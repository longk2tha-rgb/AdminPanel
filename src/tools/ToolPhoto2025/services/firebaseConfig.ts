// ToolPhoto2025 Firebase Configuration
// Separate Firebase instance for ToolPhoto2025 data
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAUFQb3vsZPVv6i5smRTeXJkVYZuJGoQZE",
    authDomain: "toolphoto-2025.firebaseapp.com",
    projectId: "toolphoto-2025",
    storageBucket: "toolphoto-2025.firebasestorage.app",
    messagingSenderId: "820992304466",
    appId: "1:820992304466:web:6400056a3bf60d747a868b",
    measurementId: "G-TDZCN54YD4"
};

// Initialize with unique name to avoid conflicts
const toolphotoApp = initializeApp(firebaseConfig, 'toolphoto2025');
export const auth = getAuth(toolphotoApp);
export const db = getFirestore(toolphotoApp);
export { toolphotoApp as app };
