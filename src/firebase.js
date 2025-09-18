import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Your Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCFBD60nC022esiVmEwmlAd0XEDndQhpXU",
    authDomain: "graffitiwall-79754.firebaseapp.com",
    projectId: "graffitiwall-79754",
    storageBucket: "graffitiwall-79754.firebasestorage.app",
    messagingSenderId: "380463004013",
    appId: "1:380463004013:web:a08a5418092421088d0264",
    measurementId: "G-0K055K34SZ"
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Set auth language to the device language
auth.useDeviceLanguage();

// Providers
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);

export default app;
