import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PillNav } from '../../components/ui/PillNav';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassInput } from '../../components/ui/GlassInput';
import { useAppContext } from '../../AppContext';
import { Users, Clock, Pill, FileText, LogOut, Video, Plus, CheckCircle, Search, MessageCircle, Send, X, Bell, BarChart3, TrendingUp, Check, Info, DollarSign, Activity, Star, Calendar } from 'lucide-react';
import { ParallaxWrapper } from '../../components/ui/ParallaxWrapper';
import { FloatingAssistant } from '../../components/ui/FloatingAssistant';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';

const mockWeeklyEarnings = [
    { name: 'Mon', value: 4500 }, { name: 'Tue', value: 5200 }, { name: 'Wed', value: 3800 },
    { name: 'Thu', value: 6100 }, { name: 'Fri', value: 5800 }, { name: 'Sat', value: 7200 }, { name: 'Sun', value: 6500 },
];
const mockCompletion = [{ name: 'Completed', value: 88 }, { name: 'Cancelled', value: 12 }];
const COMPLETION_COLORS = ['#3b82f6', '#f1f5f9'];
import { ProfileMenu } from '../../components/ui/ProfileMenu';

const tabs = [
    { id: 'waiting', label: 'Waiting Room', icon: Clock },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
    { id: 'history', label: 'History', icon: FileText },
]; const mockDoctorVisits = [
    { name: 'Mon', value: 12 },
    { name: 'Tue', value: 18 },
    { name: 'Wed', value: 15 },
    { name: 'Thu', value: 22 },
    { name: 'Fri', value: 20 },
    { name: 'Sat', value: 30 },
    { name: 'Sun', value: 25 },
];

const mockRatingTrend = [
    { name: 'Wk1', value: 4.5 },
    { name: 'Wk2', value: 4.6 },
    { name: 'Wk3', value: 4.8 },
    { name: 'Wk4', value: 4.7 },
    { name: 'Wk5', value: 4.9 },
    { name: 'Wk6', value: 4.9 },
];

