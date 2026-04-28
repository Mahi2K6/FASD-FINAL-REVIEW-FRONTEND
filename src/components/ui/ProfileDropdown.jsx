import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, Lock, Calendar, Bell, CreditCard, LogOut } from 'lucide-react';
import { useAppContext, API_URL } from '../../AppContext';

const ProfileDropdown = () => {
    const { currentUser, logout } = useAppContext();
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setProfileOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        if (typeof logout === 'function') logout();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate('/login');
    };

    // Compute the correct base path for the current user's role
    const getBasePath = () => {
        const r = (currentUser?.role || 'patient').toLowerCase();
        if (r === 'doctor') return '/doctor-dashboard';
        if (r === 'pharmacist') return '/pharmacist-dashboard';
        if (r === 'admin') return '/admin-dashboard';
        return '/dashboard';
    };

    const handleMenuAction = (action) => {
        setProfileOpen(false);
        const base = getBasePath();
        switch(action) {
            case "profile":
                navigate(`${base}/profile`);
                break;
            case "settings":
                navigate(`${base}/settings`);
                break;
            case "password":
                navigate(`${base}/change-password`);
                break;
            case "appointments":
                navigate(`${base}/appointments`);
                break;
            case "notifications":
                navigate(`${base}/notifications`);
                break;
            case "billing":
                navigate(`${base}/billing`);
                break;
            case "logout":
                handleLogout();
                break;
            default:
                break;
        }
    };

    const userInitial = currentUser?.name?.charAt(0)?.toUpperCase() || 'U';
    const role = currentUser?.role || 'PATIENT';

    return (
        <div className="relative" ref={profileRef}>
            <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="group flex items-center cursor-pointer select-none outline-none"
                style={{ gap: '10px', padding: '5px 14px 5px 5px' }}
            >
                <motion.div
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.94 }}
                    className="relative shrink-0"
                >
                    <div
                        className="w-[34px] h-[34px] rounded-full flex items-center justify-center font-semibold text-[13px] text-white overflow-hidden transition-shadow duration-300"
                        style={{
                            background: 'var(--brand-gradient, linear-gradient(135deg, #3b82f6, #1e40af))',
                            boxShadow: '0 0 0 2.5px rgba(255,255,255,0.7), 0 0 0 4px rgba(37,99,235,0.12), 0 6px 16px rgba(37,99,235,0.15)',
                        }}
                    >
                        {currentUser?.profile_picture ? (
                            <img src={`${API_URL}${currentUser.profile_picture}`} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            userInitial
                        )}
                    </div>
                    <span
                        className="absolute -bottom-[1px] -right-[1px] w-[10px] h-[10px] rounded-full border-[2px] border-white transition-all duration-300 group-hover:scale-110"
                        style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
                    />
                </motion.div>

                <div className="hidden sm:flex flex-col items-end leading-none">
                    <span className="text-[13px] font-semibold text-slate-700 tracking-[-0.01em] transition-all duration-300 group-hover:text-slate-900">
                        {currentUser?.name || 'User'}
                    </span>
                    <span className="text-[9.5px] font-semibold text-slate-400/70 uppercase tracking-[0.14em] mt-[2px] transition-all duration-300 group-hover:text-slate-500/80">
                        {role}
                    </span>
                </div>
            </button>

            <AnimatePresence>
                {profileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 450, damping: 30, mass: 0.7 }}
                        className="absolute right-0 top-full mt-3 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 z-[9999] overflow-hidden"
                    >
                        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                            <p className="text-sm font-bold text-slate-800 truncate">{currentUser?.name || 'User'}</p>
                            <p className="text-xs text-slate-400 truncate mt-0.5 font-medium">{currentUser?.email || 'No email'}</p>
                        </div>
                        <div className="py-2">
                            <button
                                onClick={() => handleMenuAction("profile")}
                                className="w-full px-5 py-3.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[var(--color-primary, #2563eb)] text-left transition-all font-medium flex items-center gap-3"
                            >
                                <User size={18} /> My Profile
                            </button>
                            <button
                                onClick={() => handleMenuAction("settings")}
                                className="w-full px-5 py-3.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[var(--color-primary, #2563eb)] text-left transition-all font-medium flex items-center gap-3"
                            >
                                <Settings size={18} /> Account Settings
                            </button>
                            <button
                                onClick={() => handleMenuAction("password")}
                                className="w-full px-5 py-3.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[var(--color-primary, #2563eb)] text-left transition-all font-medium flex items-center gap-3"
                            >
                                <Lock size={18} /> Change Password
                            </button>
                            <button
                                onClick={() => handleMenuAction("appointments")}
                                className="w-full px-5 py-3.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[var(--color-primary, #2563eb)] text-left transition-all font-medium flex items-center gap-3"
                            >
                                <Calendar size={18} /> {role === 'DOCTOR' ? 'Consultation History' : role === 'PHARMACIST' ? 'Orders History' : role === 'ADMIN' ? 'Platform Activity' : 'Appointment History'}
                            </button>
                            <button
                                onClick={() => handleMenuAction("notifications")}
                                className="w-full px-5 py-3.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[var(--color-primary, #2563eb)] text-left transition-all font-medium flex items-center gap-3"
                            >
                                <Bell size={18} /> Notifications
                            </button>
                            <button
                                onClick={() => handleMenuAction("billing")}
                                className="w-full px-5 py-3.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-[var(--color-primary, #2563eb)] text-left transition-all font-medium flex items-center gap-3"
                            >
                                <CreditCard size={18} /> Billing / Payments
                            </button>
                        </div>
                        <div className="border-t border-slate-100 py-2 bg-slate-50/30">
                            <button
                                onClick={() => handleMenuAction("logout")}
                                className="w-full px-5 py-3.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 text-left transition-all font-bold flex items-center gap-3"
                            >
                                <LogOut size={18} strokeWidth={2.5} /> Logout
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfileDropdown;
