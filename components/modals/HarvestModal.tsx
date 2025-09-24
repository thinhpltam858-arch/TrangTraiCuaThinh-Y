
import React, { useState } from 'react';
import { Cage } from '../../types';
import Modal from '../ui/Modal';

interface HarvestModalProps {
    cage: Cage;
    onClose: () => void;
    onHarvest: (finalWeight: number, pricePerKg: number) => void;
}

const HarvestModal: React.FC<HarvestModalProps> = ({ cage, onClose, onHarvest }) => {
    const [weight, setWeight] = useState(cage.currentWeight.toString());
    const [price, setPrice] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalWeight = parseInt(weight, 10);
        const pricePerKg = parseInt(price, 10);

        if (isNaN(finalWeight) || isNaN(pricePerKg) || finalWeight <= 0 || pricePerKg <= 0) {
            alert('Vui lòng nhập trọng lượng và giá hợp lệ.');
            return;
        }
        onHarvest(finalWeight, pricePerKg);
    };

    return (
        <Modal isOpen={true} onClose={onClose} maxWidthClass="max-w-md">
            <h2 className="text-xl font-bold mb-4">Thu hoạch Lồng #{cage.id}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Trọng lượng cuối cùng (gam)</label>
                    <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Giá bán (VND / kg)</label>
                    <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" required placeholder="Ví dụ: 350000" />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg">Hủy</button>
                    <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg">Xác nhận Thu hoạch</button>
                </div>
            </form>
        </Modal>
    );
};

export default HarvestModal;
