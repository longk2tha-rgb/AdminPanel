import React from 'react';
import { REGISTERED_TOOLS, ToolConfig } from '../../config/tools';
import { AdminUser } from '../types';
import { logoutAdmin } from '../auth/authService';

interface SidebarProps {
    currentTool: string | null;
    onToolChange: (toolId: string) => void;
    admin: AdminUser;
}

const Sidebar: React.FC<SidebarProps> = ({ currentTool, onToolChange, admin }) => {
    const handleLogout = async () => {
        if (confirm('Bạn có chắc muốn đăng xuất?')) {
            await logoutAdmin();
        }
    };

    return (
        <aside className="main-sidebar">
            {/* Header */}
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="logo-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <div className="logo-text">
                        <h2>Admin Panel</h2>
                        <p>Unified Management</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                <div className="nav-section">
                    <span className="nav-section-title">🛠️ CÔNG CỤ</span>
                    {REGISTERED_TOOLS.map((tool: ToolConfig) => (
                        <button
                            key={tool.id}
                            className={`nav-item ${currentTool === tool.id ? 'active' : ''}`}
                            onClick={() => onToolChange(tool.id)}
                            style={{ '--tool-color': tool.color } as React.CSSProperties}
                        >
                            <span className="nav-icon">{tool.icon}</span>
                            <span className="nav-label">{tool.name}</span>
                            {currentTool === tool.id && <span className="active-indicator"></span>}
                        </button>
                    ))}
                </div>
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                <div className="admin-info">
                    <div className="admin-avatar">
                        {admin.displayName?.[0]?.toUpperCase() || admin.email?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <div className="admin-details">
                        <h4>{admin.displayName || 'Admin'}</h4>
                        <p>{admin.email}</p>
                    </div>
                </div>

                <button className="logout-btn" onClick={handleLogout}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Đăng xuất
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
