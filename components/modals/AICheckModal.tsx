

import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { AIHealthReport } from '../../types';

interface AICheckModalProps {
    onClose: () => void;
    fetchAnalysis: () => Promise<AIHealthReport>;
    isEmbedded?: boolean;
    onRerun?: () => void;
}

const statusStyles = {
    green: {
        banner: 'bg-green-100 border-green-200 text-green-800',
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    },
    yellow: {
        banner: 'bg-yellow-100 border-yellow-200 text-yellow-800',
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
    },
    red: {
        banner: 'bg-red-100 border-red-200 text-red-800',
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    }
};

const LoadingSkeleton: React.FC = () => (
    <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded-md w-1/2 mx-auto mb-6"></div>
        <div className="h-14 bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-6 bg-gray-200 rounded-md w-3/4 mx-auto mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <div className="h-6 bg-gray-200 rounded-md w-1/3 mb-4"></div>
                <div className="space-y-3">
                    <div className="h-5 bg-gray-200 rounded"></div>
                    <div className="h-5 bg-gray-200 rounded"></div>
                    <div className="h-5 bg-gray-200 rounded"></div>
                </div>
            </div>
            <div>
                <div className="h-6 bg-gray-200 rounded-md w-1/3 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded-lg"></div>
            </div>
        </div>
        <div className="h-10 bg-gray-200 rounded-lg w-28 mx-auto mt-8"></div>
    </div>
);

const ObservationItem: React.FC<{ text: string, isPositive: boolean }> = ({ text, isPositive }) => {
    const icon = isPositive ? (
        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
    ) : (
        <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
    );
    return (
        <li className="flex items-start space-x-3">
            {icon}
            <span className="text-sm text-gray-700">{text}</span>
        </li>
    );
}

const AICheckContent: React.FC<{analysisResult: AIHealthReport | null, isLoading: boolean, onRerun?: () => void, isEmbedded?: boolean, onClose: () => void}> = ({analysisResult, isLoading, onRerun, isEmbedded, onClose}) => {
    if (isLoading || !analysisResult) {
        return <LoadingSkeleton />;
    }

    const currentStatusStyle = statusStyles[analysisResult.statusColor];

    return (
         <div>
            <div className={`p-4 mb-4 border rounded-lg flex items-center space-x-3 ${currentStatusStyle.banner}`}>
                <div className="flex-shrink-0">{currentStatusStyle.icon}</div>
                <div className="font-semibold text-lg">{analysisResult.healthStatus}</div>
            </div>
            
            <p className="text-center text-gray-600 mb-6">{analysisResult.summary}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                {/* Key Observations */}
                <div>
                    <h3 className="font-semibold text-gray-700 mb-3">Quan sát chính</h3>
                    <ul className="space-y-2.5">
                        {analysisResult.keyObservations.map((obs, index) => (
                            <ObservationItem key={index} text={obs.text} isPositive={obs.isPositive} />
                        ))}
                    </ul>
                </div>
                {/* Recommendation */}
                <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
                    <h3 className="font-semibold text-primary-800 mb-2 flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                        <span>Hành động Đề xuất</span>
                    </h3>
                    <p className="text-sm text-primary-700">{analysisResult.recommendation}</p>
                </div>
            </div>

            <div className="mt-8 text-center flex justify-center space-x-4">
                {isEmbedded ? (
                    onRerun && (
                        <button onClick={onRerun} className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow hover:shadow-md text-sm">
                            Phân tích lại
                        </button>
                    )
                ) : (
                    <button onClick={onClose} className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2.5 px-8 rounded-lg transition-colors shadow hover:shadow-md">
                        Đã hiểu
                    </button>
                )}
            </div>
        </div>
    );
};


const AICheckModal: React.FC<AICheckModalProps> = ({ onClose, fetchAnalysis, isEmbedded = false, onRerun }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [analysisResult, setAnalysisResult] = useState<AIHealthReport | null>(null);

    useEffect(() => {
        const getAnalysis = async () => {
            setIsLoading(true);
            const result = await fetchAnalysis();
            setAnalysisResult(result);
            setIsLoading(false);
        };
        getAnalysis();
    }, [fetchAnalysis]);

    if (isEmbedded) {
        return <AICheckContent analysisResult={analysisResult} isLoading={isLoading} onRerun={onRerun} isEmbedded={isEmbedded} onClose={onClose}/>
    }

    return (
        <Modal isOpen={true} onClose={onClose} maxWidthClass="max-w-xl">
            <h2 className="text-xl font-bold text-center mb-6 text-gray-800">Báo cáo Sức khỏe AI</h2>
            <AICheckContent analysisResult={analysisResult} isLoading={isLoading} onRerun={onRerun} isEmbedded={isEmbedded} onClose={onClose} />
        </Modal>
    );
};

export default AICheckModal;