
import React from 'react';
import Modal from '../ui/Modal';

interface ReportModalProps {
    title: string;
    content: string;
    isLoading: boolean;
    onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ title, content, isLoading, onClose }) => {
    return (
        <Modal isOpen={true} onClose={onClose}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{title}</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[200px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                    <p className="mt-4 text-gray-600">AI đang tạo báo cáo...</p>
                </div>
            ) : (
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
            )}
        </Modal>
    );
};

export default ReportModal;