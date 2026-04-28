import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/* ═══════════════════════════════════════════════════
 *  MedConnect — Premium StatCard
 *  Animated counter, ambient glow, trend indicator
 * ═══════════════════════════════════════════════════ */

const AnimatedNumber = ({ value }) => {
    const [display, setDisplay] = useState(value);
    const prevRef = useRef(value);

    useEffect(() => {
        const raw = String(value);
        const numMatch = raw.match(/[\d,.]+/);
        if (!numMatch) { setDisplay(value); return; }

        const numStr = numMatch[0].replace(/,/g, '');
        const target = parseFloat(numStr);
        if (isNaN(target) || target === 0) { setDisplay(value); return; }

        const prefix = raw.slice(0, numMatch.index);
        const suffix = raw.slice(numMatch.index + numMatch[0].length);
        const isDecimal = numStr.includes('.');
        const start = 0;
        const duration = 800;
        const startTime = performance.now();

        const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = start + (target - start) * eased;
            const formatted = isDecimal ? current.toFixed(1) : Math.round(current).toLocaleString();
            setDisplay(`${prefix}${formatted}${suffix}`);
            if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
        prevRef.current = value;
    }, [value]);

    return <span>{display}</span>;
};

const StatCard = ({ icon: Icon, label, value, color, subtitle, title, trend }) => {
    const displayLabel = label || title || '';
    const displaySubtitle = subtitle || '';

    // Map incoming arbitrary Tailwind colors to the strict 4-color premium system
    const colorString = color || '';
    let themeStr = 'blue';
    if (colorString.includes('emerald') || colorString.includes('teal')) themeStr = 'mint';
    else if (colorString.includes('purple') || colorString.includes('fuchsia') || colorString.includes('indigo')) themeStr = 'violet';
    else if (colorString.includes('rose') || colorString.includes('red') || colorString.includes('amber') || colorString.includes('orange')) themeStr = 'coral';

    const themes = {
        blue: {
            text: 'from-[#4F8CFF] to-[#6EA8FF]',
            bg: 'from-[#4F8CFF]/10 to-[#6EA8FF]/10',
            glow: 'from-[#4F8CFF] to-[#6EA8FF]',
            icon: 'text-[#4F8CFF]'
        },
        mint: {
            text: 'from-[#10B981] to-[#2DD4BF]',
            bg: 'from-[#10B981]/10 to-[#2DD4BF]/10',
            glow: 'from-[#10B981] to-[#2DD4BF]',
            icon: 'text-[#10B981]'
        },
        violet: {
            text: 'from-[#8B5CF6] to-[#A855F7]',
            bg: 'from-[#8B5CF6]/10 to-[#A855F7]/10',
            glow: 'from-[#8B5CF6] to-[#A855F7]',
            icon: 'text-[#8B5CF6]'
        },
        coral: {
            text: 'from-[#FB7185] to-[#FF8FAB]',
            bg: 'from-[#FB7185]/10 to-[#FF8FAB]/10',
            glow: 'from-[#FB7185] to-[#FF8FAB]',
            icon: 'text-[#FB7185]'
        }
    };

    const activeTheme = themes[themeStr];

    return (
        <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4, scale: 1.015, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
            className="relative overflow-hidden rounded-[var(--radius-xl)] p-6 border border-[rgba(15,23,42,0.06)] bg-[rgba(255,255,255,0.75)] backdrop-blur-2xl shadow-[0_12px_40px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_60px_rgba(15,23,42,0.08)] transition-all duration-400 group"
        >
            {/* Ambient glow orb */}
            <div className={`absolute -bottom-10 -right-10 w-36 h-36 rounded-full bg-gradient-to-br ${activeTheme.glow} opacity-[0.04] blur-3xl group-hover:opacity-[0.10] group-hover:scale-110 transition-all duration-700`} />
            
            {/* Top accent line */}
            <div className={`absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r ${activeTheme.glow} opacity-0 group-hover:opacity-60 transition-opacity duration-500 rounded-full`} />
            
            {/* Inner shine */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-inherit pointer-events-none opacity-60" />

            <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-2">{displayLabel}</p>
                    <h3 className={`text-[28px] font-extrabold bg-clip-text text-transparent bg-gradient-to-r ${activeTheme.text} leading-none pb-0.5 count-reveal`}>
                        <AnimatedNumber value={value} />
                    </h3>
                    {displaySubtitle && (
                        <p className="text-[10px] text-slate-400 mt-2 font-medium flex items-center gap-1.5">
                            {trend && (
                                <span className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                    trend > 0 ? 'bg-teal-50 text-teal-600' : 'bg-rose-50 text-rose-500'
                                }`}>
                                    {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                                </span>
                            )}
                            {displaySubtitle}
                        </p>
                    )}
                </div>
                {Icon && (
                    <motion.div 
                        className={`w-12 h-12 rounded-[14px] bg-gradient-to-br ${activeTheme.bg} backdrop-blur-md flex items-center justify-center shrink-0 border border-white/60 shadow-[0_4px_12px_rgba(15,23,42,0.04)] group-hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)] transition-all duration-300 relative`}
                        whileHover={{ rotate: [0, -6, 6, 0], scale: 1.05 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="absolute inset-0 rounded-[14px] bg-white/20" />
                        <Icon size={20} className={`relative z-10 ${activeTheme.icon} drop-shadow-sm group-hover:brightness-110 transition-all duration-300`} strokeWidth={2} />
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default StatCard;
