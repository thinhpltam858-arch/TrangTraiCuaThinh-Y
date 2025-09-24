
import React from 'react';

interface BulkActionBarProps {
    selectedCount: number;
    onFeed: () => void;
}

const BulkActionBar: React.FC<BulkActionBarProps> = ({ selectedCount, onFeed }) => {
    const isVisible = selectedCount > 0;

    return (
        <div className={`bulk-action-bar fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-3 shadow-lg transform z-40 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="container mx-auto flex justify-between items-center">
                <span>Đã chọn {selectedCount} lồng</span>
                <div className="space-x-2">
                    <button onClick={onFeed} className="bg-primary-500 hover:bg-primary-600 px-4 py-2 rounded-lg text-sm">Đánh dấu đã cho ăn</button>
                    <button className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm">Hành động khác</button>
                </div>
            </div>
        </div>
    );
};

export default BulkActionBar;