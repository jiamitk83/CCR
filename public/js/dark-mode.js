// Dark Mode Toggle Functionality

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';

// Apply theme on page load
document.documentElement.setAttribute('data-bs-theme', currentTheme);

// Function to toggle dark mode
function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Update the data-bs-theme attribute for Bootstrap 5.3 support
    document.documentElement.setAttribute('data-bs-theme', newTheme);
    
    // Save preference to localStorage
    localStorage.setItem('theme', newTheme);
    
    // Update all toggle button icons
    updateAllToggleIcons(newTheme);
}

// Update all toggle button icons based on current theme
function updateAllToggleIcons(theme) {
    // Update navbar toggle button
    const navToggleBtn = document.getElementById('dark-mode-toggle');
    if (navToggleBtn) {
        const icon = navToggleBtn.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
    
    // Update login page toggle button
    const loginToggleBtn = document.getElementById('login-dark-mode-toggle');
    if (loginToggleBtn) {
        const icon = loginToggleBtn.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    // Update register page toggle button
    const registerToggleBtn = document.getElementById('register-dark-mode-toggle');
    if (registerToggleBtn) {
        const icon = registerToggleBtn.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
}

// Initialize toggle button icons on page load
document.addEventListener('DOMContentLoaded', () => {
    updateAllToggleIcons(currentTheme);
    
    // Add event listener to navbar toggle button if it exists
    const navToggleBtn = document.getElementById('dark-mode-toggle');
    if (navToggleBtn) {
        navToggleBtn.addEventListener('click', toggleDarkMode);
    }
    
    // Add event listener to login page toggle button if it exists
    const loginToggleBtn = document.getElementById('login-dark-mode-toggle');
    if (loginToggleBtn) {
        loginToggleBtn.addEventListener('click', toggleDarkMode);
    }

    // Add event listener to register page toggle button if it exists
    const registerToggleBtn = document.getElementById('register-dark-mode-toggle');
    if (registerToggleBtn) {
        registerToggleBtn.addEventListener('click', toggleDarkMode);
    }
});

