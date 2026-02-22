// Authentication and User Management System

// Simple hash function (SHA-256 would be better, but this works for basic obfuscation)
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
}

// Better hash using crypto API if available (more secure)
async function hashPassword(password) {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Fallback to simple hash
    return simpleHash(password);
}

// Initialize admin credentials if not exists
// Password is hashed for security
async function initializeAdmin() {
    if (!localStorage.getItem('adminCredentials')) {
        // Hash the password before storing
        const adminUsername = 'KushalNeha@1602';
        const adminPassword = 'KushalNeha@1602';
        
        // Store hashed version
        const hashedPassword = await hashPassword(adminPassword);
        localStorage.setItem('adminCredentials', JSON.stringify({
            username: adminUsername,
            passwordHash: hashedPassword
        }));
    } else {
        // Migrate old plain text password to hashed if needed
        const admin = JSON.parse(localStorage.getItem('adminCredentials'));
        if (admin.password && !admin.passwordHash) {
            const hashedPassword = await hashPassword(admin.password);
            admin.passwordHash = hashedPassword;
            delete admin.password;
            localStorage.setItem('adminCredentials', JSON.stringify(admin));
        }
    }
}

// Initialize users array if not exists
function initializeUsers() {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
}

// Get all users (with Firebase support)
async function getUsers() {
    // Try Firebase first, fallback to localStorage
    if (typeof getUsersFromFirebase === 'function') {
        try {
            return await getUsersFromFirebase();
        } catch (error) {
            console.log('Firebase not available, using localStorage');
        }
    }
    return JSON.parse(localStorage.getItem('users') || '[]');
}

// Save users (with Firebase support)
async function saveUsers(users) {
    // Try Firebase first, fallback to localStorage
    if (typeof saveUsersToFirebase === 'function') {
        try {
            await saveUsersToFirebase(users);
            return;
        } catch (error) {
            console.log('Firebase not available, using localStorage');
        }
    }
    localStorage.setItem('users', JSON.stringify(users));
}

// Get admin credentials
function getAdminCredentials() {
    return JSON.parse(localStorage.getItem('adminCredentials'));
}

// Check if user is logged in
function isLoggedIn() {
    const session = localStorage.getItem('currentSession');
    if (!session) return false;
    
    const sessionData = JSON.parse(session);
    const users = getUsers();
    const user = users.find(u => u.id === sessionData.userId);
    
    if (!user || user.status !== 'approved') {
        localStorage.removeItem('currentSession');
        return false;
    }
    
    return true;
}

// Get current user
function getCurrentUser() {
    const session = localStorage.getItem('currentSession');
    if (!session) return null;
    
    const sessionData = JSON.parse(session);
    const users = getUsers();
    return users.find(u => u.id === sessionData.userId);
}

// Login user (async for Firebase)
async function loginUser(username, password) {
    const users = await getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
        return { success: false, message: 'Invalid username or password' };
    }
    
    if (user.status === 'pending') {
        return { success: false, message: 'Your account is pending approval. Please wait for admin approval.' };
    }
    
    if (user.status === 'approved') {
        localStorage.setItem('currentSession', JSON.stringify({
            userId: user.id,
            username: user.username,
            loginTime: new Date().toISOString()
        }));
        return { success: true, message: 'Login successful' };
    }
    
    return { success: false, message: 'Account not approved' };
}

// Signup new user (async for Firebase)
async function signupUser(username, password, email) {
    const users = await getUsers();
    
    // Check if username already exists
    if (users.find(u => u.username === username)) {
        return { success: false, message: 'Username already exists' };
    }
    
    // Check if email already exists
    if (email && users.find(u => u.email === email)) {
        return { success: false, message: 'Email already exists' };
    }
    
    // Create new user
    const newUser = {
        id: Date.now().toString(),
        username: username,
        password: password,
        email: email || '',
        status: 'pending', // pending, approved, rejected
        createdAt: new Date().toISOString(),
        approvedAt: null
    };
    
    users.push(newUser);
    await saveUsers(users);
    
    // Also add to Firebase directly
    if (typeof addUserToFirebase === 'function') {
        try {
            await addUserToFirebase(newUser);
        } catch (error) {
            console.log('Firebase add user failed, but saved to localStorage');
        }
    }
    
    return { success: true, message: 'Signup request submitted. Waiting for admin approval.' };
}

