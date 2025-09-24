
import React from 'react';
import { Theme } from '../types';

interface ThemeSwitcherProps {
    currentTheme: Theme;
    onThemeChange: (theme: Theme) => void;
}

const themes: { name: Theme; color: string }[] = [
    { name: 'blue', color: 'bg-blue-500' },
    { name: 'green', color: 'bg-green-500' },
    { name: 'orange', color: 'bg-orange-500' }
];

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ currentTheme, onThemeChange }) => {
    return (
        <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-full">
            {themes.map(theme => (
                <button
                    key={theme.name}
                    onClick={() => onThemeChange(theme.name)}
                    className={`w-6 h-6 rounded-full ${theme.color} transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-primary-500`}
                    aria-label={`Set theme to ${theme.name}`}
                >
                    {currentTheme === theme.name && (
                        <div className="w-full h-full rounded-full ring-2 ring-white ring-offset-2 ring-offset-primary-500"></div>
                    )}
                </button>
            ))}
        </div>
    );
};

export default ThemeSwitcher;
