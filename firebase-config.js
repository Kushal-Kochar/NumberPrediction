// Firebase Configuration
// ⚠️ IMPORTANT: You MUST configure Firebase for data to sync across devices!
// 
// Follow these steps:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project (or use existing)
// 3. Enable Firestore Database
// 4. Get your config from Project Settings → Your apps → Web app
// 5. Replace the values below with your actual Firebase config
//
// See firebase-setup.md for detailed instructions

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Note: Firebase will be initialized in firebase-db.js
// If Firebase is not configured, the app will fallback to localStorage (device-specific)

