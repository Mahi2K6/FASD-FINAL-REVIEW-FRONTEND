import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Edit, Lock, Package, RefreshCcw, MapPin, Phone, LogOut, ChevronRight, X, Briefcase, Pill, Mail, Smartphone, Home } from 'lucide-react';
import { useAppContext } from '../../AppContext';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { GlassInput } from './GlassInput';

export const ProfileMenu = () => {
    const { currentUser, updateData, data, logout } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Modals internal states
    const [modals, setModals] = useState({
        viewProfile: false,
        updateProfile: false,
        personalInfo: false,
        changePassword: false,
        orders: false,
        returnMeds: false,
        support: false,
        logoutConfirm: false
    });

    const closeMenu = () => setIsOpen(false);

    const openModal = (modalName) => {
        closeMenu();
        setModals(prev => ({ ...prev, [modalName]: true }));
    };

    const closeModal = (modalName) => {
        setModals(prev => ({ ...prev, [modalName]: false }));
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const userInitial = currentUser?.name?.charAt(0)?.toUpperCase() || 'U';

    const menuItems = [
        { id: 'viewProfile', icon: User, label: 'View Profile' },
        { id: 'updateProfile', icon: Edit, label: 'Update Profile' },
        { id: 'personalInfo', icon: Briefcase, label: 'Personal Information' },
        { id: 'changePassword', icon: Lock, label: 'Change Password' },
        { id: 'orders', icon: Package, label: 'Orders & History' },
        { id: 'returnMeds', icon: Pill, label: 'Return Medicines' },
        { id: 'support', icon: Phone, label: 'Contact Support' },
    ];

    // Form states
    const [profileForm, setProfileForm] = useState({ name: currentUser?.name || '', email: currentUser?.email || '', phone: currentUser?.phone || '' });
    const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
    const [supportForm, setSupportForm] = useState({ subject: '', message: '' });
    const [returnForm, setReturnForm] = useState({ order: '', reason: '' });
    const [toastMessage, setToastMessage] = useState(null);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleUpdateProfile = () => {
        const updatedUsers = data.users.map(u => u.id === currentUser.id ? { ...u, ...profileForm } : u);
        updateData('users', updatedUsers);
        // Direct context updates should trigger a rerender realistically, relying on prototype's session state here
        showToast("Profile Updated Successfully");
        closeModal('updateProfile');
    };

    const handleChangePassword = () => {
        if (passwordForm.new !== passwordForm.confirm) {
            alert("New passwords do not match.");
            return;
        }
        showToast("Password successfully changed");
        setPasswordForm({ current: '', new: '', confirm: '' });
        closeModal('changePassword');
    };

    const handleSendSupport = () => {
        const newNotif = {
            id: `SUP${Date.now()}`,
            userId: 'admin', // send to admin
            title: `Support: ${supportForm.subject}`,
            message: `From ${currentUser.name}: ${supportForm.message}`,
            time: new Date().toLocaleTimeString(),
            read: false,
        };
        updateData('notifications', [...data.notifications, newNotif]);
        showToast("Support request sent to admin");
        setSupportForm({ subject: '', message: '' });
        closeModal('support');
    };

    const handleReturnRequest = () => {
        showToast(`Return request submitted for Order ${returnForm.order}`);
        setReturnForm({ order: '', reason: '' });
        closeModal('returnMeds');
    };

    return (
        <div className="relative inline-block text-left" ref={menuRef}>
            {/* TRIGGER AVATAR */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                title="Account Settings"
                className={`relative w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-sm transition-shadow duration-300 pointer-events-auto border-2 ${isOpen ? 'border-blue-300 shadow-md ring-2 ring-blue-500/20' : 'border-white/60 hover:shadow-md'}`}
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)' }}
            >
                {userInitial}
            </motion.button>

            {/* DROPDOWN MENU */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                        className="absolute right-0 mt-3 w-64 bg-white/90 backdrop-blur-2xl border border-white/40 shadow-[0_25px_60px_-5px_rgba(0,0,0,0.15)] rounded-[24px] overflow-hidden z-[100] pb-2 pointer-events-auto"
                    >
                        {/* Header Area */}
                        <div className="bg-slate-50/80 px-4 py-4 border-b border-slate-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-inner flex-shrink-0">
                                {userInitial}
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-semibold text-slate-800 truncate">{currentUser.name}</p>
                                <p className="text-[10px] uppercase tracking-wider font-bold text-blue-600">{currentUser.role} Account</p>
                            </div>
                        </div>

                        {/* Menu Options */}
                        <div className="py-2 flex flex-col px-2">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => openModal(item.id)}
                                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-[16px] hover:bg-slate-100/80 transition-all duration-200 group text-left"
                                >
                                    <span className="p-1.5 rounded-xl bg-white shadow-sm border border-slate-100 group-hover:border-blue-100 text-blue-500 group-hover:text-blue-600 transition-colors">
                                        <item.icon size={16} />
                                    </span>
                                    {item.label}
                                </button>
                            ))}
                            <div className="h-px bg-slate-200/60 my-2 mx-3"></div>

                            <button
                                onClick={() => openModal('logoutConfirm')}
                                className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-600 hover:text-red-700 rounded-[16px] hover:bg-red-50 transition-all duration-200 group text-left"
                            >
                                <span className="p-1.5 rounded-xl bg-red-50 shadow-sm border border-red-100 group-hover:border-red-200 text-red-500 group-hover:text-red-600 transition-colors">
                                    <LogOut size={16} />
                                </span>
                                Logout
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MODALS */}
            {/* 1. View Profile Modal */}
            <AnimatePresence>
                {modals.viewProfile && (
                    <Modal overlay onClickOut={() => closeModal('viewProfile')}>
                        <div className="w-full max-w-[1000px] w-[95vw] bg-white/95 backdrop-blur-3xl rounded-[36px] p-6 sm:p-10 relative shadow-2xl border border-white/60 pointer-events-auto">
                            <button onClick={() => closeModal('viewProfile')} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100/80 text-slate-400 hover:text-slate-600 transition-colors z-10">
                                <X size={24} />
                            </button>

                            {/* Profile Header */}
                            <div className="flex flex-col items-center mb-8 pb-8 border-b border-slate-100">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-4xl shadow-xl shadow-blue-500/20 border-4 border-white mb-4 relative">
                                    {userInitial}
                                    <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                                </div>
                                <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{currentUser.name}</h3>
                                <div className="px-4 py-1.5 bg-blue-50/80 text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest mt-2 border border-blue-100/50">{currentUser.role} Account</div>
                            </div>

                            {/* Two-Column Grid Content */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                                {/* Left Column: Core Contact */}
                                <div className="space-y-6">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><User size={16} /> Contact Information</h4>

                                    <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6 space-y-5">
                                        <div className="flex items-start gap-4">
                                            <div className="mt-1 p-2 bg-white rounded-xl shadow-sm text-blue-500 border border-slate-100"><Mail size={20} /></div>
                                            <div>
                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                                                <p className="font-semibold text-slate-800 text-lg">{currentUser.email || 'patient@medconnect.local'}</p>
                                            </div>
                                        </div>
                                        <div className="w-full h-px bg-slate-200/60"></div>
                                        <div className="flex items-start gap-4">
                                            <div className="mt-1 p-2 bg-white rounded-xl shadow-sm text-indigo-500 border border-slate-100"><Smartphone size={20} /></div>
                                            <div>
                                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                                                <p className="font-semibold text-slate-800 text-lg">{currentUser.phone || '+91 99000 00000'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Status & Emergency */}
                                <div className="space-y-6">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Briefcase size={16} /> Account Status</h4>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-5">
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Member Since</p>
                                            <p className="font-bold text-slate-800 text-xl">2026</p>
                                        </div>
                                        <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-5 relative overflow-hidden">
                                            <div className="absolute right-[-10px] top-[-10px] text-blue-200/50 opacity-50"><Package size={80} /></div>
                                            <p className="text-[11px] font-bold text-blue-500 uppercase tracking-widest mb-2 relative z-10">Total Orders</p>
                                            <p className="font-bold text-blue-700 text-xl relative z-10">14</p>
                                        </div>
                                    </div>

                                    <div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-5 flex items-center gap-4">
                                        <div className="p-3 bg-white rounded-xl shadow-sm text-amber-500 border border-amber-100/50"><Phone size={20} /></div>
                                        <div>
                                            <p className="text-[11px] font-bold text-amber-600/70 uppercase tracking-widest mb-1">Emergency Contact</p>
                                            <p className="font-semibold text-amber-800">Sarah Connor: +91 98000 55555</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Footer */}
                            <div className="mt-10 flex justify-center pt-6 border-t border-slate-100">
                                <GlassButton onClick={() => { closeModal('viewProfile'); openModal('updateProfile'); }} className="px-10 py-3 bg-slate-800 text-white hover:bg-slate-900 shadow-xl shadow-slate-900/10">
                                    Edit Profile Information
                                </GlassButton>
                            </div>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>

            {/* 2. Update Profile Modal */}
            <AnimatePresence>
                {modals.updateProfile && (
                    <Modal overlay onClickOut={() => closeModal('updateProfile')}>
                        <div className="w-full max-w-md bg-white rounded-[32px] p-8 relative shadow-2xl border border-slate-100 pointer-events-auto">
                            <button onClick={() => closeModal('updateProfile')} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={20} />
                            </button>
                            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3"><Edit size={24} className="text-blue-500" /> Update Profile</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider pl-1 mb-2">Full Name</label>
                                    <GlassInput value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} className="bg-slate-50 border-slate-200" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider pl-1 mb-2">Email</label>
                                    <GlassInput value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} type="email" className="bg-slate-50 border-slate-200" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider pl-1 mb-2">Phone</label>
                                    <GlassInput value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} className="bg-slate-50 border-slate-200" />
                                </div>
                            </div>
                            <div className="mt-8 flex gap-4">
                                <GlassButton variant="secondary" onClick={() => closeModal('updateProfile')} className="flex-1 py-3">Cancel</GlassButton>
                                <GlassButton onClick={handleUpdateProfile} className="flex-1 py-3 bg-blue-600 text-white border-none shadow-md">Save Changes</GlassButton>
                            </div>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>

            {/* 3. Change Password Modal */}
            <AnimatePresence>
                {modals.changePassword && (
                    <Modal overlay onClickOut={() => closeModal('changePassword')}>
                        <div className="w-full max-w-lg bg-white/95 backdrop-blur-3xl rounded-[36px] p-8 sm:p-12 relative shadow-2xl border border-white/60 pointer-events-auto">
                            <button onClick={() => closeModal('changePassword')} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100/80 text-slate-400 hover:text-slate-600 transition-colors z-10">
                                <X size={24} />
                            </button>

                            <div className="flex flex-col items-center mb-8">
                                <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center shadow-inner border border-blue-100/50 mb-5">
                                    <Lock size={36} />
                                </div>
                                <h3 className="text-3xl font-bold text-slate-800 tracking-tight text-center">Security Settings</h3>
                                <p className="text-slate-500 text-center mt-2 text-sm">Update your password to keep your account secure.</p>
                            </div>

                            <div className="space-y-5 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2">Current Password</label>
                                    <GlassInput type="password" value={passwordForm.current} onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })} className="bg-white border-slate-200/60 shadow-sm" />
                                </div>
                                <div className="w-full h-px bg-slate-200/60 my-2"></div>
                                <div>
                                    <label className="block text-[11px] font-bold text-blue-400 uppercase tracking-widest pl-1 mb-2">New Password</label>
                                    <GlassInput type="password" value={passwordForm.new} onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })} className="bg-white border-slate-200/60 shadow-sm" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2">Confirm New Password</label>
                                    <GlassInput type="password" value={passwordForm.confirm} onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className="bg-white border-slate-200/60 shadow-sm" />
                                </div>
                            </div>

                            <div className="mt-10">
                                <GlassButton onClick={handleChangePassword} className="w-full py-4 bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-600/20 text-lg">Update Password</GlassButton>
                            </div>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>

            {/* 4. Orders & History Panel */}
            <AnimatePresence>
                {modals.orders && (
                    <Modal overlay onClickOut={() => closeModal('orders')} fullScreen>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-[1100px] w-[95vw] h-[85vh] bg-white/95 backdrop-blur-3xl sm:rounded-[40px] p-6 sm:p-10 relative shadow-2xl border border-white/60 pointer-events-auto flex flex-col">
                            <button onClick={() => closeModal('orders')} className="absolute top-6 right-6 p-3 rounded-full hover:bg-slate-100/80 text-slate-400 hover:text-slate-600 transition-colors z-10">
                                <X size={24} />
                            </button>

                            <div className="flex items-center gap-5 border-b border-slate-100 pb-8 mb-6 shrink-0">
                                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center shadow-inner border border-blue-100/50">
                                    <Package size={32} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Orders & History</h2>
                                    <p className="text-slate-500 mt-1">Review your past pharmacy orders and transaction states.</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto hide-scrollbar rounded-2xl">
                                {data.orders?.filter(o => o.patientId === currentUser.id).length > 0 ? (
                                    <table className="w-full text-left border-collapse">
                                        <thead className="sticky top-0 bg-white/90 backdrop-blur-md z-10 border-b border-slate-100">
                                            <tr>
                                                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Order ID</th>
                                                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Items</th>
                                                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                                                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                                <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.orders.filter(o => o.patientId === currentUser.id).map((order) => (
                                                <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                                    <td className="py-5 px-6 font-bold text-slate-600">#{order.id}</td>
                                                    <td className="py-5 px-6 text-slate-500">Today, 10:00 AM</td>
                                                    <td className="py-5 px-6 font-medium text-slate-800">{order.items}</td>
                                                    <td className="py-5 px-6 text-slate-600 font-medium">{order.total}</td>
                                                    <td className="py-5 px-6">
                                                        <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold uppercase tracking-wider border border-green-100/50">{order.status}</span>
                                                    </td>
                                                    <td className="py-5 px-6 text-right">
                                                        <button className="text-blue-500 hover:text-blue-700 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">Reorder</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                        <Package size={64} className="opacity-20 mb-4" />
                                        <p>No recent orders found.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </Modal>
                )}
            </AnimatePresence>

            {/* 5. Return Medicines Modal */}
            <AnimatePresence>
                {modals.returnMeds && (
                    <Modal overlay onClickOut={() => closeModal('returnMeds')}>
                        <div
                            className="relative pointer-events-auto flex flex-col items-center mx-auto"
                            style={{
                                width: 'min(95vw, 720px)',
                                maxWidth: '720px',
                                minWidth: 'min(95vw, 520px)',
                                backdropFilter: 'blur(30px)',
                                WebkitBackdropFilter: 'blur(30px)',
                                background: 'rgba(255,255,255,0.85)',
                                borderRadius: '24px',
                                padding: '40px',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.12)'
                            }}
                        >
                            <button onClick={() => closeModal('returnMeds')} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100/80 text-slate-400 hover:text-slate-600 transition-colors z-10 w-auto h-auto min-w-0" style={{ padding: '8px', minWidth: 'auto', borderRadius: '999px', writingMode: 'horizontal-tb' }}>
                                <X size={24} />
                            </button>

                            <div className="flex flex-col items-center mb-8 w-full" style={{ whiteSpace: 'normal', wordBreak: 'normal', writingMode: 'horizontal-tb', overflowWrap: 'break-word', textAlign: 'center' }}>
                                <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shadow-sm border border-amber-100 mb-4" style={{ height: '64px', minHeight: '64px' }}>
                                    <RefreshCcw size={32} />
                                </div>
                                <h3 className="text-3xl font-bold text-slate-800 tracking-tight text-center mb-2" style={{ whiteSpace: 'normal', wordBreak: 'normal', writingMode: 'horizontal-tb' }}>Return Request</h3>
                                <p className="text-slate-500 text-center text-sm px-4" style={{ whiteSpace: 'normal', wordBreak: 'normal', writingMode: 'horizontal-tb' }}>Initiate a return request for medicines from a recent pharmacy order.</p>
                            </div>

                            <div className="w-full space-y-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100 text-left" style={{ whiteSpace: 'normal', wordBreak: 'normal', writingMode: 'horizontal-tb', overflowWrap: 'break-word' }}>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Order Selector */}
                                    <div style={{ whiteSpace: 'normal', writingMode: 'horizontal-tb' }}>
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2">Select Order</label>
                                        <div className="relative">
                                            <select className="w-full bg-white border border-slate-200/60 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30 shadow-sm appearance-none" style={{ writingMode: 'horizontal-tb' }}>
                                                <option value="">Select a recent order...</option>
                                                <option value="ORD-7829">ORD-7829 (Delivered Today)</option>
                                                <option value="ORD-7811">ORD-7811 (Delivered 2 days ago)</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Medicine Target */}
                                    <div style={{ whiteSpace: 'normal', writingMode: 'horizontal-tb' }}>
                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2">Medicine Target</label>
                                        <div className="relative">
                                            <select className="w-full bg-white border border-slate-200/60 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30 shadow-sm appearance-none" style={{ writingMode: 'horizontal-tb' }}>
                                                <option value="">Select medicine to return...</option>
                                                <option value="med1">Amoxicillin 500mg (2 strips)</option>
                                                <option value="med2">Paracetamol 650mg (1 strip)</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full h-px bg-slate-200/60 my-2"></div>

                                {/* Reason Textarea */}
                                <div>
                                    <label className="block text-[11px] font-bold text-amber-500 uppercase tracking-widest pl-1 mb-2" style={{ writingMode: 'horizontal-tb' }}>Reason for Return</label>
                                    <textarea
                                        value={returnForm.reason}
                                        onChange={e => setReturnForm({ ...returnForm, reason: e.target.value })}
                                        className="w-full bg-white border border-slate-200/60 focus:outline-none focus:ring-2 focus:ring-amber-500/30 shadow-sm"
                                        style={{ width: '100%', minHeight: '120px', resize: 'vertical', padding: '14px 16px', borderRadius: '16px', whiteSpace: 'normal', wordBreak: 'normal', writingMode: 'horizontal-tb', overflowWrap: 'break-word', color: '#334155' }}
                                        placeholder="Please provide details about why you are returning this medicine (e.g., damaged packaging, wrong item)..."
                                    />
                                </div>

                                {/* Optional Photo Upload */}
                                <div>
                                    <p className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2" style={{ writingMode: 'horizontal-tb' }}>Upload Photo (Optional)</p>
                                    <div className="border border-dashed border-slate-300 rounded-xl p-4 flex items-center justify-center bg-white/50 hover:bg-white transition-colors cursor-pointer group" style={{ minHeight: '80px', writingMode: 'horizontal-tb' }}>
                                        <div className="flex items-center gap-3 text-slate-500 group-hover:text-amber-500">
                                            <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-amber-50 border border-slate-200 whitespace-nowrap"><RefreshCcw size={16} /></div>
                                            <span className="text-sm font-medium whitespace-nowrap">Click to upload image of the item</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-center w-full relative z-10" style={{ whiteSpace: 'normal', writingMode: 'horizontal-tb' }}>
                                <button
                                    onClick={handleReturnRequest}
                                    className="bg-amber-500 hover:bg-amber-600 text-white font-semibold transition-all shadow-xl shadow-amber-500/20 active:scale-95 border-none"
                                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '14px 28px', borderRadius: '999px', width: 'auto', minWidth: '220px', height: 'auto', whiteSpace: 'nowrap', writingMode: 'horizontal-tb', fontSize: '16px', marginTop: '10px' }}
                                >
                                    Submit Return Request
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>

            {/* 6. Personal Information Modal */}
            <AnimatePresence>
                {modals.personalInfo && (
                    <Modal overlay onClickOut={() => closeModal('personalInfo')}>
                        <div className="w-full max-w-[1000px] w-[95vw] bg-white/95 backdrop-blur-3xl rounded-[36px] p-6 sm:p-10 relative shadow-2xl border border-white/60 pointer-events-auto">
                            <button onClick={() => closeModal('personalInfo')} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100/80 text-slate-400 hover:text-slate-600 transition-colors z-10">
                                <X size={24} />
                            </button>

                            <div className="flex items-center gap-5 border-b border-slate-100 pb-8 mb-8">
                                <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center shadow-inner border border-blue-100/50">
                                    <Briefcase size={32} />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold text-slate-800 tracking-tight">Personal Information</h3>
                                    <p className="text-slate-500 mt-1">Manage your core medical profile and vitals.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                                {/* Left Column: Vitals */}
                                <div className="space-y-6">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><User size={16} /> Core Data</h4>
                                    <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6 grid justify-between gap-y-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Date of Birth</p>
                                            <p className="font-semibold text-slate-800 text-lg">14 Sep 1985</p>
                                        </div>
                                        <div className="w-full h-px bg-slate-200/60"></div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Gender</p>
                                            <p className="font-semibold text-slate-800 text-lg">Male</p>
                                        </div>
                                        <div className="w-full h-px bg-slate-200/60"></div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Blood Group</p>
                                            <p className="font-semibold text-red-500 text-lg px-3 py-1 bg-red-50/80 rounded-full border border-red-100/50">O+</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Metrics & Alerts */}
                                <div className="space-y-6">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Briefcase size={16} /> Medical History</h4>

                                    <div className="grid justify-between gap-y-6 bg-slate-50/50 border border-slate-100 rounded-3xl p-6">
                                        <div className="flex justify-between items-center gap-5">
                                            <div>
                                                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Height</p>
                                                <p className="font-semibold text-slate-800 text-lg">182 cm</p>
                                            </div>
                                            <div className="h-10 w-px bg-slate-200/80"></div>
                                            <div>
                                                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Weight</p>
                                                <p className="font-semibold text-slate-800 text-lg">72 kg</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-rose-50/60 border border-rose-100 rounded-3xl p-6">
                                        <p className="text-[11px] font-bold text-rose-600 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Pill size={14} /> Known Allergies / Conditions</p>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            <span className="px-3 py-1.5 bg-white text-rose-700 rounded-lg text-sm font-semibold border border-rose-100/50 shadow-sm">Penicillin</span>
                                            <span className="px-3 py-1.5 bg-white text-rose-700 rounded-lg text-sm font-semibold border border-rose-100/50 shadow-sm">Peanuts</span>
                                            <span className="px-3 py-1.5 bg-white text-rose-700 rounded-lg text-sm font-semibold border border-rose-100/50 shadow-sm">Asthma</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>

            {/* 7. Contact Support Modal */}
            <AnimatePresence>
                {modals.support && (
                    <Modal overlay onClickOut={() => closeModal('support')}>
                        <div className="w-full max-w-lg bg-white/95 backdrop-blur-3xl rounded-[36px] p-8 sm:p-12 relative shadow-2xl border border-white/60 pointer-events-auto">
                            <button onClick={() => closeModal('support')} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100/80 text-slate-400 hover:text-slate-600 transition-colors z-10">
                                <X size={24} />
                            </button>

                            <div className="flex flex-col items-center mb-8">
                                <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center shadow-inner border border-indigo-100/50 mb-5">
                                    <Phone size={36} />
                                </div>
                                <h3 className="text-3xl font-bold text-slate-800 tracking-tight text-center">Contact Support</h3>
                                <p className="text-slate-500 text-center mt-2 text-sm">Send a message to our admin team for assistance.</p>
                            </div>

                            <div className="space-y-5 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2">Subject</label>
                                    <GlassInput value={supportForm.subject} onChange={e => setSupportForm({ ...supportForm, subject: e.target.value })} placeholder="e.g. Help with Appointment" className="bg-white border-slate-200/60 shadow-sm" />
                                </div>
                                <div className="w-full h-px bg-slate-200/60 my-2"></div>
                                <div>
                                    <label className="block text-[11px] font-bold text-indigo-500 uppercase tracking-widest pl-1 mb-2">Message</label>
                                    <textarea
                                        value={supportForm.message} onChange={e => setSupportForm({ ...supportForm, message: e.target.value })}
                                        className="w-full bg-white border border-slate-200/60 rounded-[20px] p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none h-32 shadow-sm"
                                        placeholder="How can our support team assist you today?"
                                    />
                                </div>
                            </div>

                            <div className="mt-10">
                                <GlassButton onClick={handleSendSupport} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20 text-lg border-none">Send Message</GlassButton>
                            </div>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>

            {/* 8. Logout Confirmation */}
            <AnimatePresence>
                {modals.logoutConfirm && (
                    <Modal overlay onClickOut={() => closeModal('logoutConfirm')}>
                        <div className="w-full max-w-md bg-white/95 backdrop-blur-3xl rounded-[36px] p-8 sm:p-12 relative shadow-2xl border border-white/60 pointer-events-auto text-center">
                            <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-red-100/50">
                                <LogOut size={40} />
                            </div>
                            <h3 className="text-3xl font-bold text-slate-800 tracking-tight mb-3">Sign Out?</h3>
                            <p className="text-slate-500 mb-10 text-base px-4">Are you sure you want to log out of your MEDCONNECT account?</p>

                            <div className="flex gap-4">
                                <GlassButton variant="secondary" onClick={() => closeModal('logoutConfirm')} className="flex-1 py-4 bg-slate-100 text-slate-700 border-none hover:bg-slate-200 text-lg">Cancel</GlassButton>
                                <GlassButton onClick={logout} className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white border-none shadow-xl shadow-red-500/20 text-lg rounded-full">Sign Out</GlassButton>
                            </div>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>


            {/* Global Toast */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 50, x: '-50%' }}
                        className="fixed bottom-10 left-1/2 -ml-[50%] z-[200] bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl font-medium text-sm border border-slate-700 pointer-events-none whitespace-nowrap"
                    >
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Helper Modal wrapper for reusable background overlay & centering
const Modal = ({ children, overlay = true, onClickOut, fullScreen = false }) => {
    const modalContent = (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.18 } }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
            style={{ boxSizing: 'border-box' }}
        >
            {overlay && <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClickOut} />}
            <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } }}
                exit={{ scale: 0.96, opacity: 0, transition: { duration: 0.12 } }}
                className={`relative z-[10000] flex justify-center ${fullScreen ? 'w-full h-full items-center' : 'w-full items-center'} shrink-0`}
                style={{ flexShrink: 0, boxSizing: 'border-box', writingMode: 'horizontal-tb' }}
            >
                {children}
            </motion.div>
        </motion.div>
    );

    // Only portal if document is defined (browser env)
    if (typeof document !== 'undefined') {
        return ReactDOM.createPortal(modalContent, document.body);
    }
    return null;
};
