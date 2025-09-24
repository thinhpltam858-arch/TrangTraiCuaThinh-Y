

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Cage, AIHealthReport } from '../../types';
import Modal from '../ui/Modal';
import GrowthChart from '../ui/GrowthChart';
import { getHealthCheckAnalysis } from '../../services/geminiService';
import AICheckModal from './AICheckModal';
import HistoryTimeline from '../HistoryTimeline';

type Tab = 'overview' | 'history' | 'ai';

interface DetailsModalProps {
    cage: Cage;
    onClose: () => void;
    onUpdate: () => void;
    onHarvest: () => void;
    onDelete: (id: string) => void;
    targetWeight: number;
}

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
            active
                ? 'bg-primary-500 text-white'
                : 'text-gray-600 hover:bg-gray-200'
        }`}
    >
        {children}
    </button>
);

const OverviewTab: React.FC<Omit<DetailsModalProps, 'onClose'>> = ({ cage, onUpdate, onHarvest, onDelete, targetWeight }) => {
    const [isConfirmingDelete, setConfirmingDelete] = useState(false);
    
    const {formatCurrency, formatDate, getFarmingDays} = useMemo(() => {
        return {
            formatCurrency: (value: number) => value.toLocaleString('vi-VN'),
            formatDate: (dateString: string) => new Date(dateString).toLocaleDateString('vi-VN'),
            getFarmingDays: (startDateString: string) => Math.max(1, Math.floor((new Date().getTime() - new Date(startDateString).getTime()) / (1000 * 60 * 60 * 24)))
        }
    },[]);

    const farmingDays = getFarmingDays(cage.startDate);
    const weightGain = cage.currentWeight - cage.initialWeight;
    const totalCost = cage.costs.seed + cage.costs.feed + cage.costs.medicine;

    const aiPrediction = useMemo(() => {
        const growthRate = weightGain / farmingDays;
        const daysToTarget = (targetWeight - cage.currentWeight) / (growthRate || 2.5);
        if (daysToTarget < 0) return `Đã đạt trọng lượng mục tiêu!`;
        const predictedDate = new Date();
        predictedDate.setDate(predictedDate.getDate() + Math.round(daysToTarget));
        return `Ước tính đạt ${targetWeight}g vào ngày ${formatDate(predictedDate.toISOString())}.`;
    }, [cage, farmingDays, weightGain, targetWeight, formatDate]);

    const handleDeleteClick = () => {
        if (isConfirmingDelete) {
            onDelete(cage.id);
        } else {
            setConfirmingDelete(true);
            setTimeout(() => setConfirmingDelete(false), 3000);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
             {/* Left Column */}
            <div>
                <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Báo cáo Tình trạng</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-lg col-span-2">
                            <div>
                                <div className="font-semibold">{farmingDays} ngày (Từ {formatDate(cage.startDate)})</div>
                                <div className="text-xs text-gray-500">Thời gian nuôi</div>
                            </div>
                        </div>
                        <div><div className="font-semibold">{cage.initialWeight}g</div><div className="text-xs">Trọng lượng thả</div></div>
                        <div><div className="font-semibold">{cage.currentWeight}g</div><div className="text-xs">Hiện tại</div></div>
                        <div className={`p-2 rounded-lg ${cage.deadCrabCount > 0 ? "bg-red-50 text-red-800" : ""}`}>
                            <div className="font-semibold">{cage.deadCrabCount}</div><div className="text-xs">Cua chết</div>
                        </div>
                        <div className="bg-green-50 p-2 rounded-lg text-green-800">
                            <div className="font-semibold">{weightGain > 0 ? `+${weightGain}g` : `${weightGain}g`}</div>
                            <div className="text-xs">Tăng trưởng</div>
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Phân tích Chi phí (VND)</h3>
                    <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between"><span>Giống:</span><span className="font-semibold">{formatCurrency(cage.costs.seed)}</span></div>
                        <div className="flex justify-between"><span>Thức ăn:</span><span className="font-semibold">{formatCurrency(cage.costs.feed)}</span></div>
                        <div className="flex justify-between"><span>Thuốc:</span><span className="font-semibold">{formatCurrency(cage.costs.medicine)}</span></div>
                        <div className="flex justify-between pt-2 mt-2 border-t text-base"><strong>Tổng:</strong><strong className="text-red-600">{formatCurrency(totalCost)}</strong></div>
                    </div>
                </div>
            </div>
            {/* Right Column */}
            <div>
                 <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
                    <h3 className="text-sm font-medium text-indigo-800 mb-2">Trợ lý AI (Dự báo)</h3>
                    <div className="text-sm text-indigo-700">{aiPrediction}</div>
                </div>

                <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Biểu đồ tăng trưởng (gam)</h3>
                    <div className="bg-gray-50 p-2 rounded-lg">
                        <GrowthChart data={cage.growthHistory} />
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-3 mt-4">
                    <button onClick={onHarvest} className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-4 rounded-lg">Thu Hoạch</button>
                    <button onClick={onUpdate} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg">Cập Nhật</button>
                    <button onClick={handleDeleteClick} className={`col-span-2 w-full text-white font-semibold py-2.5 px-4 rounded-lg transition-colors ${isConfirmingDelete ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-red-500 hover:bg-red-600'}`}>
                        {isConfirmingDelete ? 'Xác nhận Xóa?' : 'Xóa Lồng'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AITab: React.FC<{ cage: Cage }> = ({ cage }) => {
    const [analysisResult, setAnalysisResult] = useState<AIHealthReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const hasAnalyzed = useRef(false);

    const runAnalysis = useCallback(async () => {
        setIsLoading(true);
        const result = await getHealthCheckAnalysis(cage);
        setAnalysisResult(result);
        setIsLoading(false);
        hasAnalyzed.current = true;
    }, [cage]);

    useEffect(() => {
        if (!hasAnalyzed.current) {
            runAnalysis();
        }
    }, [runAnalysis]);
    
    return (
        <div className="mt-4">
            <AICheckModal 
                onClose={() => {}} 
                fetchAnalysis={() => getHealthCheckAnalysis(cage)} 
                isEmbedded={true}
                onRerun={runAnalysis}
            />
        </div>
    );
};

const DetailsModal: React.FC<DetailsModalProps> = (props) => {
    const { cage, onClose } = props;
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    // Add a default user to older log entries for consistent display
    const logsWithUser = useMemo(() => {
        return cage.log.map(entry => ({
            ...entry,
            meta: {
                ...entry.meta,
                user: entry.meta?.user || 'Hệ thống'
            }
        }));
    }, [cage.log]);

    return (
        <Modal isOpen={true} onClose={onClose}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-2xl font-bold">Chi tiết Lồng #{cage.id}</h2>
                    {cage.aiAlert && (
                        <div className="mt-1 text-sm text-red-600 font-semibold animate-pulse">
                            (Có cảnh báo AI)
                        </div>
                    )}
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            
            <div className="border-b border-gray-200 mb-4">
                <div className="flex space-x-2">
                    <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>Tổng quan</TabButton>
                    <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')}>Lịch sử Chi tiết</TabButton>
                    <TabButton active={activeTab === 'ai'} onClick={() => setActiveTab('ai')}>Phân tích AI</TabButton>
                </div>
            </div>

            <div>
                {activeTab === 'overview' && <OverviewTab {...props} />}
                {activeTab === 'history' && <HistoryTimeline logEntries={logsWithUser} />}
                {activeTab === 'ai' && <AITab cage={cage} />}
            </div>
        </Modal>
    );
};

export default DetailsModal;