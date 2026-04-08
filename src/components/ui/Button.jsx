import React from 'react';

const variants = {
    primary: 'bg-[#1B6CA8] hover:bg-[#155E9A] text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:shadow-md hover:-translate-y-[0.5px] active:translate-y-0 active:shadow-sm border border-transparent',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:-translate-y-[0.5px]',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:shadow-md hover:-translate-y-[0.5px] active:translate-y-0 active:shadow-sm border border-transparent',
    ghost: 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-800 border border-transparent',
    success: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-transparent',
};

const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-2xl',
};

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    loading = false,
    icon: Icon,
    ...props
}) => {
    return (
        <button
            disabled={disabled || loading}
            className={`
                inline-flex items-center justify-center gap-2 font-semibold
                transition-all duration-200 cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed
                ${variants[variant] || variants.primary}
                ${sizes[size] || sizes.md}
                ${className}
            `}
            {...props}
        >
            {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            ) : Icon ? (
                <Icon size={16} />
            ) : null}
            {children}
        </button>
    );
};

export default Button;
