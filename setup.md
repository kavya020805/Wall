# Quick Setup Guide

## Prerequisites
- Node.js (version 14 or higher)
- npm or yarn
- Firebase account

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password provider
4. Create Realtime Database:
   - Go to Realtime Database
   - Create database in test mode
   - Set rules to:
       ```json
    {
      "rules": {
        "strokes": {
          "$userId": {
            ".read": "auth != null",
            ".write": "auth != null && auth.uid == $userId"
          }
        },
        "onlineUsers": {
          ".read": "auth != null",
          ".write": "auth != null"
        },
        "cursors": {
          ".read": "auth != null",
          ".write": "auth != null"
        }
      }
    }
    ```
5. Get your config:
   - Go to Project Settings
   - Scroll down to "Your apps"
   - Click the web icon (</>)
   - Register your app
   - Copy the config object

## Step 3: Update Firebase Config

Edit `src/firebase.js` and replace the placeholder config with your actual Firebase configuration.

## Step 4: Run the Application

```bash
npm start
```

The app will open at http://localhost:3000

## Testing

1. Open the app in multiple browser tabs/windows
2. Sign up with different email addresses
3. Start drawing on the canvas
4. You should see real-time collaboration in action!

## Features to Test

- ✅ Real-time drawing synchronization
- ✅ Live cursor tracking
- ✅ Online users list
- ✅ Auto-cleanup when users leave
- ✅ Responsive design
- ✅ Authentication flow

## Troubleshooting

- **Firebase connection issues**: Check your config in `src/firebase.js`
- **Authentication errors**: Ensure Email/Password provider is enabled
- **Database errors**: Check your Realtime Database rules
- **CORS issues**: Make sure your Firebase project settings are correct
