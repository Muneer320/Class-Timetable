# College Timetable Application

A modern, responsive college timetable application for **Scaler School of Technology (SST) 2029 batch**. This app fetches data from Google Sheets and displays it in a clean, user-friendly interface, eliminating the need to constantly check the Google Sheets document.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.0-blue.svg)
![Node](https://img.shields.io/badge/Node-18+-green.svg)
![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)

## 🎯 Motivation

I was tired of constantly switching between tabs to check the [SST 2029 Batch Timetable](https://docs.google.com/spreadsheets/d/1rRdVLKFmfb_XuKr93kn41CwzTey7DjCAQ7jfb-aYA04/) just to see my classes and classroom schedules each day. So I decided to build this web app during some free time when I was feeling bored and needed a side project!

The goal was simple: create a fast, mobile-friendly interface that shows all the timetable information without the need to navigate through Google Sheets every time.

## 🌟 Features

- 📅 **Weekly Timetable View**: Complete schedule for each group (A, B, C)
- 🏠 **Today's Classes**: Quick view of current day's schedule with live class indicators
- 📚 **Course Details**: Comprehensive course information with instructor and room details
- 🔍 **Real-time Search**: Search across courses, instructors, rooms, and course codes as you type
- 🌙 **Dark Mode**: Toggle between light and dark themes
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- ⚡ **Fast Loading**: No API dependencies, loads from local JSON files
- 🔄 **Auto-sync**: Automatically updates from Google Sheets twice daily via GitHub Actions
- 📡 **Offline Ready**: Works offline once loaded
- 🎯 **Live Class Indicators**: Shows which class is currently ongoing

## 🏗️ Architecture

This application uses a **static data approach** instead of a live API for better performance and reliability:

```
Google Sheets → Python Script → GitHub Actions → JSON Files → React App
```

For detailed development guidelines, setup instructions, and contribution workflows, please refer to comprehensive [Development Guide](docs/DEVELOPMENT.md).

### Data Flow

1. **Data Source**: [SST 2029 Batch Timetable](https://docs.google.com/spreadsheets/d/1rRdVLKFmfb_XuKr93kn41CwzTey7DjCAQ7jfb-aYA04/)
2. **Data Fetching**: Python script (`scripts/fetch_timetable.py`) runs via GitHub Actions
3. **Data Storage**: SQLite database (backup) + JSON files (frontend consumption)
4. **Frontend**: React application consuming local JSON files

### Tech Stack

**Frontend:**

- ⚛️ React 18 with functional components and hooks
- 🎨 Tailwind CSS for styling
- 🔗 React Icons for UI icons
- 📱 Responsive design with mobile-first approach

**Backend/Data Pipeline:**

- 🐍 Python 3.8+ for data fetching
- 🗄️ SQLite for data storage
- 📊 Google Sheets API for source data
- ⚙️ GitHub Actions for automation

**Deployment:**

- 🚀 Static hosting (Vercel/Netlify compatible)
- 📦 Build artifacts served as static files

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.8+ (for data scripts)
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Muneer320/Class-Timetable.git
   cd Class-Timetable
   ```

2. **Install frontend dependencies**

   ```bash
   cd frontend
   npm install
   ```

3. **Install Python dependencies** (optional, for data scripts)

   ```bash
   cd ../scripts
   pip install -r requirements.txt
   ```

4. **Start development server**

   ```bash
   cd ../frontend
   npm start
   ```

5. **Open your browser**
   Visit `http://localhost:3000` to see the application.

### Environment Variables

If you want to run the data fetching scripts, you'll need to configure Google Sheets API credentials:

1. **Set up Google Sheets API credentials** in `scripts/GoogleSheets.json`:

   ```json
   {
     "type": "service_account",
     "project_id": "your-project-id",
     "private_key_id": "your-private-key-id",
     "private_key": "your-private-key",
     "client_email": "your-service-account-email",
     "client_id": "your-client-id",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token"
   }
   ```

2. **Or use environment variables** (for GitHub Actions):
   ```env
   GOOGLE_PROJECT_ID=your-project-id
   GOOGLE_PRIVATE_KEY=your-private-key
   GOOGLE_CLIENT_EMAIL=your-service-account-email
   ```

**Note**: The frontend works with pre-generated JSON files, so no API keys or environment setup is needed for basic usage.

## 📁 Project Structure

```
Class-Timetable/
├── frontend/                 # React application
│   ├── public/
│   │   ├── data/            # Static JSON data files
│   │   │   ├── timetable.json
│   │   │   ├── group_a.json
│   │   │   ├── group_b.json
│   │   │   ├── group_c.json
│   │   │   ├── courses.json
│   │   │   └── metadata.json
│   │   └── index.html
│   ├── src/
│   │   ├── components/       # UI components (shadcn/ui)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions
│   │   ├── App.js           # Main application component
│   │   ├── App.css          # Global styles
│   │   └── index.js         # Application entry point
│   ├── package.json
│   └── tailwind.config.js
├── scripts/                  # Data fetching scripts
│   ├── fetch_timetable.py   # Main data fetching script
│   ├── GoogleSheets.json    # Google Sheets API credentials
│   └── requirements.txt     # Python dependencies
├── data/
│   └── timetable.db         # SQLite database (backup)
├── .github/
│   └── workflows/           # GitHub Actions workflows
├── README.md
└── .gitignore
```

## 🎨 Features Overview

### Home Page

- **Dynamic Greeting**: Good Morning/Afternoon/Evening based on time
- **Current Time & Date**: Real-time display
- **Next Class Preview**: Shows upcoming class information
- **Today's Schedule**: All classes for the current day
- **Live Class Indicator**: Highlights currently ongoing classes

### Timetable View

- **Weekly Overview**: Complete schedule for the selected group
- **Day-wise Organization**: Classes organized by weekdays
- **Time Sorting**: Classes sorted by start time
- **Class Details**: Course name, instructor, room, and duration

### Search Functionality

- **Real-time Search**: Results appear as you type (300ms debounce)
- **Multi-field Search**: Search across course names, instructors, rooms, and course codes
- **Group Filtering**: Search within selected group or across all groups
- **Instant Results**: No need to press Enter or click search button

### Course Details

- **Complete Information**: Course codes, credits, instructors
- **Schedule Overview**: All class timings for each course
- **Group Distribution**: Which groups have which courses

## 🔧 Development

### Available Scripts

```bash
# Frontend development
cd frontend
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run lint       # Run ESLint

# Data scripts
cd scripts
python fetch_timetable.py    # Fetch latest data from Google Sheets
```

### Adding New Features

1. **Frontend Components**: Add to `frontend/src/components/`
2. **Styling**: Use Tailwind CSS classes or extend `App.css`
3. **Data Processing**: Modify `scripts/fetch_timetable.py`
4. **New Pages**: Add to the main `App.js` component

### Code Quality

This project uses:

- **ESLint**: For JavaScript linting
- **Prettier**: For code formatting (recommended)
- **Responsive Design**: Mobile-first approach

## 📦 Deployment

### Static Hosting (Recommended)

1. **Build the application**

   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy to Vercel/Netlify**
   - Upload the `build` folder
   - Configure redirects for SPA routing

### GitHub Pages

1. **Enable GitHub Pages** in repository settings
2. **Use GitHub Actions** for automatic deployment
3. **Set base URL** in `package.json` if using subdirectory

## 🤝 Contributing

Parts of the frontend was built with some assistance from Claude AI, so there might be bugs, inefficient code, or unnecessary components. **Contributions are very welcome!**

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a Pull Request**

### Areas for Improvement

- 🐛 **Bug Fixes**: Found a bug? Please report it or fix it!
- ⚡ **Performance**: Optimize loading times or reduce bundle size
- 🎨 **UI/UX**: Improve the design or user experience
- 🔧 **Code Quality**: Refactor repetitive or inefficient code
- 📱 **Mobile Experience**: Enhance mobile responsiveness
- ✨ **New Features**: Add useful functionality

### Reporting Issues

Please use the GitHub Issues tab to report:

- 🐛 Bugs with detailed reproduction steps
- 💡 Feature requests with clear descriptions
- 📖 Documentation improvements
- ❓ Questions about the codebase

## 📊 Data Update Schedule

The timetable data is automatically updated:

- **Frequency**: Twice daily (6:00 AM & 6:00 PM UTC)
- **Source**: Google Sheets via GitHub Actions
- **Backup**: SQLite database stored in repository
- **Manual Update**: Run `python scripts/fetch_timetable.py`

## 🔒 Privacy & Data

- **No Personal Data**: Only publicly available timetable information
- **Local Storage**: User preferences stored in browser only
- **No Analytics**: No tracking or data collection
- **Open Source**: All code is publicly available

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 90+
- ✅ Safari 14+
- ✅ Edge 90+
- 📱 iOS Safari 14+
- 📱 Chrome Mobile 90+

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Muneer** - [GitHub](https://github.com/Muneer320)

## 🙏 Acknowledgments

- **Scaler School of Technology** for the original timetable data
- **Claude AI** for assistance with frontend development
- **Open Source Community** for the amazing tools and libraries used
- **SST 2029 Batch** for being the motivation behind this project

## 📞 Support

If you like this project, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting features
- 🤝 Contributing code

---

**Made with ❤️ by a bored SST student who was tired of checking Google Sheets! 📚**
