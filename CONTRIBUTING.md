# Contributing to College Timetable Application

First off, thank you for considering contributing to this project! 🎉 This application was built by a bored SST student with some help from Claude AI, so there's definitely room for improvement and contributions are very welcome.

## 🤝 How to Contribute

### Reporting Bugs 🐛

If you find a bug, please create an issue with:

- **Clear title**: Brief description of the bug
- **Steps to reproduce**: How to trigger the bug
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Environment**: Browser, OS, device type
- **Screenshots**: If applicable

### Suggesting Features 💡

Feature requests are welcome! Please create an issue with:

- **Clear title**: Brief description of the feature
- **Use case**: Why this feature would be useful
- **Detailed description**: How it should work
- **Mockups/designs**: If you have visual ideas

### Code Contributions 🔧

#### Areas That Need Improvement

Since this was built with AI assistance, there are several areas that could use human expertise:

1. **Performance Optimization**

   - Bundle size reduction
   - Loading speed improvements
   - Memory usage optimization

2. **Code Quality**

   - Remove unnecessary code
   - Improve component structure
   - Better error handling
   - Add TypeScript

3. **UI/UX Improvements**

   - Better mobile experience
   - Accessibility improvements
   - Animation enhancements
   - Better visual feedback

4. **New Features**

   - Calendar integration
   - Notifications for upcoming classes
   - Export functionality
   - Offline sync improvements

5. **Bug Fixes**
   - Edge cases in time calculations
   - Search functionality improvements
   - Dark mode consistency

#### Getting Started

1. **Fork the repository**

   ```bash
   git clone https://github.com/muneer320/Class-Timetable.git
   cd Class-Timetable
   ```

2. **Set up the development environment**

   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Create a feature branch**

   ```bash
   git checkout -b feature/amazing-feature
   # or
   git checkout -b bugfix/fix-something
   ```

4. **Make your changes**

   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Test your changes thoroughly

5. **Test your changes**

   ```bash
   npm test
   npm run build  # Ensure build works
   ```

6. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   # or
   git commit -m "fix: resolve issue with search"
   ```

7. **Push and create a Pull Request**
   ```bash
   git push origin feature/amazing-feature
   ```

## 📝 Code Style Guidelines

### JavaScript/React

- Use functional components with hooks
- Use camelCase for variables and functions
- Use PascalCase for component names
- Keep components small and focused
- Use meaningful variable names

```javascript
// ✅ Good
const fetchTodayClasses = async () => {
  // implementation
};

// ❌ Avoid
const ftc = async () => {
  // implementation
};
```

### CSS/Styling

- Use Tailwind CSS classes when possible
- Keep custom CSS minimal
- Use semantic class names
- Follow mobile-first responsive design

```javascript
// ✅ Good
<div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800">

// ❌ Avoid
<div className="custom-header-style">
```

### Python (Data Scripts)

- Follow PEP 8 style guide
- Use type hints when possible
- Add docstrings for functions
- Handle errors gracefully

```python
# ✅ Good
def fetch_timetable_data(sheet_id: str) -> dict:
    """
    Fetches timetable data from Google Sheets.

    Args:
        sheet_id: The Google Sheets document ID

    Returns:
        Dictionary containing timetable data
    """
    try:
        # implementation
        return data
    except Exception as e:
        logger.error(f"Failed to fetch data: {e}")
        raise
```

## 🧪 Testing

### Manual Testing

Always test your changes by:

1. **Functionality**: Does the feature work as expected?
2. **Responsiveness**: Test on different screen sizes
3. **Dark mode**: Ensure it works in both themes
4. **Cross-browser**: Test in Chrome, Firefox, Safari
5. **Edge cases**: Test with empty data, long text, etc.

### Automated Testing

```bash
# Run existing tests
npm test

# Add tests for new features
npm test -- --coverage
```

## 📚 Project Structure Understanding

```
frontend/src/
├── App.js              # Main component with all pages
├── App.css             # Global styles
├── components/         # UI components (shadcn/ui)
├── hooks/              # Custom React hooks
└── lib/                # Utility functions

scripts/
├── fetch_timetable.py  # Data fetching from Google Sheets
└── requirements.txt    # Python dependencies
```

### Key Concepts

- **Static Data Approach**: No backend API, data is pre-generated
- **Real-time Search**: Debounced search with 300ms delay
- **Dark Mode**: Uses system preference + manual toggle
- **Group Selection**: Persistent in localStorage
- **Live Indicators**: Shows current ongoing classes

## 🚀 Pull Request Process

1. **Title**: Use clear, descriptive titles

   - `feat: add real-time search functionality`
   - `fix: resolve dark mode toggle issue`
   - `docs: update installation instructions`

2. **Description**: Include

   - What changes were made
   - Why these changes were necessary
   - Any breaking changes
   - Screenshots/GIFs for UI changes

3. **Testing**: Describe how you tested the changes

4. **Documentation**: Update README if needed

## 🎯 Commit Message Guidelines

Use conventional commit format:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:

```
feat: implement real-time search with debouncing
fix: resolve dark mode inconsistency in navigation
docs: add API documentation for data fetching
refactor: extract search logic into custom hook
```

## 🔍 Common Issues & Solutions

### Development Issues

1. **Node modules issues**

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Build failures**

   ```bash
   npm run build
   # Check for linting errors
   npm run lint
   ```

3. **Data not loading**
   - Check if JSON files exist in `frontend/public/data/`
   - Verify file permissions
   - Check browser console for errors

### Code Quality Issues

1. **Unused imports/variables**

   - Use ESLint to identify
   - Remove or comment out unused code

2. **Performance issues**
   - Use React DevTools Profiler
   - Optimize re-renders with useMemo/useCallback
   - Lazy load components if needed

## 🙋‍♂️ Getting Help

- **Questions**: Create an issue with the "question" label
- **Discussion**: Use GitHub Discussions
- **Discord**: [Add if you create one]

## 🏆 Recognition

Contributors will be:

- Listed in the README acknowledgments
- Credited in commit history
- Mentioned in release notes for significant contributions

## 📋 Checklist for Contributors

Before submitting a PR, ensure:

- [ ] Code follows the style guidelines
- [ ] Changes have been tested manually
- [ ] No console errors or warnings
- [ ] Dark mode works correctly
- [ ] Responsive design is maintained
- [ ] Documentation is updated if needed
- [ ] Commit messages follow conventions
- [ ] PR description is comprehensive

## 🎉 Thank You!

Every contribution, no matter how small, makes this project better for the SST 2029 batch and helps improve my programming skills. Thank you for taking the time to contribute!

---

**Happy Coding! 🚀**
