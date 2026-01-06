// ToolPhoto2025 Admin Panel - Entry Component
import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import UserList from './components/UserList';
import NotificationSender from './components/NotificationSender';
import ClothingManager from './components/ClothingManager';
import FeedbackManager from './components/FeedbackManager';
import { AdminUser } from '../../core/types';

type Page = 'dashboard' | 'users' | 'notifications' | 'clothing' | 'feedbacks';

// Fake admin for now - will be passed from parent
const mockAdmin: AdminUser = {
    uid: 'admin',
    email: 'longk2tha@gmail.com',
    displayName: 'Admin'
};

const ToolPhoto2025Admin: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard />;
            case 'users':
                return <UserList />;
            case 'feedbacks':
                return <FeedbackManager />;
            case 'notifications':
                return <NotificationSender admin={mockAdmin} />;
            case 'clothing':
                return <ClothingManager />;
            default:
                return <Dashboard />;
        }
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'users', label: 'Quản lý Users', icon: '👥' },
        { id: 'feedbacks', label: 'Hòm Thư Góp Ý', icon: '📧' },
        { id: 'notifications', label: 'Gửi thông báo', icon: '🔔' },
        { id: 'clothing', label: 'Thư viện Trang phục', icon: '👔' },
    ];

    return (
        <div className="toolphoto-admin">
            {/* Internal Navigation */}
            <div className="tool-internal-nav">
                <div className="nav-header">
                    <h2>📷 ToolPhoto 2025</h2>
                    <span className="live-badge">🔴 Live</span>
                </div>
                <nav className="nav-tabs">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            className={`nav-tab ${currentPage === item.id ? 'active' : ''}`}
                            onClick={() => setCurrentPage(item.id as Page)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="tool-content">
                {renderPage()}
            </div>
        </div>
    );
};

export default ToolPhoto2025Admin;
