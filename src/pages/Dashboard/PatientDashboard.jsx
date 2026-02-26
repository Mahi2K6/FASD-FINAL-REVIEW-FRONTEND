import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PillNav } from '../../components/ui/PillNav';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassInput } from '../../components/ui/GlassInput';
import { useAppContext } from '../../AppContext';
import { Home, Calendar, FileText, Pill, LogOut, Video, CreditCard, CheckCircle, User, Bell, Download, Star, Clock, Activity, FileCheck, Info, MessageCircle, Send, X, Lock, Stethoscope, Building2, Smartphone, Wallet, ChevronRight, Shield, ShoppingBag, UploadCloud, Truck, Package, Search, Loader2, AlertCircle, CalendarPlus, DownloadCloud, Banknote } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const mockConsultations = [
    { name: 'Jan', value: 2 }, { name: 'Feb', value: 1 }, { name: 'Mar', value: 3 },
    { name: 'Apr', value: 0 }, { name: 'May', value: 5 }, { name: 'Jun', value: 2 }
];
const mockHealthScore = [
    { name: 'Jan', value: 78 }, { name: 'Feb', value: 80 }, { name: 'Mar', value: 82 },
    { name: 'Apr', value: 85 }, { name: 'May', value: 84 }, { name: 'Jun', value: 88 }
];
const mockAdherence = [{ name: 'Taken', value: 85 }, { name: 'Missed', value: 15 }];
const COLORS = ['#10b981', '#f1f5f9'];
import { AIThinkingState } from '../../components/ui/AIThinkingState';
import { ParallaxWrapper } from '../../components/ui/ParallaxWrapper';
import { FloatingAssistant } from '../../components/ui/FloatingAssistant';
import { ProfileMenu } from '../../components/ui/ProfileMenu';
import { VideoConsultation } from '../../components/ui/VideoConsultation';

const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'doctors', label: 'Find Doctors', icon: Search },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
    { id: 'records', label: 'Records', icon: Activity }
];

