

import React, { useState } from 'react';
import { Cage, LogEntry } from '../../types';
import Modal from '../ui/Modal';

interface UpdateModalProps {
    cage: Cage;
    onClose: () => void;
    onSave: (updatedCage: Cage) => void;
}

const UpdateModal: React.FC<UpdateModalProps> = ({ cage, onClose, onSave }) => {
    const [weight, setWeight] = useState(cage.currentWeight.toString());
    const [feedCost, setFeedCost] = useState('');
    const [medicineCost, setMedicineCost] = useState('');
    const [deadCrabs, setDeadCrabs] = useState('');
    const [notes, setNotes] = useState('');
    const [feedType, setFeedType] = useState('');
    const [feedWeight, setFeedWeight] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const now = new Date().toISOString();
        const newWeight = parseInt(weight, 10);
        const newFeedCost = parseInt(feedCost, 10) || 0;
        const newMedCost = parseInt(medicineCost, 10) || 0;
        const newDeadCrabs = parseInt(deadCrabs, 10) || 0;
        const newFeedWeight = parseInt(feedWeight, 10) || 0;
        
        if (isNaN(newWeight) || newWeight < 0) return;

        const newLogEntries: LogEntry[] = [];
        
        const updatedCage: Cage = {
            ...cage,
            currentWeight: newWeight,
            costs: {
                ...cage.costs,
                feed: cage.costs.feed + newFeedCost,
                medicine: cage.costs.medicine + newMedCost,
            },
            progress: Math.min(100, Math.round((newWeight / 500) * 100)),
            growthHistory: cage.growthHistory,
            log: [...cage.log],
            feedHistory: [...cage.feedHistory],
            deadCrabCount: cage.deadCrabCount + newDeadCrabs,
        };

        // Log weight update if it changed
        if (newWeight !== cage.currentWeight) {
            updatedCage.growthHistory = [...cage.growthHistory, newWeight];
            newLogEntries.push({
                date: now,
                type: 'update',
                details: `Trọng lượng mới: ${newWeight}g. Tăng ${newWeight - cage.currentWeight}g.`,
                meta: { newWeight, oldWeight: cage.currentWeight }
            });
        }
        
        // Handle feed log
        if (newFeedCost > 0 || newFeedWeight > 0 || feedType.trim() !== '') {
            const feedLogEntry = {
                date: now,
                feedType: feedType.trim() || 'Thức ăn chung',
                weight: newFeedWeight,
                cost: newFeedCost
            };
            updatedCage.feedHistory.push(feedLogEntry);
            newLogEntries.push({
                date: now,
                type: 'feeding',
                details: `Cho ăn ${feedLogEntry.weight}g ${feedLogEntry.feedType}.`,
                meta: { ...feedLogEntry }
            });
        }
        
        // Handle medicine log
        if (newMedCost > 0) {
            newLogEntries.push({
                date: now,
                type: 'medicine',
                details: `Sử dụng thuốc.`,
                meta: { cost: newMedCost }
            });
        }

        // Handle dead crab log
        if (newDeadCrabs > 0) {
            newLogEntries.push({
                date: now,
                type: 'death',
                details: `Ghi nhận ${newDeadCrabs} cua chết.`,
                meta: { count: newDeadCrabs }
            });
        }

        // Handle general notes
        if (notes.trim()) {
            newLogEntries.push({
                date: now,
                type: 'note',
                details: notes.trim(),
                meta: {}
            });
        }
        
        updatedCage.log.push(...newLogEntries);
        // Sort log by date to ensure chronological order
        updatedCage.log.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
                    <label className="block text-sm font-medium text-gray-700">Số cua chết phát hiện</label>
                    <input type="number" value={deadCrabs} onChange={e => setDeadCrabs(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" placeholder="0"/>
                </div>

                <fieldset className="border-t pt-4">
                    <legend className="text-sm font-medium text-gray-900 mb-2">Ghi nhận Dinh dưỡng & Chi phí (tùy chọn)</legend>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Loại thức ăn</label>
                            <input type="text" value={feedType} onChange={e => setFeedType(e.target.value)} placeholder="VD: Thức ăn công nghiệp A1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Lượng thức ăn (gam)</label>
                            <input type="number" value={feedWeight} onChange={e => setFeedWeight(e.target.value)} placeholder="0" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Chi phí thức ăn (VND)</label>
                            <input type="number" value={feedCost} onChange={e => setFeedCost(e.target.value)} placeholder="0" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Chi phí thuốc (VND)</label>
                            <input type="number" value={medicineCost} onChange={e => setMedicineCost(e.target.value)} placeholder="0" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
                        </div>
                    </div>
                </fieldset>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">Ghi chú chung</label>
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