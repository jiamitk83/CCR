# Dark Mode Implementation Guide

## Overview
A comprehensive dark mode system has been implemented using Bootstrap 5.3's native `data-bs-theme` attribute, combined with custom CSS variables for fine-grained control.

## Features
- **Bootstrap 5.3 Integration**: Leverages native dark mode for all standard components (Modals, Dropdowns, Cards, Forms).
- **Custom Theming**: Extended with custom CSS variables for specific brand colors and smooth transitions.
- **Persistence**: Remembers user preference using `localStorage`.
- **Global Toggle**: Available on all pages (Dashboard, Login, Register).
- **Smooth Transitions**: CSS transitions for background and color changes.

## Implementation Details

### 1. CSS Variables (`style.css`)
We use `[data-bs-theme="dark"]` to override variables when dark mode is active.

```css
[data-bs-theme="dark"] {
    --primary-color: #6366f1;
    --background-color: #0f172a;
    --card-bg: #1e293b;
    /* ... other variables */
}
```

### 2. JavaScript Logic (`dark-mode.js`)
Handles the toggling and persistence.

```javascript
// Apply theme on load
document.documentElement.setAttribute('data-bs-theme', savedTheme);

// Toggle function
function toggleDarkMode() {
    // Switches between 'light' and 'dark'
    // Updates data-bs-theme attribute
    // Saves to localStorage
}
```

### 3. Usage
- **Dashboard & Protected Pages**: Toggle button in the navbar (handled by `auth-check.js`).
  - Includes: Subject, Class, Chapter, Status, Teacher Management pages.
- **Login/Register**: Toggle button in the header/navbar (handled by `dark-mode.js`).

## Verification
Verified across:
- ✅ Dashboard (Cards, Charts, Tables)
- ✅ Login Page (Forms, Alerts)
- ✅ Register Page (Forms, Navbar)

## Screenshots

### Dashboard Dark Mode
![Dashboard Dark Mode](file:///C:/Users/91750/.gemini/antigravity/brain/b3cee97d-9292-413d-a5b3-e1251dba679e/dashboard_dark_v2_1764041566113.png)

### Register Page Dark Mode
![Register Page Dark Mode](file:///C:/Users/91750/.gemini/antigravity/brain/b3cee97d-9292-413d-a5b3-e1251dba679e/register_dark_v2_1764041596536.png)
