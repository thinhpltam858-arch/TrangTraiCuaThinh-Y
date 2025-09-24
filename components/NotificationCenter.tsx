
import React, { useEffect, useRef } from 'react';
import { Notification } from '../types';
import { formatDistanceToNow } from '../utils/time';

interface NotificationCenterProps {
    notifications: Notification[];
    onClose: () => void;
}

const NotificationIcon: React.FC<{ type: 'alert' | 'harvest' }> = ({ type }) => {
    if (type === 'alert') {
        return (
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
        );
    }
    return (
         <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l1.414 1.414M17.586 19.586L19 21m0-16l-1.414 1.414M4.414 19.586L3 21m13.465-4.465a5.5 5.5 0 10-7.778-7.778 5.5 5.5 0 007.778 7.778z"></path></svg>
        </div>
    );
};

const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications, onClose }) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
        <div ref={dropdownRef} className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50">
            <div className="p-3 border-b font-semibold text-gray-700">Thông báo</div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map(notification => (
                        <div key={notification.id} className="p-3 flex items-start space-x-3 hover:bg-gray-50 border-b last:border-b-0">
                            <NotificationIcon type={notification.type} />
                            <div>
                                <p className="text-sm text-gray-800">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{formatDistanceToNow(notification.timestamp)}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-4 text-center text-sm text-gray-500">
                        Không có thông báo mới.
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationCenter;