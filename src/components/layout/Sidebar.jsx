import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Activity, Search, Calendar, Pill, FileText, Clock, Users,
    ShoppingBag, Package, BarChart3, Settings, DollarSign,
    ChevronLeft, ChevronRight, LogOut, LayoutDashboard, X, Menu
} from 'lucide-react';
import { useAppContext } from '../../AppContext';

const SIDEBAR_ITEMS = {
    patient: [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'doctors', label: 'Find Doctors', icon: Search },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
        { id: 'prescriptions', label: 'Pharmacy', icon: Pill },
        { id: 'records', label: 'Records', icon: FileText },
    ],
    doctor: [
        { id: 'waiting', label: 'Waiting Room', icon: Clock },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
        { id: 'patients', label: 'Patients', icon: Users },
        { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
        { id: 'earnings', label: 'Earnings', icon: DollarSign },
    ],
    pharmacist: [
        { id: 'orders', label: 'Orders Feed', icon: ShoppingBag },
        { id: 'inventory', label: 'Inventory', icon: Package },
        { id: 'history', label: 'History', icon: Clock },
    ],
    admin: [
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'approvals', label: 'Approvals', icon: Activity },
        { id: 'rejected', label: 'Rejected', icon: X },
        { id: 'doctors', label: 'Doctors', icon: Users },
        { id: 'patients', label: 'Patients', icon: Users },
        { id: 'pharmacists', label: 'Pharmacists', icon: ShoppingBag },
        { id: 'settings', label: 'Settings', icon: Settings },
    ],
};

const Sidebar = ({ activeTab, setActiveTab, collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
    const { currentUser, logout } = useAppContext();
    const navigate = useNavigate();
    const sidebarRef = useRef(null);

    const role = currentUser?.role?.toLowerCase() || 'patient';
    const items = SIDEBAR_ITEMS[role] || SIDEBAR_ITEMS.patient;

    // Close mobile sidebar on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (mobileOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
                setMobileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [mobileOpen, setMobileOpen]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleItemClick = (id) => {
        setActiveTab(id);
        setMobileOpen(false);
    };

    return (
        <>
            {/* Mobile backdrop */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-[var(--color-text-primary)]/30 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                ref={sidebarRef}
                className={`
                    fixed lg:relative z-50 h-[calc(100vh-32px)] m-4 rounded-[20px] overflow-hidden
                    flex flex-col transition-all duration-300 ease-in-out
                    bg-[#0F1C2E] shadow-xl
                    ${collapsed ? 'w-[72px]' : 'w-64'}
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* Logo area */}
                <div className={`flex items-center p-4 py-5 border-b border-white/5 ${collapsed ? 'justify-center' : 'gap-3'}`}>
                    <img src="/medconnect.png" alt="MedConnect" className="h-8 w-8 shrink-0 brightness-0 invert" />
                    {!collapsed && (
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-lg font-semibold text-white tracking-tight">MedConnect</span>
                            <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-[#00B4D8] mt-[2px]">
                                {role} portal
                            </span>
                        </div>
                    )}
                    {/* Mobile close */}
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="lg:hidden ml-auto p-1.5 text-white/60 hover:text-white rounded-xl hover:bg-white/10"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Navigation items */}
                <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                    {items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleItemClick(item.id)}
                                title={collapsed ? item.label : undefined}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                                    ${isActive
                                        ? 'text-white bg-[#1E3A5F] before:content-[""] before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:bg-[#00B4D8] before:rounded-full'
                                        : 'text-slate-400 hover:text-white hover:bg-[#1A2E46]'
                                    }
                                    ${collapsed ? 'justify-center before:left-[4px]' : ''}
                                `}
                            >
                                <Icon className={`shrink-0 w-4 h-4 ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`} />
                                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                            </button>
                        );
                    })}
                </nav>

                {/* Bottom section */}
                <div className="mt-auto px-4 pb-4 border-t border-white/10 pt-3 flex flex-col gap-2">
                    {/* Collapse toggle */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden lg:flex w-full items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:bg-[#1A2E46] hover:text-white transition-colors"
                    >
                        {collapsed ? <ChevronRight className="w-4 h-4 mx-auto" /> : <><ChevronLeft className="w-4 h-4" /> <span>Collapse</span></>}
                    </button>

                    {/* User info */}
                    <div className={`flex items-center gap-3 px-2 py-2 ${collapsed ? 'justify-center' : ''}`}>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1B6CA8] to-[#00B4D8] text-white flex items-center justify-center text-sm font-semibold shrink-0 shadow-md">
                            {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{currentUser?.name || 'User'}</p>
                                <p className="text-xs text-slate-400 uppercase tracking-wide">{role}</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleLogout}
                        title={collapsed ? 'Log out' : undefined}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors ${collapsed ? 'justify-center' : ''}`}
                    >
                        <LogOut className="w-4 h-4 shrink-0" />
                        {!collapsed && <span>Log out</span>}
                    </button>
                </div>
            </aside>
        </>
    );
};

export { SIDEBAR_ITEMS };
export default Sidebar;
