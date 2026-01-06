// Firebase configuration for DeCuongMate Admin
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, update, remove, push } from 'firebase/database';

// DeCuongMate Firebase Config - Separate from main auth
const firebaseConfig = {
    apiKey: "AIzaSyCpg5b1iLe6cQIP1kbcp9UYHptRDe4auo8",
    authDomain: "decuongmate.firebaseapp.com",
    databaseURL: "https://decuongmate-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "decuongmate",
    storageBucket: "decuongmate.firebasestorage.app",
    messagingSenderId: "501658395606",
    appId: "1:501658395606:web:8ae3e0d09d8042dd063a77",
    measurementId: "G-SDK59KEWXC"
};

// Initialize Firebase with unique name to avoid conflicts
const decuongApp = initializeApp(firebaseConfig, 'decuongmate');
const database = getDatabase(decuongApp);

// User type definition - matching main app structure
export interface FirebaseUser {
    id: string;
    email?: string;        // Email đăng nhập (Firebase Auth)
    phoneNumber?: string;  // Legacy phone login (optional)
    password?: string;
    name: string;
    tier: 'free' | 'pro';
    credits: number;
    downloadsLeft: number;
    createdAt: number;
    isVerified?: boolean;
    authProvider?: 'email' | 'google' | 'phone';
}

// ==================== USER MANAGEMENT ====================

// Get all users
export const getAllUsers = async (): Promise<FirebaseUser[]> => {
    try {
        const usersRef = ref(database, 'users');
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
            const data = snapshot.val();
            return Object.keys(data).map(key => ({ ...data[key], id: key }));
        }
        return [];
    } catch (error) {
        console.error('Error getting users:', error);
        return [];
    }
};

// Create new user
export const createUser = async (userData: Omit<FirebaseUser, 'id'>): Promise<FirebaseUser | null> => {
    try {
        const usersRef = ref(database, 'users');
        const newUserRef = push(usersRef);
        const newUser: FirebaseUser = {
            ...userData,
            id: newUserRef.key!,
        };
        await set(newUserRef, newUser);
        return newUser;
    } catch (error) {
        console.error('Error creating user:', error);
        return null;
    }
};

// Update user
export const updateUser = async (userId: string, updates: Partial<FirebaseUser>): Promise<boolean> => {
    try {
        const userRef = ref(database, `users/${userId}`);
        await update(userRef, updates);
        return true;
    } catch (error) {
        console.error('Error updating user:', error);
        return false;
    }
};

// Delete user
export const deleteUser = async (userId: string): Promise<boolean> => {
    try {
        const userRef = ref(database, `users/${userId}`);
        await remove(userRef);
        return true;
    } catch (error) {
        console.error('Error deleting user:', error);
        return false;
    }
};

// Listen to all users changes (real-time) - for Admin
export const subscribeToAllUsers = (callback: (users: FirebaseUser[]) => void) => {
    const usersRef = ref(database, 'users');
    return onValue(usersRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const users = Object.keys(data).map(key => ({ ...data[key], id: key }));
            callback(users);
        } else {
            callback([]);
        }
    });
};

// Add credits
export const addCredits = async (userId: string, amount: number): Promise<boolean> => {
    try {
        const userRef = ref(database, `users/${userId}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            const user = snapshot.val();
            await update(userRef, { credits: (user.credits || 0) + amount });
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error adding credits:', error);
        return false;
    }
};

// Toggle Pro tier
export const toggleProTier = async (userId: string): Promise<boolean> => {
    try {
        const userRef = ref(database, `users/${userId}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
            const user = snapshot.val();
            const newTier = user.tier === 'pro' ? 'free' : 'pro';
            await update(userRef, {
                tier: newTier,
                downloadsLeft: newTier === 'pro' ? 999999 : 3
            });
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error toggling tier:', error);
        return false;
    }
};

// Reset all users credits
export const resetAllCredits = async (newCredits: number = 3): Promise<boolean> => {
    try {
        const users = await getAllUsers();
        const promises = users.map(user =>
            update(ref(database, `users/${user.id}`), { credits: newCredits })
        );
        await Promise.all(promises);
        return true;
    } catch (error) {
        console.error('Error resetting credits:', error);
        return false;
    }
};

// Upgrade all users to Pro
export const upgradeAllToPro = async (): Promise<boolean> => {
    try {
        const users = await getAllUsers();
        const promises = users.map(user =>
            update(ref(database, `users/${user.id}`), { tier: 'pro', downloadsLeft: 999999 })
        );
        await Promise.all(promises);
        return true;
    } catch (error) {
        console.error('Error upgrading all to pro:', error);
        return false;
    }
};

export { database };
