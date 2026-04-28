import React, { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useMagneticHover } from '../../hooks/useMagneticHover';

// Helper component to apply the hook individually per tab
const NavTab = ({ tab, activeTab, onTabClick }) => {
    const { ref, styles, handlers, isHovered } = useMagneticHover({ magneticStrength: 0.15, tiltStrength: 0 });
    const [ripples, setRipples] = useState([]);

    const handleClick = (e) => {
        if (activeTab !== tab.id) {
            if (navigator?.vibrate) {
                navigator.vibrate(15);
            }
            onTabClick(e, tab.id);
        }

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
            onClick={handleClick}
            style={{
                x: styles.x,
                y: styles.y,
                '--mouse-x': styles['--mouse-x'],
                '--mouse-y': styles['--mouse-y']
            }}
            onMouseMove={handlers.onMouseMove}
            onMouseEnter={handlers.onMouseEnter}
            onMouseLeave={handlers.onMouseLeave}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            className={`shrink-0 relative overflow-hidden px-4 py-1.5 min-h-[36px] text-xs font-semibold rounded-full transition-all duration-200 ease-out pointer-events-auto flex items-center gap-1.5 outline-none ${activeTab === tab.id ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]'
                } ${isHovered && activeTab !== tab.id ? 'bg-[var(--color-primary-light)]/40' : ''}`}
        >
            {/* Active State Background Indicator */}
            {activeTab === tab.id && (
                <motion.div
                    layoutId="activeTabBadge"
                    className="absolute inset-0 bg-white rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-[rgba(0,0,0,0.04)] z-0"
                    transition={{ type: "spring", stiffness: 420, damping: 32, mass: 0.8 }}
                />
            )}

            {/* Hover Background Fallback */}
            {!activeTab && isHovered && (
                <motion.div
                    className="absolute inset-0 bg-[var(--color-primary-light)]/30 rounded-full z-0 pointer-events-none"
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
                            initial={{ top: ripple.y, left: ripple.x, scale: 0, opacity: 0.15 }}
                            animate={{ scale: 4, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="absolute bg-[var(--color-primary)]/20 rounded-full pointer-events-none"
                            style={{ width: "40px", height: "40px", marginTop: "-20px", marginLeft: "-20px" }}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Content Layer */}
            <span className="relative z-10 flex items-center gap-1.5">
                {tab.icon && <tab.icon size={15} strokeWidth={2} />}
                {tab.label}
            </span>
        </motion.button>
    );
};

const PillNav = ({ tabs, activeTab, setActiveTab, className = '' }) => {
    const layoutGroupId = tabs?.[0]?.id || 'navGroup';
    
    return (
        <LayoutGroup id={layoutGroupId}>
            <div className={`flex sm:inline-flex w-full sm:w-auto max-w-full flex-nowrap overflow-x-auto hide-scrollbar whitespace-nowrap rounded-full p-1 relative px-1.5 gap-0.5 items-center bg-slate-100/60 backdrop-blur-md border border-[rgba(0,0,0,0.04)] ${className}`}>
                {tabs.map((tab) => (
                    <NavTab
                        key={tab.id}
                        tab={tab}
                        activeTab={activeTab}
                        onTabClick={(e, id) => setActiveTab(id)}
                    />
                ))}
            </div>
        </LayoutGroup>
    );
};

export default PillNav;
