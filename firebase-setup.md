# Firebase Setup Instructions

## Why Firebase?

The app currently uses localStorage which is device-specific. Firebase will sync data across all devices so:
- Users created on one device will be available on all devices
- Excel files uploaded on one device will be available to all users on all devices
- Data persists in the cloud

## Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add project" or "Create a project"
3. Enter project name: `NumberPrediction` (or any name)
4. Disable Google Analytics (optional, can enable later)
5. Click "Create project"
6. Wait for project to be created

## Step 2: Enable Firestore Database

1. In Firebase Console, click "Firestore Database" (left sidebar)
2. Click "Create database"
3. Select "Start in test mode" (for now)
4. Choose a location (closest to your users)
5. Click "Enable"

## Step 3: Get Firebase Config

1. In Firebase Console, click the gear icon ⚙️ (Project Settings)
2. Scroll down to "Your apps" section
3. Click the web icon `</>` (Add app)
4. Register app with nickname: "Number Prediction Web"
5. Copy the `firebaseConfig` object

## Step 4: Update firebase-config.js

1. Open `firebase-config.js` in your project
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "AIza...", // Your actual API key
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};
```

## Step 5: Set Firestore Security Rules

1. Go to Firestore Database → Rules
2. Replace with these rules (for basic security):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to users collection
    match /users/{userId} {
      allow read, write: if true; // For now, allow all (can restrict later)
    }
    
    // Allow read/write access to excelData
    match /excelData/{document} {
      allow read, write: if true; // For now, allow all (can restrict later)
    }
  }
}
```

3. Click "Publish"

## Step 6: Test

1. Upload an Excel file as admin
2. Check Firebase Console → Firestore Database
3. You should see collections: `users` and `excelData`
4. Try logging in from a different device - data should sync!

## Important Notes

- Firebase free tier (Spark plan) is sufficient for most use cases
- Data syncs in real-time across all devices
- No backend code needed - Firebase handles everything
- Data is stored in Google's cloud infrastructure

## Troubleshooting

If data doesn't sync:
1. Check browser console for errors
2. Verify Firebase config is correct
3. Check Firestore rules allow read/write
4. Ensure Firebase SDK is loaded in HTML files

