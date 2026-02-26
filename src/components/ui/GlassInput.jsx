import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMagneticHover } from '../../hooks/useMagneticHover';

export const GlassInput = React.forwardRef(({ className = '', error, success, ...props }, ref) => {
    const { ref: magneticRef, styles, handlers, isHovered } = useMagneticHover({ magneticStrength: 0, tiltStrength: 0 });
    const [isFocused, setIsFocused] = useState(false);
    const [ripples, setRipples] = useState([]);

    const handleFocus = (e) => {
        setIsFocused(true);
        if (props.onFocus) props.onFocus(e);

        if (!magneticRef.current) return;
        const rect = magneticRef.current.getBoundingClientRect();
        const x = rect.width / 2; // Center ripple vertically
        const y = rect.height / 2;

        const newRipple = { id: Date.now(), x, y };
        setRipples(prev => [...prev, newRipple]);
        setTimeout(() => setRipples(prev => prev.filter(r => r.id !== newRipple.id)), 600);
    };

    const handleBlur = (e) => {
        setIsFocused(false);
        if (props.onBlur) props.onBlur(e);
    };


    return (
        <motion.div
            ref={magneticRef}
            style={{
                '--mouse-x': styles['--mouse-x'],
                '--mouse-y': styles['--mouse-y']
            }}
            animate={error ? { x: [-4, 4, -4, 4, 0] } : { y: isHovered || isFocused ? -2 : 0 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 20 }}
            onMouseMove={handlers.onMouseMove}
            onMouseEnter={handlers.onMouseEnter}
            onMouseLeave={handlers.onMouseLeave}
            className={`w-full relative rounded-full transition-shadow duration-300 ${isHovered || isFocused ? 'liquid-glass-panel shadow-md' : 'shadow-sm'} ${(isFocused || isHovered) ? 'liquid-glow-intense' : ''}`}
        >
            {/* Ripple Effect Container inside the input wrapper */}
            <div className={`absolute inset-0 overflow-hidden pointer-events-none rounded-full ${isFocused || isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 z-0`}>
                <AnimatePresence>
                    {ripples.map((ripple) => (
                        <motion.span
                            key={ripple.id}
                            initial={{ top: ripple.y, left: ripple.x, scale: 0, opacity: 0.2 }}
                            animate={{ scale: 6, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`absolute rounded-full pointer-events-none ${error ? 'bg-red-400/20' : success ? 'bg-emerald-400/20' : 'bg-blue-400/20'}`}
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

            <input
                ref={ref}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={`w-full bg-white/50 border backdrop-blur-md px-4 py-3 outline-none transition-all duration-300 text-slate-800 placeholder:text-slate-400 rounded-full relative z-10 ${error
                    ? 'border-red-500 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                    : success
                        ? 'border-emerald-500 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                        : 'border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20'
                    } ${className}`}
                {...props}
            />
        </motion.div>
    );
});
GlassInput.displayName = 'GlassInput';
