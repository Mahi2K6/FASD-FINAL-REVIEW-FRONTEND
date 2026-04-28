import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useAppContext } from '../../AppContext';
import {
    Activity, Users, Calendar, FileText, Settings, BarChart3,
    DollarSign, Clock, Package, ShoppingBag, Pill, Shield,
    Stethoscope, ChevronLeft, ChevronRight, LogOut, Menu, X,
    Home, UserCheck, XCircle
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const SIDEBAR_ITEMS = {
    PATIENT: [
        { id: 'overview', label: 'Overview', icon: Home, path: '/dashboard' },
        { id: 'doctors', label: 'Find Doctors', icon: Stethoscope, path: '/dashboard/find-doctors' },
        { id: 'appointments', label: 'My Appointments', icon: Calendar, path: '/dashboard/appointments' },
        { id: 'prescriptions', label: 'Prescriptions', icon: Pill, path: '/dashboard/prescriptions' },
        { id: 'records', label: 'Medical Records', icon: FileText, path: '/dashboard/records' },
    ],
    DOCTOR: [
        { id: 'waiting', label: 'Waiting Room', icon: Clock, path: '/doctor-dashboard/waiting' },
        { id: 'appointments', label: 'Appointments', icon: Calendar, path: '/doctor-dashboard/appointments' },
        { id: 'patients', label: 'Patients', icon: Users, path: '/doctor-dashboard/patients' },
        { id: 'prescriptions', label: 'Prescriptions', icon: FileText, path: '/doctor-dashboard/prescriptions' },
        { id: 'earnings', label: 'Earnings', icon: DollarSign, path: '/doctor-dashboard/earnings' },
    ],
    PHARMACIST: [
        { id: 'orders', label: 'Orders', icon: ShoppingBag, path: '/pharmacist-dashboard/orders' },
        { id: 'inventory', label: 'Inventory', icon: Package, path: '/pharmacist-dashboard/inventory' },
        { id: 'history', label: 'History', icon: Clock, path: '/pharmacist-dashboard/history' },
    ],
    ADMIN: [
        { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin-dashboard' },
        { id: 'approvals', label: 'Approvals', icon: UserCheck, path: '/admin-dashboard/approvals' },
        { id: 'rejected', label: 'Rejected', icon: XCircle, path: '/admin-dashboard/rejected' },
        { id: 'doctors', label: 'Doctors', icon: Stethoscope, path: '/admin-dashboard/doctors' },
        { id: 'patients', label: 'Patients', icon: Users, path: '/admin-dashboard/patients' },
        { id: 'pharmacists', label: 'Pharmacists', icon: Package, path: '/admin-dashboard/pharmacists' },
        { id: 'settings', label: 'Settings', icon: Settings, path: '/admin-dashboard/settings' },
    ],
};

/* ─── Floating Sidebar Geometry ─── */
const SIDEBAR_INSET = 18;        // px from viewport edges
const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED = 72;
const SIDEBAR_RADIUS = 32;       // large organic curves matching modals

const Sidebar = ({ activeTab, setActiveTab }) => {
    const { currentUser, logout } = useAppContext();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    
    const role = (currentUser?.role || 'PATIENT').toUpperCase();
    const items = useMemo(() => SIDEBAR_ITEMS[role] || SIDEBAR_ITEMS.PATIENT, [role]);

    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Brand Header */}
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-5 pt-6 pb-4`}>
                <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm flex items-center justify-center p-1.5 border border-white/[0.08] shrink-0 shadow-lg shadow-blue-900/10"
                >
                    <img src="/medconnect.png" alt="MedConnect" className="w-full h-full object-contain brightness-200 grayscale" />
                </motion.div>
                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <h1 className="text-[15px] font-bold text-white tracking-tight leading-none whitespace-nowrap">
                                MedConnect
                            </h1>
                            <span className="text-[9px] font-medium text-blue-400/50 uppercase tracking-[0.15em] whitespace-nowrap mt-1 block">
                                {role} Portal
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Gradient Separator */}
            <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent mb-4" />

            {/* Section Label */}
            <AnimatePresence>
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="px-5 mb-2"
                    >
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.15em]">Navigation</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation Items */}
            <LayoutGroup>
                <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto hide-scrollbar">
                    {items.map((item) => {
                        // For base paths like '/dashboard', require exact match.
                        // For sub-paths like '/doctor-dashboard/waiting', use exact match.
                        // Fallback: if current path IS the base path and item is the first item, highlight it.
                        const isActive = location.pathname === item.path;
                        return (
                            <motion.button
                                key={item.id}
                                onClick={() => navigate(item.path)}
                                whileHover={{ x: isCollapsed ? 0 : 3 }}
                                whileTap={{ scale: 0.97 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                className={`
                                    w-full flex items-center gap-3 rounded-2xl py-2.5 transition-all duration-200 relative group cursor-pointer
                                    ${isCollapsed ? 'justify-center px-2.5' : 'px-3.5'}
                                    ${isActive
                                        ? 'text-white'
                                        : 'text-slate-400 hover:text-slate-200'
                                    }
                                `}
                            >
                                {/* Active background with sliding animation */}
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active-bg"
                                        className="absolute inset-0 bg-white/[0.08] rounded-2xl border border-white/[0.06]"
                                        transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.8 }}
                                    />
                                )}

                                {/* Active left indicator with glow */}
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-indicator"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                                        style={{
                                            background: 'linear-gradient(180deg, #60A5FA, #818CF8)',
                                            boxShadow: '0 0 12px rgba(96,165,250,0.4), 0 0 4px rgba(96,165,250,0.6)'
                                        }}
                                        transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.8 }}
                                    />
                                )}

                                <item.icon 
                                    size={18} 
                                    strokeWidth={isActive ? 2.2 : 1.7} 
                                    className={`shrink-0 relative z-10 transition-all duration-200 ${isActive ? 'drop-shadow-[0_0_4px_rgba(96,165,250,0.3)]' : ''}`} 
                                />
                                <AnimatePresence>
                                    {!isCollapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -4 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -4 }}
                                            transition={{ duration: 0.15 }}
                                            className={`text-[13px] whitespace-nowrap overflow-hidden relative z-10 ${isActive ? 'font-semibold' : 'font-medium'}`}
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                                
                                {/* Tooltip for collapsed state */}
                                {isCollapsed && (
                                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-800/95 backdrop-blur-md text-white text-xs font-medium rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-white/5">
                                        {item.label}
                                    </div>
                                )}
                            </motion.button>
                        );
                    })}
                </nav>
            </LayoutGroup>

            {/* Bottom Section */}
            <div className="mt-auto">
                {/* Separator */}
                <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent mb-3 mt-3" />

                <div className="px-3 pb-4 space-y-1.5">
                    {/* Collapse toggle — desktop only */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden md:flex items-center justify-center w-full py-2 rounded-xl text-slate-500 hover:bg-white/[0.04] hover:text-slate-300 transition-all"
                    >
                        {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
                    </motion.button>

                    {/* User card */}
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} p-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.04]`}>
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-white text-xs font-bold shrink-0 border border-white/[0.08]">
                            {currentUser?.name?.charAt(0) || 'U'}
                        </div>
                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.div
                                    initial={{ opacity: 0, x: -4 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -4 }}
                                    className="flex-1 min-w-0 overflow-hidden"
                                >
                                    <p className="text-xs font-semibold text-white/85 truncate">{currentUser?.name || 'User'}</p>
                                    <p className="text-[10px] text-slate-500 truncate">{currentUser?.email || ''}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Logout */}
                    <motion.button
                        whileHover={{ x: isCollapsed ? 0 : 2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={logout}
                        className={`w-full flex items-center gap-3 rounded-xl py-2 text-slate-500 hover:bg-red-500/[0.08] hover:text-red-400 transition-all ${isCollapsed ? 'justify-center px-2.5' : 'px-3.5'}`}
                    >
                        <LogOut size={15} strokeWidth={1.8} />
                        <AnimatePresence>
                            {!isCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-[12px] font-medium"
                                >
                                    Sign Out
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Hamburger */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="md:hidden fixed top-4 left-4 z-[60] w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-md shadow-[var(--shadow-md)] border border-white/60 flex items-center justify-center text-slate-600 hover:bg-white transition-all"
            >
                <Menu size={18} />
            </button>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden fixed inset-0 bg-black/25 backdrop-blur-sm z-[70]"
                        onClick={() => setIsMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Mobile Sidebar Drawer — floating with inset */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.aside
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 34, mass: 0.8 }}
                        className="md:hidden fixed z-[80] overflow-hidden"
                        style={{ 
                            top: SIDEBAR_INSET,
                            left: SIDEBAR_INSET,
                            bottom: SIDEBAR_INSET,
                            width: 260,
                            borderRadius: SIDEBAR_RADIUS,
                            background: 'linear-gradient(180deg, #071A35 0%, #0B2B56 100%)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            boxShadow: 'var(--shadow-sidebar)',
                        }}
                    >
                        <button
                            onClick={() => setIsMobileOpen(false)}
                            className="absolute top-5 right-4 p-2 rounded-xl text-white/30 hover:bg-white/[0.06] hover:text-white/60 transition-all z-10"
                        >
                            <X size={16} />
                        </button>
                        {sidebarContent}
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* ═══ Desktop Floating Sidebar ═══ */}
            <motion.aside
                animate={{ width: isCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH }}
                transition={{ type: 'spring', stiffness: 380, damping: 34, mass: 0.8 }}
                className="hidden md:flex fixed z-40 flex-col overflow-hidden"
                style={{ 
                    top: SIDEBAR_INSET,
                    left: SIDEBAR_INSET,
                    bottom: SIDEBAR_INSET,
                    borderRadius: SIDEBAR_RADIUS,
                    background: 'linear-gradient(180deg, #071A35 0%, #0A2244 40%, #0B2B56 100%)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    boxShadow: 'var(--shadow-sidebar)',
                }}
            >
                {/* Inner glow overlay */}
                <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        borderRadius: SIDEBAR_RADIUS,
                        background: 'linear-gradient(180deg, rgba(96,165,250,0.04) 0%, transparent 30%, transparent 70%, rgba(129,140,248,0.03) 100%)',
                    }}
                />
                {/* Ambient glow orbs */}
                <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-blue-500/[0.04] blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 -right-16 w-36 h-36 rounded-full bg-indigo-500/[0.03] blur-3xl pointer-events-none" />
                {sidebarContent}
            </motion.aside>
        </>
    );
};

export { SIDEBAR_ITEMS };
export default Sidebar;
