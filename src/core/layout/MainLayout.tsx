import React from 'react';
import Sidebar from './Sidebar';
import { AdminUser } from '../types';

interface MainLayoutProps {
    admin: AdminUser;
    currentTool: string | null;
    onToolChange: (toolId: string) => void;
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({
    admin,
    currentTool,
    onToolChange,
    children
}) => {
    return (
        <div className="app-layout">
            <Sidebar
                currentTool={currentTool}
                onToolChange={onToolChange}
                admin={admin}
            />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
