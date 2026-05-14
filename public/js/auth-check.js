// Initialize theme on page load
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-bs-theme', savedTheme);

// Check if user is authenticated
async function checkAuthentication() {
    try {
        const response = await fetch('/api/auth/check', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (!data.authenticated) {
            // Not authenticated, redirect to login
            window.location.href = 'login.html';
            return null;
        }
        
        // Store user info
        sessionStorage.setItem('user', JSON.stringify(data.user));
        return data.user;
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = 'login.html';
        return null;
    }
}

// Get current user from session
function getCurrentUser() {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Check if user has required role
function hasRole(...roles) {
    const user = getCurrentUser();
    return user && roles.includes(user.role);
}

// Initialize authentication check
checkAuthentication().then(user => {
    if (user) {
        // Update navbar with user info
        updateNavbar(user);
    }
});

// Update navbar with logout button and user info
function updateNavbar(user) {
    const navbarNav = document.querySelector('#navbarNav .navbar-nav');
    if (!navbarNav) return;

    // Remove register link
    const registerLink = navbarNav.querySelector('a[href="register.html"]');
    if (registerLink) {
        registerLink.remove();
    }

    // Add user info
    const userInfoSpan = document.createElement('span');
    userInfoSpan.className = 'nav-link';
    userInfoSpan.innerHTML = `
        <i class="fas fa-user"></i> ${user.username}
        <span class="badge bg-${user.role === 'admin' ? 'danger' : user.role === 'teacher' ? 'warning' : 'info'}">${user.role}</span>
    `;
    navbarNav.appendChild(userInfoSpan);

    // Add dark mode toggle button
    const darkModeToggle = document.createElement('button');
    darkModeToggle.id = 'dark-mode-toggle';
    darkModeToggle.className = 'btn btn-outline-secondary ms-2';
    darkModeToggle.setAttribute('aria-label', 'Toggle dark mode');
    const currentTheme = localStorage.getItem('theme') || 'light';
    darkModeToggle.innerHTML = `<i class="fas fa-${currentTheme === 'dark' ? 'sun' : 'moon'}"></i>`;
    navbarNav.appendChild(darkModeToggle);

    // Add logout button
    const logoutBtn = document.createElement('button');
    logoutBtn.id = 'logout-btn';
    logoutBtn.className = 'btn btn-outline-danger ms-2';
    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
    navbarNav.appendChild(logoutBtn);

    // Add logout handler
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await logout();
    });

    // Add dark mode toggle handler
    darkModeToggle.addEventListener('click', toggleDarkMode);

    // Hide elements based on role
    applyRoleBasedUI(user.role);
}

// Dark mode toggle function
function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update toggle button icon
    const toggleBtn = document.getElementById('dark-mode-toggle');
    if (toggleBtn) {
        const icon = toggleBtn.querySelector('i');
        if (icon) {
            icon.className = `fas fa-${newTheme === 'dark' ? 'sun' : 'moon'}`;
        }
    }
}

// Logout function
async function logout() {
    try {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        sessionStorage.removeItem('user');
        localStorage.removeItem('rememberMe');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = 'login.html';
    }
}

// Apply role-based UI restrictions
function applyRoleBasedUI(role) {
    // Hide management links for non-admin users
    if (role !== 'admin') {
        const managementLinks = document.querySelectorAll('a[href="subject-management.html"], a[href="class-management.html"]');
        managementLinks.forEach(link => {
            link.style.display = 'none';
        });
    }

    // Ensure teacher management link is always visible for authenticated users
    // (No hiding logic applied)
}
