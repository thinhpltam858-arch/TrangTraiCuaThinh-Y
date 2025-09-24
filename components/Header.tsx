

import React, { useState, useMemo } from 'react';
import { Theme, Notification } from '../types';
import ThemeSwitcher from './ThemeSwitcher';
import NotificationCenter from './NotificationCenter';

interface HeaderProps {
    onAddCage: () => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    notifications: Notification[];
    onMarkAsRead: () => void;
    currentView: 'cages' | 'dashboard';
    onNavigate: (view: 'cages' | 'dashboard') => void;
}

const NavButton: React.FC<{
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
}> = ({ isActive, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-md font-semibold transition-colors text-sm sm:text-base ${
            isActive
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-200'
        }`}
    >
        {children}
    </button>
);


const Header: React.FC<HeaderProps> = ({ onAddCage, theme, setTheme, notifications, onMarkAsRead, currentView, onNavigate }) => {
    const [isNotificationOpen, setNotificationOpen] = useState(false);

    const unreadCount = useMemo(() => {
        return notifications.filter(n => !n.read).length;
    }, [notifications]);

    const handleNotificationToggle = () => {
        setNotificationOpen(prev => !prev);
        if (!isNotificationOpen && unreadCount > 0) {
            onMarkAsRead();
        }
    };
    
    return (
        <header className="mb-6 flex flex-wrap justify-between items-center gap-4">
            {/* Navigation */}
            <div className="flex items-center space-x-2 p-1 bg-gray-100 rounded-lg">
                <NavButton isActive={currentView === 'cages'} onClick={() => onNavigate('cages')}>
                    Quản lý Lồng
                </NavButton>
                <NavButton isActive={currentView === 'dashboard'} onClick={() => onNavigate('dashboard')}>
                    Bảng Tài chính
                </NavButton>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-2 sm:space-x-4">
                <ThemeSwitcher currentTheme={theme} onThemeChange={setTheme} />

                <div className="relative">
                    <button onClick={handleNotificationToggle} className="text-gray-500 hover:text-primary-500 p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                         {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 block h-5 w-5 rounded-full ring-2 ring-white bg-red-500 text-white text-xs flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                    {isNotificationOpen && <NotificationCenter notifications={notifications} onClose={() => setNotificationOpen(false)} />}
                </div>

                <button
                    onClick={onAddCage}
                    className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors shadow hover:shadow-md"
                >
                    <svg className="w-5 h-5 hidden sm:inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    <span className="text-sm sm:text-base">Thêm Lồng</span>
                </button>
            </div>
        </header>
    );
};

export default Header;