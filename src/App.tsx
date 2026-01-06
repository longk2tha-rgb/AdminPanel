// Unified Admin Panel - Main App
import React, { useState, useEffect } from 'react';
import { subscribeToAuthState } from './core/auth/authService';
import AdminLogin from './core/auth/AdminLogin';
import MainLayout from './core/layout/MainLayout';
import { AdminUser } from './core/types';
import { REGISTERED_TOOLS } from './config/tools';
import UpdateNotification from './components/UpdateNotification';

// Lazy load tool components
import DeCuongMateAdmin from './tools/DeCuongMate';
import ToolPhoto2025Admin from './tools/ToolPhoto2025';

const App: React.FC = () => {
    const [admin, setAdmin] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentTool, setCurrentTool] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = subscribeToAuthState((user) => {
            setAdmin(user);
            setLoading(false);
            // Set default tool if logged in
            if (user && !currentTool && REGISTERED_TOOLS.length > 0) {
                setCurrentTool(REGISTERED_TOOLS[0].id);
            }
        });

        return () => unsubscribe();
    }, [currentTool]);

    const handleLoginSuccess = () => {
        // Auth state listener will update the admin state
    };

    const handleToolChange = (toolId: string) => {
        setCurrentTool(toolId);
    };

    // Render tool component based on currentTool
    const renderToolContent = () => {
        if (!currentTool) {
            return (
                <div className="welcome-screen">
                    <div className="welcome-icon">👋</div>
                    <h2>Chào mừng đến Admin Panel</h2>
                    <p>Chọn một công cụ từ thanh bên trái để bắt đầu</p>
                </div>
            );
        }

        switch (currentTool) {
            case 'toolphoto2025':
                return <ToolPhoto2025Admin />;
            case 'decuongmate':
                return <DeCuongMateAdmin />;
            default:
                return (
                    <div className="tool-not-found">
                        <h2>🔧 Tool không tìm thấy</h2>
                        <p>Tool "{currentTool}" chưa được cài đặt.</p>
                    </div>
                );
        }
    };

    if (loading) {
        return (
            <div className="app-loading">
                <div className="loading-spinner"></div>
                <p>Đang kiểm tra phiên đăng nhập...</p>
            </div>
        );
    }

    // Not logged in - show login page
    if (!admin) {
        return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
    }

    // Logged in - show admin panel
    return (
        <>
            <UpdateNotification />
            <MainLayout
                admin={admin}
                currentTool={currentTool}
                onToolChange={handleToolChange}
            >
                {renderToolContent()}
            </MainLayout>
        </>
    );
};

export default App;
