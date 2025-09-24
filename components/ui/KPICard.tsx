
import React from 'react';

interface KPICardProps {
    title: string;
    value: string;
    description?: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, description }) => {
    return (
        <div className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
            {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
        </div>
    );
};

export default KPICard;
