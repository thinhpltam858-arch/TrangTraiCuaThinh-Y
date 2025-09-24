
import React, { useState, useMemo, useCallback } from 'react';
import { Cage, AIHealthReport } from '../../types';
import Modal from '../ui/Modal';
import GrowthChart from '../ui/GrowthChart';
import { getHealthCheckAnalysis } from '../../services/geminiService';
import AICheckModal from './AICheckModal';

interface DetailsModalProps {
    cage: Cage;
    onClose: () => void;
    onUpdate: () => void;
    onHarvest: () => void;
    onDelete: (id: string) => void;
    targetWeight: number;
}

const DetailsModal: React.FC<DetailsModalProps> = ({ cage, onClose, onUpdate, onHarvest, onDelete, targetWeight }) => {
    const [isConfirmingDelete, setConfirmingDelete] = useState(false);
    const [isAICheckModalOpen, setAICheckModalOpen] = useState(false);
    
    const {formatCurrency, formatDate, formatDateTime, getFarmingDays} = useMemo(() => {
        return {
            formatCurrency: (value: number) => value.toLocaleString('vi-VN'),
            formatDate: (dateString: string) => new Date(dateString).toLocaleDateString('vi-VN'),
            formatDateTime: (dateString: string) => new Date(dateString).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short'}),
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
        <>
            <Modal isOpen={true} onClose={onClose}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Chi tiết Lồng #{cage.id}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                {cage.aiAlert && (
                    <div className="p-3 mb-4 bg-red-100 text-red-800 rounded-lg text-sm">
                        <strong>Cảnh báo AI:</strong> Tốc độ tăng trưởng chậm bất thường. Cần kiểm tra ngay!
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                        <div className="mb-4">
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Biểu đồ tăng trưởng (gam)</h3>
                            <div className="bg-gray-50 p-2 rounded-lg">
                                <GrowthChart data={cage.growthHistory} />
                            </div>
                        </div>
                    </div>
                    {/* Right Column */}
                    <div>
                        <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
                            <h3 className="text-sm font-medium text-indigo-800 mb-2">Trợ lý AI</h3>
                            <div className="text-sm text-indigo-700 mb-3"><strong>Dự báo:</strong> {aiPrediction}</div>
                            <button onClick={() => setAICheckModalOpen(true)} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg text-sm flex items-center justify-center space-x-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                <span>Kiểm tra Sức khỏe (AI)</span>
                            </button>
                        </div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Nhật ký Hoạt động</h3>
                        <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-2 h-32 overflow-y-auto">
                            {cage.log.slice().reverse().map((l, i) => (
                                <div key={i}><strong>{formatDateTime(l.date)}:</strong> {l.message}</div>
                            ))}
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
            </Modal>
            {isAICheckModalOpen && (
                 <AICheckModal 
                    onClose={() => setAICheckModalOpen(false)} 
                    fetchAnalysis={() => getHealthCheckAnalysis(cage)} 
                 />
            )}
        </>
    );
};

export default DetailsModal;
