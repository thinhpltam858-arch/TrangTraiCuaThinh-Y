import React from 'react';
import { ReportType } from '../types';

interface ReportCenterProps {
    onGenerateReport: (type: ReportType) => void;
}

const ReportItem: React.FC<{
    id: ReportType,
    title: string,
    description: string,
    icon: React.ReactNode,
    color: string, // Tailwind bg-color class
    onClick: (type: ReportType) => void
}> = ({ id, title, description, icon, color, onClick }) => (
    <div 
        onClick={() => onClick(id)} 
        className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer flex flex-col h-full"
    >
        <div className="flex-grow">
            <div className={`flex-shrink-0 w-12 h-12 ${color} rounded-lg flex items-center justify-center text-gray-800 mb-4`}>
                {icon}
            </div>
            <h3 className="font-semibold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        <div className="mt-4 text-center bg-primary-500/10 text-primary-600 font-semibold py-2.5 px-4 rounded-lg hover:bg-primary-500/20 transition-colors text-sm">
            Xem Báo Cáo
        </div>
    </div>
);


const ReportCenter: React.FC<ReportCenterProps> = ({ onGenerateReport }) => {
    const allReports = [
        { 
            id: ReportType.Overview, 
            title: "Tổng quan", 
            description: "Tóm tắt toàn diện về tình hình trang trại của bạn.", 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>, 
            color: "bg-primary-100" 
        },
        { 
            id: ReportType.Performance, 
            title: "Hiệu suất", 
            description: "Phân tích lồng tăng trưởng tốt nhất và kém nhất.", 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>, 
            color: "bg-green-100" 
        },
        { 
            id: ReportType.HarvestReady, 
            title: "Sẵn sàng Thu hoạch", 
            description: "Liệt kê các lồng đã đạt tiêu chuẩn để thu hoạch.", 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l1.414 1.414M17.586 19.586L19 21m0-16l-1.414 1.414M4.414 19.586L3 21m13.465-4.465a5.5 5.5 0 10-7.778-7.778 5.5 5.5 0 007.778 7.778z"></path></svg>, 
            color: "bg-yellow-100" 
        },
        { 
            id: ReportType.Profit, 
            title: "Lợi nhuận", 
            description: "Phân tích chi tiết về doanh thu, chi phí và lãi/lỗ.", 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>, 
            color: "bg-purple-100" 
        },
        { 
            id: ReportType.Inventory, 
            title: "Quản lý Kho", 
            description: "Ước tính vật tư (thức ăn, thuốc) cho tháng tới.", 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4M4 7s0 0 0 0M12 15v4m-4-2v2m8-2v2"></path></svg>, 
            color: "bg-indigo-100" 
        }
    ];

    return (
        <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Trung tâm Báo cáo</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {allReports.map(report => (
                     <ReportItem key={report.id} {...report} onClick={onGenerateReport} />
                ))}
            </div>
        </section>
    );
};

export default ReportCenter;
