import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    const overlayRef = useRef(null);

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    // Close on Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    return ReactDOM.createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop — premium frosted overlay */}
                    <motion.div
                        ref={overlayRef}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl"
                        style={{ WebkitBackdropFilter: 'blur(16px)' }}
                        onClick={onClose}
                    />
                    {/* Panel — glass card with spring entrance */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.94, y: 16, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.96, y: 8, filter: 'blur(2px)' }}
                        transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.7 }}
                        className={`relative bg-white/96 backdrop-blur-2xl rounded-[var(--radius-3xl)] shadow-[var(--shadow-xl)] border border-white/70 w-full ${sizes[size]} mx-4 max-h-[85vh] overflow-hidden flex flex-col`}
                    >
                        {/* Header */}
                        {title && (
                            <div className="px-7 pt-6 pb-4 border-b border-slate-100/60 relative flex items-center justify-between">
                                <h2 className="text-[17px] font-bold text-slate-800 tracking-tight">{title}</h2>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                    onClick={onClose}
                                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors duration-150"
                                >
                                    <X size={16} strokeWidth={2.2} />
                                </motion.button>
                            </div>
                        )}
                        {/* Body */}
                        <div className="flex-1 overflow-y-auto px-7 py-5 hide-scrollbar">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default Modal;
