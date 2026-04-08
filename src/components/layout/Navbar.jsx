import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Menu, Search } from 'lucide-react';
import { useAppContext } from '../../AppContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ title, onMenuClick }) => {
    const { currentUser, data, updateData, logout } = useAppContext();
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const notifRef = useRef(null);
    const profileRef = useRef(null);

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
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setShowProfile(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        if (typeof logout === 'function') logout();
        navigate('/login');
    };

    const userInitial = currentUser?.name?.charAt(0)?.toUpperCase() || 'U';

    return (
        <header className="bg-white/50 backdrop-blur-xl border-b border-[rgba(26,111,196,0.06)] flex items-center justify-between px-6 py-4 shrink-0 relative z-20">
            {/* Left: Hamburger */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-xl transition-all duration-200 ease-in-out"
                >
                    <Menu size={20} />
                </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <div ref={notifRef} className="relative">
                    <button
                        onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                        className="relative p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded-xl transition-all duration-200 ease-in-out"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                        )}
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 mt-2 w-80 glass-card !rounded-[20px] !p-0 z-50 overflow-hidden"
                            >
                                <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(26,111,196,0.08)]">
                                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={handleMarkAllRead}
                                            className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-medium"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-72 overflow-y-auto">
                                    {myNotifications.length === 0 ? (
                                        <div className="px-4 py-8 text-center">
                                            <Bell size={24} className="mx-auto text-[var(--color-primary)]/30 mb-2" />
                                            <p className="text-sm text-[var(--color-text-secondary)]">No notifications yet</p>
                                        </div>
                                    ) : (
                                        myNotifications.map(notif => (
                                            <div
                                                key={notif.id}
                                                onClick={() => handleMarkAsRead(notif.id)}
                                                className={`px-4 py-3 border-b border-[rgba(26,111,196,0.04)] cursor-pointer hover:bg-[var(--color-primary-light)]/40 transition-colors ${!notif.read ? 'bg-[var(--color-primary-light)]/50' : ''}`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium truncate ${!notif.read ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                                                            {notif.title}
                                                        </p>
                                                        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 line-clamp-2">{notif.message}</p>
                                                    </div>
                                                    {!notif.read && <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full mt-1.5 shrink-0" />}
                                                </div>
                                                <p className="text-[10px] text-[var(--color-text-secondary)]/60 mt-1">{notif.time}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Profile */}
                <div ref={profileRef} className="relative">
                    <button
                        onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                        className="flex items-center gap-2 p-1.5 hover:bg-[var(--color-primary-light)] rounded-xl transition-all duration-200 ease-in-out"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white flex items-center justify-center text-sm font-bold">
                            {userInitial}
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-medium text-[var(--color-text-primary)] leading-none">{currentUser?.name || 'User'}</p>
                            <p className="text-[11px] text-[var(--color-text-secondary)] capitalize leading-none mt-0.5">{currentUser?.role || 'user'}</p>
                        </div>
                    </button>

                    <AnimatePresence>
                        {showProfile && (
                            <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 mt-2 w-56 glass-card !p-0 !rounded-[20px] z-50 py-2 overflow-hidden pointer-events-auto"
                            >
                                <div className="px-4 py-3 border-b border-[rgba(26,111,196,0.08)] mb-1">
                                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">{currentUser?.name}</p>
                                    <p className="text-xs text-[var(--color-text-secondary)]">{currentUser?.email}</p>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); navigate('/profile'); setShowProfile(false); }}
                                    className="w-full px-4 py-2.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-primary-light)] text-left transition-colors"
                                >
                                    Profile
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); navigate('/settings'); setShowProfile(false); }}
                                    className="w-full px-4 py-2.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-primary-light)] text-left transition-colors"
                                >
                                    Settings
                                </button>
                                <div className="border-t border-[rgba(26,111,196,0.08)] mt-1 pt-1">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left transition-colors"
                                    >
                                        Log out
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