export const PatientDashboard = () => {
    const [activeTab, setActiveTab] = useState('home');
    const { currentUser, data, updateData, logout, setIsSearchGlobalVisible } = useAppContext();

    // States for Booking Flow
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [bookingStep, setBookingStep] = useState('select'); // select -> payment -> success
    const [inCall, setInCall] = useState(false);
    const [viewingRx, setViewingRx] = useState(null);
    const [ratingModal, setRatingModal] = useState({ open: false, doctorId: null, doctorName: '', rating: 0, review: '' });
    const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'netbanking' | 'card' | 'wallets' | 'cash'
    const [upiId, setUpiId] = useState('');
    const [selectedUpiApp, setSelectedUpiApp] = useState(null);
    const [selectedBank, setSelectedBank] = useState(null);
    const [selectedWallet, setSelectedWallet] = useState(null);
    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentError, setPaymentError] = useState('');

    const myAppointments = data.appointments?.filter(a => a.patientId === currentUser.id) || [];
    const myPrescriptions = data.prescriptions?.filter(p => p.patientId === currentUser.id) || [];
    const myOrders = data.orders?.filter(o => o.patientId === currentUser.id) || [];

    const doctors = data.users.filter(u => u.role === 'doctor' && u.status === 'approved');

    const handleReorder = (rx) => {
        const newOrder = {
            id: `ORD${Date.now()}`,
            patientId: currentUser.id,
            patientName: currentUser.name,
            status: 'confirmed',
            date: new Date().toISOString().split('T')[0],
            items: rx.medicines.map(m => m.name).join(', '),
            total: "₹" + (Math.floor(Math.random() * 1000) + 200)
        };
        const updatedOrders = [...(data.orders || []), newOrder];
        updateData('orders', updatedOrders);
        setViewingRx(null);
        setActiveTab('records');
    };

    const [bookingDetails, setBookingDetails] = useState({ problem: '', timeSlot: '' });
    const getFilteredSlots = () => {
        const allSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM'];
        const now = new Date();
        const currentHour = now.getHours();
        const currentMin = now.getMinutes();

        return allSlots.filter(slot => {
            const [time, modifier] = slot.split(' ');
            let [hours, minutes] = time.split(':');
            hours = parseInt(hours, 10);
            if (hours === 12 && modifier === 'AM') hours = 0;
            if (modifier === 'PM' && hours < 12) hours += 12;

            if (hours > currentHour) return true;
            if (hours === currentHour && parseInt(minutes, 10) > currentMin) return true;
            return false;
        });
    };
    const availableSlots = getFilteredSlots();
    const recommendedSlot = availableSlots.length > 0 ? availableSlots[0] : null;

    // Reschedule & Cancel States
    const [cancelModal, setCancelModal] = useState({ open: false, aptId: null });
    const [rescheduleModal, setRescheduleModal] = useState({ open: false, apt: null, newSlot: '' });

    const handleCancelAppointment = () => {
        const updated = data.appointments.filter(a => a.id !== cancelModal.aptId);
        updateData('appointments', updated);
        setCancelModal({ open: false, aptId: null });
    };

    const handleReschedule = () => {
        const updated = data.appointments.map(a =>
            a.id === rescheduleModal.apt.id ? { ...a, time: rescheduleModal.newSlot, timeSlot: rescheduleModal.newSlot } : a
        );
        updateData('appointments', updated);
        setRescheduleModal({ open: false, apt: null, newSlot: '' });
    };

    // Manage Global Search Visibility
    useEffect(() => {
        if (!setIsSearchGlobalVisible) return;
        const isCriticalAction =
            bookingStep === 'payment' ||
            bookingStep === 'success' ||
            ratingModal.open ||
            cancelModal.open ||
            rescheduleModal.open ||
            viewingRx !== null;

        const isSearchableTab = ['doctors', 'records', 'prescriptions'].includes(activeTab);

        setIsSearchGlobalVisible(isSearchableTab && !isCriticalAction);

        // Cleanup on unmount
        return () => setIsSearchGlobalVisible(true);
    }, [activeTab, bookingStep, ratingModal.open, cancelModal.open, rescheduleModal.open, viewingRx, setIsSearchGlobalVisible]);

    const [healthProfile, setHealthProfile] = useState({
        age: currentUser.age || '',
        height: currentUser.height || '',
        weight: currentUser.weight || '',
        bloodGroup: currentUser.bloodGroup || '',
        allergies: currentUser.allergies || '',
        conditions: currentUser.conditions || '',
        emergencyContact: currentUser.emergencyContact || ''
    });

    const [contactError, setContactError] = useState('');
    const [contactSuccess, setContactSuccess] = useState(false);

    const validatePhone = (phone) => {
        return /^[6-9]\d{9}$/.test(phone);
    };

    const handleContactChange = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 10) val = val.slice(0, 10);

        setHealthProfile({ ...healthProfile, emergencyContact: val });

        if (val.length === 10) {
            if (validatePhone(val)) {
                setContactError('');
                setContactSuccess(true);
            } else {
                setContactError('Enter a valid 10-digit Indian mobile number');
                setContactSuccess(false);
            }
        } else if (val.length > 0) {
            setContactError('');
            setContactSuccess(false);
        } else {
            // Empty is allowed
            setContactError('');
            setContactSuccess(false);
        }
    };

    const handleContactBlur = () => {
        if (healthProfile.emergencyContact && !validatePhone(healthProfile.emergencyContact)) {
            setContactError('Enter a valid 10-digit Indian mobile number');
            setContactSuccess(false);
        }
    };

    const handleSaveHealthProfile = () => {
        if (healthProfile.emergencyContact && !validatePhone(healthProfile.emergencyContact)) {
            setContactError('Enter a valid 10-digit Indian mobile number');
            setContactSuccess(false);
            return;
        }

        const updatedUser = { ...currentUser, ...healthProfile };
        const updatedUsers = data.users.map(u => u.id === currentUser.id ? updatedUser : u);
        updateData('users', updatedUsers);
        // Assuming current user state gets updated via context side effect or re-login in real app.
        // For prototype, we simulate a success message
        alert('Health Profile Saved Successfully');
    };

    const myNotifications = data.notifications?.filter(n => n.userId === currentUser.id) || [];
    const unreadCount = myNotifications.filter(n => !n.read).length;

    const [showNotifications, setShowNotifications] = useState(false);


    const handleBookAppointment = () => {
        setIsProcessingPayment(true);
        setPaymentError('');

        setTimeout(() => {
            if (paymentMethod === 'card' && cardDetails.cvv === '000') {
                setIsProcessingPayment(false);
                setPaymentError('Payment Failed. Invalid card details.');
                return;
            }

            const newApt = {
                id: `APT${Date.now()}`,
                patientId: currentUser.id,
                patientName: currentUser.name,
                doctorId: selectedDoctor.id,
                doctorName: selectedDoctor.name,
                specialization: selectedDoctor.specialization,
                date: new Date().toISOString(),
                timeSlot: bookingDetails.timeSlot,
                problem: bookingDetails.problem,
                status: 'scheduled'
            };
            updateData('appointments', [...data.appointments, newApt]);
            setIsProcessingPayment(false);
            setBookingStep('success');
        }, 1500);
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
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-sm font-semibold text-slate-800">Hello, {currentUser?.name?.split(' ')[0] || 'Patient'}</span>
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-none mt-1">Patient Portal</span>
                    </div>

                    <div className="relative">
                        <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 bg-white/50 backdrop-blur-md rounded-full text-slate-500 hover:text-blue-600 hover:shadow-md border border-white/60 transition-all duration-300">
                            <Bell size={20} />
                            {unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
                        </button>

                        {/* Notification Dropdown */}
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

                    {/* HOME TAB */}
                    {activeTab === 'home' && (
                        <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                <GlassCard className="p-4 md:p-6 bg-gradient-to-br from-blue-50/80 to-white">
                                    <p className="text-[10px] md:text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">Total Consultations</p>
                                    <h3 className="text-2xl md:text-4xl font-bold text-slate-800">14</h3>
                                </GlassCard>
                                <GlassCard className="p-4 md:p-6 bg-gradient-to-br from-indigo-50/80 to-white">
                                    <p className="text-[10px] md:text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">Upcoming Appts</p>
                                    <h3 className="text-2xl md:text-4xl font-bold text-slate-800">{myAppointments.filter(a => a.status === 'scheduled').length}</h3>
                                </GlassCard>
                                <GlassCard className="p-4 md:p-6 bg-gradient-to-br from-purple-50/80 to-white">
                                    <p className="text-[10px] md:text-sm font-semibold text-purple-600 uppercase tracking-wider mb-2">Prescriptions</p>
                                    <h3 className="text-2xl md:text-4xl font-bold text-slate-800">{myPrescriptions.length}</h3>
                                </GlassCard>
                                <GlassCard className="p-4 md:p-6 bg-gradient-to-br from-emerald-50/80 to-white">
                                    <p className="text-[10px] md:text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-2">Health Score</p>
                                    <h3 className="text-2xl md:text-4xl font-bold text-slate-800">88<span className="text-base text-emerald-500 ml-1">↑</span></h3>
                                </GlassCard>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <GlassCard className="p-6 lg:col-span-2">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2"><Activity size={18} className="text-emerald-500" /> Health Activity Score</h3>
                                    </div>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={mockHealthScore} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} domain={['dataMin - 5', 'dataMax + 5']} />
                                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                                                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorHealth)" activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 3 }} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </GlassCard>
                                <GlassCard className="p-6 lg:col-span-1">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2"><Pill size={18} className="text-blue-500" /> Medication Adherence</h3>
                                    <div className="h-48 flex items-center justify-center relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={mockAdherence}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    stroke="none"
                                                >
                                                    {mockAdherence.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <span className="text-3xl font-bold text-slate-800">85%</span>
                                            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Adherence</span>
                                        </div>
                                    </div>
                                </GlassCard>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <GlassCard className="p-6">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                                        <Activity size={18} className="text-indigo-500" /> Monthly Consultations
                                    </h3>
                                    <div className="h-56">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={mockConsultations} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                                                <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 3 }} style={{ filter: 'drop-shadow(0 6px 8px rgba(99,102,241,0.25))' }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </GlassCard>

                                <div className="space-y-6">
                                    <GlassCard className="p-6">
                                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                            <Calendar size={20} className="text-blue-600" /> Upcoming Appointment
                                        </h3>
                                        {(() => {
                                            const upcoming = myAppointments.find(a => a.status === 'scheduled' || a.status === 'upcoming');
                                            if (upcoming) {
                                                return (
                                                    <div className="bg-blue-50 p-5 rounded-[28px] border border-blue-100 flex flex-col gap-4 shadow-[0_4px_20px_rgba(37,99,235,0.06)] relative overflow-hidden transition-all hover:shadow-[0_8px_30px_rgba(37,99,235,0.12)]">
                                                        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <h4 className="font-semibold text-slate-800 text-lg">Dr. {upcoming.doctorName}</h4>
                                                                <p className="text-sm text-slate-500 mb-2">{upcoming.specialization || 'Consultation'}</p>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs flex items-center gap-1.5 bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full font-bold shadow-sm">
                                                                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                                                                        Starts in 18 mins
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col items-end gap-2.5">
                                                                <button onClick={() => { setSelectedDoctor({ name: upcoming.doctorName }); setInCall(true); }} className="text-xs px-4 py-2 rounded-full border border-transparent bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 hover:-translate-y-0.5 font-medium flex items-center gap-2">
                                                                    <Video size={14} /> Join Call
                                                                </button>
                                                                <div className="flex items-center gap-3 pr-1">
                                                                    <button onClick={() => setRescheduleModal({ open: true, apt: upcoming, newSlot: '' })} className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors">Reschedule</button>
                                                                    <div className="w-px h-3 bg-slate-300"></div>
                                                                    <button onClick={() => setCancelModal({ open: true, aptId: upcoming.id })} className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">Cancel</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return <p className="text-slate-500 text-sm">No upcoming appointments.</p>;
                                        })()}
                                    </GlassCard>

                                    <GlassCard className="p-6">
                                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                            <Pill size={20} className="text-indigo-600" /> Recent Prescriptions
                                        </h3>
                                        {myPrescriptions.length > 0 ? (
                                            <div className="space-y-3">
                                                {myPrescriptions.slice(-2).map(p => (
                                                    <div key={p.id} className="flex items-center justify-between p-3 bg-white/40 rounded-full border border-white/60 shadow-sm hover:shadow-md transition-all text-sm cursor-pointer" onClick={() => setActiveTab('prescriptions')}>
                                                        <div>
                                                            <p className="font-medium text-slate-800">{p.medicines[0]?.name} {p.medicines.length > 1 ? `+${p.medicines.length - 1} more` : ''}</p>
                                                            <p className="text-slate-500 text-xs">From Dr. {p.doctorName}</p>
                                                        </div>
                                                        <span className={`text-xs px-2 py-1 rounded-full border shadow-sm ${p.status === 'ready' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                                                            {p.status || 'Pending'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-slate-500 text-sm">No recent prescriptions.</p>
                                        )}
                                    </GlassCard>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* DOCTORS TAB */}
                    {activeTab === 'doctors' && (
                        <motion.div key="doctors" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>

                            {bookingStep === 'select' && (
                                <GlassCard className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                        <div>
                                            <h2 className="text-xl font-semibold tracking-tight text-slate-800">Find a Specialist</h2>
                                            <p className="text-sm text-slate-500 mt-1">Book an appointment with our elite medical team.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {doctors.map(doc => (
                                            <div key={doc.id} className="p-5 bg-gradient-to-b from-white to-slate-50 rounded-[28px] border border-white/60 shadow-[0_6px_18px_rgba(0,0,0,0.06)] hover:shadow-[0_18px_40px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all flex flex-col pointer-events-auto">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center font-bold text-xl shadow-inner">
                                                        {doc.name ? doc.name.charAt(0) : 'D'}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-slate-800 tracking-tight">Dr. {doc.name || 'Unknown'}</h4>
                                                        <p className="text-sm text-blue-600 font-medium">{doc.specialization}</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-slate-500 mb-4 tracking-wide">{doc.experience} Years Experience</p>
                                                <div className="mt-auto pt-2">
                                                    <GlassButton
                                                        onClick={() => { setSelectedDoctor(doc); setBookingStep('details'); }}
                                                        className="w-full shadow-md"
                                                    >
                                                        Book Consultation
                                                    </GlassButton>
                                                </div>
                                            </div>
                                        ))}
                                        {doctors.length === 0 && (
                                            <div className="col-span-full py-12 text-center text-slate-500">
                                                <Stethoscope size={48} className="mx-auto mb-4 text-slate-300" />
                                                <p>No doctors found matching your criteria.</p>
                                            </div>
                                        )}
                                    </div>
                                </GlassCard>
                            )}

                            {bookingStep === 'details' && selectedDoctor && (
                                <GlassCard className="p-8 max-w-2xl mx-auto">
                                    <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Calendar className="text-blue-600" /> Book Consultation</h3>

                                    <div className="bg-white/50 p-4 rounded-[28px] border border-white/60 mb-6 flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl uppercase">
                                                {selectedDoctor.name?.charAt(0) || 'D'}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-800 tracking-tight">Dr. {selectedDoctor.name}</h4>
                                                <p className="text-sm text-blue-600 font-medium">{selectedDoctor.specialization}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${selectedDoctor.availability?.load === 'Busy' ? 'bg-red-100 text-red-700 border border-red-200' : selectedDoctor.availability?.load === 'Medium' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                                                Load: {selectedDoctor.availability?.load || 'Low'}
                                            </span>
                                            <p className="text-[10px] text-slate-500 mt-1.5 font-semibold tracking-wide uppercase">Est. Wait: <span className="text-slate-700">{selectedDoctor.availability?.load === 'Busy' ? '30 mins' : '10 mins'}</span></p>
                                        </div>
                                    </div>

                                    <div className="space-y-6 mb-8">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2 pl-1">Describe your problem</label>
                                            <textarea
                                                className="w-full bg-white/50 border border-slate-200 rounded-[28px] p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none h-24 shadow-inner"
                                                placeholder="Briefly describe your symptoms..."
                                                value={bookingDetails.problem}
                                                onChange={(e) => setBookingDetails({ ...bookingDetails, problem: e.target.value })}
                                            ></textarea>
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {['Fever', 'Headache', 'Skin issue', 'General consultation', 'Other'].map(tag => (
                                                    <button
                                                        key={tag}
                                                        onClick={() => setBookingDetails({ ...bookingDetails, problem: bookingDetails.problem ? `${bookingDetails.problem}, ${tag}` : tag })}
                                                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-full border border-slate-200 transition-colors cursor-pointer"
                                                    >
                                                        + {tag}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2 pl-1">Select Time Slot</label>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-48 overflow-y-auto p-2 -mx-2 hide-scrollbar">
                                                {availableSlots.length === 0 ? (
                                                    <div className="col-span-full py-4 text-center text-sm font-medium text-slate-500 bg-slate-50 rounded-[20px]">No slots available today.</div>
                                                ) : (
                                                    availableSlots.map(slot => {
                                                        const isRecommended = slot === recommendedSlot;
                                                        return (
                                                            <button
                                                                key={slot}
                                                                onClick={() => setBookingDetails({ ...bookingDetails, timeSlot: slot })}
                                                                className={`relative text-sm py-3 rounded-[20px] transition-all font-medium ${bookingDetails.timeSlot === slot ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 transform scale-105 border-transparent' : isRecommended ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 mt-2' : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'}`}
                                                                style={{ borderWidth: '1px' }}
                                                            >
                                                                {isRecommended && <span className="absolute -top-[14px] left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm tracking-wider font-bold">SUGGESTED</span>}
                                                                {slot}
                                                            </button>
                                                        )
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <GlassButton variant="secondary" className="flex-1 py-3" onClick={() => setBookingStep('select')}>Back to Search</GlassButton>
                                        <GlassButton className="flex-1 py-3" disabled={!bookingDetails.timeSlot} onClick={() => setBookingStep('payment')}>Proceed to Payment</GlassButton>
                                    </div>
                                </GlassCard>
                            )}

                            {bookingStep === 'payment' && selectedDoctor && (
                                <div className="max-w-2xl mx-auto space-y-6">
                                    {/* Consultation Summary Card */}
                                    <GlassCard className="p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] bg-white/80 backdrop-blur-xl border border-white/40 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 rounded-t-[28px]"></div>
                                        <h3 className="text-2xl font-bold text-slate-800 mb-6">Confirm & Pay</h3>
                                        <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 p-5 rounded-[28px] border border-slate-100 flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl">
                                                    {selectedDoctor.name?.charAt(0) || 'D'}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-slate-800 text-lg">Virtual Consultation</h4>
                                                    <p className="text-sm text-slate-500 font-medium">with Dr. {selectedDoctor.name}</p>
                                                    <p className="text-xs text-slate-400 mt-0.5">{bookingDetails.timeSlot} • Today</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-3xl font-black text-slate-800 tracking-tight">₹999</span>
                                                <p className="text-xs text-slate-400 font-medium">Incl. all taxes</p>
                                            </div>
                                        </div>
                                    </GlassCard>

                                    {/* Payment Methods Card */}
                                    <GlassCard className="p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] bg-white/80 backdrop-blur-xl border border-white/40">
                                        <p className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-5">Choose Payment Method</p>

                                        {/* Payment Method Tabs */}
                                        <div className="flex gap-2 mb-6 p-1.5 bg-slate-100/80 rounded-full">
                                            {[
                                                { id: 'upi', label: 'UPI', icon: Smartphone },
                                                { id: 'netbanking', label: 'Net Banking', icon: Building2 },
                                                { id: 'card', label: 'Card', icon: CreditCard },
                                                { id: 'wallets', label: 'Wallets', icon: Wallet },
                                                { id: 'cash', label: 'Cash', icon: Banknote },
                                            ].map(method => (
                                                <button
                                                    key={method.id}
                                                    onClick={() => setPaymentMethod(method.id)}
                                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full text-sm font-medium transition-all duration-300 ${paymentMethod === method.id
                                                        ? 'bg-white text-blue-600 shadow-md border border-white/60'
                                                        : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'
                                                        }`}
                                                >
                                                    <method.icon size={18} />
                                                    <span className="hidden sm:inline">{method.label}</span>
                                                </button>
                                            ))}
                                        </div>

                                        {/* UPI Payment */}
                                        <AnimatePresence mode="wait">
                                            {paymentMethod === 'upi' && (
                                                <motion.div key="upi" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-5">
                                                    {/* Popular UPI Apps */}
                                                    <div>
                                                        <p className="text-xs font-medium text-slate-500 mb-3">Pay using UPI App</p>
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                            {[
                                                                { id: 'gpay', name: 'Google Pay', color: 'from-blue-500 to-blue-600', letter: 'G' },
                                                                { id: 'phonepe', name: 'PhonePe', color: 'from-indigo-500 to-purple-600', letter: 'P' },
                                                                { id: 'paytm', name: 'Paytm', color: 'from-sky-400 to-blue-500', letter: 'P' },
                                                                { id: 'bhim', name: 'BHIM UPI', color: 'from-orange-400 to-orange-600', letter: 'B' },
                                                            ].map(app => (
                                                                <button
                                                                    key={app.id}
                                                                    onClick={() => setSelectedUpiApp(app.id)}
                                                                    className={`p-4 rounded-[32px] border-2 transition-all duration-300 flex flex-col items-center gap-2 group ${selectedUpiApp === app.id
                                                                        ? 'border-blue-400 bg-blue-50/60 shadow-md shadow-blue-500/10 scale-[1.02]'
                                                                        : 'border-slate-100 bg-white/50 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-sm'
                                                                        }`}
                                                                >
                                                                    <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${app.color} text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform`}>
                                                                        {app.letter}
                                                                    </div>
                                                                    <span className="text-xs font-medium text-slate-700">{app.name}</span>
                                                                    {selectedUpiApp === app.id && (
                                                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2 right-2">
                                                                            <CheckCircle size={16} className="text-blue-500" />
                                                                        </motion.div>
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* OR divider */}
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                                                        <span className="text-xs font-medium text-slate-400 uppercase">or enter UPI ID</span>
                                                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                                                    </div>

                                                    {/* UPI ID Input */}
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                                            <Wallet size={18} />
                                                        </div>
                                                        <GlassInput
                                                            placeholder="Enter UPI ID (e.g. name@upi)"
                                                            value={upiId}
                                                            onChange={(e) => { setUpiId(e.target.value); setSelectedUpiApp(null); }}
                                                            className="pl-12 border border-slate-200 focus:ring-2 focus:ring-blue-500/30 bg-white/60 text-sm"
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* Net Banking */}
                                            {paymentMethod === 'netbanking' && (
                                                <motion.div key="netbanking" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                                                    <p className="text-xs font-medium text-slate-500 mb-1">Select your bank</p>
                                                    {/* Popular Banks */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {[
                                                            { id: 'sbi', name: 'State Bank of India', short: 'SBI', color: 'text-blue-700 bg-blue-50' },
                                                            { id: 'hdfc', name: 'HDFC Bank', short: 'HDFC', color: 'text-red-700 bg-red-50' },
                                                            { id: 'icici', name: 'ICICI Bank', short: 'ICICI', color: 'text-orange-700 bg-orange-50' },
                                                            { id: 'axis', name: 'Axis Bank', short: 'AXIS', color: 'text-purple-700 bg-purple-50' },
                                                            { id: 'kotak', name: 'Kotak Mahindra', short: 'KMB', color: 'text-red-600 bg-red-50' },
                                                            { id: 'bob', name: 'Bank of Baroda', short: 'BOB', color: 'text-orange-600 bg-orange-50' },
                                                        ].map(bank => (
                                                            <button
                                                                key={bank.id}
                                                                onClick={() => setSelectedBank(bank.id)}
                                                                className={`p-4 rounded-[32px] border-2 transition-all duration-300 flex items-center gap-3 group ${selectedBank === bank.id
                                                                    ? 'border-blue-400 bg-blue-50/60 shadow-md'
                                                                    : 'border-slate-100 bg-white/50 hover:border-blue-200 hover:shadow-sm'
                                                                    }`}
                                                            >
                                                                <div className={`w-10 h-10 rounded-full ${bank.color} flex items-center justify-center font-bold text-xs shadow-sm`}>
                                                                    {bank.short}
                                                                </div>
                                                                <div className="text-left">
                                                                    <p className="text-sm font-medium text-slate-800">{bank.name}</p>
                                                                    {selectedBank === bank.id && <p className="text-[10px] text-blue-500 font-medium">Selected</p>}
                                                                </div>
                                                                <ChevronRight size={16} className="ml-auto text-slate-300 group-hover:text-blue-400 transition-colors" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <p className="text-[11px] text-slate-400 text-center mt-2">You will be redirected to your bank's secure page (Demo)</p>
                                                </motion.div>
                                            )}

                                            {/* Card Payment */}
                                            {paymentMethod === 'card' && (
                                                <motion.div key="card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-5">
                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-500 mb-2 pl-1">Card Number</label>
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                                                <CreditCard size={18} />
                                                            </div>
                                                            <GlassInput
                                                                placeholder="1234 5678 9012 3456"
                                                                borderFull={true}
                                                                value={cardDetails.number}
                                                                onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                                                                className="pl-12 border border-slate-200 focus:ring-2 focus:ring-blue-500/30 bg-white/60 font-mono text-sm"
                                                            />
                                                        </div>
                                                        {/* Card brand indicators */}
                                                        <div className="flex gap-2 mt-2.5 ml-1">
                                                            {['VISA', 'MC', 'RuPay', 'Amex'].map(brand => (
                                                                <div key={brand} className="h-6 px-2 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-[9px] font-semibold text-slate-600">{brand}</div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-medium text-slate-500 mb-2 pl-1">Cardholder Name</label>
                                                        <GlassInput
                                                            placeholder="Name on card"
                                                            borderFull={true}
                                                            value={cardDetails.name}
                                                            onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                                                            className="border border-slate-200 focus:ring-2 focus:ring-blue-500/30 bg-white/60 text-sm"
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-500 mb-2 pl-1">Expiry</label>
                                                            <GlassInput
                                                                placeholder="MM/YY"
                                                                borderFull={true}
                                                                value={cardDetails.expiry}
                                                                onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                                                                className="border border-slate-200 focus:ring-2 focus:ring-blue-500/30 bg-white/60 font-mono text-sm text-center"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-500 mb-2 pl-1">CVV</label>
                                                            <GlassInput
                                                                placeholder="•••"
                                                                borderFull={true}
                                                                type="password"
                                                                value={cardDetails.cvv}
                                                                onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                                                                className="border border-slate-200 focus:ring-2 focus:ring-blue-500/30 bg-white/60 font-mono text-sm text-center"
                                                            />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                            {paymentMethod === 'wallets' && (
                                                <motion.div key="wallets" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                                                    <p className="text-xs font-medium text-slate-500 mb-1">Select Wallet</p>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {[
                                                            { id: 'paytm', name: 'Paytm Wallet', color: 'from-sky-400 to-blue-500' },
                                                            { id: 'amazon', name: 'Amazon Pay', color: 'from-amber-400 to-yellow-500' }
                                                        ].map(wallet => (
                                                            <button
                                                                key={wallet.id}
                                                                onClick={() => setSelectedWallet(wallet.id)}
                                                                className={`p-4 rounded-[32px] border-2 transition-all duration-300 flex items-center gap-3 group ${selectedWallet === wallet.id
                                                                    ? 'border-blue-400 bg-blue-50/60 shadow-md'
                                                                    : 'border-slate-100 bg-white/50 hover:border-blue-200 hover:shadow-sm'
                                                                    }`}
                                                            >
                                                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${wallet.color} flex items-center justify-center font-bold text-xs text-white shadow-sm`}>
                                                                    {wallet.name.charAt(0)}
                                                                </div>
                                                                <div className="text-left">
                                                                    <p className="text-sm font-medium text-slate-800">{wallet.name}</p>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}

                                            {paymentMethod === 'cash' && (
                                                <motion.div key="cash" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4 p-4 bg-orange-50 border border-orange-100 rounded-[28px] text-center">
                                                    <Banknote className="mx-auto text-orange-500 mb-2" size={32} />
                                                    <h4 className="font-semibold text-orange-800">Cash on Visit</h4>
                                                    <p className="text-sm text-orange-600 font-medium">Pay directly at the clinic before your consultation begins.</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </GlassCard>

                                    {/* Security & Action Card */}
                                    <GlassCard className="p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] bg-white/80 backdrop-blur-xl border border-white/40">
                                        {/* Trust Indicators */}
                                        <div className="flex items-center justify-center gap-6 mb-6">
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <Lock size={13} />
                                                <span className="text-[11px] font-medium">256-bit SSL</span>
                                            </div>
                                            <div className="w-px h-4 bg-slate-200"></div>
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <Shield size={13} />
                                                <span className="text-[11px] font-medium">PCI DSS Compliant</span>
                                            </div>
                                            <div className="w-px h-4 bg-slate-200"></div>
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <CheckCircle size={13} />
                                                <span className="text-[11px] font-medium">RBI Approved</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                disabled={isProcessingPayment}
                                                className="w-full sm:w-1/3 py-3.5 text-sm font-medium text-slate-600 bg-white rounded-full border border-slate-300 hover:bg-slate-50 shadow-sm transition-all flex items-center justify-center disabled:opacity-50"
                                                onClick={() => setBookingStep('details')}
                                            >
                                                Back
                                            </motion.button>
                                            {paymentError ? (
                                                <motion.button
                                                    whileHover={{ scale: 1.02, translateY: -2 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="w-full sm:w-2/3 py-3.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-full shadow-md hover:shadow-lg border border-red-500 transition-all flex items-center justify-center gap-2"
                                                    onClick={handleBookAppointment}
                                                >
                                                    <AlertCircle size={16} /> Retry Payment
                                                </motion.button>
                                            ) : (
                                                <motion.button
                                                    whileHover={{ scale: 1.02, translateY: -2 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    disabled={isProcessingPayment}
                                                    className="w-full sm:w-2/3 py-3.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-md hover:shadow-lg hover:shadow-blue-500/30 border border-blue-500 transition-all flex items-center justify-center gap-2 disabled:opacity-80"
                                                    onClick={handleBookAppointment}
                                                >
                                                    {isProcessingPayment ? (
                                                        <><Loader2 size={16} className="animate-spin" /> Processing...</>
                                                    ) : (
                                                        <><Lock size={14} /> {paymentMethod === 'cash' ? 'Confirm Booking' : 'Pay ₹999 & Book'}</>
                                                    )}
                                                </motion.button>
                                            )}
                                        </div>
                                        {paymentError && <p className="text-center text-xs text-red-500 mt-4 font-semibold">{paymentError}</p>}
                                    </GlassCard>
                                </div>
                            )}

                            {bookingStep === 'success' && (
                                <GlassCard className="p-12 max-w-lg mx-auto text-center">
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle size={48} className="text-green-500" />
                                        </div>
                                    </motion.div>
                                    <h3 className="text-3xl font-bold text-slate-800 mb-2">Payment Successful!</h3>
                                    <p className="text-slate-500 mb-8 font-medium">Your virtual consultation with Dr. {selectedDoctor?.name} is confirmed.</p>

                                    <div className="bg-slate-50 p-6 rounded-[28px] border border-slate-100 mb-8 text-left space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-slate-500">Date & Time</span>
                                            <span className="text-sm font-semibold text-slate-800">Today, {bookingDetails.timeSlot}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-slate-500">Amount Paid</span>
                                            <span className="text-sm font-semibold text-slate-800">₹999</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-slate-500">Transaction ID</span>
                                            <span className="text-sm font-mono text-slate-800">TXN{Date.now().toString().slice(-8)}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <GlassButton className="w-full py-3.5 flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 border-none shadow-md shadow-blue-500/20"><CalendarPlus size={16} className="mr-2" /> Add to Calendar</GlassButton>
                                        <GlassButton variant="secondary" className="w-full py-3 flex items-center justify-center"><DownloadCloud size={16} className="mr-2" /> Download Invoice</GlassButton>
                                        <GlassButton variant="secondary" onClick={() => { setBookingStep('select'); setSelectedDoctor(null); setActiveTab('appointments'); }} className="w-full py-3 border-transparent bg-slate-100 hover:bg-slate-200">
                                            Return to Dashboard
                                        </GlassButton>
                                    </div>
                                </GlassCard>
                            )}
                        </motion.div>
                    )}

                    {/* APPOINTMENTS TAB */}
                    {activeTab === 'appointments' && (
                        <motion.div key="appointments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <GlassCard className="p-6">
                                <h3 className="text-xl font-bold text-slate-800 mb-6">Upcoming Appointments</h3>
                                {myAppointments.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500">
                                        <Calendar size={48} className="mx-auto mb-4 text-slate-300" />
                                        <p>You have no appointments. Book one in the Find Doctors tab.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {myAppointments.map(apt => (
                                            <div key={apt.id} className="p-4 bg-white/50 rounded-[28px] border border-white/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-blue-100/50 rounded-full flex items-center justify-center text-blue-600">
                                                        <Calendar size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-slate-800 text-lg tracking-tight">Dr. {apt.doctorName}</h4>
                                                        <p className="text-sm text-slate-500 font-medium">{apt.specialization}</p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full font-medium">Confirmed</span>
                                                    <GlassButton onClick={() => setInCall(true)} className="px-5 py-2 group shadow-blue-500/20">
                                                        <Video size={16} className="mr-2 group-hover:scale-110 transition-transform" /> Join Call
                                                    </GlassButton>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </GlassCard>
                        </motion.div>
                    )}

                    {/* PRESCRIPTIONS TAB */}
                    {activeTab === 'prescriptions' && (
                        <motion.div key="prescriptions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <GlassCard className="p-6">
                                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><FileCheck className="text-indigo-600" /> My Digital Prescriptions</h3>
                                {myPrescriptions.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500">
                                        <Pill size={48} className="mx-auto mb-4 text-slate-300" />
                                        <p>No prescriptions found.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {myPrescriptions.map(p => (
                                            <div key={p.id} className="p-6 bg-white/60 rounded-[32px] border border-white shadow-sm hover:shadow-md transition-all flex flex-col group relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-bl-full -z-10 opacity-50 transition-transform group-hover:scale-110"></div>
                                                <div className="flex items-start justify-between mb-4 z-10">
                                                    <div>
                                                        <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100 mb-2 inline-block">RX-{p.id.slice(-6).toUpperCase()}</span>
                                                        <h4 className="font-semibold text-slate-800 text-lg">Dr. {p.doctorName}</h4>
                                                        <p className="text-xs text-slate-500">{new Date(p.createdAt || "2024-01-01").toLocaleDateString()}</p>
                                                    </div>
                                                    <span className={`text-xs px-3 py-1 rounded-full font-medium shadow-sm ${p.status === 'ready' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-orange-100 text-orange-700 border border-orange-200'}`}>
                                                        {p.status === 'ready' ? 'Ready for Pickup' : 'Sent to Pharmacy'}
                                                    </span>
                                                </div>

                                                <div className="space-y-2 mb-6 z-10">
                                                    {p.medicines.slice(0, 2).map((m, idx) => (
                                                        <div key={idx} className="flex justify-between text-sm py-1 border-b border-slate-100 last:border-0">
                                                            <span className="font-medium text-slate-700 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div> {m.name}</span>
                                                            <span className="text-slate-500">{m.dosage} • {m.quantity}x</span>
                                                        </div>
                                                    ))}
                                                    {p.medicines.length > 2 && <div className="text-xs text-indigo-500 font-medium">+{p.medicines.length - 2} more medications</div>}
                                                </div>

                                                <div className="mt-auto flex gap-3 z-10">
                                                    <GlassButton onClick={() => setViewingRx(p)} variant="secondary" className="flex-1 py-2 text-sm text-indigo-700 border-indigo-200 hover:bg-indigo-50"><FileText size={16} className="mr-2" /> View Details</GlassButton>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </GlassCard>

                            {/* PDF View Modal Overlay */}
                            <AnimatePresence>
                                {viewingRx && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                                            <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                                                <div>
                                                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Digital Prescription</h2>
                                                    <p className="text-slate-500 font-mono text-sm mt-1">RX-{viewingRx.id.toUpperCase()}</p>
                                                </div>
                                                <button onClick={() => setViewingRx(null)} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors">✕</button>
                                            </div>
                                            <div className="p-8">
                                                <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-slate-100">
                                                    <div>
                                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Prescribed By</p>
                                                        <p className="font-semibold text-slate-800 text-lg">Dr. {viewingRx.doctorName}</p>
                                                        <p className="text-sm text-slate-600">Issued: {new Date(viewingRx.createdAt || "2024-01-01").toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Patient Details</p>
                                                        <p className="font-semibold text-slate-800 text-lg">{currentUser.name}</p>
                                                        <p className="text-sm text-slate-600">Age: {currentUser.age || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div className="mb-8">
                                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">Medications</p>
                                                    <table className="w-full text-left">
                                                        <thead>
                                                            <tr className="border-b border-slate-200">
                                                                <th className="py-2 text-sm font-semibold text-slate-600">Medicine</th>
                                                                <th className="py-2 text-sm font-semibold text-slate-600">Dosage</th>
                                                                <th className="py-2 text-sm font-semibold text-slate-600">Qty</th>
                                                                <th className="py-2 text-sm font-semibold text-slate-600">Instructions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {viewingRx.medicines.map((m, i) => (
                                                                <tr key={i} className="border-b border-slate-100 last:border-0">
                                                                    <td className="py-3 text-sm font-medium text-slate-800">{m.name}</td>
                                                                    <td className="py-3 text-sm text-slate-600">{m.dosage}</td>
                                                                    <td className="py-3 text-sm text-slate-600 bg-slate-50 px-2 rounded">{m.quantity}</td>
                                                                    <td className="py-3 text-sm text-slate-600">{m.instructions || 'As directed'}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                {viewingRx.notes && (
                                                    <div className="bg-blue-50/50 p-4 rounded-[28px] border border-blue-100">
                                                        <p className="text-xs text-blue-800 font-bold uppercase tracking-wider mb-1">Doctor's Notes</p>
                                                        <p className="text-sm text-slate-700">{viewingRx.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-4 rounded-b-2xl">
                                                <GlassButton variant="secondary" onClick={() => setViewingRx(null)}>Close</GlassButton>
                                                <GlassButton className="bg-emerald-600 hover:bg-emerald-700 border-emerald-500 shadow-emerald-500/30 text-white" onClick={() => handleReorder(viewingRx)}>
                                                    <ShoppingBag size={16} className="mr-2" /> Reorder Medicines
                                                </GlassButton>
                                                <GlassButton className="bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30 text-white">
                                                    <Download size={16} className="mr-2" /> Download PDF
                                                </GlassButton>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <GlassCard className="p-6 lg:col-span-1 border-t-4 border-t-blue-500">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-3xl mb-4 border-4 border-white shadow-md">
                                            {currentUser.name?.charAt(0) || 'P'}
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800">{currentUser.name}</h3>
                                        <p className="text-sm text-slate-500">{currentUser.email}</p>
                                        <div className="mt-6 w-full space-y-3 text-left">
                                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                                <span className="text-sm text-slate-500">Phone</span>
                                                <span className="text-sm font-medium text-slate-800">{currentUser.phone || 'Not provided'}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                                <span className="text-sm text-slate-500">Role</span>
                                                <span className="text-sm font-medium text-slate-800 capitalize">{currentUser.role}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                                <span className="text-sm text-slate-500">Member Since</span>
                                                <span className="text-sm font-medium text-slate-800">{new Date(currentUser.createdAt || "2024-01-01").toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>

                                <GlassCard className="p-8 lg:col-span-2">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Activity className="text-blue-600" /> Health Profile</h3>
                                        <GlassButton variant="secondary" onClick={handleSaveHealthProfile} className="px-5 py-2 text-sm shadow-sm hover:shadow-md">Save Changes</GlassButton>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1 pl-1">Age</label>
                                            <GlassInput value={healthProfile.age} onChange={e => setHealthProfile({ ...healthProfile, age: e.target.value })} placeholder="e.g. 28" borderFull={false} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1 pl-1">Blood Group</label>
                                            <GlassInput value={healthProfile.bloodGroup} onChange={e => setHealthProfile({ ...healthProfile, bloodGroup: e.target.value })} placeholder="e.g. O+" borderFull={false} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1 pl-1">Height (cm)</label>
                                            <GlassInput value={healthProfile.height} onChange={e => setHealthProfile({ ...healthProfile, height: e.target.value })} placeholder="e.g. 175" borderFull={false} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1 pl-1">Weight (kg)</label>
                                            <GlassInput value={healthProfile.weight} onChange={e => setHealthProfile({ ...healthProfile, weight: e.target.value })} placeholder="e.g. 70" borderFull={false} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 mb-1 pl-1">Allergies</label>
                                            <GlassInput value={healthProfile.allergies} onChange={e => setHealthProfile({ ...healthProfile, allergies: e.target.value })} placeholder="e.g. Peanuts, Penicillin" borderFull={false} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 mb-1 pl-1">Existing Conditions</label>
                                            <GlassInput value={healthProfile.conditions} onChange={e => setHealthProfile({ ...healthProfile, conditions: e.target.value })} placeholder="e.g. Asthma, Hypertension" borderFull={false} />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 mb-1 pl-1">Emergency Phone Number</label>
                                            <GlassInput
                                                value={healthProfile.emergencyContact}
                                                onChange={handleContactChange}
                                                onBlur={handleContactBlur}
                                                error={!!contactError}
                                                success={contactSuccess}
                                                placeholder="9876543210"
                                                borderFull={false}
                                            />
                                            {contactError && <p className="text-xs text-red-500 mt-1 pl-1">{contactError}</p>}
                                        </div>
                                    </div>
                                </GlassCard>

                                {/* Security Settings */}
                                <GlassCard className="p-8 lg:col-span-2 border-t-4 border-t-slate-800">
                                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6"><Shield className="text-slate-800" /> Security Settings</h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1 pl-1">Current Password</label>
                                            <GlassInput type="password" placeholder="••••••••" borderFull={false} />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1 pl-1">New Password</label>
                                                <GlassInput type="password" placeholder="••••••••" borderFull={false} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1 pl-1">Confirm Password</label>
                                                <GlassInput type="password" placeholder="••••••••" borderFull={false} />
                                            </div>
                                        </div>
                                        <GlassButton className="mt-4 bg-slate-800 hover:bg-slate-900 border-none text-white shadow-xl shadow-slate-900/20">Update Password</GlassButton>
                                    </div>
                                </GlassCard>

                                {/* Login Activity */}
                                <GlassCard className="p-6 lg:col-span-1">
                                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6"><Lock className="text-slate-500" /> Login Activity</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">MacBook Pro - Safari</p>
                                                <p className="text-xs text-slate-500">New York, USA • 192.168.1.1</p>
                                            </div>
                                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 uppercase tracking-wider">Active</span>
                                        </div>
                                        <div className="flex items-start justify-between pb-3">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">iPhone 14 - App</p>
                                                <p className="text-xs text-slate-500">New York, USA • 10.0.0.1</p>
                                            </div>
                                            <span className="text-xs text-slate-400">2 days ago</span>
                                        </div>
                                    </div>
                                    <button className="text-[13px] font-semibold text-red-500 hover:text-red-700 mt-6 transition-colors flex items-center gap-1 group"><LogOut size={14} className="group-hover:-translate-x-1 transition-transform" /> Log out all devices</button>
                                </GlassCard>
                            </div>
                        </motion.div>
                    )}
                    {/* RECORDS AND HISTORY TIMELINE */}
                    {activeTab === 'records' && (
                        <motion.div key="records" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                            {/* Document Upload Mock */}
                            <GlassCard className="p-8 border-dashed border-2 border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors group cursor-pointer text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-indigo-50/20 pointer-events-none"></div>
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-inner">
                                    <UploadCloud size={32} />
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 mb-2">Upload Lab Reports & Documents</h4>
                                <p className="text-sm text-slate-500 mb-6">Drag and drop files here, or click to browse</p>
                                <GlassButton className="bg-white text-slate-700 shadow-sm border-slate-200 hover:bg-slate-50 mx-auto px-6 py-2.5 rounded-full font-medium text-sm">Select Files</GlassButton>

                                <div className="mt-8 pt-8 border-t border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                                    <h5 className="col-span-full text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recent Documents</h5>
                                    {['Blood Test Report.pdf', 'X-Ray Scan.jpg'].map((doc, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${i === 0 ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                                <FileText size={18} />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-xs font-semibold text-slate-700 truncate">{doc}</p>
                                                <p className="text-[10px] text-slate-400">12 MB</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </GlassCard>

                            <GlassCard className="p-8">
                                <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-2"><Clock className="text-blue-600" /> Patient Health Timeline</h3>

                                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-100 before:via-blue-200 before:to-transparent">

                                    {/* Pharmacy Order Tracker - dynamic based on myOrders */}
                                    {myOrders.map((order) => (
                                        <div key={order.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-emerald-500 text-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform hover:scale-110">
                                                <Package size={16} />
                                            </div>
                                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-[28px] bg-white border border-emerald-100 shadow-sm hover:shadow-[0_8px_30px_rgba(16,185,129,0.12)] transition-shadow">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-bold text-slate-800 text-lg">Pharmacy Order {order.id.slice(-4)}</h4>
                                                    <time className="text-sm font-medium tracking-wide text-emerald-600">{new Date(order.date).toLocaleDateString()}</time>
                                                </div>
                                                <p className="text-sm text-slate-600 mb-4 font-medium">{order.items}</p>

                                                {/* Visual tracker */}
                                                <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                    <div className="flex justify-between items-center relative before:absolute before:top-1/2 before:left-0 before:right-0 before:-translate-y-1/2 before:h-1 before:bg-slate-200">
                                                        {['confirmed', 'packed', 'shipping', 'delivered'].map((step, i, arr) => {
                                                            const isPast = arr.indexOf(order.status) >= i;
                                                            const isActive = order.status === step;
                                                            return (
                                                                <div key={step} className={`z-10 flex flex-col items-center gap-1 ${isPast ? 'text-emerald-500' : 'text-slate-300'}`}>
                                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-white border-2 text-[10px] shadow-sm ${isPast ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300'} ${isActive && 'animate-pulse'}`}>
                                                                        {step === 'confirmed' && <CheckCircle size={10} />}
                                                                        {step === 'packed' && <Package size={10} />}
                                                                        {step === 'shipping' && <Truck size={10} />}
                                                                        {step === 'delivered' && <Home size={10} />}
                                                                    </div>
                                                                    <span className="text-[9px] font-bold uppercase tracking-wider">{step}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Timeline Item 1 */}
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-500 text-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform hover:scale-110">
                                            <Calendar size={16} />
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-[28px] bg-white border border-slate-100 shadow-sm hover:shadow-[0_8px_30px_rgba(37,99,235,0.12)] transition-shadow">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-bold text-slate-800 text-lg">Dr. Sarah Jenkins</h4>
                                                <time className="text-sm font-medium tracking-wide text-blue-600">Oct 12, 2025</time>
                                            </div>
                                            <p className="text-sm text-slate-500 mb-4">General checkup and flu consultation. Prescribed Amoxicillin.</p>
                                            <div className="flex gap-2">
                                                <GlassButton variant="secondary" className="px-3 py-1.5 text-xs text-blue-700 bg-blue-50 border-blue-100"><FileText size={12} className="mr-1" /> Notes</GlassButton>
                                                <GlassButton variant="secondary" className="px-3 py-1.5 text-xs text-amber-600 bg-amber-50 border-amber-100" onClick={() => setRatingModal({ open: true, doctorId: 'mock1', doctorName: 'Sarah Jenkins', rating: 0, review: '' })}><Star size={12} className="mr-1" /> Rate Doctor</GlassButton>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline Item 2 */}
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-300 text-slate-50 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                            <Pill size={16} />
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-[28px] bg-white border border-slate-100 shadow-sm opacity-70">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-bold text-slate-800 text-lg">Dr. Michael Chen</h4>
                                                <time className="text-sm font-medium tracking-wide text-slate-500">Aug 05, 2025</time>
                                            </div>
                                            <p className="text-sm text-slate-500 mb-4">Dermatology consultation for skin rash.</p>
                                            <div className="flex gap-2">
                                                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold px-2 py-1 bg-amber-50 rounded-full border border-amber-100">
                                                    <Star size={12} fill="currentColor" /> 5.0 Rated
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>

                            {/* Rating Modal */}
                            <AnimatePresence>
                                {ratingModal.open && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm p-6 text-center">
                                            <h3 className="text-xl font-bold text-slate-800 mb-2">Rate your visit</h3>
                                            <p className="text-sm text-slate-500 mb-6">How was your consultation with Dr. {ratingModal.doctorName}?</p>

                                            <div className="flex justify-center gap-2 mb-6">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <button key={star} onClick={() => setRatingModal({ ...ratingModal, rating: star })} className={`transition-all duration-200 hover:scale-110 ${ratingModal.rating >= star ? 'text-amber-400 drop-shadow-sm' : 'text-slate-200'}`}>
                                                        <Star size={36} fill={ratingModal.rating >= star ? 'currentColor' : 'none'} strokeWidth={ratingModal.rating >= star ? 0 : 2} />
                                                    </button>
                                                ))}
                                            </div>

                                            <textarea
                                                className="w-full bg-slate-50 border border-slate-200 rounded-[28px] p-4 text-sm mb-6 focus:ring-2 focus:ring-amber-400 outline-none resize-none h-24"
                                                placeholder="Leave a review (optional)..."
                                                value={ratingModal.review}
                                                onChange={(e) => setRatingModal({ ...ratingModal, review: e.target.value })}
                                            />

                                            <div className="flex gap-3">
                                                <GlassButton variant="secondary" className="flex-1" onClick={() => setRatingModal({ ...ratingModal, open: false })}>Cancel</GlassButton>
                                                <GlassButton className="flex-1 bg-amber-500 hover:bg-amber-600 shadow-amber-500/30 border-amber-400 border text-white" disabled={ratingModal.rating === 0} onClick={() => setRatingModal({ ...ratingModal, open: false })}>Submit</GlassButton>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div >

            {/* PDF View Modal Overlay */}
            <AnimatePresence>
                {/* Modal rendering logic kept internally by PatientDashboard or handled locally */}
            </AnimatePresence>

            {/* LIVE VIDEO CONSULTATION MODAL */}
            {
                inCall && (
                    <VideoConsultation
                        doctorName={selectedDoctor?.name || 'Doctor'}
                        onEndCall={() => setInCall(false)}
                    />
                )
            }

            {/* Cancel Modal */}
            <AnimatePresence>
                {cancelModal.open && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm pointer-events-auto">
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-[32px] shadow-2xl w-full max-w-md p-6 overflow-hidden relative">
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-400 to-rose-500 rounded-t-[32px]"></div>
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-slate-800">Cancel Appointment</h3>
                                <button onClick={() => setCancelModal({ open: false, aptId: null })} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <p className="text-sm text-slate-600 mb-6">Are you sure you want to cancel this appointment? This action cannot be undone.</p>
                            <div className="flex gap-3 mt-8">
                                <GlassButton variant="secondary" className="flex-1" onClick={() => setCancelModal({ open: false, aptId: null })}>Keep it</GlassButton>
                                <GlassButton className="flex-1 bg-red-500 hover:bg-red-600 shadow-red-500/30 border-red-400 border text-white" onClick={handleCancelAppointment}>Yes, Cancel</GlassButton>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reschedule Modal */}
            <AnimatePresence>
                {rescheduleModal.open && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm pointer-events-auto">
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg p-6 overflow-hidden relative">
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-t-[32px]"></div>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800">Reschedule Appointment</h3>
                                    <p className="text-sm text-slate-500 mt-1">Select a new time slot with Dr. {rescheduleModal.apt?.doctorName}</p>
                                </div>
                                <button onClick={() => setRescheduleModal({ open: false, apt: null, newSlot: '' })} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 mb-2 pl-1">Available Time Slots</label>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-48 overflow-y-auto p-2 -mx-2 hide-scrollbar">
                                    {availableSlots.length === 0 ? (
                                        <div className="col-span-full py-4 text-center text-sm font-medium text-slate-500 bg-slate-50 rounded-[20px]">No slots available today.</div>
                                    ) : (
                                        availableSlots.map(slot => {
                                            const isRecommended = slot === recommendedSlot;
                                            return (
                                                <button
                                                    key={slot}
                                                    onClick={() => setRescheduleModal({ ...rescheduleModal, newSlot: slot })}
                                                    className={`relative text-sm py-3 rounded-[20px] transition-all font-medium ${rescheduleModal.newSlot === slot ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 transform scale-105 border-transparent' : isRecommended ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 mt-2' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'}`}
                                                    style={{ borderWidth: '1px' }}
                                                >
                                                    {isRecommended && <span className="absolute -top-[14px] left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm tracking-wider font-bold">SUGGESTED</span>}
                                                    {slot}
                                                </button>
                                            )
                                        })
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <GlassButton variant="secondary" className="flex-1" onClick={() => setRescheduleModal({ open: false, apt: null, newSlot: '' })}>Back</GlassButton>
                                <GlassButton className="flex-1 bg-blue-600 hover:bg-blue-700 shadow-blue-500/30 border-blue-500 border text-white" disabled={!rescheduleModal.newSlot} onClick={handleReschedule}>Confirm New Time</GlassButton>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <FloatingAssistant />
        </main >
    );
};
