import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMagneticHover } from '../../hooks/useMagneticHover';

// Helper component to apply the hook individually per tab
const NavTab = ({ tab, activeTab, onTabClick }) => {
    const { ref, styles, handlers, isHovered } = useMagneticHover({ magneticStrength: 0.2, tiltStrength: 0 });
    const [ripples, setRipples] = useState([]);

    const handleTabClick = (e) => {
        onTabClick(e, tab.id);

        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newRipple = { id: Date.now(), x, y };
        setRipples(prev => [...prev, newRipple]);
        setTimeout(() => setRipples(prev => prev.filter(r => r.id !== newRipple.id)), 600);
    };

    return (
        <motion.button
            ref={ref}
            onClick={handleTabClick}
            style={{
                x: styles.x,
                y: styles.y,
                '--mouse-x': styles['--mouse-x'],
                '--mouse-y': styles['--mouse-y']
            }}
            onMouseMove={handlers.onMouseMove}
            onMouseEnter={handlers.onMouseEnter}
            onMouseLeave={handlers.onMouseLeave}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            className={`relative overflow-hidden px-5 py-2.5 text-sm font-medium rounded-full transition-shadow duration-300 pointer-events-auto flex items-center gap-2 ${activeTab === tab.id ? 'text-blue-700 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-800'
                } ${isHovered ? 'liquid-glass-panel' : ''}`}
        >
            {/* Active State Background Indicator */}
            {activeTab === tab.id && (
                <motion.div
                    layoutId="activeTabBadge"
                    className="absolute inset-0 bg-white rounded-full shadow-sm ring-1 ring-slate-100 z-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
            )}

            {/* Hover Background Fallback */}
            {!activeTab && isHovered && (
                <motion.div
                    className="absolute inset-0 bg-slate-50/80 rounded-full z-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                />
            )}

            {/* Ripple Effect Layer */}
            <div className={`absolute inset-0 overflow-hidden pointer-events-none rounded-full ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 z-10`}>
                <AnimatePresence>
                    {ripples.map((ripple) => (
                        <motion.span
                            key={ripple.id}
                            initial={{ top: ripple.y, left: ripple.x, scale: 0, opacity: 0.2 }}
                            animate={{ scale: 4, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="absolute bg-slate-400 rounded-full pointer-events-none"
                            style={{ width: "40px", height: "40px", marginTop: "-20px", marginLeft: "-20px" }}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Content Layer */}
            <span className="relative z-20 flex items-center gap-2">
                {tab.icon && <tab.icon size={16} strokeWidth={2.5} />}
                {tab.label}
            </span>
        </motion.button>
    );
};

export const PillNav = ({ tabs, activeTab, setActiveTab, className = '' }) => {
    return (
        <div className={`p-1.5 rounded-full inline-flex shadow-sm bg-white/70 backdrop-blur-xl border border-white/80 ${className}`}>
            {tabs.map((tab) => (
                <NavTab
                    key={tab.id}
                    tab={tab}
                    activeTab={activeTab}
                    onTabClick={(e, id) => setActiveTab(id)}
                />
            ))}
        </div>
    );
};
