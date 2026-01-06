// Unified Admin Authentication Service
import {
    signInWithEmailAndPassword,
    signOut,
    User as FirebaseUser,
    onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { AdminUser } from '../types';

// Whitelist of allowed admin emails
const ADMIN_WHITELIST = ['longk2tha@gmail.com'];

// Check if email is admin
export const isAdminEmail = (email: string | null): boolean => {
    if (!email) return false;
    return ADMIN_WHITELIST.includes(email.toLowerCase());
};

// Login admin with email and password
export const loginAdmin = async (email: string, password: string): Promise<AdminUser> => {
    // First check if email is in whitelist
    if (!isAdminEmail(email)) {
        throw new Error('Bạn không có quyền truy cập Admin Panel');
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        return {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
        };
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.message.includes('auth/invalid-credential') ||
                error.message.includes('auth/wrong-password')) {
                throw new Error('Email hoặc mật khẩu không đúng');
            }
            if (error.message.includes('auth/user-not-found')) {
                throw new Error('Tài khoản không tồn tại');
            }
            if (error.message.includes('auth/too-many-requests')) {
                throw new Error('Quá nhiều lần thử. Vui lòng thử lại sau');
            }
        }
        throw new Error('Đã xảy ra lỗi khi đăng nhập');
    }
};

// Logout admin
export const logoutAdmin = async (): Promise<void> => {
    await signOut(auth);
};

// Subscribe to auth state changes
export const subscribeToAuthState = (
    callback: (user: AdminUser | null) => void
): (() => void) => {
    return onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser && isAdminEmail(firebaseUser.email)) {
            callback({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName
            });
        } else {
            callback(null);
        }
    });
};

// Get current admin user
export const getCurrentAdmin = (): AdminUser | null => {
    const user = auth.currentUser;
    if (user && isAdminEmail(user.email)) {
        return {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
        };
    }
    return null;
};