export const DoctorDashboard = () => {
    const [activeTab, setActiveTab] = useState('waiting');
    const { currentUser, data, updateData, logout, setIsSearchGlobalVisible } = useAppContext();

    // Notifications
    const myNotifications = data.notifications?.filter(n => n.userId === currentUser.id) || [];
    const unreadCount = myNotifications.filter(n => !n.read).length;
    const [showNotifications, setShowNotifications] = useState(false);

    // States
    const [inCall, setInCall] = useState(false);
    const [currentPatient, setCurrentPatient] = useState(null);
    const [prescriptionForm, setPrescriptionForm] = useState([{ name: '', dosage: '', quantity: '' }]);
    const [hasSentPrescription, setHasSentPrescription] = useState(false);

    useEffect(() => {
        if (!setIsSearchGlobalVisible) return;
        const isSearchableTab = ['patients', 'history'].includes(activeTab);
        setIsSearchGlobalVisible(isSearchableTab && !inCall);
        return () => setIsSearchGlobalVisible(true);
    }, [activeTab, inCall, setIsSearchGlobalVisible]);

    const myAppointments = data.appointments.filter(a => a.doctorId === currentUser.id);
    const upcomingAppointments = myAppointments.filter(a => a.status === 'scheduled');
    const completedAppointments = myAppointments.filter(a => a.status === 'completed');



    const handleStartConsultation = (apt) => {
        setCurrentPatient(apt);
        setInCall(true);
    };

    const handleEndConsultation = () => {
        setInCall(false);
        setActiveTab('prescriptions');
    };

    const addMedicineRow = () => {
        setPrescriptionForm([...prescriptionForm, { name: '', dosage: '', quantity: '' }]);
    };

    const updateMedicine = (index, field, value) => {
        const updated = [...prescriptionForm];
        updated[index][field] = value;
        setPrescriptionForm(updated);
    };

    const handleSendPrescription = () => {
        const newPrescription = {
            id: `RX${Date.now()}`,
            doctorId: currentUser.id,
            doctorName: currentUser.name,
            patientId: currentPatient.patientId,
            patientName: currentPatient.patientName,
            medicines: prescriptionForm.filter(m => m.name !== ''),
            status: 'pending',
            date: new Date().toISOString()
        };

        // Update appointment status to completed
        const updatedAppointments = data.appointments.map(a =>
            a.id === currentPatient.id ? { ...a, status: 'completed' } : a
        );

        updateData('appointments', updatedAppointments);
        updateData('prescriptions', [...data.prescriptions, newPrescription]);

        // Reset form
        setPrescriptionForm([{ name: '', dosage: '', quantity: '' }]);
        setCurrentPatient(null);
        setActiveTab('waiting');
    };

    return (
        <main className="main-content w-full flex-1 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-x-hidden flex flex-col items-center p-4 after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.6),transparent_60%)] after:pointer-events-none">
            {/* Background blobs with Parallax */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <ParallaxWrapper depth={1}>
                    <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
                </ParallaxWrapper>
                <ParallaxWrapper depth={1.2}>
                    <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
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
                        <span className="text-sm font-semibold text-slate-800">Hello, {currentUser?.name?.split(' ')[0] || 'Doctor'}</span>
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-none mt-1">Doctor Portal</span>
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

                    {/* WAITING ROOM TAB */}
                    {activeTab === 'waiting' && (
                        <motion.div key="waiting" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            {inCall ? (
                                <GlassCard className="p-2 bg-white border-slate-200 shadow-xl relative overflow-hidden h-[600px] flex flex-col">
                                    {/* Mock Video UI */}
                                    <div className="flex-1 relative rounded-[28px] overflow-hidden bg-slate-100 border-2 border-slate-100">
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-slate-800">
                                            <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center mb-4 border-4 border-slate-600 shadow-md">
                                                <Users size={40} className="text-slate-400" />
                                            </div>
                                            <h3 className="text-white text-xl font-medium">{currentPatient?.patientName}</h3>
                                            <p className="text-white/50 mb-4">{currentPatient?.problem || 'General Consultation'}</p>
                                            <div className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-semibold uppercase tracking-wider border border-red-500/30 animate-pulse">Live Focus Session</div>
                                        </div>
                                        {/* Self View */}
                                        <div className="absolute top-4 right-4 w-48 h-32 bg-slate-900 rounded-[28px] border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden">
                                            <Video className="text-slate-600" size={32} />
                                        </div>
                                    </div>
                                    {/* Controls */}
                                    <div className="h-20 flex items-center justify-center gap-6 bg-slate-50 rounded-b-[24px]">
                                        <button className="w-12 h-12 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-sm flex items-center justify-center transition-colors">🎤</button>
                                        <button className="w-12 h-12 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-sm flex items-center justify-center transition-colors">📹</button>
                                        <button onClick={handleEndConsultation} className="px-6 h-12 rounded-full bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/20 border-0 text-white flex items-center justify-center transition-colors font-semibold hover:scale-105 active:scale-95 duration-200">End & Prescribe</button>
                                    </div>
                                </GlassCard>
                            ) : (
                                <div className="space-y-8">
                                    {/* Analytics Overview Stats */}
                                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                                        <GlassCard className="p-4 bg-gradient-to-br from-blue-50/80 to-white border-blue-100 hover:-translate-y-1 transition-transform">
                                            <p className="text-[10px] md:text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Users size={14} /> Patients</p>
                                            <h3 className="text-2xl md:text-3xl font-bold text-slate-800">124</h3>
                                        </GlassCard>
                                        <GlassCard className="p-4 bg-gradient-to-br from-indigo-50/80 to-white border-indigo-100 hover:-translate-y-1 transition-transform">
                                            <p className="text-[10px] md:text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Calendar size={14} /> Appts Today</p>
                                            <h3 className="text-2xl md:text-3xl font-bold text-slate-800">{myAppointments.length}</h3>
                                        </GlassCard>
                                        <GlassCard className="p-4 bg-gradient-to-br from-emerald-50/80 to-white border-emerald-100 hover:-translate-y-1 transition-transform">
                                            <p className="text-[10px] md:text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Clock size={14} /> Avg Time</p>
                                            <h3 className="text-2xl md:text-3xl font-bold text-slate-800">12m</h3>
                                        </GlassCard>
                                        <GlassCard className="p-4 bg-gradient-to-br from-amber-50/80 to-white border-amber-100 hover:-translate-y-1 transition-transform">
                                            <p className="text-[10px] md:text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5"><DollarSign size={14} /> Earnings</p>
                                            <h3 className="text-2xl md:text-3xl font-bold text-slate-800">₹42k</h3>
                                        </GlassCard>
                                        <GlassCard className="p-4 bg-gradient-to-br from-rose-50/80 to-white border-rose-100 hover:-translate-y-1 transition-transform">
                                            <p className="text-[10px] md:text-xs font-semibold text-rose-600 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Star size={14} /> Rating</p>
                                            <h3 className="text-2xl md:text-3xl font-bold text-slate-800">4.9</h3>
                                        </GlassCard>
                                    </div>

                                    {/* Analytics Charts Rows */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <GlassCard className="p-6 lg:col-span-2">
                                            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2"><BarChart3 size={18} className="text-blue-500" /> Daily Patient Visits</h3>
                                            <div className="h-64">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={mockDoctorVisits} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                                        <defs>
                                                            <linearGradient id="colorVisitsDoctor" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                                        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                                                        <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitsDoctor)" activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 3 }} />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </GlassCard>
                                        <GlassCard className="p-6 lg:col-span-1">
                                            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2"><CheckCircle size={18} className="text-indigo-500" /> Completion Rate</h3>
                                            <div className="h-48 flex items-center justify-center relative mt-4">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie data={mockCompletion} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                                            {mockCompletion.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COMPLETION_COLORS[index % COMPLETION_COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                    <span className="text-3xl font-bold text-slate-800">88%</span>
                                                </div>
                                            </div>
                                        </GlassCard>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <GlassCard className="p-6">
                                            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2"><TrendingUp size={18} className="text-amber-500" /> Patient Satisfaction Trend</h3>
                                            <div className="h-56">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={mockRatingTrend} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} domain={[3.5, 5.0]} />
                                                        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                                                        <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#f59e0b', stroke: '#fff', strokeWidth: 3 }} style={{ filter: 'drop-shadow(0 6px 8px rgba(245,158,11,0.25))' }} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </GlassCard>
                                        <GlassCard className="p-6">
                                            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2"><DollarSign size={18} className="text-emerald-500" /> Weekly Earnings</h3>
                                            <div className="h-56">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={mockWeeklyEarnings} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                                        <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                                                        <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} style={{ filter: 'drop-shadow(0 4px 6px rgba(16,185,129,0.2))' }} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </GlassCard>
                                    </div>

                                    <GlassCard className="p-6">
                                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                                            <Clock className="text-blue-600" /> Live Appointment Queue
                                        </h3>

                                        {upcomingAppointments.length === 0 ? (
                                            <div className="text-center py-12 text-slate-500">
                                                <CheckCircle size={48} className="mx-auto mb-4 text-slate-300" />
                                                <p>Your waiting room is empty. Enjoy your break!</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {upcomingAppointments.map((apt, idx) => (
                                                    <div key={apt.id} className="p-5 bg-white/60 rounded-[28px] border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl shadow-sm">
                                                                {idx + 1}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-slate-800 text-lg tracking-tight">{apt.patientName}</h4>
                                                                <p className="text-sm text-slate-500 font-medium">{new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Consultation</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-3">
                                                            {idx === 0 && (
                                                                <span className="text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-full shadow-sm animate-pulse">Waiting Now</span>
                                                            )}
                                                            <GlassButton onClick={() => handleStartConsultation(apt)} className="px-5 py-2 group bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-sm shadow-blue-500/20">
                                                                <Video size={16} className="mr-2 group-hover:scale-110 transition-transform" /> Start Session
                                                            </GlassButton>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </GlassCard>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* PRESCRIPTIONS BUILDER TAB */}
                    {activeTab === 'prescriptions' && (
                        <motion.div key="prescriptions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <GlassCard className="p-8">
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">Prescription Builder</h3>
                                <p className="text-slate-500 mb-6">Create and send digital prescriptions directly to the pharmacist.</p>

                                {currentPatient ? (
                                    <div className="bg-white/60 backdrop-blur-md p-5 rounded-[32px] border border-white shadow-sm mb-6 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-1">Patient</p>
                                            <h4 className="font-bold text-slate-800 text-lg">{currentPatient.patientName}</h4>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-orange-50/80 backdrop-blur-md p-5 rounded-[32px] border border-orange-200/50 mb-6 font-medium text-orange-700 text-sm shadow-sm flex items-center gap-3">
                                        <Info size={20} className="text-orange-500" />
                                        No active patient selected. Start a consultation from the Waiting Room first.
                                    </div>
                                )}
                                {/* Medication Lines */}
                                <div className="space-y-4 mb-6">
                                    {prescriptionForm.map((med, index) => (
                                        <div key={index} className="flex flex-col md:flex-row gap-4 bg-white/60 backdrop-blur-md p-5 rounded-[32px] border border-white shadow-sm hover:shadow-md transition-all">
                                            <div className="flex-1">
                                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 pl-1">Medicine Name</label>
                                                <GlassInput
                                                    placeholder="e.g. Amoxicillin 500mg"
                                                    value={med.name}
                                                    onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                                                    disabled={!currentPatient}
                                                    className="bg-white/80 border-slate-200 focus:ring-2 focus:ring-blue-500/30 text-sm"
                                                />
                                            </div>
                                            <div className="w-full md:w-1/3">
                                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 pl-1">Dosage (M-A-E-N)</label>
                                                <GlassInput
                                                    placeholder="e.g. 1-0-1-0"
                                                    value={med.dosage}
                                                    onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                                                    disabled={!currentPatient}
                                                    className="bg-white/80 border-slate-200 focus:ring-2 focus:ring-blue-500/30 text-sm"
                                                />
                                            </div>
                                            <div className="w-full md:w-32">
                                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 pl-1">Quantity</label>
                                                <GlassInput
                                                    type="number"
                                                    placeholder="e.g. 10"
                                                    value={med.quantity}
                                                    onChange={(e) => updateMedicine(index, 'quantity', e.target.value)}
                                                    disabled={!currentPatient}
                                                    className="bg-white/80 border-slate-200 focus:ring-2 focus:ring-blue-500/30 text-sm"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-200 mt-6 pt-6">
                                    <GlassButton variant="secondary" onClick={addMedicineRow} disabled={!currentPatient} className="px-4 py-2 text-blue-600">
                                        <Plus size={16} className="mr-2" /> Add Medicine
                                    </GlassButton>

                                    <motion.div layout>
                                        <GlassButton
                                            onClick={() => {
                                                setHasSentPrescription(true);
                                                setTimeout(() => {
                                                    handleSendPrescription();
                                                    setHasSentPrescription(false);
                                                }, 1000);
                                            }}
                                            disabled={!currentPatient || prescriptionForm[0].name === '' || hasSentPrescription}
                                            className={`px-8 py-3 overflow-hidden relative ${hasSentPrescription ? 'bg-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.5)] text-white' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'}`}
                                        >
                                            <AnimatePresence mode="wait">
                                                {hasSentPrescription ? (
                                                    <motion.div
                                                        key="success"
                                                        initial={{ y: 20, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        className="flex items-center justify-center gap-2"
                                                    >
                                                        <Check size={20} className="text-white" />
                                                        <span>Sent Complete</span>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="default"
                                                        initial={{ y: -20, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        exit={{ y: 20, opacity: 0 }}
                                                        className="flex items-center justify-center"
                                                    >
                                                        Send to Pharmacy
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </GlassButton>
                                    </motion.div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}

                    {/* PATIENTS & HISTORY (PLACEHOLDERS) */}
                    {activeTab === 'patients' && (
                        <motion.div key="patients" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <GlassCard className="p-12 text-center text-slate-500">
                                <Users size={48} className="mx-auto mb-4 text-blue-200" />
                                <h3 className="text-xl font-semibold text-slate-700 mb-2">Patient Directory</h3>
                                <p className="font-medium">Global patient search and directory modules are restricted.</p>
                            </GlassCard>
                        </motion.div>
                    )}

                    {activeTab === 'history' && (
                        <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <GlassCard className="p-12 text-center text-slate-500">
                                <FileText size={48} className="mx-auto mb-4 text-blue-200" />
                                <h3 className="text-xl font-semibold text-slate-700 mb-2">Consultation History</h3>
                                <p className="font-medium">View your past completed appointments and generated reports here.</p>
                            </GlassCard>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div >

            <FloatingAssistant />
        </main >
    );
};
