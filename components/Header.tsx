

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Theme, Notification, User } from '../types';
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
    user: User;
    onSignOut: () => void;
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


const Header: React.FC<HeaderProps> = ({ onAddCage, theme, setTheme, notifications, onMarkAsRead, currentView, onNavigate, user, onSignOut }) => {
    const [isNotificationOpen, setNotificationOpen] = useState(false);
    const [isUserMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const unreadCount = useMemo(() => {
        return notifications.filter(n => !n.read).length;
    }, [notifications]);

    const handleNotificationToggle = () => {
        setNotificationOpen(prev => !prev);
        if (!isNotificationOpen && unreadCount > 0) {
            onMarkAsRead();
        }
    };

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
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

                 <div className="relative" ref={userMenuRef}>
                    <button onClick={() => setUserMenuOpen(prev => !prev)} className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold hover:bg-gray-300">
                         {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                    </button>
                    {isUserMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border z-50">
                            <div className="p-3 border-b">
                                <p className="text-sm font-semibold text-gray-800">Đã đăng nhập với</p>
                                <p className="text-sm text-gray-600 truncate">{user.email}</p>
                            </div>
                            <button onClick={onSignOut} className="w-full text-left p-3 hover:bg-gray-100 text-sm text-red-600 font-medium">
                                Đăng xuất
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;