// Admin login (async to handle password hashing)
async function adminLoginAsync(username, password) {
    const admin = getAdminCredentials();
    if (!admin) {
        return { success: false, message: 'Admin credentials not initialized' };
    }
    
    // Hash the provided password and compare
    const providedPasswordHash = await hashPassword(password);
    
    if (admin.username === username && admin.passwordHash === providedPasswordHash) {
        localStorage.setItem('adminSession', JSON.stringify({
            loginTime: new Date().toISOString()
        }));
        return { success: true, message: 'Admin login successful' };
    }
    return { success: false, message: 'Invalid admin credentials' };
}

// Synchronous wrapper for admin login (for backward compatibility)
function adminLogin(username, password) {
    // This will be handled asynchronously in the HTML files
    return adminLoginAsync(username, password);
}

// Check if admin is logged in
function isAdminLoggedIn() {
    return localStorage.getItem('adminSession') !== null;
}

// Get pending users (accepts users array as parameter)
function getPendingUsers(users) {
    if (!users) {
        // If no users provided, try to get them (but this is async now)
        return [];
    }
    return users.filter(u => u.status === 'pending');
}

// Approve user (async for Firebase)
async function approveUser(userId) {
    const users = await getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return { success: false, message: 'User not found' };
    }
    
    users[userIndex].status = 'approved';
    users[userIndex].approvedAt = new Date().toISOString();
    await saveUsers(users);
    
    // Also update Firebase directly
    if (typeof updateUserInFirebase === 'function') {
        try {
            await updateUserInFirebase(userId, {
                status: 'approved',
                approvedAt: new Date().toISOString()
            });
        } catch (error) {
            console.log('Firebase update failed, but saved to localStorage');
        }
    }
    
    return { success: true, message: 'User approved successfully' };
}

// Reject user (async for Firebase)
async function rejectUser(userId) {
    const users = await getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return { success: false, message: 'User not found' };
    }
    
    users[userIndex].status = 'rejected';
    await saveUsers(users);
    
    // Also update Firebase directly
    if (typeof updateUserInFirebase === 'function') {
        try {
            await updateUserInFirebase(userId, { status: 'rejected' });
        } catch (error) {
            console.log('Firebase update failed, but saved to localStorage');
        }
    }
    
    return { success: true, message: 'User rejected' };
}

// Logout
function logout() {
    localStorage.removeItem('currentSession');
}

// Admin logout
function adminLogout() {
    localStorage.removeItem('adminSession');
}

// Excel Data Management Functions (with Firebase support)
async function saveExcelData(data) {
    // Try Firebase first, fallback to localStorage
    if (typeof saveExcelDataToFirebase === 'function') {
        try {
            await saveExcelDataToFirebase(data);
            return;
        } catch (error) {
            console.log('Firebase not available, using localStorage');
        }
    }
    localStorage.setItem('excelData', JSON.stringify(data));
    localStorage.setItem('excelDataTimestamp', new Date().toISOString());
}

async function getExcelData() {
    // Try Firebase first, fallback to localStorage
    if (typeof getExcelDataFromFirebase === 'function') {
        try {
            const result = await getExcelDataFromFirebase();
            return result.data;
        } catch (error) {
            console.log('Firebase not available, using localStorage');
        }
    }
    const data = localStorage.getItem('excelData');
    return data ? JSON.parse(data) : null;
}

async function getExcelDataTimestamp() {
    // Try Firebase first, fallback to localStorage
    if (typeof getExcelDataFromFirebase === 'function') {
        try {
            const result = await getExcelDataFromFirebase();
            return result.timestamp;
        } catch (error) {
            console.log('Firebase not available, using localStorage');
        }
    }
    return localStorage.getItem('excelDataTimestamp');
}

async function hasExcelData() {
    const data = await getExcelData();
    return data !== null;
}

async function clearExcelData() {
    // Try Firebase first, fallback to localStorage
    if (typeof clearExcelDataFromFirebase === 'function') {
        try {
            await clearExcelDataFromFirebase();
            return;
        } catch (error) {
            console.log('Firebase not available, using localStorage');
        }
    }
    localStorage.removeItem('excelData');
    localStorage.removeItem('excelDataTimestamp');
}

// Initialize on load
initializeAdmin();
initializeUsers();

