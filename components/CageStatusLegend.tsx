import React from 'react';

const legendItems = [
    { color: 'bg-red-500', label: '>= 40 ngày' },
    { color: 'bg-green-500', label: '30-39 ngày' },
    { color: 'bg-yellow-400', label: '20-29 ngày' },
    { color: 'bg-purple-500', label: '10-19 ngày' },
    { color: 'bg-gray-400', label: '< 10 ngày' },
];

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
    <div className="flex items-center space-x-2">
        <span className={`w-3 h-3 rounded-full ${color}`}></span>
        <span className="text-xs text-gray-600">{label}</span>
    </div>
);

const CageStatusLegend: React.FC = () => {
    return (
        <section className="mb-4 sm:mb-6 bg-white p-3 rounded-lg shadow-sm flex flex-wrap gap-x-4 gap-y-2 items-center justify-center sm:justify-start">
            <h3 className="text-sm font-semibold text-gray-700 mr-2">Chú thích Trạng thái Lồng:</h3>
            {legendItems.map(item => (
                <LegendItem key={item.label} color={item.color} label={item.label} />
            ))}
        </section>
    );
};

export default CageStatusLegend;
