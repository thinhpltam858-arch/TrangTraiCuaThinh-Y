// Fix: Create the FilterControls.tsx file to provide sorting and searching functionality.
import React from 'react';

interface FilterControlsProps {
    onSortChange: (sortKey: string) => void;
    onSearch: (searchTerm: string) => void;
    sortKey: string;
    searchTerm: string;
}

const FilterControls: React.FC<FilterControlsProps> = ({ onSortChange, onSearch, sortKey, searchTerm }) => {
    return (
        <section className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:max-w-xs">
                <input
                    type="search"
                    placeholder="Tìm kiếm lồng (ví dụ: A01)..."
                    value={searchTerm}
                    onChange={(e) => onSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <label htmlFor="sort-cages" className="text-sm font-medium text-gray-700">Sắp xếp theo:</label>
                <select
                    id="sort-cages"
                    value={sortKey}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="rounded-lg border-gray-300 focus:ring-primary-500 focus:border-primary-500 text-sm py-2"
                >
                    <option value="id">ID Lồng</option>
                    <option value="progress_desc">Tiến độ (Cao-Thấp)</option>
                    <option value="progress_asc">Tiến độ (Thấp-Cao)</option>
                    <option value="days_desc">Ngày nuôi (Cũ-Mới)</option>
                    <option value="days_asc">Ngày nuôi (Mới-Cũ)</option>
                </select>
            </div>
        </section>
    );
};

export default FilterControls;
