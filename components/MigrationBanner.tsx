import React from 'react';

interface MigrationBannerProps {
    onMigrate: () => void;
}

const MigrationBanner: React.FC<MigrationBannerProps> = ({ onMigrate }) => {
    return (
        <div className="bg-primary-800 text-white p-4 rounded-lg mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-lg">
            <div>
                <h3 className="font-bold text-lg">Nâng cấp Cơ sở dữ liệu!</h3>
                <p className="text-sm text-primary-100">
                    Chúng tôi phát hiện bạn có dữ liệu được lưu trên máy. Hãy chuyển lên đám mây để đảm bảo an toàn và truy cập từ mọi nơi.
                </p>
            </div>
            <button
                onClick={onMigrate}
                className="bg-white text-primary-800 font-bold py-2 px-5 rounded-md hover:bg-primary-100 transition-colors flex-shrink-0"
            >
                Chuyển dữ liệu ngay
            </button>
        </div>
    );
};

export default MigrationBanner;
