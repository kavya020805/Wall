# Global Scribble Board (Realtime Collaborative Wall)

A polished, real-time collaborative drawing app where people around the world can sketch together on a shared canvas. Built with React and Firebase, featuring modern UI, OAuth login, live cursors, and playful emoji avatars.

## Highlights

- **Google & Apple Login**: One-click sign-in via secure OAuth popups
- **Realtime Canvas**: Firebase Realtime Database sync for low-latency drawing
- **Live Cursors**: See where others are pointing in real-time
- **Online Presence**: Know who’s currently connected
- **Emoji Avatars (Animals)**: Fun, square avatars generated from animal emojis that change on each refresh
- **Performance Optimizations**: Throttled cursor updates, sampled stroke points, and requestAnimationFrame batched redraws
- **Responsive, Modern UI**: Cohesive gradient header, clean sidebar cards, and refined login screen

## Tech Stack

- **Frontend**: React 18
- **Auth**: Firebase Authentication (Email/Password, Google, Apple)
- **Realtime**: Firebase Realtime Database
- **Styling**: CSS (handcrafted, responsive)

## Getting Started

### 1) Firebase Setup

1. Create a Firebase project: `console.firebase.google.com`
2. In Authentication → Sign-in method, enable:
   - Email/Password
   - Google
   - Apple (see Apple notes below)
3. In Authentication → Settings → Authorized domains, add your dev and hosted domains:
   - `localhost`
   - `127.0.0.1`
   - Your Firebase Hosting domains (e.g., `your-project.web.app`, `your-project.firebaseapp.com`)
   - Any custom dev host you use (e.g., LAN IP)
4. Create a Realtime Database and use locked-down rules (example):

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

### 2) Add Config

Update `src/firebase.js` with your project’s configuration (apiKey, authDomain, etc.). The app already initializes `Auth` and `Database`, and exports OAuth providers for Google and Apple.

### 3) Install & Run

```bash
npm install
npm start
```

The app runs at `http://localhost:3000`.

## How It Works

### Auth Flow
- Users sign in with Email/Password, Google, or Apple
- Session is observed via `onAuthStateChanged`
- After sign-in, users land on the canvas

### Realtime Drawing
- Brush: fixed black stroke with width 3
- Points are saved as stroke arrays under each user in Realtime Database
- Other clients listen and redraw strokes as they arrive

### Presence & Cursors
- Presence is written to `onlineUsers` and cleaned up on disconnect
- Cursors are updated at ~30 FPS to reduce writes
- Cursor labels show the user’s email

### Emoji Avatars (Animals)
- Avatars in the sidebar are generated from a curated set of animal Twemoji PNGs
- A session-specific seed is created on each refresh, so the avatar changes every time
- Images are square (32×32) for full visibility

## Performance Optimizations
- **Cursor Throttle (~30fps)**: Cuts write frequency for smoother performance
- **Point Sampling**: Skips sub-2px movements to reduce point density and draw cost
- **rAF Redraws**: Full-canvas redraws are batched using `requestAnimationFrame`

## Project Structure

```
src/
├─ components/
│  ├─ Login.js / Login.css     # Auth UI with Google & Apple buttons
│  ├─ Canvas.js / Canvas.css   # Canvas, presence, cursors, avatars, UI
├─ firebase.js                  # Firebase app, Auth, DB, OAuth providers
├─ App.js / App.css             # App shell & loader
├─ index.js / index.css         # Entry & global styles
```
