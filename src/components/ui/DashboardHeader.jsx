import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import { useAppContext } from '../../AppContext';

/* ─── Shared pill glass tokens ─── */
const PILL_GLASS = {
    background: 'rgba(255,255,255,0.72)',
    backdropFilter: 'blur(18px) saturate(160%)',
    WebkitBackdropFilter: 'blur(18px) saturate(160%)',
    border: '1px solid rgba(255,255,255,0.45)',
    borderRadius: '999px',
    boxShadow: '0 8px 25px rgba(15,23,42,0.06), 0 0 0 1px rgba(255,255,255,0.45), 0 0 16px rgba(72,145,255,0.04), inset 0 1px 0 rgba(255,255,255,0.35)',
};

/* ═══════════════════════════════════════════════
   GlowPill — Premium floating glass pill wrapper
   ──────────────────────────────────────────────
   ✦ Dynamic cursor-reactive edge lighting
   ✦ Subtle idle float animation (CSS-driven)
   ✦ Enhanced hover depth + shadow intensification
   ═══════════════════════════════════════════════ */
const GlowPill = ({ 
    children, 
    className = '', 
    style = {}, 
    floatDelay = 0,
    floatDuration = 6,
    floatDistance = 1.5,
    glowColor = '72,145,255',
    glowSize = 140,
    as: Tag = 'div',
    onClick,
    ...motionProps 
}) => {
    const pillRef = useRef(null);
    const glowRef = useRef(null);

    const handleMouseMove = useCallback((e) => {
        const rect = pillRef.current?.getBoundingClientRect();
        const glow = glowRef.current;
        if (!rect || !glow) return;
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        glow.style.opacity = '1';
        glow.style.background = `radial-gradient(${glowSize}px circle at ${x}% ${y}%, rgba(${glowColor},0.15), transparent 70%)`;
    }, [glowColor, glowSize]);

    const handleMouseLeave = useCallback(() => {
        if (glowRef.current) glowRef.current.style.opacity = '0';
    }, []);

    const MotionTag = Tag === 'button' ? motion.button : motion.div;

    return (
        <MotionTag
            ref={pillRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            className={`pill-float ${className}`}
            style={{ 
                ...PILL_GLASS, 
                ...style, 
                position: 'relative', 
                overflow: style.overflow || 'hidden',
                animationDelay: `${floatDelay}s`,
                animationDuration: `${floatDuration}s`,
            }}
            {...motionProps}
        >
            {/* Dynamic cursor-reactive edge glow overlay */}
            <div
                ref={glowRef}
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'inherit',
                    pointerEvents: 'none',
                    zIndex: 0,
                    opacity: 0,
                    transition: 'opacity 0.35s ease',
                }}
            />
            {/* Content — above glow layer */}
            <div className="relative z-10 flex items-center" style={{ gap: 'inherit' }}>
                {children}
            </div>
        </MotionTag>
    );
};

/* ─── Stagger entrance animation ─── */
const pillVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95, filter: 'blur(4px)' },
    visible: (i) => ({
        opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
        transition: { 
            delay: i * 0.06, 
            type: 'spring', stiffness: 380, damping: 26, mass: 0.7 
        }
    }),
};

/* ═══════════════════════════════════════════════
   DashboardHeader Component
   ═══════════════════════════════════════════════ */
