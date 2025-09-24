import React from 'react';
import { Cage } from '../types';
import ProgressCircle from './ui/ProgressCircle';

interface CageCardProps {
    cage: Cage;
    onClick: () => void;
    onSelectChange: (id: string, isSelected: boolean) => void;
    isSelected: boolean;
}

const CageCard: React.FC<CageCardProps> = ({ cage, onClick, onSelectChange, isSelected }) => {
    const getFarmingInfo = (startDateString: string) => {
        const start = new Date(startDateString);
        const diffDays = Math.max(1, Math.floor((new Date().getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
        let colorClass = 'bg-gray-400'; // Default for < 10 days
        if (diffDays >= 40) colorClass = 'bg-red-500';
        else if (diffDays >= 30) colorClass = 'bg-green-500';
        else if (diffDays >= 20) colorClass = 'bg-yellow-400';
        else if (diffDays >= 10) colorClass = 'bg-purple-500';

        return { days: diffDays, color: colorClass };
    };

    const farmingInfo = getFarmingInfo(cage.startDate);

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSelectChange(cage.id, e.target.checked);
    };

    const handleCardClick = (e: React.MouseEvent<HTMLElement>) => {
        // Prevent modal from opening when the checkbox itself is clicked
        if ((e.target as HTMLElement).tagName.toLowerCase() !== 'input') {
            onClick();
        }
    };

    return (
        <article
            onClick={handleCardClick}
            className="cage-card bg-white rounded-xl shadow-md flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden group"
        >
            {/* FIX: Checkbox is now always visible to work on touch devices. */}
            <input
                type="checkbox"
                onChange={handleCheckboxChange}
                checked={isSelected}
                onClick={(e) => e.stopPropagation()} // Stop propagation to prevent card click
                className="cage-card-checkbox absolute top-3 left-3 h-5 w-5 rounded text-primary-600 border-gray-300 focus:ring-primary-500 z-10"
            />
            {cage.aiAlert && (
                <div className="absolute top-2 right-2 text-red-500 animate-pulse z-10" title="AI có cảnh báo!">
                    <svg className="w-6 h-6 p-1 bg-white/70 rounded-full" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 003 15h14a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
                    </svg>
                </div>
            )}

            <img src={`https://picsum.photos/seed/${cage.id}/200/150`} alt={`Hình ảnh lồng cua ${cage.id}`} className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105" />
            
            <div className="p-4 flex flex-col items-center flex-grow">
                <h3 className="text-3xl font-bold text-gray-700">{cage.id}</h3>
                <div className="my-2">
                    <ProgressCircle progress={cage.progress} />
                </div>
                <div className="w-full mt-2 pt-2 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
                    <span className="font-semibold">Ngày nuôi: <span className="text-gray-800">{farmingInfo.days}</span></span>
                    <span className={`w-3 h-3 rounded-full ${farmingInfo.color}`} title={`Farming day status`}></span>
                </div>
            </div>
        </article>
    );
};

export default CageCard;