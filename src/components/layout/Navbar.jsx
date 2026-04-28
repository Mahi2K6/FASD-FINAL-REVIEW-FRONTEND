import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Menu, Search } from 'lucide-react';
import { useAppContext } from '../../AppContext';
import { useNavigate } from 'react-router-dom';
import ProfileDropdown from '../ui/ProfileDropdown';

const Navbar = ({ title, onMenuClick }) => {
    const { currentUser, data, updateData, logout } = useAppContext();
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const notifRef = useRef(null);

    // Notifications
    const myNotifications = data?.notifications?.filter(
        n => n.userId === currentUser?.id || n.userId === currentUser?.role
    ) || [];
    const unreadCount = myNotifications.filter(n => !n.read).length;

    const handleMarkAsRead = (id) => {
        if (!updateData || !data?.notifications) return;
        const updated = data.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        );
        updateData('notifications', updated);
    };

    const handleMarkAllRead = () => {
        if (!updateData || !data?.notifications) return;
        const updated = data.notifications.map(n =>
            (n.userId === currentUser?.id || n.userId === currentUser?.role) ? { ...n, read: true } : n
        );
        updateData('notifications', updated);
    };

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    return (
        <header className="h-[64px] bg-white/70 backdrop-blur-2xl border-b border-[rgba(0,0,0,0.04)] flex items-center justify-between px-6 shrink-0 relative z-20 transition-all duration-300" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.02), inset 0 -1px 0 rgba(255,255,255,0.8)' }}>
            {/* Left: Hamburger */}
            <div className="flex items-center gap-3">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.93 }}
                    onClick={onMenuClick}
                    className="lg:hidden p-2 text-slate-400 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-xl transition-all duration-150"
                >
                    <Menu size={18} />
                </motion.button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2.5">
                {/* Notifications */}
                <div ref={notifRef} className="relative">
                    <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.93 }}
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50/80 rounded-xl transition-all duration-200"
                    >
                        <Bell size={18} strokeWidth={1.8} />
                        {unreadCount > 0 && (
                            <motion.span 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full ring-[2.5px] ring-white breathe-glow" 
                            />
                        )}
                    </motion.button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                                transition={{ type: 'spring', stiffness: 450, damping: 30, mass: 0.7 }}
                                className="absolute right-0 mt-2 w-80 bg-white/98 backdrop-blur-2xl border border-[rgba(0,0,0,0.06)] shadow-[var(--shadow-xl)] rounded-2xl overflow-hidden z-50"
                            >
                                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100/60">
                                    <h3 className="text-[13px] font-semibold text-slate-800">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={handleMarkAllRead}
                                            className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-72 overflow-y-auto hide-scrollbar">
                                    {myNotifications.length === 0 ? (
                                        <div className="px-4 py-10 text-center">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mx-auto mb-2">
                                                <Bell size={17} className="text-slate-300" />
                                            </div>
                                            <p className="text-xs font-medium text-slate-400">No notifications yet</p>
                                        </div>
                                    ) : (
                                        myNotifications.map((notif, idx) => (
                                            <motion.div
                                                key={notif.id}
                                                initial={{ opacity: 0, x: 8 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.03 }}
                                                onClick={() => handleMarkAsRead(notif.id)}
                                                className={`px-4 py-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50/60 transition-colors ${!notif.read ? 'bg-blue-50/20' : ''}`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-xs font-semibold truncate ${!notif.read ? 'text-slate-800' : 'text-slate-500'}`}>
                                                            {notif.title}
                                                        </p>
                                                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{notif.message}</p>
                                                    </div>
                                                    {!notif.read && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1 shrink-0" />}
                                                </div>
                                                <p className="text-[9px] text-slate-300 mt-1 uppercase tracking-wider font-medium">{notif.time}</p>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Separator */}
                <div className="w-px h-6 bg-slate-100 mx-0.5 hidden sm:block" />

                {/* Profile */}
                <ProfileDropdown />
            </div>
        </header>
    );
};

export default Navbar;
