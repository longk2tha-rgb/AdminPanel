// Shared Types for Unified Admin Panel

export interface AdminUser {
    uid: string;
    email: string | null;
    displayName: string | null;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

// Tool-specific types can be defined in their respective folders
