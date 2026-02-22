// Firebase Database Operations
// This file handles all Firebase Firestore operations

let db = null;
let firebaseInitialized = false;

// Initialize Firebase
function initializeFirebase() {
    if (firebaseInitialized) return Promise.resolve();
    
    // Check if Firebase is loaded
    if (typeof firebase === 'undefined' || typeof firebase.firestore === 'undefined') {
        console.error('Firebase SDK not loaded. Please add Firebase scripts to HTML.');
        return Promise.reject('Firebase SDK not loaded');
    }
    
    try {
        // Initialize Firebase if not already initialized
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.firestore();
        firebaseInitialized = true;
        console.log('Firebase initialized successfully');
        return Promise.resolve();
    } catch (error) {
        console.error('Firebase initialization error:', error);
        return Promise.reject(error);
    }
}

// Users Collection Operations
async function getUsersFromFirebase() {
    try {
        await initializeFirebase();
        const snapshot = await db.collection('users').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting users from Firebase:', error);
        // Fallback to localStorage
        return JSON.parse(localStorage.getItem('users') || '[]');
    }
}

async function saveUsersToFirebase(users) {
    try {
        await initializeFirebase();
        const batch = db.batch();
        
        // Clear existing users
        const snapshot = await db.collection('users').get();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        
        // Add all users
        users.forEach(user => {
            const userRef = db.collection('users').doc(user.id);
            batch.set(userRef, user);
        });
        
        await batch.commit();
        console.log('Users saved to Firebase');
        
        // Also save to localStorage as backup
        localStorage.setItem('users', JSON.stringify(users));
    } catch (error) {
        console.error('Error saving users to Firebase:', error);
        // Fallback to localStorage
        localStorage.setItem('users', JSON.stringify(users));
    }
}

async function addUserToFirebase(user) {
    try {
        await initializeFirebase();
        await db.collection('users').doc(user.id).set(user);
        console.log('User added to Firebase');
        
        // Also update localStorage
        const users = await getUsersFromFirebase();
        localStorage.setItem('users', JSON.stringify(users));
    } catch (error) {
        console.error('Error adding user to Firebase:', error);
    }
}

async function updateUserInFirebase(userId, updates) {
    try {
        await initializeFirebase();
        await db.collection('users').doc(userId).update(updates);
        console.log('User updated in Firebase');
        
        // Also update localStorage
        const users = await getUsersFromFirebase();
        localStorage.setItem('users', JSON.stringify(users));
    } catch (error) {
        console.error('Error updating user in Firebase:', error);
    }
}

// Excel Data Operations
async function getExcelDataFromFirebase() {
    try {
        await initializeFirebase();
        const snapshot = await db.collection('excelData').doc('current').get();
        if (snapshot.exists) {
            const data = snapshot.data();
            return {
                data: data.data || null,
                timestamp: data.timestamp || null
            };
        }
        return { data: null, timestamp: null };
    } catch (error) {
        console.error('Error getting Excel data from Firebase:', error);
        // Fallback to localStorage
        const data = localStorage.getItem('excelData');
        return {
            data: data ? JSON.parse(data) : null,
            timestamp: localStorage.getItem('excelDataTimestamp')
        };
    }
}

async function saveExcelDataToFirebase(data) {
    try {
        await initializeFirebase();
        await db.collection('excelData').doc('current').set({
            data: data,
            timestamp: new Date().toISOString()
        });
        console.log('Excel data saved to Firebase');
        
        // Also save to localStorage as backup
        localStorage.setItem('excelData', JSON.stringify(data));
        localStorage.setItem('excelDataTimestamp', new Date().toISOString());
    } catch (error) {
        console.error('Error saving Excel data to Firebase:', error);
        // Fallback to localStorage
        localStorage.setItem('excelData', JSON.stringify(data));
        localStorage.setItem('excelDataTimestamp', new Date().toISOString());
    }
}

async function clearExcelDataFromFirebase() {
    try {
        await initializeFirebase();
        await db.collection('excelData').doc('current').delete();
        console.log('Excel data cleared from Firebase');
        
        // Also clear localStorage
        localStorage.removeItem('excelData');
        localStorage.removeItem('excelDataTimestamp');
    } catch (error) {
        console.error('Error clearing Excel data from Firebase:', error);
        localStorage.removeItem('excelData');
        localStorage.removeItem('excelDataTimestamp');
    }
}

// Real-time listeners (optional - for live updates)
function subscribeToUsers(callback) {
    if (!firebaseInitialized) {
        initializeFirebase().then(() => {
            db.collection('users').onSnapshot(callback);
        });
    } else {
        db.collection('users').onSnapshot(callback);
    }
}

function subscribeToExcelData(callback) {
    if (!firebaseInitialized) {
        initializeFirebase().then(() => {
            db.collection('excelData').doc('current').onSnapshot(callback);
        });
    } else {
        db.collection('excelData').doc('current').onSnapshot(callback);
    }
}

