import React from 'react';
import { Cage } from '../types';

interface CageListItemProps {
    cage: Cage;
    onClick: () => void;
    onSelectChange: (id: string, isSelected: boolean) => void;
    isSelected: boolean;
}

const CageListItem: React.FC<CageListItemProps> = ({ cage, onClick, onSelectChange, isSelected }) => {
    const getFarmingDays = (startDateString: string) => {
        const start = new Date(startDateString);
        return Math.max(1, Math.floor((new Date().getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    };

    const farmingDays = getFarmingDays(cage.startDate);

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSelectChange(cage.id, e.target.checked);
    };
    
    // Prevent modal from opening when the checkbox container is clicked
    const handleCheckboxContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
    };

    return (
        <article
            onClick={onClick}
            className="bg-white rounded-lg shadow-sm p-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
            <div onClick={handleCheckboxContainerClick}>
                 <input
                    type="checkbox"
                    onChange={handleCheckboxChange}
                    checked={isSelected}
                    className="h-5 w-5 rounded text-primary-600 border-gray-300 focus:ring-primary-500"
                />
            </div>
           

            <div className="flex-grow flex items-center space-x-3 overflow-hidden">
                <span className="font-bold text-lg text-gray-700 w-12 text-center">{cage.id}</span>
                
                <div className="border-l pl-3 flex-grow overflow-hidden">
                    <div className="text-sm font-semibold text-gray-800 truncate">{cage.currentWeight}g</div>
                    <div className="text-xs text-gray-500 truncate">{farmingDays} ngày nuôi</div>
                </div>
            </div>
            
            <div className="flex-shrink-0 flex items-center space-x-2">
                {cage.aiAlert && (
                    <div className="text-red-500 animate-pulse" title="AI có cảnh báo!">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 003 15h14a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
                        </svg>
                    </div>
                )}
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
            </div>
        </article>
    );
};

export default CageListItem;