# Changelog

All notable changes to the College Timetable Application will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-08-20

### Added

- Real-time search functionality with 300ms debouncing
- Comprehensive documentation (README, CONTRIBUTING, API docs)
- Unified .gitignore file
- MIT License

### Changed

- Search now triggers automatically as user types
- Improved search placeholder text for better UX
- Enhanced README with motivation and technical details

### Removed

- Manual search button (replaced with real-time search)
- Enter key requirement for search

## [1.0.0] - 2025-08-19

### Added

- Initial release of College Timetable Application
- React-based frontend with modern UI
- Dark mode support with system preference detection
- Group selection (A, B, C) with persistent storage
- Today's classes view with live class indicators
- Weekly timetable view for all groups
- Comprehensive course details page
- Search functionality across courses, instructors, and rooms
- Responsive design for mobile, tablet, and desktop
- Static data approach using JSON files
- Python script for data fetching from Google Sheets
- GitHub Actions for automated data updates (twice daily)
- SQLite database for data backup
- Offline capability once loaded
- Real-time clock and date display
- Next class preview on home page
- Live indicators for ongoing classes

### Features

- **Home Dashboard**

  - Dynamic greeting based on time of day
  - Current date and time display
  - Today's class schedule
  - Next upcoming class preview
  - Live indicator for currently ongoing classes

- **Weekly Timetable**

  - Complete weekly schedule view
  - Day-wise organization of classes
  - Time-sorted class entries
  - Group-specific filtering
  - Detailed class information display

- **Search Functionality**

  - Search across multiple fields (course name, instructor, room, course code)
  - Group-specific or global search
  - Real-time filtering of results

- **Course Information**

  - Complete course catalog
  - Instructor details
  - Credit information
  - Schedule overview for each course

- **Additional Features**
  - Dark/light mode toggle with persistence
  - Responsive mobile-first design
  - Group selection on first visit
  - Persistent user preferences
  - Fast loading with no API dependencies

### Technical Details

- **Frontend**: React 18, Tailwind CSS, React Icons
- **Data Pipeline**: Python with Google Sheets API
- **Automation**: GitHub Actions for data synchronization
- **Storage**: SQLite for backup, JSON for frontend consumption
- **Hosting**: Static hosting compatible (Vercel, Netlify, GitHub Pages)

### Data Sources

- Google Sheets: SST 2029 Batch Timetable
- Automated updates twice daily (6:00 AM & 6:00 PM UTC)
- Manual update capability via GitHub Actions

---

## Development Notes

### Known Issues

- Some frontend code generated with Claude AI assistance may contain inefficiencies
- Potential optimization opportunities in component structure
- Search algorithm could be enhanced for better performance with large datasets

### Future Enhancements

- TypeScript migration for better type safety
- Unit tests for components and utilities
- Calendar integration (ICS export)
- Push notifications for upcoming classes
- Progressive Web App (PWA) features
- Better error handling and loading states
- Accessibility improvements

### Contributing

This project welcomes contributions! Areas that need improvement:

- Performance optimization
- Code quality enhancements
- UI/UX improvements
- Bug fixes
- New feature implementations

---

## Version History Summary

| Version | Date       | Description                             |
| ------- | ---------- | --------------------------------------- |
| 1.0.0   | 2025-01-XX | Initial release with core functionality |

---

_Note: This project was created by a bored SST student who was tired of constantly checking Google Sheets for class schedules. Built with love, caffeine, and some help from Claude AI! 📚☕🤖_
