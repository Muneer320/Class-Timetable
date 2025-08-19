# Development Guide

This guide provides detailed information for developers working on the College Timetable Application.

## 🏗️ Architecture Overview

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Google Sheets  │───▶│  GitHub Actions  │───▶│   JSON Files    │
│   (Data Source) │    │   (Processing)   │    │  (Static Data)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │  React Frontend │
                                                │ (User Interface)│
                                                └─────────────────┘
```

### Design Principles

1. **Static First**: No backend server required
2. **Offline Capable**: Works without internet after initial load
3. **Mobile First**: Responsive design prioritizing mobile experience
4. **Performance**: Fast loading with minimal dependencies
5. **Maintainability**: Clean, readable code with good documentation

## 🔧 Development Environment

### Required Tools

- **Node.js**: v18+ (for React development)
- **Python**: v3.8+ (for data scripts)
- **Git**: Version control
- **VS Code**: Recommended editor with extensions:
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - Prettier - Code formatter
  - ESLint

### Project Setup

1. **Clone and Install**

   ```bash
   git clone https://github.com/Muneer320/Class-Timetable.git
   cd Class-Timetable

   # Frontend setup
   cd frontend
   npm install

   # Python setup (optional)
   cd ../scripts
   pip install -r requirements.txt
   ```

2. **Environment Configuration**

   ```bash
   # Frontend environment
   cd frontend
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Development**

   ```bash
   # Start React development server
   npm start

   # Open http://localhost:3000
   ```

## 📁 Code Organization

### Frontend Structure

```
frontend/src/
├── App.js              # Main application component
├── App.css             # Global styles and custom CSS
├── index.js            # Application entry point
├── components/         # Reusable UI components
│   └── ui/            # shadcn/ui components
├── hooks/             # Custom React hooks
└── lib/               # Utility functions
```

### Component Architecture

The application uses a **single-file component approach** in `App.js`:

```javascript
// Main App component
function App() {
  // State management
  // Effect hooks
  // Event handlers
  // Page rendering logic
}

// Page components
function HomePage({ props }) {
  /* ... */
}
function TimetablePage({ props }) {
  /* ... */
}
function SearchPage({ props }) {
  /* ... */
}
// ... other components

export default App;
```

**Why Single File?**

- Simplified state management
- Easier prop passing
- Reduced complexity for this scale
- Fast development iteration

### State Management

Uses React's built-in state management:

```javascript
// Application state
const [currentPage, setCurrentPage] = useState("home");
const [selectedGroup, setSelectedGroup] = useState(null);
const [timetableData, setTimetableData] = useState(null);
const [loading, setLoading] = useState(false);
const [darkMode, setDarkMode] = useState(false);
const [searchQuery, setSearchQuery] = useState("");
const [searchResults, setSearchResults] = useState([]);
```

## 🎨 Styling Guide

### Tailwind CSS

The project uses Tailwind CSS for styling:

```javascript
// Component example
<div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
    Title
  </h2>
</div>
```

### Design System

**Colors:**

- Primary: Blue-to-Purple gradient (`from-blue-500 to-purple-600`)
- Background: Gray-50 (light), Gray-900 (dark)
- Cards: White (light), Gray-800 (dark)
- Text: Gray-900 (light), White (dark)

**Spacing:**

- Consistent padding: `p-4`, `p-6`
- Margins: `mb-4`, `mb-6`
- Gaps: `gap-2`, `gap-4`

**Typography:**

- Headers: `text-xl font-bold`, `text-2xl font-bold`
- Body: Default size with `text-gray-600` secondary color
- Small text: `text-sm text-gray-500`

### Dark Mode Implementation

```javascript
// Dark mode toggle
const [darkMode, setDarkMode] = useState(
  localStorage.getItem("darkMode") === "true"
);

// Apply dark mode
useEffect(() => {
  document.documentElement.classList.toggle("dark", darkMode);
  localStorage.setItem("darkMode", darkMode);
}, [darkMode]);

// Component styling
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
```

## 🔄 Data Flow

### Data Fetching Pattern

```javascript
// 1. State initialization
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);

// 2. Fetch function
const fetchData = async () => {
  setLoading(true);
  try {
    const response = await fetch("/data/file.json");
    const data = await response.json();
    setData(data);
  } catch (error) {
    console.error("Error:", error);
    setData([]);
  }
  setLoading(false);
};

// 3. Effect hook
useEffect(() => {
  fetchData();
}, [dependency]);
```

### Search Implementation

```javascript
// Real-time search with debouncing
useEffect(() => {
  if (currentPage !== "search") {
    setSearchResults([]);
    return;
  }

  const timeoutId = setTimeout(() => {
    if (searchQuery.trim()) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, 300); // 300ms debounce

  return () => clearTimeout(timeoutId);
}, [searchQuery, currentPage]);
```

## 🧪 Testing Strategy

### Manual Testing Checklist

**Functionality:**

- [ ] Group selection works
- [ ] Navigation between pages
- [ ] Today's classes display correctly
- [ ] Weekly timetable loads
- [ ] Search functionality works
- [ ] Dark mode toggle

**Responsiveness:**

- [ ] Mobile (320px - 768px)
- [ ] Tablet (768px - 1024px)
- [ ] Desktop (1024px+)

**Cross-browser:**

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**Edge Cases:**

- [ ] Empty data states
- [ ] Long text overflow
- [ ] Slow network conditions
- [ ] Offline mode

