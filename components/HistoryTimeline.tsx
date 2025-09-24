import React from 'react';
import { LogEntry, LogEntryType } from '../types';

const ICONS: Record<LogEntryType, { icon: React.ReactNode, color: string }> = {
    creation: {
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
        color: 'bg-green-500',
    },
    update: {
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5"></path></svg>,
        color: 'bg-blue-500',
    },
    feeding: {
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>,
        color: 'bg-yellow-500',
    },
    medicine: {
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21a9 9 0 000-18h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>,
        color: 'bg-purple-500',
    },
    death: {
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>,
        color: 'bg-red-500',
    },
    note: {
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>,
        color: 'bg-gray-500',
    },
    harvest: {
        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l1.414 1.414M17.586 19.586L19 21m0-16l-1.414 1.414M4.414 19.586L3 21m13.465-4.465a5.5 5.5 0 10-7.778-7.778 5.5 5.5 0 007.778 7.778z"></path></svg>,
        color: 'bg-teal-500',
    }
};

const TimelineItem: React.FC<{ entry: LogEntry; isLast: boolean }> = ({ entry, isLast }) => {
    const { icon, color } = ICONS[entry.type] || ICONS.note;
    const { date, details, meta } = entry;

    return (
        <div className="flex">
            <div className="flex flex-col items-center mr-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full text-white ${color}`}>
                    {icon}
                </div>
                {!isLast && <div className="w-px h-full bg-gray-300"></div>}
            </div>
            <div className="pb-8 flex-grow">
                 <div className="flex justify-between items-baseline">
                    <p className="mb-1 text-sm font-semibold text-gray-600">
                        {new Date(date).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    {meta?.user && (
                         <p className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{meta.user}</p>
                    )}
                </div>
                <p className="text-gray-800 font-medium">{details}</p>
                 {meta?.cost && <p className="text-xs text-red-600">Chi phí: {meta.cost.toLocaleString('vi-VN')} VND</p>}
            </div>
        </div>
    );
};

interface HistoryTimelineProps {
    logEntries: LogEntry[];
}

const HistoryTimeline: React.FC<HistoryTimelineProps> = ({ logEntries }) => {
    // Sort entries from most recent to oldest for display
    const sortedEntries = [...logEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (sortedEntries.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500">
                Chưa có hoạt động nào được ghi lại.
            </div>
        );
    }
    
    return (
        <div className="mt-4 max-h-[50vh] overflow-y-auto pr-2">
            {sortedEntries.map((entry, index) => (
                <TimelineItem key={`${entry.date}-${index}`} entry={entry} isLast={index === sortedEntries.length - 1} />
            ))}
        </div>
    );
};

export default HistoryTimeline;