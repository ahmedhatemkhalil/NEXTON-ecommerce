# Authentication System Guide

## Overview

This authentication system provides **Role-Based Access Control (RBAC)** with two user types:
- **Admin**: Full access to admin features
- **Customer**: Access to customer-only features

The system uses **localStorage** to store user data (simulating a database). In a production environment, you would use a backend API with a real database.

---

## 📁 File Structure

```
e-commerce/
├── auth.js              # Main authentication functions
├── users.json           # Default users data (for reference)
├── login.html           # Login page
├── signup.html          # Registration page
├── index.html           # Customer home page
├── admin-dashboard.html # Admin-only page
└── AUTHENTICATION_GUIDE.md # This file
```

---

## 🔑 How It Works

### 1. **User Registration** (`signup.html`)

When a user registers:
1. They fill out the form with:
   - Full Name
   - Email
   - Account Type (Admin or Customer)
   - Password (twice for confirmation)
2. The form validates:
   - All fields are filled
   - Email format is valid
   - Passwords match
   - Password is at least 6 characters
   - Email is not already registered
3. User data is saved to `localStorage` (simulating database)
4. Password is hashed (simple hash for demo - use bcrypt in production!)
5. User is automatically logged in after registration
6. Redirects based on role:
   - Admin → `admin-dashboard.html`
   - Customer → `index.html`

### 2. **User Login** (`login.html`)

When a user logs in:
1. They enter email and password
2. System checks if user exists
3. Password is verified (compared with hashed password)
4. If valid, user session is created in `localStorage`
5. Redirects based on role:
   - Admin → `admin-dashboard.html`
   - Customer → `index.html`

### 3. **Session Management**

- **Current User**: Stored in `localStorage` as `currentUser`
- **All Users**: Stored in `localStorage` as `users`
- Session persists across page refreshes
- Logout clears the session

### 4. **Role-Based Access Control**

The system prevents:
- **Customers** from accessing admin pages
- **Admins** from accessing customer-only features (if any)
- **Unauthenticated users** from accessing protected pages

---

## 🛠️ Key Functions in `auth.js`

### Registration & Login

```javascript
// Register a new user
registerUser(email, password, role, name)
// Returns: { success: boolean, message: string, user?: Object }

// Login user
loginUser(email, password)
// Returns: { success: boolean, message: string, user?: Object }

// Logout user
logoutUser()
// Returns: { success: boolean, message: string }
```

### Session Management

```javascript
// Check if user is logged in
isLoggedIn()
// Returns: boolean

// Get current user
getCurrentUser()
// Returns: User object or null

// Get user role
getUserRole()
// Returns: 'admin', 'customer', or null
```

### Role Checking

```javascript
// Check if user has specific role
hasRole('admin')  // or 'customer'
// Returns: boolean

// Check if user is admin
isAdmin()
// Returns: boolean

// Check if user is customer
isCustomer()
// Returns: boolean
```

### Route Protection

```javascript
// Protect a route (redirects if not authorized)
protectRoute('admin', './login.html')
// First param: required role ('admin', 'customer', or null for any logged-in user)
// Second param: redirect URL if access denied
// Returns: boolean (true if authorized)

// Redirect if already logged in (for login/signup pages)
redirectIfLoggedIn('./index.html')
```

### UI Updates

```javascript
// Update navigation based on login status
updateNavigation()
// Shows/hides login/logout buttons, user info, etc.

// Show success/error message
showMessage('Login successful!', 'success')
showMessage('Invalid credentials', 'error')
```

---

## 📝 Usage Examples

### Example 1: Protect an Admin Page

```javascript
// At the top of admin-dashboard.html
<script src="auth.js"></script>
<script>
    // Only admins can access this page
    protectRoute('admin', './login.html');
</script>
```

### Example 2: Protect a Customer Page

```javascript
// At the top of customer-page.html
<script src="auth.js"></script>
<script>
    // Only customers can access this page
    protectRoute('customer', './login.html');
</script>
```

### Example 3: Protect Any Logged-In User

```javascript
// At the top of protected-page.html
<script src="auth.js"></script>
<script>
    // Any logged-in user (admin or customer) can access
    protectRoute(null, './login.html');
</script>
```

### Example 4: Check Role in JavaScript

```javascript
// Show admin button only to admins
if (isAdmin()) {
    document.getElementById('adminButton').style.display = 'block';
}

// Show customer features only to customers
if (isCustomer()) {
    document.getElementById('customerFeatures').style.display = 'block';
}
```

### Example 5: Update Navigation

```javascript
// In index.html or any page with navigation
<script src="auth.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        updateNavigation();
        
        // Add logout handler
        document.getElementById('logoutLink').addEventListener('click', function(e) {
            e.preventDefault();
            logoutUser();
            showMessage('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.href = './login.html';
            }, 1000);
        });
    });
</script>
```

---

## 🔒 Security Notes

### ⚠️ Important Security Warnings:

1. **Password Hashing**: The current implementation uses a simple hash function. **In production, use proper password hashing** like:
   - `bcrypt`
   - `argon2`
   - `scrypt`

2. **localStorage**: This is **NOT secure** for production! Anyone can access localStorage in the browser console. In production:
   - Use a backend API
   - Use secure HTTP-only cookies for sessions
   - Implement proper authentication tokens (JWT)

3. **Client-Side Validation**: Always validate on the server side too. Client-side validation can be bypassed.

4. **HTTPS**: Always use HTTPS in production to protect data in transit.

---

## 🧪 Testing the System

### Default Test Accounts

The system comes with two default accounts:

1. **Admin Account**:
   - Email: `admin@example.com`
   - Password: `admin123`
   - Role: `admin`

2. **Customer Account**:
   - Email: `customer@example.com`
   - Password: `customer123`
   - Role: `customer`

### Test Scenarios

1. **Register a New User**:
   - Go to `signup.html`
   - Fill in the form
   - Select role (Admin or Customer)
   - Submit and verify auto-login

2. **Login**:
   - Go to `login.html`
   - Use test credentials above
   - Verify redirect based on role

3. **Access Control**:
   - Login as Customer → Try to access `admin-dashboard.html` → Should redirect
   - Login as Admin → Access `admin-dashboard.html` → Should work

4. **Logout**:
   - Click logout in navigation
   - Verify session is cleared
   - Try accessing protected page → Should redirect to login

---

## 📊 Data Storage Structure

### User Object Structure

```json
{
  "id": 1,
  "email": "user@example.com",
  "password": "hashed_password",
  "role": "admin" | "customer",
  "name": "User Name",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Session Object Structure

```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "admin" | "customer",
  "name": "User Name",
  "loginTime": "2024-01-01T00:00:00.000Z"
}
```

---

## 🚀 Next Steps

To extend this system:

1. **Add More Roles**: Modify the `registerUser()` function to accept more roles
2. **Add Permissions**: Create a permission system (e.g., `canEditProducts`, `canDeleteUsers`)
3. **Add Password Reset**: Implement forgot password functionality
4. **Add Email Verification**: Verify email addresses before allowing login
5. **Add Session Timeout**: Automatically log out users after inactivity
6. **Add Remember Me**: Implement persistent login sessions

---

## ❓ Troubleshooting

### Issue: Users not persisting
- **Solution**: Check browser localStorage. Clear it and try again.

### Issue: Can't login after registration
- **Solution**: Check console for errors. Verify password hashing is working.

### Issue: Redirect loops
- **Solution**: Make sure `redirectIfLoggedIn()` is called on login/signup pages.

### Issue: Role check not working
- **Solution**: Verify `getCurrentUser()` returns the user object with a `role` property.

---

## 📚 Learning Resources

- **localStorage API**: [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- **Password Hashing**: [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- **Role-Based Access Control**: [Wikipedia - RBAC](https://en.wikipedia.org/wiki/Role-based_access_control)

---

## 💡 Tips for Learning

1. **Read the Code**: Start by reading `auth.js` to understand each function
2. **Test Each Function**: Use browser console to test functions individually
3. **Modify and Experiment**: Try adding new features or changing existing ones
4. **Debug**: Use `console.log()` to see what's happening at each step
5. **Understand localStorage**: Check what's stored in localStorage after each action

---

**Happy Learning! 🎓**

