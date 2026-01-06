// Admin Authentication Service for ToolPhoto2025
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebaseConfig';

export interface AdminUser {
    uid: string;
    email: string | null;
    displayName: string | null;
}

// Danh sách email admin được phép
const ADMIN_EMAILS = ['longk2tha@gmail.com'];

/**
 * Đăng nhập admin
 */
export const loginAdmin = async (email: string, password: string): Promise<AdminUser> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Kiểm tra xem email có trong danh sách admin không
        if (!ADMIN_EMAILS.includes(user.email || '')) {
            await signOut(auth);
            throw new Error('Bạn không có quyền truy cập Admin Panel');
        }

        return {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
        };
    } catch (error: any) {
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
            throw new Error('Email hoặc mật khẩu không đúng');
        }
        if (error.code === 'auth/user-not-found') {
            throw new Error('Tài khoản không tồn tại');
        }
        if (error.code === 'auth/too-many-requests') {
            throw new Error('Quá nhiều lần thử. Vui lòng thử lại sau');
        }
        throw error;
    }
};

/**
 * Đăng xuất admin
 */
export const logoutAdmin = async (): Promise<void> => {
    await signOut(auth);
    window.location.reload();
};

/**
 * Lấy thông tin admin hiện tại
 */
export const getCurrentAdmin = (): Promise<AdminUser | null> => {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
            unsubscribe();
            if (user && ADMIN_EMAILS.includes(user.email || '')) {
                resolve({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName
                });
            } else {
                resolve(null);
            }
        });
    });
};

/**
 * Theo dõi trạng thái đăng nhập admin
 */
export const onAdminAuthStateChanged = (callback: (admin: AdminUser | null) => void): (() => void) => {
    return onAuthStateChanged(auth, (user: User | null) => {
        if (user && ADMIN_EMAILS.includes(user.email || '')) {
            callback({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName
            });
        } else {
            callback(null);
        }
    });
};
