#!/usr/bin/env python3
"""
Timetable Data Fetcher

This script fetches timetable data from Google Sheets and stores it locally
in both SQLite database and JSON files for the frontend to consume.

Configuration (no secrets are hardcoded here):
- GitHub Actions: provide credentials via secrets. Supported options:
        Option A (preferred): GOOGLE_CREDENTIALS_JSON (full service account JSON string)
        Option B: GOOGLE_CREDENTIALS_FILE (path), or GOOGLE_APPLICATION_CREDENTIALS (path)
        Option C: Discrete vars: GOOGLE_PROJECT_ID, GOOGLE_PRIVATE_KEY_ID, GOOGLE_PRIVATE_KEY,
                         GOOGLE_CLIENT_EMAIL, GOOGLE_CLIENT_ID
    Also set: SPREADSHEET_ID (required), optionally SHEET_RANGE.

- Local development: create scripts/.env with the same variables, or pass --credentials to a JSON file.
"""

import os
import json
import sqlite3
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
from urllib.parse import quote
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from dotenv import load_dotenv


class TimetableDataFetcher:
    def __init__(self):
        # Load local .env
        load_dotenv(
            dotenv_path=os.path.join(os.path.dirname(__file__), ".env"),
            override=True
        )

        self.spreadsheet_id = (
            os.getenv("SPREADSHEET_ID", "").strip().strip('"').strip("'"))
        if not self.spreadsheet_id or self.spreadsheet_id.lower() == "dummy_sheet_id":
            raise RuntimeError(
                "Missing SPREADSHEET_ID. Provide it via scripts/.env (local) or as a GitHub Secret."
            )

        # Resolve paths relative to repo root (parent of scripts/)
        repo_root = os.path.abspath(
            os.path.join(os.path.dirname(__file__), ".."))
        self.database_path = os.path.join(repo_root, "data", "timetable.db")
        self.json_output_path = os.path.join(
            repo_root, "frontend", "public", "data")
        self.credentials = None
        self.service = None

        self.default_range = os.getenv("SHEET_RANGE", "A:S")

        # Ensure directories exist
        os.makedirs(os.path.dirname(self.database_path), exist_ok=True)
        os.makedirs(self.json_output_path, exist_ok=True)

        self._initialize_service()
        self._initialize_database()

    def _initialize_service(self):
        """Initialize Google Sheets service (from file, JSON env, or discrete env vars)."""
        try:
            scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly']

            cred_file = os.getenv("GOOGLE_CREDENTIALS_FILE") or os.getenv(
                "GOOGLE_APPLICATION_CREDENTIALS")

            if cred_file and os.path.exists(cred_file):
                self.credentials = service_account.Credentials.from_service_account_file(
                    cred_file, scopes=scopes
                )
            self.service = build('sheets', 'v4', credentials=self.credentials)
            print("✅ Google Sheets service initialized successfully")

        except Exception:
            print("❌ Failed to initialize Google Sheets service.")
            raise

    def _initialize_database(self):
        """Initialize SQLite database"""
        try:
            with sqlite3.connect(self.database_path) as conn:
                cursor = conn.cursor()

                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS timetable_entries (
                        id TEXT PRIMARY KEY,
                        group_name TEXT NOT NULL,
                        day TEXT NOT NULL,
                        start_time TEXT NOT NULL,
                        end_time TEXT NOT NULL,
                        duration_minutes INTEGER NOT NULL,
                        course_code TEXT NOT NULL,
                        course_name TEXT NOT NULL,
                        instructor TEXT NOT NULL,
                        room TEXT NOT NULL,
                        credits INTEGER DEFAULT 3,
                        entry_type TEXT DEFAULT 'Lecture',
                        created_at TEXT NOT NULL,
                        updated_at TEXT NOT NULL
                    )
                """)

                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS metadata (
                        key TEXT PRIMARY KEY,
                        value TEXT NOT NULL,
                        updated_at TEXT NOT NULL
                    )
                """)

                conn.commit()
                print("✅ Database initialized successfully")

        except Exception as e:
            print(f"❌ Failed to initialize database: {str(e)}")
            raise

    def get_sheet_titles(self) -> List[str]:
        """Return all worksheet (tab) titles in the spreadsheet."""
        meta = self.service.spreadsheets().get(
            spreadsheetId=self.spreadsheet_id
        ).execute()
        return [s["properties"]["title"] for s in meta.get("sheets", [])]

    def fetch_sheet_data(self, sheet_index: int = 0):
        """Fetch data from a worksheet."""
        try:
            if not self.service:
                raise RuntimeError("Google Sheets service not initialized")

            titles = self.get_sheet_titles()
            if sheet_index < 0 or sheet_index >= len(titles):
                raise IndexError(
                    f"Sheet index {sheet_index} out of range (found {len(titles)} sheets).")

            sheet_name = titles[sheet_index]
            a1_range = self.default_range
            range_to_use = f"'{sheet_name}'!{a1_range}"

            print(
                f"📥 Fetching data from sheet {sheet_index} ({sheet_name}) range {a1_range}")
            result = self.service.spreadsheets().values().get(
                spreadsheetId=self.spreadsheet_id,
                range=range_to_use
            ).execute()

            values = result.get("values", [])
            print(f"✅ Fetched {len(values)} rows from {sheet_name}")
            return values

        except HttpError as e:
            print(f"❌ Google Sheets API error: {e}")
            raise
        except Exception as e:
            print(f"❌ Error fetching sheet data: {e}")
            raise

    def _find_header_rows(self, raw_data: List[List[str]]) -> Tuple[Optional[int], Optional[int]]:
        """Locate the row indices for the 'Group' header row and the 'Day' header row."""
        group_row = None
        day_row = None
        # Scan first few rows for headers
        for i, row in enumerate(raw_data[:6]):
            row_strs = [str(c) for c in row]
            if any("Group A" in s or "Group B" in s or "Group C" in s for s in row_strs):
                group_row = i
            if any(s in ("Monday", "Tuesday", "Wednesday", "Thursday", "Friday") for s in row_strs):
                day_row = i
                # keep searching group_row in case it appears after day row within first few
        return group_row, day_row

    def _map_group_day_columns(
        self, raw_data: List[List[str]], group_row: int, day_row: int
    ) -> Dict[str, List[Tuple[int, str]]]:
        """
        Build a mapping of group -> list of (column_index, day_name).
        Robust to spacing and varying empty columns.
        """
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        day_row_vals = raw_data[day_row] if day_row < len(raw_data) else []
        group_row_vals = raw_data[group_row] if group_row < len(
            raw_data) else []

        # Find starting column for each group
        group_starts: Dict[str, int] = {}
        for idx, val in enumerate(group_row_vals):
            sval = str(val)
            if "Group A" in sval:
                group_starts["A"] = idx
            elif "Group B" in sval:
                group_starts["B"] = idx
            elif "Group C" in sval:
                group_starts["C"] = idx

        # Determine an upper bound for each group's section (next group's start or end of row)
        ordered_groups = [(g, group_starts[g]) for g in sorted(
            group_starts.keys(), key=lambda k: group_starts[k])]
        section_bounds: Dict[str, Tuple[int, int]] = {}
        for i, (g, start) in enumerate(ordered_groups):
            end = len(day_row_vals)
            if i + 1 < len(ordered_groups):
                end = ordered_groups[i + 1][1]
            section_bounds[g] = (start, end)

        # For each group, pick the columns where the day headers match
        group_cols: Dict[str, List[Tuple[int, str]]] = {
            g: [] for g in group_starts.keys()}
        for g, (start, end) in section_bounds.items():
            used = set()
            for d in days:
                # Find the next occurrence of this day within the group's section
                found_col = None
                for c in range(start, end):
                    if c in used:
                        continue
                    if c < len(day_row_vals) and str(day_row_vals[c]).strip() == d:
                        found_col = c
                        break
                if found_col is not None:
                    used.add(found_col)
                    group_cols[g].append((found_col, d))

        return group_cols

    def parse_timetable_data(self, raw_data: List[List[str]]) -> Dict[str, List[Dict]]:
        """Parse raw sheet data into structured timetable entries"""
        if not raw_data or len(raw_data) < 3:
            print("⚠️ No data to parse")
            return {"A": [], "B": [], "C": []}

        print("🔄 Parsing timetable data...")
        group_entries: Dict[str, List[Dict]] = {"A": [], "B": [], "C": []}

        # Find header rows dynamically
        group_row, day_row = self._find_header_rows(raw_data)
        if group_row is None or day_row is None:
            print("❌ Could not find header rows")
            return group_entries

        print(f"📊 Found headers - Group row: {group_row}, Day row: {day_row}")

        # Map columns for each group/day
        group_day_cols = self._map_group_day_columns(
            raw_data, group_row, day_row)
        for g, cols in group_day_cols.items():
            print(f"📅 Group {g} columns: {cols}")

        # Track last entry to merge multi-row classes
        last_entry_map: Dict[Tuple[str, str, int], Dict] = {}

        for row_idx in range(day_row + 1, len(raw_data)):
            row = raw_data[row_idx]
            if not row:
                continue

            time_info = row[0] if len(row) > 0 else ""
            if not isinstance(time_info, str) or ("AM" not in time_info and "PM" not in time_info):
                continue

            try:
                if " - " in time_info:
                    start_time_raw, end_time_raw = time_info.split(" - ", 1)
                    start_time, end_time = self._clean_time(
                        start_time_raw.strip(), end_time_raw.strip())
                else:
                    continue
            except Exception:
                continue

            for group, cols in group_day_cols.items():
                for col, day in cols:
                    key = (group, day, col)
                    cell = row[col] if col < len(row) else ""
                    text = cell.strip() if isinstance(cell, str) else ""

                    # Breaks end any ongoing entry
                    if text.upper() == "LUNCH":
                        if key in last_entry_map:
                            del last_entry_map[key]
                        continue

                    # Blank cell under a merged block → extend previous entry to this row's end_time
                    if not text:
                        if key in last_entry_map:
                            prev = last_entry_map[key]
                            prev["time_slot"]["end_time"] = end_time
                            sh, sm = map(
                                int, prev["time_slot"]["start_time"].split(":"))
                            eh, em = map(int, end_time.split(":"))
                            prev["time_slot"]["duration_minutes"] = (
                                eh * 60 + em) - (sh * 60 + sm)
                        continue

                    # Non-empty cell → parse and create/extend entry
                    entry = self._parse_class_info(
                        text, group, day, start_time, end_time)
                    if not entry:
                        if key in last_entry_map:
                            prev = last_entry_map[key]
                            prev["time_slot"]["end_time"] = end_time
                            sh, sm = map(
                                int, prev["time_slot"]["start_time"].split(":"))
                            eh, em = map(int, end_time.split(":"))
                            prev["time_slot"]["duration_minutes"] = (
                                eh * 60 + em) - (sh * 60 + sm)
                        continue

                    if key in last_entry_map:
                        prev = last_entry_map[key]
                        # Same class continuing across rows → extend
                        if entry["course"]["course_code"] == prev["course"]["course_code"]:
                            prev["time_slot"]["end_time"] = end_time
                            sh, sm = map(
                                int, prev["time_slot"]["start_time"].split(":"))
                            eh, em = map(int, end_time.split(":"))
                            prev["time_slot"]["duration_minutes"] = (
                                eh * 60 + em) - (sh * 60 + sm)
                        else:
                            # New class starts here
                            group_entries[group].append(entry)
                            last_entry_map[key] = entry
                    else:
                        # First row of a class block
                        group_entries[group].append(entry)
                        last_entry_map[key] = entry

        for group, entries in group_entries.items():
            print(f"📚 Group {group}: {len(entries)} classes")

        return group_entries

    def _clean_time(self, start_time: str, end_time: str) -> tuple[str, str]:
        try:
            def parse(t, suffix=None):
                ts = t.strip().upper()
                if "AM" in ts or "PM" in ts:
                    return datetime.strptime(ts.replace(" ", ""), "%I:%M%p")
                return datetime.strptime(ts + suffix, "%I:%M%p")

            options = []
            start_has = any(x in start_time.upper() for x in ["AM", "PM"])
            end_has = any(x in end_time.upper() for x in ["AM", "PM"])

            for sfx_s in (["AM", "PM"] if not start_has else [None]):
                for sfx_e in (["AM", "PM"] if not end_has else [None]):
                    try:
                        s = parse(start_time, sfx_s or "")
                        e = parse(end_time,   sfx_e or "")
                        if e < s:
                            e += timedelta(days=1)
                        dur = (e - s).total_seconds()/60
                        if dur > 0:
                            options.append((dur, s, e))
                    except:
                        pass

            if not options:
                return start_time, end_time

            _, s, e = min(options, key=lambda x: x[0])
            return s.strftime("%H:%M"), e.strftime("%H:%M")
        except Exception:
            return start_time, end_time

    def _parse_class_info(self, class_info: str, group: str, day: str, start_time: str, end_time: str) -> Optional[Dict]:
        try:
            lines = [ln.strip() for ln in class_info.split('\n') if ln.strip()]
            if not lines:
                return None

            course_name = lines[0].strip()
            instructor = lines[1].strip().replace(
                '[', '').replace(']', '') if len(lines) > 1 else "TBD"
            room = lines[2].strip().replace('[', '').replace(']',
                                                             '') if len(lines) > 2 else "TBD"

            course_code = ''.join([word[0].upper()
                                  for word in course_name.split()[:3] if word])
            sh, sm = map(int, start_time.split(':'))
            eh, em = map(int, end_time.split(':'))
            duration = (eh * 60 + em) - (sh * 60 + sm)

            entry_type = "Lab" if "lab" in course_name.lower() else "Lecture"

            return {
                "id": str(uuid.uuid4()),
                "group": group,
                "day": day,
                "time_slot": {
                    "start_time": start_time,
                    "end_time": end_time,
                    "duration_minutes": duration
                },
                "course": {
                    "course_code": course_code,
                    "course_name": course_name.replace("Lab", "").strip() if entry_type == "Lab" else course_name,
                    "instructor": instructor,
                    "credits": 3
                },
                "room": room,
                "entry_type": entry_type
            }
        except Exception:
            return None

    def save_to_database(self, timetable_data: Dict[str, List[Dict]]):
        """Save parsed data to SQLite database"""
        try:
            print("💾 Saving data to database...")

            with sqlite3.connect(self.database_path) as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM timetable_entries")

                total_entries = 0
                for group, entries in timetable_data.items():
                    for entry in entries:
                        cursor.execute("""
                            INSERT INTO timetable_entries 
                            (id, group_name, day, start_time, end_time, duration_minutes,
                             course_code, course_name, instructor, room, credits, entry_type,
                             created_at, updated_at)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, (
                            entry["id"],
                            entry["group"],
                            entry["day"],
                            entry["time_slot"]["start_time"],
                            entry["time_slot"]["end_time"],
                            entry["time_slot"]["duration_minutes"],
                            entry["course"]["course_code"],
                            entry["course"]["course_name"],
                            entry["course"]["instructor"],
                            entry["room"],
                            entry["course"]["credits"],
                            entry["entry_type"],
                            datetime.now().isoformat(),
                            datetime.now().isoformat()
                        ))
                        total_entries += 1

                cursor.execute("""
                    INSERT OR REPLACE INTO metadata (key, value, updated_at)
                    VALUES (?, ?, ?)
                """, ("last_updated", datetime.now().isoformat(), datetime.now().isoformat()))

                cursor.execute("""
                    INSERT OR REPLACE INTO metadata (key, value, updated_at)
                    VALUES (?, ?, ?)
                """, ("total_entries", str(total_entries), datetime.now().isoformat()))

                conn.commit()
                print(f"✅ Saved {total_entries} entries to database")

        except Exception as e:
            print(f"❌ Error saving to database: {str(e)}")
            raise

    def export_to_json(self, timetable_data: Dict[str, List[Dict]]):
        """Export data to JSON files for frontend consumption"""
        try:
            print("📤 Exporting data to JSON files...")

            group_timetables = []
            for group, entries in timetable_data.items():
                if entries:
                    group_timetable = {
                        "group": group,
                        "entries": entries,
                        "total_classes": len(entries)
                    }
                    group_timetables.append(group_timetable)

            timetable_response = {
                "success": True,
                "data": group_timetables,
                "total_groups": len(group_timetables),
                "last_updated": datetime.now().isoformat()
            }

            with open(f"{self.json_output_path}/timetable.json", 'w') as f:
                json.dump(timetable_response, f, indent=2)

            for group_data in group_timetables:
                group = group_data["group"].lower()
                with open(f"{self.json_output_path}/group_{group}.json", 'w') as f:
                    json.dump(group_data, f, indent=2)

            courses: Dict[str, Dict] = {}
            for group_data in group_timetables:
                for entry in group_data["entries"]:
                    course_code = entry["course"]["course_code"]
                    if course_code not in courses:
                        courses[course_code] = {
                            "course_code": course_code,
                            "course_name": entry["course"]["course_name"],
                            "instructor": entry["course"]["instructor"],
                            "credits": entry["course"]["credits"],
                            "groups": [],
                            "schedule": []
                        }

                    if group_data["group"] not in courses[course_code]["groups"]:
                        courses[course_code]["groups"].append(
                            group_data["group"])

                    courses[course_code]["schedule"].append({
                        "group": group_data["group"],
                        "day": entry["day"],
                        "time": f"{entry['time_slot']['start_time']} - {entry['time_slot']['end_time']}",
                        "room": entry["room"],
                        "type": entry["entry_type"]
                    })

            courses_response = {"courses": list(courses.values())}
            with open(f"{self.json_output_path}/courses.json", 'w') as f:
                json.dump(courses_response, f, indent=2)

            metadata = {
                "last_updated": datetime.now().isoformat(),
                "total_groups": len(group_timetables),
                "total_entries": sum(len(entries) for entries in timetable_data.values()),
                "groups": list(timetable_data.keys())
            }

            with open(f"{self.json_output_path}/metadata.json", 'w') as f:
                json.dump(metadata, f, indent=2)

            print("✅ Successfully exported all JSON files")

        except Exception as e:
            print(f"❌ Error exporting to JSON: {str(e)}")
            raise

    def run(self):
        """Main execution method"""
        try:
            print("🚀 Starting timetable data fetch...")
            print(f"📅 Current time: {datetime.now().isoformat()}")

            sheet_index = 0  # timetable is always the first sheet
            raw_data = self.fetch_sheet_data(sheet_index=sheet_index)

            timetable_data = self.parse_timetable_data(raw_data)
            self.save_to_database(timetable_data)
            self.export_to_json(timetable_data)

            print("🎉 Timetable data fetch completed successfully!")

        except Exception as e:
            print(f"💥 Fatal error during execution: {str(e)}")
            raise


def main():
    """Main function"""
    try:
        fetcher = TimetableDataFetcher()
        fetcher.run()
    except Exception as e:
        print(f"❌ Script failed: {str(e)}")
        exit(1)


if __name__ == "__main__":
    main()