const DashboardHeader = ({ title = "Dashboard", activeTab }) => {
    const { currentUser, data, updateData } = useAppContext();
    const [showNotifications, setShowNotifications] = useState(false);

    // Filter notifications for the current user
    const myNotifications = data?.notifications?.filter(n => n.userId === currentUser?.id || n.userId === currentUser?.role) || [];
    const unreadCount = myNotifications.filter(n => !n.read).length;

    const handleMarkAsRead = (id) => {
        if (!updateData || !data?.notifications) return;
        const updated = data.notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
        );
        updateData('notifications', updated);
    };

    // Generate breadcrumb from activeTab
    const breadcrumb = activeTab ? activeTab.charAt(0).toUpperCase() + activeTab.slice(1) : 'Overview';

    return (
        <header className="shrink-0 z-40 px-4 md:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between gap-3">

                {/* ═══ 1. Breadcrumb Pill ═══ */}
                <motion.div
                    custom={0}
                    variants={pillVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <GlowPill
                        className="hidden sm:flex items-center gap-2 px-5 py-2.5 cursor-default select-none"
                        floatDelay={0}
                        floatDuration={7}
                        glowSize={100}
                        whileHover={{ y: -2, boxShadow: '0 12px 35px rgba(15,23,42,0.10), 0 0 0 1px rgba(255,255,255,0.55), 0 0 24px rgba(72,145,255,0.08), inset 0 1px 0 rgba(255,255,255,0.5)' }}
                    >
                        <span className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-[0.12em]">{title}</span>
                        <span className="text-slate-200/80 text-xs">/</span>
                        <span className="text-[13px] font-semibold text-slate-700">{breadcrumb}</span>
                    </GlowPill>
                </motion.div>

                {/* ═══ Right Group: Notifications + Profile ═══ */}
                <div className="flex items-center gap-3">

                    {/* ═══ 2. Notification Pill ═══ */}
                    <motion.div
                        custom={1}
                        variants={pillVariants}
                        initial="hidden"
                        animate="visible"
                        className="relative"
                    >
                        <GlowPill
                            as="button"
                            className="relative flex items-center justify-center w-[42px] h-[42px] text-slate-500"
                            floatDelay={1}
                            floatDuration={6}
                            glowSize={60}
                            onClick={() => setShowNotifications(!showNotifications)}
                            whileHover={{ scale: 1.08, y: -2, boxShadow: '0 12px 35px rgba(15,23,42,0.10), 0 0 0 1px rgba(255,255,255,0.55), 0 0 24px rgba(72,145,255,0.10), inset 0 1px 0 rgba(255,255,255,0.5)' }}
                            whileTap={{ scale: 0.92 }}
                        >
                            <Bell size={17} strokeWidth={1.8} />
                            {unreadCount > 0 && (
                                <motion.span 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-0.5 -right-0.5 flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[8px] font-bold min-w-[18px] min-h-[18px] rounded-full shadow-sm ring-2 ring-white"
                                    style={{ zIndex: 20 }}
                                >
                                    {unreadCount}
                                </motion.span>
                            )}
                        </GlowPill>

                        {/* Notification Dropdown */}
                        <AnimatePresence>
                            {showNotifications && (
                                <>
                                    <div className="fixed inset-0 z-[9998]" onClick={() => setShowNotifications(false)} />
                                    <motion.div 
                                        initial={{ opacity: 0, y: 8, scale: 0.95 }} 
                                        animate={{ opacity: 1, y: 0, scale: 1 }} 
                                        exit={{ opacity: 0, scale: 0.95, y: 8 }} 
                                        transition={{ type: 'spring', stiffness: 420, damping: 30, mass: 0.7 }}
                                        className="absolute right-0 mt-3 w-80 overflow-hidden z-[9999]"
                                        style={{
                                            background: 'rgba(255,255,255,0.96)',
                                            backdropFilter: 'blur(40px) saturate(180%)',
                                            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
                                            border: '1px solid rgba(255,255,255,0.5)',
                                            borderRadius: '24px',
                                            boxShadow: '0 24px 80px rgba(15,23,42,0.12), 0 8px 24px rgba(15,23,42,0.06)',
                                        }}
                                    >
                                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100/50">
                                            <h4 className="font-semibold text-slate-800 text-[13px]">Notifications</h4>
                                            {unreadCount > 0 && <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{unreadCount} new</span>}
                                        </div>
                                        <div className="max-h-72 overflow-y-auto hide-scrollbar">
                                            {myNotifications.length === 0 ? (
                                                <div className="text-slate-400 text-center py-10 text-sm flex flex-col items-center gap-2">
                                                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                                                        <Bell size={17} className="text-slate-300" />
                                                    </div>
                                                    <p className="font-medium text-xs">All caught up!</p>
                                                </div>
                                            ) : (
                                                myNotifications.map((notif, idx) => (
                                                    <motion.div 
                                                        key={notif.id}
                                                        initial={{ opacity: 0, x: 8 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.03 }}
                                                        onClick={() => handleMarkAsRead(notif.id)}
                                                        className={`px-5 py-3.5 border-b border-slate-50 cursor-pointer hover:bg-slate-50/60 transition-colors ${!notif.read ? 'bg-blue-50/15' : ''}`}
                                                    >
                                                        <div className="flex justify-between items-start mb-0.5">
                                                            <span className={`font-semibold text-xs ${notif.read ? 'text-slate-500' : 'text-slate-800'}`}>{notif.title}</span>
                                                            {!notif.read && <span className="w-1.5 h-1.5 shrink-0 bg-blue-500 rounded-full mt-1" />}
                                                        </div>
                                                        <p className="text-[11px] text-slate-400 leading-relaxed">{notif.message}</p>
                                                        <div className="text-[9px] font-medium mt-1.5 text-slate-300 uppercase tracking-wider">{notif.time}</div>
                                                    </motion.div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* ═══ 3. Profile Pill — Luxury Identity Capsule ═══ */}
                    <motion.div
                        custom={2}
                        variants={pillVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <GlowPill
                            className="flex items-center"
                            floatDelay={1.8}
                            floatDuration={7}
                            glowSize={120}
                            glowColor="72,145,255"
                            style={{
                                backdropFilter: 'blur(22px) saturate(175%)',
                                WebkitBackdropFilter: 'blur(22px) saturate(175%)',
                                border: '1px solid rgba(255,255,255,0.5)',
                                boxShadow: '0 8px 25px rgba(15,23,42,0.07), 0 0 0 1px rgba(255,255,255,0.45), 0 0 20px rgba(72,145,255,0.06), inset 0 1px 0 rgba(255,255,255,0.4)',
                                overflow: 'visible',
                            }}
                            whileHover={{ y: -2, boxShadow: '0 14px 40px rgba(15,23,42,0.11), 0 0 0 1px rgba(255,255,255,0.6), 0 0 32px rgba(72,145,255,0.12), inset 0 1px 0 rgba(255,255,255,0.55)' }}
                        >
                            <ProfileDropdown />
                        </GlowPill>
                    </motion.div>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
