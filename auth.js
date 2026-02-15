/**
 * Authentication System with Role-Based Access Control (RBAC)
 * 
 * This file handles:
 * - User registration (Admin/Customer)
 * - User login
 * - Session management (using localStorage for users, sessionStorage for sessions)
 * - Role-based access control
 * - Logout functionality
 * 
 * IMPORTANT: All data is stored in browser's storage.
 * JavaScript cannot write to JSON files - everything uses browser storage.
 * - Users are stored in localStorage key: 'users' (shared across tabs)
 * - Current session is stored in sessionStorage key: 'currentUser' (tab-specific)
 * 
 * Using sessionStorage for sessions ensures each tab has its own login session,
 * so logging in as admin in one tab won't affect customer pages in other tabs.
 */

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Migrate existing users to have hashed passwords
 * This fixes users that were created before password hashing was implemented
 */
function migrateUsersPasswords(users) {
    let needsMigration = false;
    const migratedUsers = users.map(user => {
        // Check if password is already hashed (hashed passwords are numeric strings)
        // Unhashed passwords are plain text (like "admin123")
        const isHashed = /^-?\d+$/.test(String(user.password));
        
        if (!isHashed) {
            // Password is not hashed - need to hash it
            needsMigration = true;
            // Try to identify which default user this is and hash accordingly
            if (user.email === "admin@123.com" && user.password === "admin123") {
                user.password = hashPassword("admin123");
            } else if (user.email === "customer@123.com" && user.password === "customer123") {
                user.password = hashPassword("customer123");
            } else {
                // For other users, we can't know the original password, so we'll skip
                // They'll need to reset their password or re-register
                console.warn(`Cannot migrate password for user: ${user.email}. User will need to reset password.`);
            }
        }
        return user;
    });
    
    if (needsMigration) {
        saveUsers(migratedUsers);
        console.log('User passwords migrated successfully');
    }
    
    return migratedUsers;
}

/**
 * Reset all authentication data (clear localStorage and sessionStorage)
 * Use this if you need to start fresh
 * WARNING: This will delete all users and current session
 */
function resetAuthData() {
    localStorage.removeItem('users');
    sessionStorage.removeItem('currentUser');
    console.log('Authentication data cleared. Default users will be created on next getUsers() call.');
}

/**
 * Initialize default users in localStorage (first time setup)
 * This creates default admin and customer accounts
 * All data is stored in localStorage - no JSON files are used
 */
function initializeDefaultUsers() {
    const defaultUsers = [
        {
            id: 1,
            email: "admin@123.com",
            password: hashPassword("admin123"), // Hash the password before storing
            role: "admin",
            name: "Admin",
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            email: "customer@123.com",
            password: hashPassword("customer123"), // Hash the password before storing
            role: "customer",
            name: "Customer",
            createdAt: new Date().toISOString()
        }
    ];
    // Save default users to localStorage
    saveUsers(defaultUsers);
    return defaultUsers;
}

/**
 * Get all users from localStorage
 * All user data is stored in browser's localStorage
 * In a real app, this would be an API call to a backend
 * 
 * @returns {Array} Array of user objects
 */
function getUsers() {
    const usersJson = localStorage.getItem('users');
    if (usersJson) {
        // Users exist in localStorage - parse and migrate if needed
        const users = JSON.parse(usersJson);
        // Migrate passwords if they're not hashed (for backward compatibility)
        return migrateUsersPasswords(users);
    }
    // No users in localStorage - initialize with default users
    // This only happens on first visit (localStorage is empty)
    return initializeDefaultUsers();
}

/**
 * Save users to localStorage
 * All user data is persisted in browser's localStorage
 * This is the only storage mechanism - no JSON files are used
 */
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

/**
 * Get current logged-in user from session
 * Uses sessionStorage (tab-specific) so each tab has its own session
 */
function getCurrentUser() {
    const userJson = sessionStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
}

/**
 * Save current user to session
 * Uses sessionStorage (tab-specific) so each tab has its own session
 */
function setCurrentUser(user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
}

