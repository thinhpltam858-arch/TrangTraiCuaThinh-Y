import React from 'react';
import { Cage } from '../types';
import CageCard from './CageCard';
import CageListItem from './CageListItem';

interface CageGridProps {
    cages: Cage[];
    onCardClick: (cage: Cage) => void;
    onSelectChange: (id: string, isSelected: boolean) => void;
    selectedCages: Set<string>;
}

const CageGrid: React.FC<CageGridProps> = ({ cages, onCardClick, onSelectChange, selectedCages }) => {
    return (
        <main>
            {/* Grid layout for larger screens (sm and up) */}
            <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 pb-20">
                {cages.map(cage => (
                    <CageCard 
                        key={cage.id} 
                        cage={cage} 
                        onClick={() => onCardClick(cage)} 
                        onSelectChange={onSelectChange}
                        isSelected={selectedCages.has(cage.id)}
                    />
                ))}
            </div>

            {/* List layout for mobile screens (smaller than sm) */}
            <div className="sm:hidden space-y-3 pb-20">
                {cages.map(cage => (
                    <CageListItem
                        key={cage.id}
                        cage={cage}
                        onClick={() => onCardClick(cage)}
                        onSelectChange={onSelectChange}
                        isSelected={selectedCages.has(cage.id)}
                    />
                ))}
            </div>
        </main>
    );
};

export default CageGrid;