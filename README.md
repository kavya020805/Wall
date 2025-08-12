# Global Collaborative Scribble Board

A real-time collaborative drawing application where multiple users can draw together on a shared canvas. Built with React and Firebase.

## Features

- **Real-time Collaboration**: Draw together with multiple users simultaneously
- **Live Cursor Tracking**: See other users' cursors as they move around the canvas
- **User Presence**: View who's currently online and drawing
- **Auto-cleanup**: User drawings are automatically removed when they leave
- **Simplified Interface**: Fixed black brush with no toolbar - just start drawing
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React.js
- **Backend**: Firebase (Authentication + Realtime Database)
- **Styling**: CSS3 with modern design
- **Real-time Sync**: Firebase Realtime Database listeners

## Setup Instructions

### 1. Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password provider
3. Create a Realtime Database with the following rules:

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

### 2. Update Firebase Config

Replace the placeholder configuration in `src/firebase.js` with your actual Firebase project details:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm start
```

The application will open at `http://localhost:3000`

## How It Works

### Authentication Flow
1. Users sign up/login with email and password
2. Upon successful authentication, they're redirected to the canvas
3. User presence is tracked in the Realtime Database

### Drawing System
1. **Fixed Brush**: Single black brush with preset size (3px)
2. **Real-time Sync**: All strokes are immediately broadcast to other users
3. **Stroke Management**: Each stroke is associated with a user ID
4. **Auto-cleanup**: When a user disconnects, their strokes are automatically removed

### User Presence
1. **Online Tracking**: Users are marked as online when they join
2. **Cursor Tracking**: Mouse movements are broadcast to show live cursors
3. **Disconnect Handling**: Users are automatically removed when they leave

## Project Structure

```
src/
├── components/
│   ├── Login.js          # Authentication component
│   ├── Login.css         # Login styles
│   ├── Canvas.js         # Main drawing canvas
│   └── Canvas.css        # Canvas styles
├── firebase.js           # Firebase configuration
├── App.js               # Main app component
├── App.css              # App styles
├── index.js             # Entry point
└── index.css            # Global styles
```

## Key Features Explained

### Simplified Interface
- No toolbar or tool selection
- Fixed black brush only
- No eraser or undo functionality
- Clean, distraction-free drawing experience

### Real-time Collaboration
- Firebase Realtime Database for instant stroke synchronization
- WebSocket-like behavior through Firebase listeners
- Smooth drawing experience with minimal lag

### User Management
- Email-based authentication
- Automatic user presence tracking
- Clean disconnect handling with stroke removal

### Responsive Design
- Works on desktop and mobile devices
- Adaptive layout for different screen sizes
- Touch-friendly interface

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Firebase Hosting

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Deploy: `firebase deploy`

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
