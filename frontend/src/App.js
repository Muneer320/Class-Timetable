import React, { useState, useEffect } from "react";
import { FiBookOpen, FiHome, FiCalendar, FiSearch, FiInfo, FiMoon, FiSun, FiRefreshCw, FiUsers, FiCheckCircle, FiSave, FiSmartphone, FiCpu, FiBarChart2, FiSmile } from "react-icons/fi";
import "./App.css";

// Data source configuration - now using local JSON files
const DATA_BASE_URL = process.env.REACT_APP_DATA_BASE_URL || '/data';

// Helper utilities (module scope to keep stable references)
const getCurrentTime = () => {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getCurrentDay = () => {
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
};

const isCurrentClass = (startTime, endTime) => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return currentTime >= startMinutes && currentTime <= endMinutes;
};

// Child components hoisted to avoid remounting on each App render
function GroupSelectPage({ onSelectGroup }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <FiBookOpen className="text-white" size={36} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to College Timetable
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Select your group to get started
          </p>
        </div>

        <div className="space-y-4">
          {["A", "B", "C"].map((group) => (
            <button
              key={group}
              onClick={() => onSelectGroup(group)}
              className="w-full p-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Group {group}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function HomePage({ selectedGroup, loadingToday, todayClasses, fetchTodayClasses }) {
  useEffect(() => {
    if (selectedGroup) {
      fetchTodayClasses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup]);

  const nextClass = (() => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    return todayClasses.find((classItem) => {
      const [startHour, startMin] = classItem.time_slot.start_time
        .split(":")
        .map(Number);
      const startMinutes = startHour * 60 + startMin;
      return startMinutes > currentTime;
    });
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold">
              Good{" "}
              {new Date().getHours() < 12
                ? "Morning"
                : new Date().getHours() < 17
                  ? "Afternoon"
                  : "Evening"}
              !
            </h1>
            <p className="opacity-90">
              {getCurrentDay()}, {getCurrentTime()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-75">Group</p>
            <p className="text-2xl font-bold">{selectedGroup}</p>
          </div>
        </div>

        {nextClass && (
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm opacity-90 mb-1">Next Class</p>
            <p className="font-semibold text-lg">
              {nextClass.course.course_name}
            </p>
            <p className="text-sm opacity-90">
              {nextClass.time_slot.start_time} • {nextClass.room} •{" "}
              {nextClass.course.instructor}
            </p>
          </div>
        )}
      </div>

      {/* Today's Classes */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Today's Classes
          </h2>
        </div>

        {loadingToday ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Loading classes...
            </p>
          </div>
        ) : todayClasses.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {todayClasses.map((classItem, index) => {
              const isCurrent = isCurrentClass(
                classItem.time_slot.start_time,
                classItem.time_slot.end_time
              );
              return (
                <div
                  key={index}
                  className={`p-6 transition-all duration-200 ${isCurrent
                    ? "bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-l-4 border-green-500"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                          {classItem.course.course_name}
                        </h3>
                        {isCurrent && (
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                            Live
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-1">
                        {classItem.course.instructor}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {classItem.room} • {classItem.entry_type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {classItem.time_slot.start_time}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {classItem.time_slot.duration_minutes} min
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            <FiSmile className="text-2xl mx-auto mb-2" />
            <p>No classes today! Enjoy your free time.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TimetablePage({ selectedGroup, loadingTimetable, timetableData, fetchTimetableData }) {
  useEffect(() => {
    if (selectedGroup) {
      fetchTimetableData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup]);

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Weekly Timetable - Group {selectedGroup}
          </h2>
        </div>

        {loadingTimetable ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Loading timetable...
            </p>
          </div>
        ) : timetableData ? (
          <div className="p-6">
            <div className="space-y-4">
              {days.map((day) => {
                const dayClasses = timetableData.entries.filter(
                  (entry) => entry.day === day
                );

                return (
                  <div
                    key={day}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
                      <h3 className="font-bold text-lg">{day}</h3>
                      <p className="text-sm opacity-90">
                        {dayClasses.length} classes
                      </p>
                    </div>

                    {dayClasses.length > 0 ? (
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {dayClasses
                          .sort((a, b) =>
                            a.time_slot.start_time.localeCompare(
                              b.time_slot.start_time
                            )
                          )
                          .map((classItem, index) => (
                            <div
                              key={index}
                              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-white">
                                    {classItem.course.course_name}
                                  </h4>
                                  <p className="text-gray-600 dark:text-gray-300">
                                    {classItem.course.instructor}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {classItem.room} • {classItem.entry_type}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-gray-900 dark:text-white">
                                    {classItem.time_slot.start_time} -{" "}
                                    {classItem.time_slot.end_time}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {classItem.time_slot.duration_minutes} min
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                        No classes scheduled
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            <p>Failed to load timetable data</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CoursesPage({ loadingCourses, courses, fetchCourses }) {
  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Course Details
          </h2>
        </div>

        {loadingCourses ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Loading courses...
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {courses.map((course, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {course.course_name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {course.course_code} • {course.credits} Credits
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      Instructor: {course.instructor}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Groups:
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {course.groups.join(", ")}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Schedule:
                  </h4>
                  <div className="space-y-1">
                    {course.schedule.map((schedule, scheduleIndex) => (
                      <div
                        key={scheduleIndex}
                        className="text-sm text-gray-600 dark:text-gray-300"
                      >
                        Group {schedule.group}: {schedule.day} {schedule.time}{" "}
                        - {schedule.room} ({schedule.type})
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SearchPage({ searchQuery, setSearchQuery, handleSearch, loading, searchResults }) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Search Classes
          </h2>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Start typing to search courses, instructors, or rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold flex items-center">
              <FiSearch className="mr-2" />
              Live Search
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Searching...
            </p>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                      {result.entry.course.course_name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {result.entry.course.instructor}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Group {result.group} • {result.entry.day} •{" "}
                      {result.entry.room}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {result.entry.time_slot.start_time} -{" "}
                      {result.entry.time_slot.end_time}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {result.entry.entry_type}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            No results found for "{searchQuery}"
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500 dark:text-gray-400">
            Start typing to search for classes...
          </div>
        )}
      </div>
    </div>
  );
}

function AdminPage({ handleDataRefresh }) {
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await fetch(`${DATA_BASE_URL}/metadata.json`);
        const data = await response.json();
        setMetadata(data);
      } catch (error) {
        console.error("Error fetching metadata:", error);
      }
    };

    fetchMetadata();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          <FiBarChart2 /> System Information
        </h2>

        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              <FiCpu /> Automated Updates
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
              Timetable data is automatically updated twice daily (6 AM & 6 PM UTC) from Google Sheets using GitHub Actions.
            </p>

            {metadata && (
              <div className="text-sm space-y-1">
                <p className="text-gray-500 dark:text-gray-400">
                  <FiCalendar /> Last Updated: {new Date(metadata.last_updated).toLocaleString()}
                </p>
                <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <FiBookOpen /> Total Entries: {metadata.total_entries}
                </p>
                <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <FiUsers /> Groups: {metadata.groups ? metadata.groups.join(", ") : "A, B, C"}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                <FiCheckCircle /> Static Data
              </h4>
              <p className="text-green-600 dark:text-green-400 text-sm">
                No server required - data is served as static files for fast loading.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                <FiRefreshCw /> Auto Sync
              </h4>
              <p className="text-blue-600 dark:text-blue-400 text-sm">
                Changes in Google Sheets are automatically reflected in the app.
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
              <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2 flex items-center gap-2">
                <FiSave /> Local Storage
              </h4>
              <p className="text-purple-600 dark:text-purple-400 text-sm">
                Your preferences are saved locally in your browser.
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
              <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-2 flex items-center gap-2">
                <FiSmartphone /> Offline Ready
              </h4>
              <p className="text-orange-600 dark:text-orange-400 text-sm">
                Works offline once loaded, with cached timetable data.
              </p>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={handleDataRefresh}
              className="w-full p-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              <FiRefreshCw /> Refresh Current Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Navigation({ currentPage, setCurrentPage }) {
  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {[
          { id: "home", icon: <FiHome />, label: "Home" },
          { id: "timetable", icon: <FiCalendar />, label: "Timetable" },
          { id: "courses", icon: <FiBookOpen />, label: "Courses" },
          { id: "search", icon: <FiSearch />, label: "Search" },
          { id: "admin", icon: <FiInfo />, label: "Info" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${currentPage === item.id
              ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
          >
            <span className="text-lg mb-1">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Header({ darkMode, setDarkMode, selectedGroup, onSwitchGroup }) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">CT</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 dark:text-white">
              Timetable
            </h1>
            {selectedGroup && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Group {selectedGroup}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>

          {selectedGroup && (
            <button
              onClick={onSwitchGroup}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs"
            >
              Switch
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedGroup, setSelectedGroup] = useState(
    localStorage.getItem("selectedGroup") || null
  );
  const [timetableData, setTimetableData] = useState(null);
  const [todayClasses, setTodayClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingToday, setLoadingToday] = useState(false);
  const [loadingTimetable, setLoadingTimetable] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [courses, setCourses] = useState([]);

  // Group selection effect
  useEffect(() => {
    if (!selectedGroup) {
      setCurrentPage("groupSelect");
    } else {
      localStorage.setItem("selectedGroup", selectedGroup);
      setCurrentPage("home");
    }
  }, [selectedGroup]);

  // Dark mode effect
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Real-time search effect with debouncing
  useEffect(() => {
    if (currentPage !== "search") {
      // Clear search results when leaving search page
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, currentPage]);

  // Fetch today's classes
  const fetchTodayClasses = async () => {
    if (!selectedGroup) return;

    setLoadingToday(true);
    try {
      const response = await fetch(`${DATA_BASE_URL}/group_${selectedGroup.toLowerCase()}.json`);
      const groupData = await response.json();
      const currentDay = new Date().toLocaleDateString("en-US", { weekday: "long" });

      const todayClasses = groupData.entries.filter(entry =>
        entry.day.toLowerCase() === currentDay.toLowerCase()
      );

      setTodayClasses(todayClasses || []);
    } catch (error) {
      console.error("Error fetching today's classes:", error);
      setTodayClasses([]);
    }
    setLoadingToday(false);
  };

  // Fetch timetable data
  const fetchTimetableData = async () => {
    if (!selectedGroup) return;

    setLoadingTimetable(true);
    try {
      const response = await fetch(`${DATA_BASE_URL}/group_${selectedGroup.toLowerCase()}.json`);
      const data = await response.json();
      setTimetableData(data);
    } catch (error) {
      console.error("Error fetching timetable:", error);
      setTimetableData(null);
    }
    setLoadingTimetable(false);
  };

  // Fetch courses
  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const response = await fetch(`${DATA_BASE_URL}/courses.json`);
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
    }
    setLoadingCourses(false);
  };

  // Search functionality
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      // Load all timetable data for searching
      const response = await fetch(`${DATA_BASE_URL}/timetable.json`);
      const data = await response.json();

      const results = [];
      const query = searchQuery.toLowerCase();

      // Search through all groups and entries
      for (const groupData of data.data) {
        if (selectedGroup && groupData.group.toLowerCase() !== selectedGroup.toLowerCase()) {
          continue;
        }

        for (const entry of groupData.entries) {
          // Search in course name, instructor, room, course code
          const searchFields = [
            entry.course.course_name.toLowerCase(),
            entry.course.instructor.toLowerCase(),
            entry.room.toLowerCase(),
            entry.course.course_code.toLowerCase()
          ];

          if (searchFields.some(field => field.includes(query))) {
            results.push({
              group: groupData.group,
              entry: entry
            });
          }
        }
      }

      setSearchResults(results);
    } catch (error) {
      console.error("Error searching:", error);
      setSearchResults([]);
    }
    setLoading(false);
  };


  const handleDataRefresh = () => {
    // We can just reload the current data
    if (currentPage === "home") {
      fetchTodayClasses();
    } else if (currentPage === "timetable") {
      fetchTimetableData();
    } else if (currentPage === "courses") {
      fetchCourses();
    }
  };

  // helper functions moved to module scope


  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case "groupSelect":
        return <GroupSelectPage onSelectGroup={setSelectedGroup} />;
      case "home":
        return (
          <HomePage
            selectedGroup={selectedGroup}
            loadingToday={loadingToday}
            todayClasses={todayClasses}
            fetchTodayClasses={fetchTodayClasses}
          />
        );
      case "timetable":
        return (
          <TimetablePage
            selectedGroup={selectedGroup}
            loadingTimetable={loadingTimetable}
            timetableData={timetableData}
            fetchTimetableData={fetchTimetableData}
          />
        );
      case "courses":
        return (
          <CoursesPage
            loadingCourses={loadingCourses}
            courses={courses}
            fetchCourses={fetchCourses}
          />
        );
      case "search":
        return (
          <SearchPage
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
            loading={loading}
            searchResults={searchResults}
          />
        );
      case "admin":
        return <AdminPage handleDataRefresh={handleDataRefresh} />;
      default:
        return (
          <HomePage
            selectedGroup={selectedGroup}
            loadingToday={loadingToday}
            todayClasses={todayClasses}
            fetchTodayClasses={fetchTodayClasses}
          />
        );
    }
  };

  if (currentPage === "groupSelect") {
    return <GroupSelectPage onSelectGroup={setSelectedGroup} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        selectedGroup={selectedGroup}
        onSwitchGroup={() => {
          localStorage.removeItem("selectedGroup");
          setSelectedGroup(null);
          setCurrentPage("groupSelect");
        }}
      />

      <main className="flex-1 p-4 pb-20 overflow-auto">
        <div className="max-w-4xl mx-auto">{renderPage()}</div>
      </main>

      <div className="fixed bottom-0 left-0 right-0">
        <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </div>
    </div>
  );
}

export default App;