### Automated Testing (Future)

```javascript
// Example test structure
describe("App Component", () => {
  test("renders group selection on first visit", () => {
    // Test implementation
  });

  test("displays today's classes correctly", () => {
    // Test implementation
  });

  test("search functionality works", () => {
    // Test implementation
  });
});
```

## 🚀 Performance Optimization

### Current Optimizations

1. **Static Data**: No API calls after initial load
2. **Debounced Search**: Prevents excessive search operations
3. **Conditional Rendering**: Only render active page
4. **Local Storage**: Persist user preferences

### Potential Improvements

1. **Code Splitting**: Split by page components
2. **Lazy Loading**: Load data on demand
3. **Memoization**: Use React.memo for expensive components
4. **Bundle Analysis**: Identify and remove unused code

### Performance Monitoring

```javascript
// Performance measurement
const startTime = performance.now();
// ... operation
const endTime = performance.now();
console.log(`Operation took ${endTime - startTime} milliseconds`);
```

## 📊 Data Processing

### Google Sheets to JSON

```python
# Simplified data processing flow
def process_timetable_data(sheets_data):
    """Convert Google Sheets data to structured JSON"""

    # 1. Parse raw sheet data
    parsed_data = parse_sheet_rows(sheets_data)

    # 2. Group by class groups (A, B, C)
    grouped_data = group_by_class_group(parsed_data)

    # 3. Generate time slots
    timed_data = add_time_information(grouped_data)

    # 4. Create course catalog
    course_catalog = extract_course_info(timed_data)

    # 5. Generate JSON files
    generate_json_files(timed_data, course_catalog)

    return timed_data
```

### JSON Structure Validation

```javascript
// Data validation function
const validateTimetableData = (data) => {
  if (!data.success || !Array.isArray(data.data)) {
    throw new Error("Invalid timetable data structure");
  }

  data.data.forEach((group) => {
    if (!group.group || !Array.isArray(group.entries)) {
      throw new Error(`Invalid group data: ${group.group}`);
    }
  });

  return true;
};
```

## 🔍 Debugging

### Common Issues

1. **Data Not Loading**

   ```javascript
   // Check browser console
   console.error("Failed to load data");

   // Verify file exists
   fetch("/data/timetable.json")
     .then((response) => console.log("Status:", response.status))
     .catch((error) => console.error("Fetch error:", error));
   ```

2. **Dark Mode Issues**

   ```javascript
   // Check localStorage
   console.log("Dark mode setting:", localStorage.getItem("darkMode"));

   // Check class application
   console.log(
     "Dark class applied:",
     document.documentElement.classList.contains("dark")
   );
   ```

3. **Search Not Working**
   ```javascript
   // Debug search input
   console.log("Search query:", searchQuery);
   console.log("Search results:", searchResults);
   ```

### Debug Tools

```javascript
// Debug helper function
const debugLog = (component, data) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[${component}]`, data);
  }
};

// Usage
debugLog("SearchPage", { query: searchQuery, results: searchResults.length });
```

## 🔧 Build Process

### Development Build

```bash
npm start
# - Hot reloading
# - Source maps
# - Development warnings
```

### Production Build

```bash
npm run build
# - Minified code
# - Optimized assets
# - Static files ready for hosting
```

### Build Configuration

The project uses Create React App's build configuration:

```javascript
// package.json scripts
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

## 🤝 Code Review Guidelines

### Pull Request Checklist

- [ ] Code follows style guidelines
- [ ] No console.log statements in production code
- [ ] Error handling is implemented
- [ ] Responsive design is maintained
- [ ] Dark mode works correctly
- [ ] Comments added for complex logic
- [ ] Performance impact considered

### Code Quality

```javascript
// ✅ Good: Clear, descriptive function
const fetchTodayClasses = async (selectedGroup) => {
  if (!selectedGroup) return [];

  try {
    const response = await fetch(
      `/data/group_${selectedGroup.toLowerCase()}.json`
    );
    const data = await response.json();

    const today = getCurrentDay();
    return data.entries.filter(
      (entry) => entry.day.toLowerCase() === today.toLowerCase()
    );
  } catch (error) {
    console.error("Error fetching today's classes:", error);
    return [];
  }
};

// ❌ Avoid: Unclear function with no error handling
const ftc = async (g) => {
  const r = await fetch(`/data/group_${g}.json`);
  const d = await r.json();
  return d.entries.filter(
    (e) => e.day === new Date().toLocaleDateString("en-US", { weekday: "long" })
  );
};
```

## 📈 Future Enhancements

### Planned Features

1. **TypeScript Migration**

   - Better type safety
   - Improved developer experience
   - Better IDE support

2. **Component Refactoring**

   - Split large components
   - Create reusable components
   - Implement proper component hierarchy

3. **Enhanced Search**

   - Fuzzy search
   - Search history
   - Advanced filters

4. **PWA Features**

   - Service worker
   - Offline caching
   - Push notifications

5. **Accessibility**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support

### Technical Debt

1. **Code Organization**: Split monolithic App.js
2. **State Management**: Consider Context API or Redux
3. **Error Boundaries**: Implement React error boundaries
4. **Testing**: Add comprehensive test suite
5. **Documentation**: Add JSDoc comments

This development guide will be updated as the project evolves. For questions or clarifications, please create an issue on GitHub.
