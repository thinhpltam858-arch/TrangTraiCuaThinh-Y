
import React from 'react';
import { Theme } from '../types';
import ThemeSwitcher from './ThemeSwitcher';

interface HeaderProps {
    onAddCage: () => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const Header: React.FC<HeaderProps> = ({ onAddCage, theme, setTheme }) => {
    return (
        <header className="mb-6 flex flex-wrap justify-between items-center gap-4">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-700">Trang Trại Nuôi Cua Thịnh Ý</h1>
                <p className="text-gray-500 mt-1">Nền tảng quản lý trang trại được vận hành bởi AI.</p>
            </div>
            <div className="flex items-center space-x-4">
                <ThemeSwitcher currentTheme={theme} onThemeChange={setTheme} />
                <button
                    onClick={onAddCage}
                    className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors shadow hover:shadow-md"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    <span>Thêm Lồng Mới</span>
                </button>
            </div>
        </header>
    );
};

export default Header;
