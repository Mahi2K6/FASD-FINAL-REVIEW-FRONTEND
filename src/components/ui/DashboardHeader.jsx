import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import PillNav from './PillNav';
import ProfileMenu from './ProfileMenu';
import { useAppContext } from '../../AppContext';

const DashboardHeader = ({ title = "Dashboard", tabs, activeTab, setActiveTab }) => {
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

    return (
        <header className="sticky top-0 z-40 px-6 py-3 bg-white/80 backdrop-blur-md border-b border-[rgba(0,0,0,0.06)] flex items-center justify-between transition-all duration-300">
            
            {/* Left: Brand Focus Area */}
            <div className="flex flex-1 items-center gap-3 cursor-pointer group logo-area">
                <motion.div
                    whileHover={{ scale: 1.05, rotate: [-2, 2, -2, 0] }}
                    transition={{ duration: 0.4 }}
                    className="relative flex justify-center items-center z-10"
                >
                    <img src="/medconnect.png" alt="MedConnect Logo" className="w-[32px] h-[32px] object-contain drop-shadow-sm" />
                </motion.div>
                <div className="hidden sm:flex flex-col ml-1">
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">
                        MedConnect
                    </h1>
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-0.5">
                        {title}
                    </span>
                </div>
            </div>

            {/* Center: Navigation Pill */}
            {tabs && setActiveTab && (
                <div className="hidden lg:flex items-center justify-center flex-1">
                    <PillNav tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} className="nav-pill-container" />
                </div>
            )}

            {/* Right: Actions & Profile */}
            <div className="flex flex-1 items-center justify-end gap-3 profile-area">
                
                {/* Notifications Engine */}
                <div className="relative pointer-events-auto">
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)} 
                        className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors relative"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && <span className="absolute -top-1 -right-1 flex items-center justify-center bg-[#00B4D8] text-white text-[10px] font-bold w-4 h-4 rounded-full">{unreadCount}</span>}
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                                animate={{ opacity: 1, y: 0, scale: 1 }} 
                                exit={{ opacity: 0, scale: 0.95, y: 10 }} 
                                className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.15)] rounded-3xl p-4 z-[9999]"
                            >
                                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                        <Bell size={18} className="text-blue-600" /> Notifications
                                    </h4>
                                    {unreadCount > 0 && <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-widest">{unreadCount} New</span>}
                                </div>
                                <div className="space-y-2 max-h-72 overflow-y-auto pr-1 hide-scrollbar">
                                    {myNotifications.length === 0 ? (
                                        <div className="text-slate-400 text-center py-6 text-sm flex flex-col items-center gap-2">
                                            <Bell size={24} className="opacity-20" />
                                            <p>You're all caught up!</p>
                                        </div>
                                    ) : (
                                        myNotifications.map(notif => (
                                            <div 
                                                key={notif.id} 
                                                onClick={() => handleMarkAsRead(notif.id)}
                                                className={`p-3 text-sm rounded-3xl border transition-colors cursor-pointer group ${notif.read ? 'bg-slate-50 border-slate-100 text-slate-500' : 'bg-blue-50/50 border-blue-100 text-slate-800'}`}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={`font-bold ${notif.read ? '' : 'text-blue-700'}`}>{notif.title}</span>
                                                    {!notif.read && <span className="w-2 h-2 shrink-0 bg-blue-500 rounded-full mt-1.5" />}
                                                </div>
                                                <p className="opacity-90">{notif.message}</p>
                                                <div className="text-[10px] font-bold mt-2 opacity-50 uppercase tracking-widest">{notif.time}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <ProfileMenu />
            </div>
            
        </header>
    );
};

export default DashboardHeader;
