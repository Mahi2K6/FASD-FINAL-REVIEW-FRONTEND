import React, { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useMagneticHover } from '../../hooks/useMagneticHover';

// Helper component to apply the hook individually per tab
const NavTab = ({ tab, activeTab, onTabClick }) => {
    const { ref, styles, handlers, isHovered } = useMagneticHover({ magneticStrength: 0.2, tiltStrength: 0 });
    const [ripples, setRipples] = useState([]);

    const handleClick = (e) => {
        // Vibrate and change tab only if it's not the active tab
        if (activeTab !== tab.id) {
            if (navigator?.vibrate) {
                // Vibrate for 15ms lightly on tab switch mimicking iOS segment click
                navigator.vibrate(15);
            }
            onTabClick(e, tab.id);
        }

        // Ripple effect should always happen on click
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
            whileTap={{ scale: 0.98 }}
            className={`shrink-0 relative overflow-hidden px-4 py-1.5 min-h-[36px] text-xs font-semibold rounded-full transition-all duration-300 ease-out pointer-events-auto flex items-center gap-1.5 outline-none ${activeTab === tab.id ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]/50'
                } ${isHovered && activeTab !== tab.id ? 'bg-[var(--color-primary-light)]/60 text-[var(--color-primary)]' : ''}`}
        >
            {/* Active State Background Indicator */}
            {activeTab === tab.id && (
                <motion.div
                    layoutId="activeTabBadge"
                    className="absolute inset-0 bg-[var(--color-primary-light)] rounded-full shadow-[0_1px_2px_rgba(26,111,196,0.08)] border border-[rgba(26,111,196,0.12)] z-0"
                    transition={{ type: "spring", stiffness: 400, damping: 30, mass: 1 }}
                />
            )}

            {/* Hover Background Fallback */}
            {!activeTab && isHovered && (
                <motion.div
                    className="absolute inset-0 bg-[var(--color-primary-light)]/50 rounded-full z-0 pointer-events-none"
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
                            className="absolute bg-[var(--color-primary)]/30 rounded-full pointer-events-none"
                            style={{ width: "40px", height: "40px", marginTop: "-20px", marginLeft: "-20px" }}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Content Layer */}            {/* Active State Indicator Text Layering */}
            <span className="relative z-10 flex items-center gap-1.5">
                {tab.icon && <tab.icon size={16} strokeWidth={2.5} />}
                {tab.label}
            </span>
        </motion.button>
    );
};

const PillNav = ({ tabs, activeTab, setActiveTab, className = '' }) => {
    const layoutGroupId = tabs?.[0]?.id || 'navGroup';
    
    return (
        <LayoutGroup id={layoutGroupId}>
            <div className={`flex sm:inline-flex w-full sm:w-auto max-w-full flex-nowrap overflow-x-auto hide-scrollbar whitespace-nowrap rounded-full p-1.5 relative px-2 gap-1 sm:gap-1.5 items-center glass-card !py-1.5 !px-2 ${className}`}>
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