/**
 * Clear current user session (logout)
 * Uses sessionStorage (tab-specific) so each tab has its own session
 */
function clearCurrentUser() {
    sessionStorage.removeItem('currentUser');
}

/**
 * Hash password (simple hash for demo - in production use bcrypt or similar)
 * Note: This is a simple hash for demonstration. In production, use proper password hashing!
 */
function hashPassword(password) {
    // Simple hash function (NOT secure for production!)
    // In production, use: bcrypt, argon2, or similar
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
}

/**
 * Verify password (compare with hashed password)
 */
function verifyPassword(password, hashedPassword) {
    return hashPassword(password) === hashedPassword;
}

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} role - User role ('admin' or 'customer')
 * @param {string} name - User name
 * @returns {Object} - { success: boolean, message: string, user?: Object }
 */
function registerUser(email, password, role, name) {
    // Validate inputs
    if (!email || !password || !role || !name) {
        return {
            success: false,
            message: 'All fields are required'
        };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return {
            success: false,
            message: 'Invalid email format'
        };
    }

    // Validate role
    if (role !== 'admin' && role !== 'customer') {
        return {
            success: false,
            message: 'Invalid role. Must be "admin" or "customer"'
        };
    }

    // Validate password length
    if (password.length < 6) {
        return {
            success: false,
            message: 'Password must be at least 6 characters long'
        };
    }

    // Get existing users
    const users = getUsers();

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return {
            success: false,
            message: 'User with this email already exists'
        };
    }

    // Create new user
    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        email: email.toLowerCase().trim(),
        password: hashPassword(password), // Hash the password
        role: role,
        name: name,
        createdAt: new Date().toISOString()
    };

    // Add user to array
    users.push(newUser);

    // Save to localStorage
    saveUsers(users);

    return {
        success: true,
        message: 'Registration successful!',
        user: {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
            name: newUser.name
        }
    };
}

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} - { success: boolean, message: string, user?: Object }
 */
function loginUser(email, password) {
    // Validate inputs
    if (!email || !password) {
        return {
            success: false,
            message: 'Email and password are required'
        };
    }

    // Get users
    const users = getUsers();

    // Find user by email
    const user = users.find(u => u.email === email.toLowerCase().trim());

    if (!user) {
        return {
            success: false,
            message: 'Invalid email or password'
        };
    }

    // Verify password
    if (!verifyPassword(password, user.password)) {
        return {
            success: false,
            message: 'Invalid email or password'
        };
    }

    // Create user session object (without password)
    const userSession = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        loginTime: new Date().toISOString()
    };

    // Save to session
    setCurrentUser(userSession);

    return {
        success: true,
        message: 'Login successful!',
        user: userSession
    };
}

/**
 * Logout current user
 */
function logoutUser() {
    clearCurrentUser();
    return {
        success: true,
        message: 'Logged out successfully'
    };
}

/**
 * Check if user is logged in
 * @returns {boolean}
 */
function isLoggedIn() {
    return getCurrentUser() !== null;
}

/**
 * Check if current user has a specific role
 * @param {string} role - Role to check ('admin' or 'customer')
 * @returns {boolean}
 */
function hasRole(role) {
    const user = getCurrentUser();
    return user && user.role === role;
}

/**
 * Check if current user is admin
 * @returns {boolean}
 */
function isAdmin() {
    return hasRole('admin');
}

/**
 * Check if current user is customer
 * @returns {boolean}
 */
function isCustomer() {
    return hasRole('customer');
}

/**
 * Get current user role
 * @returns {string|null} - 'admin', 'customer', or null
 */
function getUserRole() {
    const user = getCurrentUser();
    return user ? user.role : null;
}

/**
 * Protect route - redirect if not logged in or doesn't have required role
 * @param {string} requiredRole - Required role ('admin' or 'customer') or null for any logged-in user
 * @param {string} redirectUrl - URL to redirect to if access denied
 */
