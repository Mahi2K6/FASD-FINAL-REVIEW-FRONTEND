import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PillNav } from '../../components/ui/PillNav';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassInput } from '../../components/ui/GlassInput';
import { useAppContext } from '../../AppContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Users, CheckCircle, Settings, LogOut, Check, X, Search, FileText, Pill, GraduationCap, Store, Trash2, Star, Clock, BarChart3, TrendingUp } from 'lucide-react';
import { ParallaxWrapper } from '../../components/ui/ParallaxWrapper';
import { FloatingAssistant } from '../../components/ui/FloatingAssistant';
import { ProfileMenu } from '../../components/ui/ProfileMenu';

const tabs = [
    { id: 'analytics', label: 'Analytics', icon: Activity },
    { id: 'approvals', label: 'Approvals', icon: CheckCircle },
    { id: 'doctors', label: 'Doctors', icon: GraduationCap },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'pharmacists', label: 'Pharmacists', icon: Store },
    { id: 'settings', label: 'Settings', icon: Settings },
];

const chartDataGroups = {
    visits: [
        { name: 'Mon', value: 120 },
        { name: 'Tue', value: 200 },
        { name: 'Wed', value: 150 },
        { name: 'Thu', value: 280 },
        { name: 'Fri', value: 210 },
        { name: 'Sat', value: 390 },
        { name: 'Sun', value: 310 },
    ],
    appointments: [
        { name: 'Mon', value: 85 },
        { name: 'Tue', value: 140 },
        { name: 'Wed', value: 110 },
        { name: 'Thu', value: 220 },
        { name: 'Fri', value: 180 },
        { name: 'Sat', value: 290 },
        { name: 'Sun', value: 250 },
    ],
    newUsers: [
        { name: 'Mon', value: 20 }, { name: 'Tue', value: 40 }, { name: 'Wed', value: 10 }, { name: 'Thu', value: 60 }, { name: 'Fri', value: 30 }, { name: 'Sat', value: 80 }, { name: 'Sun', value: 50 }
    ]
};

const mockDoctorVisits = [
    { name: 'Mon', value: 12 }, { name: 'Tue', value: 18 }, { name: 'Wed', value: 15 },
    { name: 'Thu', value: 25 }, { name: 'Fri', value: 20 }, { name: 'Sat', value: 8 }, { name: 'Sun', value: 5 }
];

const mockRatingTrend = [
    { name: 'W1', value: 4.2 }, { name: 'W2', value: 4.4 }, { name: 'W3', value: 4.6 }, { name: 'W4', value: 4.8 }
];

