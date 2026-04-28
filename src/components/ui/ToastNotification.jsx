import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

// ─────────────────────────────────────────────
// Toast Context
// ─────────────────────────────────────────────
const ToastContext = createContext(null);

const ICONS = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
};

const COLORS = {
    success: {
        bg: 'bg-emerald-50/95',
        border: 'border-emerald-200/60',
        icon: 'text-emerald-500',
        title: 'text-emerald-800',
        msg: 'text-emerald-700',
        progress: 'bg-emerald-400',
    },
    error: {
        bg: 'bg-red-50/95',
        border: 'border-red-200/60',
        icon: 'text-red-500',
        title: 'text-red-800',
        msg: 'text-red-700',
        progress: 'bg-red-400',
    },
    info: {
        bg: 'bg-blue-50/95',
        border: 'border-blue-200/60',
        icon: 'text-blue-500',
        title: 'text-blue-800',
        msg: 'text-blue-700',
        progress: 'bg-blue-400',
    },
    warning: {
        bg: 'bg-amber-50/95',
        border: 'border-amber-200/60',
        icon: 'text-amber-500',
        title: 'text-amber-800',
        msg: 'text-amber-700',
        progress: 'bg-amber-400',
    },
};

// ─────────────────────────────────────────────
// Single Toast Item
// ─────────────────────────────────────────────
const ToastItem = ({ id, type = 'info', title, message, duration = 4000, onDismiss }) => {
    const c = COLORS[type] || COLORS.info;
    const Icon = ICONS[type] || ICONS.info;

    React.useEffect(() => {
        const t = setTimeout(() => onDismiss(id), duration);
        return () => clearTimeout(t);
    }, [id, duration, onDismiss]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.92, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className={`relative w-80 max-w-[90vw] rounded-2xl border shadow-[var(--shadow-lg)] overflow-hidden pointer-events-auto
                backdrop-filter backdrop-blur-[30px]
                ${c.bg} ${c.border}`}
            style={{ WebkitBackdropFilter: 'blur(30px)' }}
        >
            {/* Glass shimmer overlay */}
            <div className="absolute inset-0 pointer-events-none rounded-2xl"
                style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.4), rgba(255,255,255,0.0))', opacity: 0.5 }}
            />

            <div className="relative z-10 flex items-start gap-3 p-4 pr-10">
                <div className={`mt-0.5 flex-shrink-0 ${c.icon}`}>
                    <Icon size={18} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                    {title && <p className={`text-sm font-semibold leading-tight ${c.title}`}>{typeof title === "object" ? JSON.stringify(title) : title}</p>}
                    {message && <p className={`text-xs mt-0.5 leading-relaxed ${c.msg}`}>{typeof message === "object" ? JSON.stringify(message) : message}</p>}
                </div>
            </div>

            {/* Dismiss button */}
            <button
                onClick={() => onDismiss(id)}
                className={`absolute top-3 right-3 p-1 rounded-full opacity-50 hover:opacity-100 transition-opacity ${c.icon}`}
            >
                <X size={14} />
            </button>

            {/* Auto-dismiss progress bar */}
            <motion.div
                className={`absolute bottom-0 left-0 h-0.5 ${c.progress}`}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
            />
        </motion.div>
    );
};

// ─────────────────────────────────────────────
// Toast Provider — wrap around AppProvider
// ─────────────────────────────────────────────
const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        setToasts(prev => {
            // Max 3 toasts visible at once
            const next = [...prev.slice(-2), { id, type, title, message, duration }];
            return next;
        });
        return id;
    }, []);

    const dismissToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // Shorthand helpers
    const toast = {
        success: (title, message, opts) => addToast({ type: 'success', title, message, ...opts }),
        error: (title, message, opts) => addToast({ type: 'error', title, message, ...opts }),
        info: (title, message, opts) => addToast({ type: 'info', title, message, ...opts }),
        warning: (title, message, opts) => addToast({ type: 'warning', title, message, ...opts }),
        show: addToast,
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}

            {/* Toast Container — fixed top-right, below nav pill */}
            <div
                className="fixed top-20 right-4 z-[9998] flex flex-col gap-2.5 pointer-events-none"
                aria-live="polite"
            >
                <AnimatePresence initial={false} mode="sync">
                    {toasts.map(t => (
                        <ToastItem
                            key={t.id}
                            {...t}
                            onDismiss={dismissToast}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export default ToastProvider;

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────
export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
};
