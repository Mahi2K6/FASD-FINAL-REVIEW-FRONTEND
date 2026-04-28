import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

/* ═══════════════════════════════════════════════════
 *  MedConnect — Premium Button System
 *  Gradient hover glow, press feedback, ripple-like
 * ═══════════════════════════════════════════════════ */

const variants = {
    primary: 'bg-gradient-to-r from-[#3B82F6] to-[#7C5CFC] text-white shadow-[var(--shadow-fab)] hover:brightness-110 border border-white/20',
    secondary: 'bg-[rgba(255,255,255,0.4)] backdrop-blur-md text-[#0F172A] border border-[rgba(255,255,255,0.6)] shadow-[var(--shadow-xs)] hover:bg-[rgba(255,255,255,0.6)] hover:shadow-[var(--shadow-sm)] hover:border-[rgba(255,255,255,0.8)]',
    ghost: 'bg-transparent text-[#64748B] hover:bg-[rgba(255,255,255,0.4)] hover:text-[#0F172A] border border-transparent',
    danger: 'bg-gradient-to-r from-[#FB7185] to-[#FF8FAB] text-white shadow-[0_8px_32px_rgba(251,113,133,0.25)] hover:brightness-110 border border-white/20',
};

const sizes = {
    sm: 'px-4 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-base gap-2.5',
};

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    loading = false,
    disabled = false,
    className = '',
    ...props
}) => {
    return (
        <motion.button
            whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
            whileTap={!disabled ? { scale: 0.97, y: 0 } : {}}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            className={`
                inline-flex items-center justify-center font-semibold
                rounded-full
                transition-all duration-250
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/30 focus-visible:ring-offset-2
                ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
                ${variants[variant]}
                ${sizes[size]}
                ${className}
            `}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" />
            ) : Icon ? (
                <Icon size={size === 'sm' ? 14 : 16} strokeWidth={2.2} />
            ) : null}
            {children}
        </motion.button>
    );
};

export default Button;
