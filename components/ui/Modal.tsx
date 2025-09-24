
import React, { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    maxWidthClass?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, maxWidthClass = 'max-w-2xl' }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="modal fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <div
                className={`modal-content bg-white rounded-2xl shadow-2xl w-full p-6 transform transition-transform duration-300 ${maxWidthClass} ${isOpen ? 'scale-100' : 'scale-95'}`}
                onClick={e => e.stopPropagation()}
                style={{maxHeight: '90vh', overflowY: 'auto'}}
            >
                {children}
            </div>
        </div>
    );
};

export default Modal;