function protectRoute(requiredRole = null, redirectUrl = './login.html') {
    if (!isLoggedIn()) {
        // Not logged in - redirect to login
        window.location.href = redirectUrl;
        return false;
    }

    if (requiredRole && !hasRole(requiredRole)) {
        // Wrong role - redirect to appropriate page
        const userRole = getUserRole();
        if (userRole === 'admin') {
            window.location.href = './admin-dashboard.html'; // Admin dashboard
        } else {
            window.location.href = './index.html'; // Customer home
        }
        return false;
    }

    return true;
}

/**
 * Redirect if already logged in (for login/signup pages)
 * @param {string} redirectUrl - URL to redirect to
 */
function redirectIfLoggedIn(redirectUrl = './index.html') {
    if (isLoggedIn()) {
        const userRole = getUserRole();
        // Redirect based on role
        if (userRole === 'admin') {
            window.location.href = './admin-dashboard.html';
        } else {
            window.location.href = redirectUrl;
        }
    }
}

/**
 * Show user info in navigation (call this on page load)
 */
function updateNavigation() {
    const user = getCurrentUser();
    const profileDropdown = document.getElementById('profileDropdown');
    const profileDropdownContainer = document.getElementById('profileDropdownContainer');
    const loginLink = document.getElementById('loginLink');
    const logoutLink = document.getElementById('logoutLink');
    const userInfo = document.getElementById('userInfo');
        const userInfoDropdown = document.getElementById('userInfoDropdown');
        const cartLink = document.getElementById('cartLink');
        const wishlistLink = document.getElementById('wishlistLink');
        const adminDashboardLink = document.getElementById('adminDashboardLink');
        const trackOrderLink = document.getElementById('trackOrderLink');

    if (user) {
        // User is logged in
        if (loginLink) loginLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'block';
        if (userInfo) {
            userInfo.textContent = `${user.name} (${user.role})`;
            userInfo.style.display = 'block';
        }
        if (userInfoDropdown) {
            userInfoDropdown.textContent = `${user.name} (${user.role})`;
        }
        if (profileDropdown) {
            profileDropdown.innerHTML = `<i class="bi bi-person-circle fs-4"></i>`;
            profileDropdown.title = `${user.name} - ${user.role}`;
        }
        if (profileDropdownContainer) {
            profileDropdownContainer.style.display = 'inline-block';
        }
        // Show cart only for customers
        if (cartLink && user.role === 'customer') {
            cartLink.style.display = 'block';
        } else if (cartLink) {
            cartLink.style.display = 'none';
        }
        // Show wishlist for all logged-in users
        if (wishlistLink) {
            wishlistLink.style.display = 'block';
        }
        // Update wishlist count for all users (logged in or not, in case they have items)
        updateWishlistCount();
        // Show admin dashboard link only for admins
        if (adminDashboardLink) {
            adminDashboardLink.style.display = user.role === 'admin' ? 'block' : 'none';
        }
        // Show track order link only for customers
        if (trackOrderLink) {
            trackOrderLink.style.display = user.role === 'customer' ? 'block' : 'none';
        }
    } else {
        // User is not logged in
        if (loginLink) loginLink.style.display = 'block';
        if (logoutLink) logoutLink.style.display = 'none';
        if (userInfo) userInfo.style.display = 'none';
        if (profileDropdownContainer) {
            profileDropdownContainer.style.display = 'none';
        }
        if (cartLink) {
            cartLink.style.display = 'none';
        }
        if (wishlistLink) {
            wishlistLink.style.display = 'none';
        }
        if (adminDashboardLink) {
            adminDashboardLink.style.display = 'none';
        }
        if (trackOrderLink) {
            trackOrderLink.style.display = 'none';
        }
    }
}

/**

 * @param {string} message 
 * @param {string} type 
 */
function showMessage(message, type = 'success') {
    let alertClass = 'alert-success';
    if (type === 'error') {
        alertClass = 'alert-danger';
    } else if (type === 'info') {
        alertClass = 'alert-info';
    } else if (type === 'warning') {
        alertClass = 'alert-warning';
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `alert ${alertClass} alert-dismissible fade show position-fixed`;
    messageDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    messageDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