export const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('analytics');
    const { currentUser, data, updateData, logout, setIsSearchGlobalVisible } = useAppContext();

    // Delete Confirmation State
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, userId: null, userName: '', role: '' });

    // Graph State
    const [graphMetric, setGraphMetric] = useState('visits');

    // Doctor Analytics Panel State
    const [selectedDoctorView, setSelectedDoctorView] = useState(null);

    useEffect(() => {
        if (!setIsSearchGlobalVisible) return;
        const isSearchableTab = ['doctors', 'patients', 'pharmacists', 'approvals'].includes(activeTab);
        setIsSearchGlobalVisible(isSearchableTab && !deleteConfirm.open && !selectedDoctorView);
        return () => setIsSearchGlobalVisible(true);
    }, [activeTab, deleteConfirm.open, selectedDoctorView, setIsSearchGlobalVisible]);

    const handleApprove = (userId) => {
        const updatedUsers = data.users.map(u => u.id === userId ? { ...u, status: 'approved' } : u);
        const updatedApprovals = data.approvals.filter(u => u.id !== userId);
        updateData('users', updatedUsers);
        updateData('approvals', updatedApprovals);
    };

    const handleReject = (userId) => {
        const updatedUsers = data.users.filter(u => u.id !== userId);
        const updatedApprovals = data.approvals.filter(u => u.id !== userId);
        updateData('users', updatedUsers);
        updateData('approvals', updatedApprovals);
    };

    const handleDeleteUser = () => {
        if (!deleteConfirm.userId) return;
        const updatedUsers = data.users.filter(u => u.id !== deleteConfirm.userId);
        const updatedApprovals = data.approvals.filter(u => u.id !== deleteConfirm.userId);
        updateData('users', updatedUsers);
        updateData('approvals', updatedApprovals);
        setDeleteConfirm({ open: false, userId: null, userName: '', role: '' });
    };

    const getPatientApptCount = (patientId) => {
        return data.appointments.filter(a => a.patientId === patientId).length;
    };


    const allDoctors = data.users.filter(u => u.role === 'doctor');
    const allPatients = data.users.filter(u => u.role === 'patient');
    const allPharmacists = data.users.filter(u => u.role === 'pharmacist');

    return (
        <main className="main-content w-full flex-1 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 relative overflow-x-hidden flex flex-col items-center p-4 after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.6),transparent_60%)] after:pointer-events-none">
            {/* Background blobs with Parallax */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <ParallaxWrapper depth={1}>
                    <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40" />
                </ParallaxWrapper>
                <ParallaxWrapper depth={1.2}>
                    <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40" />
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
                        <span className="text-sm font-semibold text-slate-800">Hello, {currentUser?.name?.split(' ')[0] || 'Admin'}</span>
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-none mt-1">Admin Portal</span>
                    </div>

                    <ProfileMenu />
                </div>
            </header>

            {/* Main Content Area */}
            <div className="w-full max-w-6xl z-10 flex-1 flex flex-col pointer-events-auto">
                <AnimatePresence mode="wait">
                    {activeTab === 'analytics' && (
                        <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                            {/* Stats Pills Row */}
                            <div className="flex flex-wrap items-center justify-start gap-4 pb-4">
                                <div className="flex items-center gap-3 px-5 py-2.5 bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm rounded-full">
                                    <p className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider">Total Users</p>
                                    <div className="h-4 w-px bg-slate-200"></div>
                                    <p className="text-lg font-bold text-slate-800 leading-none">{data.users.length}</p>
                                </div>
                                <div className="flex items-center gap-3 px-5 py-2.5 bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm rounded-full">
                                    <p className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider">Pending Approvals</p>
                                    <div className="h-4 w-px bg-slate-200"></div>
                                    <p className="text-lg font-bold text-orange-600 leading-none">{data.approvals.length}</p>
                                </div>
                                <div className="flex items-center gap-3 px-5 py-2.5 bg-white/70 backdrop-blur-xl border border-white/80 shadow-sm rounded-full">
                                    <p className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider">Appointments</p>
                                    <div className="h-4 w-px bg-slate-200"></div>
                                    <p className="text-lg font-bold text-blue-600 leading-none">{data.appointments.length}</p>
                                </div>
                            </div>

                            <GlassCard className="p-8 h-[450px]">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                                    <h3 className="text-lg font-semibold tracking-tight text-slate-800">Platform Analytics</h3>
                                    <div className="flex bg-slate-50 p-1 rounded-full border border-slate-200 shadow-inner">
                                        {['visits', 'appointments', 'newUsers'].map((metric) => (
                                            <button
                                                key={metric}
                                                onClick={() => setGraphMetric(metric)}
                                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 capitalize ${graphMetric === metric ? 'bg-white shadow-sm text-blue-700 border border-slate-200/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'}`}
                                            >
                                                {metric.replace('new', 'New ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <ResponsiveContainer width="100%" height="80%">
                                    <AreaChart data={chartDataGroups[graphMetric]} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={graphMetric === 'appointments' ? '#10b981' : graphMetric === 'newUsers' ? '#8b5cf6' : '#3b82f6'} stopOpacity={0.4} />
                                                <stop offset="95%" stopColor={graphMetric === 'appointments' ? '#10b981' : graphMetric === 'newUsers' ? '#8b5cf6' : '#3b82f6'} stopOpacity={0.0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} dy={15} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} dx={-15} />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '16px',
                                                border: '1px solid rgba(255,255,255,0.6)',
                                                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                backdropFilter: 'blur(12px)',
                                                padding: '12px 20px',
                                                transition: 'opacity 0.2s ease, transform 0.2s ease',
                                                color: '#1e293b'
                                            }}
                                            itemStyle={{
                                                color: '#3b82f6',
                                                fontWeight: 'bold',
                                                fontSize: '16px',
                                                textTransform: 'capitalize'
                                            }}
                                            cursor={{ stroke: '#cbd5e1', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                                        />
                                        <Area
                                            isAnimationActive={true}
                                            animationDuration={1200}
                                            animationEasing="ease-in-out"
                                            type="monotone"
                                            dataKey="value"
                                            stroke={graphMetric === 'appointments' ? '#10b981' : graphMetric === 'newUsers' ? '#8b5cf6' : '#2563eb'}
                                            strokeWidth={4}
                                            fillOpacity={1}
                                            fill="url(#colorValue)"
                                            activeDot={{ r: 6, strokeWidth: 0, fill: graphMetric === 'appointments' ? '#10b981' : graphMetric === 'newUsers' ? '#8b5cf6' : '#2563eb', style: { filter: 'drop-shadow(0px 0px 8px rgba(0,0,0,0.2))', transition: 'all 0.2s ease' } }}
                                            style={{ filter: `drop-shadow(0 8px 12px ${graphMetric === 'appointments' ? 'rgba(16,185,129,0.3)' : graphMetric === 'newUsers' ? 'rgba(139,92,246,0.3)' : 'rgba(59,130,246,0.3)'})`, transition: 'all 0.4s ease-out' }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </GlassCard>
                        </motion.div>
                    )}

                    {activeTab === 'approvals' && (
                        <motion.div key="approvals" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <GlassCard className="p-6">
                                <h3 className="text-lg font-semibold text-slate-800 mb-6 tracking-wide">Pending Registrations</h3>
                                {data.approvals.length === 0 ? (
                                    <div className="text-center py-12 text-blue-600/50">
                                        <CheckCircle size={48} className="mx-auto mb-4 text-blue-500/50" />
                                        <p className="uppercase tracking-widest text-sm font-semibold">All Caught Up</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {data.approvals.map(user => (
                                            <div key={user.id} className="flex items-center justify-between p-4 bg-white/60 rounded-[32px] border border-slate-200 shadow-sm transition-all hover:shadow-md">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-full ${user.role === 'doctor' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                                        {user.role === 'doctor' ? <Activity size={20} /> : <Users size={20} />}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-slate-800">{user.name} <span className="text-[10px] font-bold text-blue-700 ml-2 uppercase bg-blue-100 px-2 py-0.5 rounded-full tracking-wider">{user.role}</span></h4>
                                                        <p className="text-sm text-slate-500 font-medium">{user.email} • {user.experience || 0} yrs exp.</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <GlassButton onClick={() => handleApprove(user.id)} className="w-10 h-10 p-0 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm border-0">
                                                        <Check size={18} />
                                                    </GlassButton>
                                                    <GlassButton onClick={() => handleReject(user.id)} variant="secondary" className="w-10 h-10 p-0 rounded-full text-red-600 bg-red-50 hover:bg-red-100 border-0">
                                                        <X size={18} />
                                                    </GlassButton>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </GlassCard>
                        </motion.div>
                    )}

                    {activeTab === 'doctors' && (
                        <motion.div key="doctors" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <GlassCard className="p-6">
                                <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2"><GraduationCap className="text-blue-600" /> Doctors Directory</h3>
                                <div className="space-y-4">
                                    {allDoctors.map(doc => (
                                        <div key={doc.id} onClick={() => setSelectedDoctorView(doc)} className="flex items-center justify-between p-4 bg-white/60 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer">
                                            <div>
                                                <h4 className="font-semibold text-slate-800 text-lg">Dr. {doc.name}</h4>
                                                <p className="text-sm text-slate-500 font-medium">{doc.specialization || 'General'} • {doc.experience || 0} yrs exp</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {doc.status === 'pending' && (
                                                    <GlassButton onClick={(e) => { e.stopPropagation(); handleApprove(doc.id); }} className="px-3 py-1.5 text-xs bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm border-0">Approve</GlassButton>
                                                )}
                                                {doc.status === 'approved' && (
                                                    <GlassButton variant="secondary" onClick={(e) => { e.stopPropagation(); handleReject(doc.id); }} className="px-3 py-1.5 text-xs text-orange-600 hover:bg-orange-50 bg-orange-50/50 border-orange-200">Revoke</GlassButton>
                                                )}
                                                <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ open: true, userId: doc.id, userName: doc.name, role: 'Doctor' }); }} className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 flex items-center justify-center transition-all shadow-sm hover:scale-105 ml-2 border border-red-100">
                                                    <Trash2 size={16} strokeWidth={2} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {allDoctors.length === 0 && <p className="text-slate-500 text-center py-6">No doctors found.</p>}
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}

                    {activeTab === 'patients' && (
                        <motion.div key="patients" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <GlassCard className="p-6">
                                <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2"><Users className="text-indigo-500" /> Patients Database</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {allPatients.map(patient => (
                                        <div key={patient.id} className="p-5 bg-white/60 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col justify-between">
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className="font-bold text-slate-800">{patient.name || 'Unnamed Patient'}</h4>
                                                <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-bold shadow-sm">{getPatientApptCount(patient.id)} Visits</span>
                                            </div>
                                            <div className="space-y-1 text-sm text-slate-500 font-medium mb-3">
                                                <p>✉️ {patient.email}</p>
                                                <p>📞 {patient.phone || 'N/A'}</p>
                                                <p>🎂 Age: {patient.age || 'N/A'}</p>
                                            </div>
                                            <div className="flex justify-end mt-auto pt-3 border-t border-slate-100/60">
                                                <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ open: true, userId: patient.id, userName: patient.name, role: 'Patient' }); }} className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-all shadow-sm hover:scale-105 border border-red-100">
                                                    <Trash2 size={16} strokeWidth={2} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {allPatients.length === 0 && <p className="text-slate-500 col-span-2 text-center py-6">No patients found.</p>}
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}

                    {activeTab === 'pharmacists' && (
                        <motion.div key="pharmacists" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <GlassCard className="p-6">
                                <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2"><Store className="text-emerald-500" /> Pharmacists & Pharmacies</h3>
                                <div className="space-y-4">
                                    {allPharmacists.map(pharm => (
                                        <div key={pharm.id} className="flex items-center justify-between p-4 bg-white/60 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                                            <div>
                                                <h4 className="font-semibold text-slate-800 text-lg">{pharm.name}</h4>
                                                <p className="text-sm text-slate-500 font-medium">🏪 {pharm.pharmacyName || 'Central Pharmacy'} • ✉️ {pharm.email}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {pharm.status === 'pending' && (
                                                    <GlassButton onClick={(e) => { e.stopPropagation(); handleApprove(pharm.id); }} className="px-3 py-1.5 text-xs bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm border-0">Approve</GlassButton>
                                                )}
                                                {pharm.status === 'approved' && (
                                                    <GlassButton variant="secondary" onClick={(e) => { e.stopPropagation(); handleReject(pharm.id); }} className="px-3 py-1.5 text-xs text-orange-600 hover:bg-orange-50 bg-orange-50/50 border-orange-200">Revoke</GlassButton>
                                                )}
                                                <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ open: true, userId: pharm.id, userName: pharm.name, role: 'Pharmacist' }); }} className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-all shadow-sm hover:scale-105 ml-2 border border-red-100">
                                                    <Trash2 size={16} strokeWidth={2} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {allPharmacists.length === 0 && <p className="text-slate-500 text-center py-6">No pharmacists found.</p>}
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}

                    {activeTab === 'settings' && (
                        <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <GlassCard className="p-6 flex flex-col items-center justify-center py-20 text-slate-500">
                                <Settings size={64} className="mb-4 text-blue-200 animate-[spin_6s_linear_infinite]" />
                                <h3 className="text-xl font-semibold text-slate-700 mb-2">Platform Configuration</h3>
                                <p className="text-sm font-medium">Global configuration and module management is limited.</p>
                            </GlassCard>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            <AnimatePresence>
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirm.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                            onClick={() => setDeleteConfirm({ open: false, userId: null, userName: '', role: '' })}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-sm bg-white/90 backdrop-blur-2xl border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[32px] overflow-hidden flex flex-col items-center p-8 text-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-6 border border-red-100 shadow-sm">
                                <Trash2 size={32} strokeWidth={2} />
                            </div>
                            <h3 className="text-xl font-bold tracking-tight text-slate-800 mb-2">Delete {deleteConfirm.role}?</h3>
                            <p className="text-slate-500 mb-8 leading-relaxed font-medium">
                                Are you sure you want to delete <span className="font-semibold text-slate-800">{deleteConfirm.userName}</span>'s records? This action cannot be undone.
                            </p>
                            <div className="flex gap-4 w-full">
                                <GlassButton
                                    variant="secondary"
                                    onClick={() => setDeleteConfirm({ open: false, userId: null, userName: '', role: '' })}
                                    className="flex-1 font-semibold py-3"
                                >
                                    Cancel
                                </GlassButton>
                                <GlassButton
                                    onClick={handleDeleteUser}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/30 font-semibold py-3 border-0"
                                >
                                    Delete
                                </GlassButton>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Doctor Analytics Panel Modal */}
            <AnimatePresence>
                {selectedDoctorView && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                            onClick={() => setSelectedDoctorView(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-4xl bg-white/95 backdrop-blur-2xl border border-slate-200 max-h-[90vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.15)] rounded-[32px] flex flex-col p-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button onClick={() => setSelectedDoctorView(null)} className="absolute top-6 right-6 p-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors border border-slate-200">
                                <X size={20} />
                            </button>

                            {/* Profile Section */}
                            <div className="flex items-start gap-6 mb-10">
                                <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-3xl font-bold border-4 border-white shadow-md">
                                    {selectedDoctorView.name.charAt(0)}
                                </div>
                                <div className="pt-2">
                                    <h2 className="text-3xl font-bold tracking-tight text-slate-800 mb-1">Dr. {selectedDoctorView.name}</h2>
                                    <p className="text-lg text-slate-500 font-medium mb-3">{selectedDoctorView.specialization || 'General Practice'} • {selectedDoctorView.experience || 0} Years Experience</p>
                                    <span className={`inline-flex px-4 py-1.5 rounded-full text-sm font-semibold border shadow-sm ${selectedDoctorView.status === 'approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-orange-50 border-orange-100 text-orange-700'}`}>
                                        {selectedDoctorView.status === 'approved' ? 'Approved & Active' : 'Pending Verification'}
                                    </span>
                                </div>
                            </div>

                            {/* Performance Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="p-4 rounded-[28px] bg-white/60 border border-white/80 shadow-sm flex flex-col justify-center gap-2">
                                    <div className="flex items-center gap-2 text-slate-500 text-sm"><Clock size={16} className="text-blue-500" /> Avg Time</div>
                                    <p className="text-2xl font-bold text-slate-800">30 <span className="text-base font-medium text-slate-500">min</span></p>
                                </div>
                                <div className="p-4 rounded-[28px] bg-white/60 border border-white/80 shadow-sm flex flex-col justify-center gap-2">
                                    <div className="flex items-center gap-2 text-slate-500 text-sm"><Star size={16} className="text-yellow-500" /> Avg Rating</div>
                                    <p className="text-2xl font-bold text-slate-800">4.6 <span className="text-base font-medium text-slate-500">/ 5.0</span></p>
                                </div>
                                <div className="p-4 rounded-[28px] bg-white/60 border border-white/80 shadow-sm flex flex-col justify-center gap-2">
                                    <div className="flex items-center gap-2 text-slate-500 text-sm"><Users size={16} className="text-indigo-500" /> Patients</div>
                                    <p className="text-2xl font-bold text-slate-800">124</p>
                                </div>
                                <div className="p-4 rounded-[28px] bg-white/60 border border-white/80 shadow-sm flex flex-col justify-center gap-2">
                                    <div className="flex items-center gap-2 text-slate-500 text-sm"><CheckCircle size={16} className="text-emerald-500" /> Completion</div>
                                    <p className="text-2xl font-bold text-slate-800">98%</p>
                                </div>
                            </div>

                            {/* Graphs Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                                <div className="p-6 rounded-[32px] bg-white/60 border border-white shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all">
                                    <h4 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2"><BarChart3 size={18} className="text-blue-500" /> Daily Visits</h4>
                                    <div className="h-48">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={mockDoctorVisits} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                                <Tooltip cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                                                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className="p-6 rounded-[32px] bg-white/60 border border-white shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all">
                                    <h4 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2"><TrendingUp size={18} className="text-amber-500" /> Rating Trend</h4>
                                    <div className="h-48">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={mockRatingTrend} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} domain={[3.5, 5.0]} />
                                                <Tooltip cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                                                <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorRating)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Action Pills */}
                            <div className="flex flex-wrap gap-4 mt-auto">
                                <GlassButton className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium border-0 shadow-lg shadow-blue-500/30">
                                    View Full Profile
                                </GlassButton>
                                {selectedDoctorView.status === 'approved' && (
                                    <GlassButton variant="secondary" className="px-6 py-2.5 rounded-full text-orange-600 bg-orange-50 hover:bg-orange-100 font-medium">
                                        Suspend Doctor
                                    </GlassButton>
                                )}
                                <GlassButton variant="secondary" onClick={() => { setDeleteConfirm({ open: true, userId: selectedDoctorView.id, userName: selectedDoctorView.name, role: 'Doctor' }); setSelectedDoctorView(null); }} className="px-6 py-2.5 rounded-full text-red-600 bg-red-50 hover:bg-red-100 font-medium ml-auto">
                                    Revoke Access
                                </GlassButton>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <FloatingAssistant />
        </main>
    );
};
