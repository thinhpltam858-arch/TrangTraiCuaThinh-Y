
import React, { useState } from 'react';
import { Cage } from '../../types';
import Modal from '../ui/Modal';

interface UpdateModalProps {
    cage: Cage;
    onClose: () => void;
    onSave: (updatedCage: Cage) => void;
}

const UpdateModal: React.FC<UpdateModalProps> = ({ cage, onClose, onSave }) => {
    const [weight, setWeight] = useState(cage.currentWeight.toString());
    const [feedCost, setFeedCost] = useState('0');
    const [medicineCost, setMedicineCost] = useState('0');
    const [deadCrabs, setDeadCrabs] = useState('0');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newWeight = parseInt(weight, 10);
        const newFeedCost = parseInt(feedCost, 10) || 0;
        const newMedCost = parseInt(medicineCost, 10) || 0;
        const newDeadCrabs = parseInt(deadCrabs, 10) || 0;
        
        if (isNaN(newWeight) || newWeight < 0) return;

        let logMessage = `Cập nhật: trọng lượng ${newWeight}g.`;
        if (newFeedCost > 0) logMessage += ` Thêm ${newFeedCost.toLocaleString('vi-VN')} VND thức ăn.`;
        if (newMedCost > 0) logMessage += ` Thêm ${newMedCost.toLocaleString('vi-VN')} VND thuốc.`;
        if (newDeadCrabs > 0) logMessage += ` Ghi nhận ${newDeadCrabs} cua chết.`;
        if (notes) logMessage += ` Ghi chú: ${notes}.`;

        const updatedCage: Cage = {
            ...cage,
            currentWeight: newWeight,
            costs: {
                ...cage.costs,
                feed: cage.costs.feed + newFeedCost,
                medicine: cage.costs.medicine + newMedCost,
            },
            progress: Math.min(100, Math.round((newWeight / 500) * 100)),
            growthHistory: [...cage.growthHistory, newWeight],
            log: [...cage.log, { date: new Date().toISOString(), message: logMessage }],
            deadCrabCount: cage.deadCrabCount + newDeadCrabs,
        };
        onSave(updatedCage);
    };

    return (
        <Modal isOpen={true} onClose={onClose} maxWidthClass="max-w-md">
            <h2 className="text-xl font-bold mb-4">Cập nhật Lồng #{cage.id}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Trọng lượng hiện tại (gam)</label>
                    <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Chi phí thức ăn thêm (VND)</label>
                    <input type="number" value={feedCost} onChange={e => setFeedCost(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Chi phí thuốc thêm (VND)</label>
                    <input type="number" value={medicineCost} onChange={e => setMedicineCost(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Số cua chết phát hiện</label>
                    <input type="number" value={deadCrabs} onChange={e => setDeadCrabs(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"></textarea>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg">Hủy</button>
                    <button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg">Lưu Cập Nhật</button>
                </div>
            </form>
        </Modal>
    );
};

export default UpdateModal;