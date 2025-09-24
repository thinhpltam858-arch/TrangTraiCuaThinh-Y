
import React from 'react';
import { Cage } from '../types';
import CageCard from './CageCard';

interface CageGridProps {
    cages: Cage[];
    onCardClick: (cage: Cage) => void;
    onSelectChange: (id: string, isSelected: boolean) => void;
    selectedCages: Set<string>;
}

const CageGrid: React.FC<CageGridProps> = ({ cages, onCardClick, onSelectChange, selectedCages }) => {
    return (
        <main className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 pb-20">
            {cages.map(cage => (
                <CageCard 
                    key={cage.id} 
                    cage={cage} 
                    onClick={() => onCardClick(cage)} 
                    onSelectChange={onSelectChange}
                    isSelected={selectedCages.has(cage.id)}
                />
            ))}
        </main>
    );
};

export default CageGrid;
