import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMagneticHover } from '../../hooks/useMagneticHover';

export const GlassButton = ({ children, className = '', variant = 'primary', ...props }) => {
    const baseStyle = "relative overflow-hidden rounded-full font-medium transition-colors duration-300 flex items-center justify-center";
    const variants = {
        primary: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_4px_15px_rgba(37,99,235,0.3)] hover:shadow-[0_8px_30px_rgba(37,99,235,0.5)] border border-transparent",
        secondary: "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm transition-colors hover:shadow-md",
        ghost: "bg-transparent text-slate-500 hover:text-blue-600 hover:bg-slate-50/80"
    };

    const { ref, styles, handlers, isHovered } = useMagneticHover({ magneticStrength: 0.15, tiltStrength: 0 });
    const [ripples, setRipples] = useState([]);

    const handleClick = (e) => {
        if (props.onClick) props.onClick(e);

        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newRipple = {
            id: Date.now(),
            x,
            y,
        };

        setRipples((prev) => [...prev, newRipple]);
        setTimeout(() => {
            setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
        }, 600);
    };

    return (
        <motion.button
            ref={ref}
            style={{
                x: styles.x,
                y: styles.y,
                '--mouse-x': styles['--mouse-x'],
                '--mouse-y': styles['--mouse-y']
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onMouseMove={handlers.onMouseMove}
            onMouseEnter={handlers.onMouseEnter}
            onMouseLeave={handlers.onMouseLeave}
            onClick={handleClick}
            className={`${baseStyle} ${variants[variant]} ${className} ${isHovered ? 'liquid-glow-intense liquid-glass-panel shadow-lg shadow-blue-500/20' : ''}`}
            {...props}
        >
            {/* Ripple Effect Container */}
            <div className={`absolute inset-0 overflow-hidden pointer-events-none rounded-full ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
                <AnimatePresence>
                    {ripples.map((ripple) => (
                        <motion.span
                            key={ripple.id}
                            initial={{ top: ripple.y, left: ripple.x, scale: 0, opacity: 0.5 }}
                            animate={{ scale: 4, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="absolute bg-white/40 rounded-full pointer-events-none"
                            style={{
                                width: "100px",
                                height: "100px",
                                marginTop: "-50px",
                                marginLeft: "-50px"
                            }}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Content Layer */}
            <div className="relative z-10 flex items-center justify-center">
                {children}
            </div>
        </motion.button>
    );
};
