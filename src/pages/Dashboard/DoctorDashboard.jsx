import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Clock, Pill, FileText, Video, Plus, CheckCircle,
    Search, MessageCircle, Send, X, BarChart3, TrendingUp,
    Check, Info, DollarSign, Activity, Star, Calendar, CalendarX,
    ChevronRight, Zap, Brain, Shield, UserCheck, Loader2
} from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import { useAppContext } from '../../AppContext';
import { useToast } from '../../components/ui/ToastNotification';
import API from '../../api';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatCard from '../../components/ui/StatCard';
import EmptyState from '../../components/ui/EmptyState';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import VideoConsultation from '../../components/ui/VideoConsultation';

const COMPLETION_COLORS = ['#1a6fc4', '#e8f1fb'];

const DoctorDashboard = () => {
    const { data, currentUser, fetchData, loadingDb } = useAppContext();
    const toast = useToast();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('waiting');
    const [inCall, setInCall] = useState(false);
    const [currentPatient, setCurrentPatient] = useState(null);
    const [isAISummarizing, setIsAISummarizing] = useState(false);
    const [prescriptionForm, setPrescriptionForm] = useState([]);
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [rxStep, setRxStep] = useState(1);
    const [medInput, setMedInput] = useState('');

    const [localDoctorAppointments, setLocalDoctorAppointments] = useState([]);
    
    // Filtering states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState('Today');

    // Fix 1: Appointments not loading
    useEffect(() => {
        const fetchDoctorAppointments = async () => {
            try {
                const res = await API.get(`/appointments/doctor/${currentUser.id}`);
                setLocalDoctorAppointments(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error('Failed to fetch doctor appointments', err);
            }
        };
        if (currentUser?.id) fetchDoctorAppointments();
    }, [currentUser?.id]);

    // Redirect handler
    useEffect(() => {
        if (!currentUser) navigate('/login');
        if (currentUser && currentUser.role?.toUpperCase() !== 'DOCTOR') navigate('/dashboard');
    }, [currentUser, navigate]);

    // Fix 2: Stats cards derive from localDoctorAppointments
    // Normalize today's date in multiple formats for robust comparison
    const todayDate = new Date();
    const todayDDMMYYYY = todayDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
    }).replace(/\//g, '/'); // "08/04/2026"
    
    const todayISO = todayDate.toISOString().split('T')[0]; // "2026-04-08"
    
    const isToday = (dateStr) => {
        if (!dateStr) return false;
        const d = dateStr.trim();
        // Match dd/MM/yyyy
        if (d === todayDDMMYYYY) return true;
        // Match yyyy-MM-dd
        if (d === todayISO) return true;
        // Match MM/dd/yyyy  
        const parts = d.split('/');
        if (parts.length === 3) {
            const [a, b, c] = parts;
            // Try dd/MM/yyyy parse
            const asDate1 = new Date(`${c}-${b}-${a}`);
            if (!isNaN(asDate1) && asDate1.toISOString().split('T')[0] === todayISO) return true;
            // Try MM/dd/yyyy parse  
            const asDate2 = new Date(`${c}-${a}-${b}`);
            if (!isNaN(asDate2) && asDate2.toISOString().split('T')[0] === todayISO) return true;
        }
        return false;
    };
    
    const todaysAppointments = localDoctorAppointments.filter(a => isToday(a.appointmentDate));
    const todaysPatients = todaysAppointments.length;

    // ALL pending appointments (for the waiting room — shows full queue, not just today)
    const pendingAppointments = localDoctorAppointments.filter(a => 
        a.status?.toUpperCase() === 'PENDING');
    const pending = pendingAppointments.length;

    const completed = localDoctorAppointments.filter(a => 
        a.status?.toUpperCase() === 'COMPLETED').length;

    // Derived states
    const myPrescriptions = useMemo(() => {
        return (data.prescriptions || []).filter(p => String(p.doctorId) === String(currentUser?.id));
    }, [data.prescriptions, currentUser?.id]);

    // Fix 4: Appointments tab — grouped list
    const groupedAppointments = useMemo(() => {
        let filtered = localDoctorAppointments;
        if (searchQuery) {
            filtered = filtered.filter(a => (a.patientName || '').toLowerCase().includes(searchQuery.toLowerCase()));
        }
        if (statusFilter !== 'All') {
            filtered = filtered.filter(a => (a.status || '').toUpperCase() === statusFilter.toUpperCase());
        }
        if (dateFilter === 'Today') {
            filtered = filtered.filter(a => isToday(a.appointmentDate));
        } else if (dateFilter === 'This Week') {
            // Primitive this week filter: just showing ALL for now or could parse en-GB
            // For simplicity, we just keep all if This Week unless parsed cleanly.
            // Let's implement real parsing:
            filtered = filtered.filter(a => {
                if (!a.appointmentDate) return false;
                const [d,m,y] = a.appointmentDate.split('/');
                const appDate = new Date(`${y}-${m}-${d}`);
                const now = new Date();
                const weekFromNow = new Date();
                weekFromNow.setDate(now.getDate() + 7);
                return appDate >= now && appDate <= weekFromNow;
            });
        }
        
        const groups = {};
        const tomorrowDate = new Date(); tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        const tomorrow = tomorrowDate.toLocaleDateString('en-GB');

        filtered.forEach(apt => {
            let label = apt.appointmentDate;
            if (isToday(apt.appointmentDate)) label = "Today";
            else if (apt.appointmentDate === tomorrow) label = "Tomorrow";
            if (!groups[label]) groups[label] = [];
            groups[label].push(apt);
        });

        Object.values(groups).forEach(arr => {
            arr.sort((a,b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));
        });
        
        const sortedKeys = Object.keys(groups).sort((a, b) => {
            if (a === 'Today') return -1;
            if (b === 'Today') return 1;
            if (a === 'Tomorrow') return -1;
            if (b === 'Tomorrow') return 1;
            return a.localeCompare(b);
        });

        return sortedKeys.map(k => ({ label: k, items: groups[k] }));
    }, [localDoctorAppointments, searchQuery, statusFilter, dateFilter, todayISO]);

    // Fix 5: Patients tab
    const uniquePatients = useMemo(() => {
        return [...new Map(
            localDoctorAppointments.map(a => [a.patientId, {
                id: a.patientId,
                name: a.patientName,
                phone: a.patientPhone,
                lastVisit: a.appointmentDate
            }])
        ).values()];
    }, [localDoctorAppointments]);

    const handleMarkComplete = async (aptId) => {
        try {
            await API.put(`/appointments/${aptId}/status`, { status: 'COMPLETED' });
            toast.success('Success', 'Appointment marked as completed.');
            
            setLocalDoctorAppointments(prev => prev.map(a => 
                a.id === aptId ? { ...a, status: 'COMPLETED' } : a
            ));
        } catch(err) {
            toast.error('Error', 'Failed to update appointment status.');
        }
    };

    const handleStartConsultation = (apt) => {
        setCurrentPatient(apt);
        setInCall(true);
    };

    const handleEndConsultation = () => {
        setInCall(false);
        setShowPrescriptionModal(true);
    };

    const handleAISummarize = () => {
        setIsAISummarizing(true);
        setTimeout(() => {
            setIsAISummarizing(false);
            toast.success('AI Summary', 'Patient has a history of seasonal allergies and mild hypertension. Recent reports show normal vitals but low Vitamin D.');
        }, 2000);
    };

    const handleSendPrescription = async () => {
        if (!currentPatient) return;
        const validMeds = prescriptionForm.filter(m => m.name !== '');
        if (validMeds.length === 0) return;

        try {
            for (const med of validMeds) {
                await API.post(`/prescriptions`, {
                    patient_id: currentPatient.patientId,
                    doctor_id: currentUser.id,
                    medication_name: med.name,
                    dosage: med.dosage,
                    frequency: med.quantity,
                    duration: '7 days',
                    notes: '',
                });
            }

            await API.put(`/appointments/${currentPatient.id}/status`, { status: 'completed' });

            fetchData();
            setPrescriptionForm([{ name: '', dosage: '', quantity: '' }]);
            setCurrentPatient(null);
            setShowPrescriptionModal(false);
            setActiveTab('waiting');
        } catch (err) {
            console.error('Prescription error:', err);
        }
    };

    // Doctor Earnings (inline)
    const [earningsData, setEarningsData] = useState({ total_earnings: 0, history: [] });
    useEffect(() => {
        if (activeTab !== 'earnings' || !currentUser?.id) return;
        const fetchEarnings = async () => {
            try {
                const res = await API.get(`/doctor/earnings/${currentUser.id}`);
                setEarningsData(res.data || { total_earnings: 0, history: [] });
            } catch (err) {
                console.warn('Earnings fetch failed silently:', err.message);
                setEarningsData({ total_earnings: 0, history: [] });
            }
        };
        fetchEarnings();
    }, [activeTab, currentUser?.id]);

    if (loadingDb) {
        return (
            <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
                <div className="flex items-center justify-center h-64">
                    <Loader2 size={32} className="text-[var(--color-primary)] animate-spin" />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            <AnimatePresence mode="wait">
                {/* ─── WAITING ROOM ─── */}
                {activeTab === 'waiting' && (
                    <motion.div key="waiting" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                                    <span className="font-normal text-slate-500">{new Date().getHours() < 12 ? 'Good morning,' : new Date().getHours() < 18 ? 'Good afternoon,' : 'Good evening,'}</span> <span className="font-bold text-slate-800">Dr. {currentUser?.name?.split(' ')[0]}</span>
                                </h2>

                        {/* Stats */}
                        {/* Stats Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                            {[
                                { title: "Today's Patients", value: todaysPatients, color: "from-blue-500 to-indigo-600", iconColor: "text-blue-600", bgIcon: "bg-blue-100", icon: Users, subtitle: "Total unique patients" },
                                { title: "Pending", value: pending, color: "from-amber-400 to-orange-500", iconColor: "text-amber-600", bgIcon: "bg-amber-100", icon: Clock, subtitle: "In waiting room" },
                                { title: "Completed", value: completed, color: "from-emerald-400 to-teal-500", iconColor: "text-emerald-600", bgIcon: "bg-emerald-100", icon: CheckCircle, subtitle: "Consultations finished" },
                                { title: "Total Earnings", value: `₹${(completed * 500).toLocaleString()}`, color: "from-indigo-500 to-purple-600", iconColor: "text-indigo-600", bgIcon: "bg-indigo-100", icon: DollarSign, subtitle: "Today's revenue" },
                            ].map((stat, i) => (
                                <motion.div 
                                    key={i} 
                                    whileHover={{ scale: 1.02 }} 
                                    className="relative overflow-hidden rounded-2xl p-5 shadow-sm border border-white/40 bg-white/60 backdrop-blur-xl transition-all"
                                >
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.title}</p>
                                            <h3 className={`text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r ${stat.color} pb-1`}>
                                                {stat.value}
                                            </h3>
                                            <p className="text-[10px] text-slate-400 mt-1 font-semibold">{stat.subtitle}</p>
                                        </div>
                                        <div className={`w-12 h-12 rounded-full ${stat.bgIcon} flex items-center justify-center shrink-0 shadow-inner`}>
                                            <stat.icon size={22} className={stat.iconColor} />
                                        </div>
                                    </div>
                                    <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${stat.color} opacity-10 blur-2xl`}></div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Today's Patients Row */}
                        <div className="space-y-4">
                            <h3 className="text-base font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                                <Users size={18} className="text-blue-600" /> Today's Patients <span className="text-xs bg-blue-100 text-blue-700 px-2 rounded-full font-bold">{todaysPatients}</span>
                            </h3>
                            {todaysAppointments.length === 0 ? (
                                <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 text-center flex flex-col items-center">
                                    <CalendarX className="text-gray-400 mb-2" size={32} />
                                    <p className="text-sm font-bold text-gray-400">No patients scheduled for today</p>
                                </div>
                            ) : (
                                <div className="flex overflow-x-auto pb-4 gap-4 snap-x hide-scrollbar">
                                    {todaysAppointments.map((apt) => (
                                        <div key={apt.id} className="min-w-[240px] bg-white border border-slate-100 rounded-2xl p-4 shadow-sm snap-start hover:-translate-y-1 transition-transform group">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-50 text-blue-600 rounded-full flex items-center justify-center font-bold shadow-sm shrink-0">
                                                    {apt.patientName?.charAt(0) || 'P'}
                                                </div>
                                                <div className="truncate">
                                                    <p className="font-bold text-[var(--color-text-primary)] truncate">{apt.patientName}</p>
                                                    <p className="text-[10px] text-slate-500 font-semibold">{apt.patientPhone || 'No phone'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 shrink-0">
                                                    <Clock size={12} /> {apt.startTime} - {apt.endTime}
                                                </span>
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0 ${apt.status?.toUpperCase() === 'PENDING' ? 'bg-amber-50 text-amber-600' : (apt.status?.toUpperCase()==='COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600')}`}>
                                                    {apt.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Waiting Queue */}
                        <Card>
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                                    <Clock size={18} className="text-amber-600" /> Waiting Room
                                </h3>
                                {pendingAppointments.length === 0 ? (
                                    <EmptyState icon={Users} title="No patients waiting" description="Your schedule is clear for now." />
                                ) : (
                                    <div className="relative border-l-2 border-blue-100 pl-6 ml-14 space-y-6 mt-4">
                                        <div className="absolute top-1/3 -left-[5px] w-[calc(100%+30px)] flex items-center z-10 pointer-events-none">
                                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                            <div className="h-[2px] bg-red-500/50 flex-1 ml-1 rounded-full"></div>
                                            <span className="text-[10px] bg-red-50 text-red-600 px-2 rounded-full absolute -top-2 right-0 font-bold border border-red-100 backdrop-blur-md">Current Time</span>
                                        </div>
                                        {pendingAppointments.map((apt, i) => (
                                        <div key={apt.id} className="relative group">
                                            <div className="absolute -left-[31.5px] top-4 w-3.5 h-3.5 bg-white border-2 border-blue-500 rounded-full shadow-sm"></div>
                                            <div className="absolute -left-[68px] top-3 w-10 text-right">
                                                <span className="text-xs font-extrabold text-slate-500">{apt.startTime ? apt.startTime.slice(0,5) : '10:00'}</span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white hover:bg-blue-50/30 shadow-sm hover:shadow-md transition-all rounded-2xl border border-slate-100">
                                                <div className="flex items-start gap-4 max-w-[65%]">
                                                    <div className="w-10 h-10 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-full flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
                                                        {apt.patientName?.charAt(0) || 'P'}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-bold text-slate-800 truncate">{apt.patientName}</p>
                                                            <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-200 shrink-0">
                                                                <Clock size={10} /> Pending
                                                            </span>
                                                        </div>
                                                        <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{apt.appointmentDate} · {apt.patientPhone || 'No phone'}</p>
                                                        <p className="text-[11px] font-medium text-slate-500 mt-1.5 truncate italic border-l-2 border-slate-200 pl-2" title={apt.problemDescription || 'No description provided'}>
                                                            {apt.problemDescription || 'General Checkup Consultation'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 mt-4 sm:mt-0 shrink-0">
                                                    <Button variant="ghost" size="sm" icon={Brain} loading={isAISummarizing} onClick={handleAISummarize} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Summarize
                                                    </Button>
                                                    <Button size="sm" icon={Video} onClick={() => handleStartConsultation(apt)}>
                                                        Start Call
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* ─── APPOINTMENTS MASTER TAB ─── */}
                {activeTab === 'appointments' && (
                    <motion.div key="appointments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Appointments</h2>
                            <div className="flex flex-wrap gap-3 w-full md:w-auto">
                                <div className="relative flex-1 md:w-64">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Search patients..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all bg-white"
                                    />
                                </div>
                                <select 
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none bg-white text-slate-700 font-medium"
                                >
                                    <option value="All">All Status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                                <select 
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none bg-white text-slate-700 font-medium"
                                >
                                    <option value="All">All Time</option>
                                    <option value="Today">Today</option>
                                    <option value="This Week">This Week</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {groupedAppointments.length === 0 ? (
                                <EmptyState icon={Calendar} title="No appointments found" description="Try adjusting your filters or search query." />
                            ) : (
                                groupedAppointments.map((group, gIdx) => (
                                    <div key={gIdx} className="space-y-4">
                                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-2 border-l-2 border-[var(--color-primary)]">{group.label}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                            {group.items.map(apt => (
                                                <div key={apt.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden flex flex-col h-full">
                                                    <div className={`absolute top-0 left-0 w-1 h-full ${apt.status?.toUpperCase()==='COMPLETED'?'bg-emerald-400':(apt.status?.toUpperCase()==='PENDING'?'bg-amber-400':'bg-red-400')}`}></div>
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-full flex items-center justify-center font-bold shadow-sm shrink-0">
                                                                {apt.patientName?.charAt(0) || 'P'}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-800 leading-tight">{apt.patientName}</p>
                                                                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{apt.patientPhone || 'No phone'}</p>
                                                            </div>
                                                        </div>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${apt.status?.toUpperCase()==='COMPLETED'?'bg-emerald-50 text-emerald-600 border border-emerald-100':(apt.status?.toUpperCase()==='PENDING'?'bg-amber-50 text-amber-600 border border-amber-100':'bg-red-50 text-red-600 border border-red-100')}`}>
                                                            {apt.status}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="bg-slate-50 rounded-xl p-3 mb-4 flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Clock size={12} className="text-slate-400" />
                                                            <span className="text-xs font-bold text-slate-600">{apt.startTime} - {apt.endTime}</span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-500 font-medium line-clamp-2" title={apt.problemDescription || 'No description'}>
                                                            <span className="font-bold text-slate-600 mr-1">Reason:</span>
                                                            {apt.problemDescription || 'General Checkup Consultation'}
                                                        </p>
                                                    </div>

                                                    <div className="mt-auto">
                                                        {(apt.status?.toUpperCase() === 'PENDING') ? (
                                                            <div className="flex gap-2">
                                                                <Button variant="secondary" size="sm" icon={CheckCircle} onClick={() => handleMarkComplete(apt.id)} className="w-full justify-center !py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-100">
                                                                    Mark Complete
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <button disabled className="w-full py-2 bg-slate-50 text-slate-400 rounded-xl text-xs font-bold uppercase cursor-not-allowed">
                                                                {apt.status}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ─── PATIENTS TAB ─── */}
                {activeTab === 'patients' && (
                    <motion.div key="patients" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">My Patients</h2>
                        <Card className="!p-0 overflow-hidden">
                            <Table
                                columns={[
                                    { header: 'Patient', render: (row) => (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                                                {row.patientName?.charAt(0) || 'P'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-[var(--color-text-primary)]">{row.patientName}</span>
                                            </div>
                                        </div>
                                    )},
                                    { header: 'Phone', render: (row) => <span className="text-sm font-semibold text-slate-500">{row.patientPhone || 'N/A'}</span> },
                                    { header: 'Last Visit', render: (row) => <span className="text-sm text-slate-600 font-medium">{row.appointmentDate || 'N/A'}</span> },
                                    { header: 'Visits', render: (row) => (
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold text-xs ring-4 ring-white shadow-sm">
                                            {localDoctorAppointments.filter(a => a.patientId === row.patientId).length}
                                        </div>
                                    )},
                                ]}
                                data={uniquePatients}
                                emptyMessage="No patients found"
                                emptyIcon={Users}
                            />
                        </Card>
                    </motion.div>
                )}

                {/* ─── PRESCRIPTIONS TAB ─── */}
                {activeTab === 'prescriptions' && (
                    <motion.div key="prescriptions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Sent Prescriptions</h2>
                        <Card className="!p-0 overflow-hidden">
                            <Table
                                columns={[
                                    { header: 'Patient', render: (row) => <span className="font-medium text-[var(--color-text-primary)]">{row.patientName}</span> },
                                    { header: 'Medication', render: (row) => row.medicines?.map(m => m.name).join(', ') || 'N/A' },
                                    { header: 'Date', accessor: 'date' },
                                    { header: 'Status', render: (row) => (
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                            row.status === 'ready' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                            {row.status}
                                        </span>
                                    )},
                                ]}
                                data={myPrescriptions}
                                emptyMessage="No prescriptions sent yet"
                                emptyIcon={FileText}
                            />
                        </Card>
                    </motion.div>
                )}

                {/* ─── EARNINGS TAB ─── */}
                {activeTab === 'earnings' && (
                    <motion.div key="earnings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Earnings Overview</h2>
                        <div className="grid grid-cols-12 gap-6">
                            <Card className="col-span-12 lg:col-span-4 flex flex-col justify-between py-6 relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100/50">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400 opacity-10 rounded-bl-full pointer-events-none"></div>
                                <div className="z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                                            <DollarSign size={24} />
                                        </div>
                                        <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full flex items-center gap-1">
                                            <TrendingUp size={12} /> +12.5% MT
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Total Earnings</p>
                                    <p className="text-4xl font-extrabold text-slate-800">₹{earningsData.total_earnings?.toLocaleString() || '0'}</p>
                                </div>

                                {/* Custom Pure CSS Mini Bar Chart */}
                                <div className="z-10 mt-8">
                                    <div className="flex items-end justify-between h-20 gap-2">
                                        {[40, 70, 45, 90, 60].map((val, i) => (
                                            <div key={i} className="w-full flex-1 flex flex-col items-center gap-1">
                                                <div className="w-full bg-emerald-100 rounded-t-md relative group">
                                                    <div className="absolute bottom-0 w-full bg-emerald-400 rounded-t-md transition-all duration-500" style={{ height: `${val}%` }}></div>
                                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded font-bold transition-opacity z-20">₹{val * 50}</div>
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-bold">{['Mon','Tue','Wed','Thu','Fri'][i]}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                            <Card className="col-span-12 lg:col-span-8 !p-0 overflow-hidden">
                                <div className="p-6 pb-2">
                                    <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Consultation History</h3>
                                </div>
                                <Table
                                    columns={[
                                        { header: 'Date', render: (row) => new Date(row.consultation_date).toLocaleDateString() },
                                        { header: 'Patient ID', accessor: 'patient_id' },
                                        { header: 'Notes', render: (row) => <span className="truncate block max-w-[200px]">{row.notes || 'N/A'}</span> },
                                        { header: 'Fee', align: 'right', render: (row) => <span className="font-semibold text-[var(--color-primary)]">₹{row.fee || 0}</span> },
                                    ]}
                                    data={earningsData.history || []}
                                    emptyMessage="No earnings data yet"
                                    emptyIcon={DollarSign}
                                />
                            </Card>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Prescription Modal */}
            <Modal isOpen={showPrescriptionModal} onClose={() => { setShowPrescriptionModal(false); setRxStep(1); setPrescriptionForm([]); }} title="Write Prescription" size="md">
                <div className="space-y-6">
                    {/* Stepper Header */}
                    <div className="flex items-center justify-between mb-4 relative before:absolute before:top-1/2 before:left-0 before:w-full before:h-0.5 before:bg-slate-100 before:-z-10">
                        {[{s:1, l:'Patient'}, {s:2, l:'Medicines'}, {s:3, l:'Review'}].map(step => (
                            <div key={step.s} className="flex flex-col items-center gap-1 bg-white px-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${rxStep >= step.s ? 'bg-[var(--color-primary)] text-white shadow-md ring-4 ring-blue-50' : 'bg-slate-100 text-slate-400'}`}>
                                    {rxStep > step.s ? <CheckCircle size={14} /> : step.s}
                                </div>
                                <span className={`text-[10px] font-bold ${rxStep >= step.s ? 'text-[var(--color-primary)]' : 'text-slate-400'}`}>{step.l}</span>
                            </div>
                        ))}
                    </div>

                    {/* Step 1 */}
                    {rxStep === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <label className="text-sm font-bold text-[var(--color-text-primary)]">Select Patient</label>
                            <div className="border border-[var(--color-primary-light)] bg-blue-50/50 p-4 rounded-2xl flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-[var(--color-primary)] shadow-sm">
                                    {currentPatient?.patientName?.charAt(0) || 'P'}
                                </div>
                                <div>
                                    <h4 className="font-bold text-[var(--color-text-primary)]">{currentPatient?.patientName || 'Loading...'}</h4>
                                    <p className="text-xs text-[var(--color-text-secondary)]">{currentPatient?.timeSlot}</p>
                                </div>
                            </div>
                            <Button className="w-full mt-4" onClick={() => setRxStep(2)}>Continue to Medicines</Button>
                        </div>
                    )}

                    {/* Step 2 */}
                    {rxStep === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <label className="text-sm font-bold text-[var(--color-text-primary)]">Add Instructions (Press Enter to add)</label>
                            <input
                                placeholder="E.g. Paracetamol 500mg 1-0-1"
                                className="w-full px-4 py-3 input-field focus:input-field-focus text-sm"
                                value={medInput}
                                onChange={(e) => setMedInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && medInput.trim()) {
                                        e.preventDefault();
                                        setPrescriptionForm(prev => [...prev, { name: medInput.trim(), dosage: 'As prescribed', quantity: '1 strip' }]);
                                        setMedInput('');
                                    }
                                }}
                            />
                            <div className="flex flex-wrap gap-2 mt-2 min-h-[60px] p-3 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                                {prescriptionForm.length === 0 ? (
                                    <span className="text-xs text-slate-400 m-auto">No medicines added yet</span>
                                ) : (
                                    prescriptionForm.map((med, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                                            <Pill size={12} /> {med.name}
                                            <button onClick={() => setPrescriptionForm(p => p.filter((_, idx) => idx !== i))} className="hover:bg-blue-200 p-0.5 rounded-full transition-colors"><X size={12} /></button>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button variant="secondary" onClick={() => setRxStep(1)}>Back</Button>
                                <Button className="flex-1" onClick={() => setRxStep(3)} disabled={prescriptionForm.length === 0}>Review Prescription</Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3 */}
                    {rxStep === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <h4 className="text-sm font-bold text-[var(--color-text-primary)] mb-4 flex items-center justify-between border-b pb-2">
                                    Final Review
                                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{prescriptionForm.length} Items</span>
                                </h4>
                                <ul className="space-y-2">
                                    {prescriptionForm.map((med, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                                            <Check size={14} className="text-emerald-500" /> {med.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="secondary" onClick={() => setRxStep(2)}>Edit</Button>
                                <Button className="flex-1" icon={Send} onClick={() => { handleSendPrescription(); setRxStep(1); setShowPrescriptionModal(false); }}>Confirm & Send</Button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Video Consultation */}
            {inCall && <VideoConsultation onExit={handleEndConsultation} />}
        </AppLayout>
    );
};

export default DoctorDashboard;
