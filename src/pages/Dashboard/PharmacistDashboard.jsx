import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PillNav } from '../../components/ui/PillNav';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassInput } from '../../components/ui/GlassInput';
import { useAppContext } from '../../AppContext';
import { ShoppingBag, Search, Clock, Check, LogOut, Package, Bell } from 'lucide-react';
import { ParallaxWrapper } from '../../components/ui/ParallaxWrapper';
import { FloatingAssistant } from '../../components/ui/FloatingAssistant';
import { ProfileMenu } from '../../components/ui/ProfileMenu';

const tabs = [
    { id: 'orders', label: 'Orders Feed', icon: ShoppingBag },
    { id: 'inventory', label: 'Inventory', icon: Search },
    { id: 'history', label: 'Order History', icon: Clock },
];

export const PharmacistDashboard = () => {
    const [activeTab, setActiveTab] = useState('orders');
    const { currentUser, data, updateData, logout, setIsSearchGlobalVisible } = useAppContext();

    // Notifications
    const myNotifications = data.notifications?.filter(n => n.userId === currentUser.id) || [];
    const unreadCount = myNotifications.filter(n => !n.read).length;
    const [showNotifications, setShowNotifications] = useState(false);
    const [completedRxIds, setCompletedRxIds] = useState([]);

    useEffect(() => {
        if (!setIsSearchGlobalVisible) return;
        const isSearchableTab = ['inventory', 'history'].includes(activeTab);
        setIsSearchGlobalVisible(isSearchableTab);
        return () => setIsSearchGlobalVisible(true);
    }, [activeTab, setIsSearchGlobalVisible]);

    const pendingPrescriptions = data.prescriptions.filter(p => p.status === 'pending');
    const readyPrescriptions = data.prescriptions.filter(p => p.status === 'ready');

    const filteredInventory = [
        { name: 'Amoxicillin 500mg', stock: 120, price: '₹950' },
        { name: 'Ibuprofen 400mg', stock: 350, price: '₹680' },
        { name: 'Lisinopril 10mg', stock: 15, price: '₹1200' },
        { name: 'Azithromycin 250mg', stock: 0, price: '₹1750' },
        { name: 'Metformin 500mg', stock: 210, price: '₹800' }
    ];

    const handleMarkReady = (rxId) => {
        const updated = data.prescriptions.map(p =>
            p.id === rxId ? { ...p, status: 'ready' } : p
        );
        updateData('prescriptions', updated);
    };

    return (
        <main className="main-content w-full flex-1 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-x-hidden flex flex-col items-center p-4 after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.6),transparent_60%)] after:pointer-events-none">
            {/* Background blobs with Parallax */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <ParallaxWrapper depth={1}>
                    <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
                </ParallaxWrapper>
                <ParallaxWrapper depth={1.2}>
                    <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
                </ParallaxWrapper>
            </div>

            {/* Top Header */}
            <header className="top-header">
                <div className="logo-area hidden sm:flex">
                    <img src="/medconnect.png" alt="MedConnect Logo" className="drop-shadow-sm" />
                    <div className="flex flex-col">
                        <h1 className="logo-title text-slate-800 leading-none mb-[2px]">
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">MEDCONNECT</span>
                        </h1>
                        <span className="logo-subtitle text-slate-500 uppercase tracking-widest leading-none">Smart Healthcare</span>
                    </div>
                </div>

                {/* Navigation Pill */}
                <PillNav tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} className="nav-pill" />

                <div className="profile-area">
                    {/* User Info Right Side */}
                    <div className="hidden md:flex flex-col items-end mr-2">
                        <span className="text-sm font-semibold text-slate-800">Hello, {currentUser?.name?.split(' ')[0] || 'Pharmacist'}</span>
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-none mt-1">Pharmacist Portal</span>
                    </div>

                    <div className="relative pointer-events-auto">
                        <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 bg-white/50 backdrop-blur-md rounded-full text-slate-500 hover:text-blue-600 hover:shadow-md border border-white/60 transition-all duration-300">
                            <Bell size={20} />
                            {unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
                        </button>

                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.15)] rounded-[32px] p-4 z-50">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold text-slate-800 flex items-center gap-2"><Bell size={16} className="text-blue-600" /> Notifications</h4>
                                        {unreadCount > 0 && <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                                    </div>
                                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                        {myNotifications.length === 0 ? (
                                            <p className="text-sm text-slate-500 text-center py-4">No new notifications</p>
                                        ) : (
                                            myNotifications.map(notif => (
                                                <div key={notif.id} className={`p-3 text-sm rounded-[28px] border transition-colors ${notif.read ? 'bg-slate-50 border-slate-100 text-slate-600' : 'bg-blue-50 border-blue-100 text-blue-800'}`}>
                                                    <div className="font-semibold mb-0.5">{notif.title}</div>
                                                    <div>{notif.message}</div>
                                                    <div className="text-xs mt-1 opacity-60 font-medium">{notif.time}</div>
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

            {/* Main Content Area */}
            <div className="w-full max-w-6xl z-10 flex-1 flex flex-col pointer-events-auto">
                <AnimatePresence mode="wait">

                    {/* ORDERS FEED */}
                    {activeTab === 'orders' && (
                        <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <GlassCard className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                                        <ShoppingBag className="text-blue-600" /> Live Prescription Feed
                                    </h3>
                                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                        Live Updates
                                    </span>
                                </div>

                                {pendingPrescriptions.length === 0 ? (
                                    <div className="text-center py-16 text-slate-500">
                                        <Package size={48} className="mx-auto mb-4 text-slate-300" />
                                        <p>No pending prescription orders right now.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {pendingPrescriptions.map((rx) => (
                                            <div key={rx.id} className="p-5 bg-white/60 rounded-[28px] border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">NEW ORDER</span>
                                                        <h4 className="font-bold text-slate-800 mt-2">{rx.patientName}</h4>
                                                        <p className="text-xs text-slate-500 mt-1">Prescribed by Dr. {rx.doctorName}</p>
                                                    </div>
                                                    <span className="text-xs font-mono text-slate-400 font-semibold">Order #{rx.id.slice(-6)}</span>
                                                </div>

                                                <div className="bg-slate-50 rounded-[24px] p-4 mb-4 flex-1 border border-slate-100">
                                                    <h5 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Medications</h5>
                                                    <ul className="space-y-2">
                                                        {rx.medicines.map((m, idx) => (
                                                            <li key={idx} className="flex justify-between text-sm">
                                                                <span className="font-medium text-slate-800">• {m.name}</span>
                                                                <span className="text-slate-600 font-mono text-xs bg-slate-200 px-2 py-0.5 rounded">{m.quantity}x</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <motion.div layout>
                                                    <GlassButton
                                                        onClick={() => {
                                                            setCompletedRxIds(prev => [...prev, rx.id]);
                                                            setTimeout(() => handleMarkReady(rx.id), 800);
                                                        }}
                                                        disabled={completedRxIds.includes(rx.id)}
                                                        className={`w-full font-semibold py-3 overflow-hidden relative border-0 ${completedRxIds.includes(rx.id) ? 'bg-emerald-500 text-white shadow-sm' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20'}`}
                                                    >
                                                        <AnimatePresence mode="wait">
                                                            {completedRxIds.includes(rx.id) ? (
                                                                <motion.div
                                                                    key="success"
                                                                    initial={{ y: 20, opacity: 0 }}
                                                                    animate={{ y: 0, opacity: 1 }}
                                                                    className="flex items-center justify-center gap-2"
                                                                >
                                                                    <Check size={20} className="text-white" />
                                                                    <span>Ready for Pickup</span>
                                                                </motion.div>
                                                            ) : (
                                                                <motion.div
                                                                    key="default"
                                                                    initial={{ y: -20, opacity: 0 }}
                                                                    animate={{ y: 0, opacity: 1 }}
                                                                    exit={{ y: 20, opacity: 0 }}
                                                                    className="flex items-center justify-center"
                                                                >
                                                                    Mark as Ready for Pickup <Check size={18} className="ml-2" />
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </GlassButton>
                                                </motion.div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </GlassCard>
                        </motion.div>
                    )}

                    {/* INVENTORY */}
                    {activeTab === 'inventory' && (
                        <motion.div key="inventory" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <GlassCard className="p-6">
                                <div className="mb-6 relative">
                                    {/* Search has been moved to FloatingSearch */}
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200">
                                                <th className="py-3 px-4 text-sm font-semibold text-slate-500">Medicine Name</th>
                                                <th className="py-3 px-4 text-sm font-semibold text-slate-500">Stock Level</th>
                                                <th className="py-3 px-4 text-sm font-semibold text-slate-500">Price</th>
                                                <th className="py-3 px-4 text-sm font-semibold text-slate-500">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredInventory.map((item, idx) => (
                                                <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-white/40 transition-colors">
                                                    <td className="py-3 px-4 text-sm font-medium text-slate-700">{item.name}</td>
                                                    <td className="py-3 px-4 text-sm text-slate-600 font-mono">{item.stock} Units</td>
                                                    <td className="py-3 px-4 text-sm text-slate-600 font-mono">{item.price}</td>
                                                    <td className="py-3 px-4 text-sm flex items-center gap-2">
                                                        {item.stock === 0 ? (
                                                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200 shadow-sm"><span className="mr-1">🔴</span> Out of Stock</span>
                                                        ) : item.stock < 50 ? (
                                                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 shadow-sm"><span className="mr-1">🟡</span> Low Stock</span>
                                                        ) : (
                                                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200 shadow-sm"><span className="mr-1">🟢</span> In Stock</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredInventory.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="py-8 text-center text-slate-500">No inventory matching your search.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}

                    {/* HISTORY */}
                    {activeTab === 'history' && (
                        <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <GlassCard className="p-6">
                                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                                    <Clock className="text-blue-600" /> Fulfilled Orders
                                </h3>

                                {readyPrescriptions.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500">
                                        <p>No fulfilled orders yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {readyPrescriptions.map((rx) => (
                                            <div key={rx.id} className="p-4 bg-white/60 rounded-[28px] border border-slate-200 shadow-sm flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-mono font-semibold text-slate-400">#{rx.id.slice(-6)}</span>
                                                        <span className="text-xs bg-slate-100 border border-slate-200 text-slate-600 px-2 rounded-full hidden sm:inline-block">Patient: {rx.patientName}</span>
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-700">
                                                        {rx.medicines.map(m => m.name).join(', ')}
                                                    </p>
                                                </div>
                                                <span className="text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1.5 rounded-full shadow-sm">
                                                    Ready for Pickup
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </GlassCard>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            <FloatingAssistant />
        </main>
    );
};
