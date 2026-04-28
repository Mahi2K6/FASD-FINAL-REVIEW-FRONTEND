import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Calendar, Pill, FileText, User,
    ChevronRight, Star, Clock, MapPin, Phone, MessageSquare,
    Filter, ArrowRight, Video, CheckCircle, Download, FilePlus,
    Activity, Shield, Heart, Plus, Minus, ShoppingBag,
    AlertCircle, Loader2, CalendarPlus, DownloadCloud, Smartphone,
    Building2, CreditCard, Wallet, Banknote, Lock, Trash2,
    Stethoscope, Thermometer, Brain, Zap, History, HeartPulse,
    TrendingUp, Award, Droplets, Info, Send, X, UploadCloud
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useAppContext } from '../../AppContext';
import API from '../../api';
import { useNavigate, useLocation } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatCard from '../../components/ui/StatCard';
import EmptyState from '../../components/ui/EmptyState';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import PatientPrescriptions from '../Prescriptions/PatientPrescriptions';
import PatientRatingModal from '../../components/ui/PatientRatingModal';


import { useToast } from '../../components/ui/ToastNotification';

// Auto-redirect helper for success screen
const AutoRedirect = ({ onRedirect, delay = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(onRedirect, delay);
        return () => clearTimeout(timer);
    }, []);
    return (
        <p className="text-[10px] text-center text-[var(--color-text-secondary)] mt-4 animate-pulse">
            Redirecting to appointments...
        </p>
    );
};

const PatientDashboard = () => {
    const { data, currentUser, logout, fetchData, updateData, loadingDb, setIsAIPanelOpen } = useAppContext();
    const navigate = useNavigate();
    const toast = useToast();

    const location = useLocation();
    
    // Derive activeTab from the URL path instead of isolated state
    // Handles both /dashboard and /patient-dashboard base paths
    const pathSegment = location.pathname.split('/').pop();
    const activeTab = (() => {
        if (pathSegment === 'find-doctors') return 'doctors';
        if (['overview', 'doctors', 'appointments', 'prescriptions', 'records'].includes(pathSegment)) return pathSegment;
        return 'overview'; // fallback for /dashboard, /patient-dashboard, or any unknown sub-path
    })();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('All');
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [bookingStep, setBookingStep] = useState('select');
    const [bookingDetails, setBookingDetails] = useState({ problem: '' });

    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [isBooking, setIsBooking] = useState(false);
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [directDoctors, setDirectDoctors] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [slots, setSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [localAppointments, setLocalAppointments] = useState([]);
    const [appointmentsLoading, setAppointmentsLoading] = useState(true);
    const [consultationFee] = useState(500);
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [upiDetails, setUpiDetails] = useState({ id: '', app: '' });
    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
    const [selectedBank, setSelectedBank] = useState('');
    const bookingRef = useRef(false);
    
    // ── Rating Modal State ──
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [ratingAppointment, setRatingAppointment] = useState(null);

    const BOOKING_STEPS = [
        { key: 'select', label: 'Doctor' },
        { key: 'slot', label: 'Schedule' },
        { key: 'payment', label: 'Payment' },
        { key: 'success', label: 'Confirmed' },
    ];

    const specialties = ['All', 'Cardiology', 'Neurology', 'Pediatrics', 'Dermatology', 'General Medicine', 'Orthopedics'];

    const myPrescriptions = useMemo(() => {
        return (data.prescriptions || []).filter(p => String(p.patientId) === String(currentUser?.id));
    }, [data.prescriptions, currentUser?.id]);

    // Dedicated doctor fetch as safety net — if context has no doctors, fetch directly
    useEffect(() => {
        const loadDoctors = async () => {
            try {
                const res = await API.get('/users/doctors');
                const docs = (res.data || []).map(d => ({
                    ...d,
                    role: d.role || 'DOCTOR',
                    status: d.status || 'ACTIVE'
                }));
                setDirectDoctors(docs);
            } catch (err) {
                console.warn('Failed to load doctors:', err.message);
                setDirectDoctors([]);
            }
        };
        loadDoctors();
    }, []);

    const doctors = useMemo(() => {
        // Merge: use context data.users first, fall back to directDoctors
        const contextDoctors = (data.users || [])
            .filter(u => u.role?.toUpperCase() === 'DOCTOR' && u.status?.toUpperCase() === 'ACTIVE');
        const source = contextDoctors.length > 0 ? contextDoctors : 
            directDoctors.filter(d => d.status?.toUpperCase() === 'ACTIVE');
        return source.map(d => ({
            ...d,
            rating: 4.0 + Math.random(),
            reviews: Math.floor(Math.random() * 100) + 20,
            availability: { load: Math.random() > 0.5 ? 'High' : 'Low' },
        }));
    }, [data.users, directDoctors]);

    const myAppointments = useMemo(() => {
        // Remove duplicate appointments by id
        const uniqueAppts = [...new Map(localAppointments.map(a => [a.id, a])).values()];
        
        return uniqueAppts
            .filter(a => (a.appointmentDate || a.date || a.selectedDate) && (a.startTime || a.timeSlot))
            .map(a => {
                // cross-reference against doctors array
                const doc = doctors.find(d => String(d.id) === String(a.doctorId));
                return {
                    ...a,
                    id: a.id,
                    slotId: a.slotId,
                    doctorName: doc ? `Dr. ${doc.name}` : `Dr. Unknown`,
                    doctorSpecialty: doc?.specialization || a.doctorSpecialization || '—',
                    doctorAvatar: doc?.profileImageUrl || (doc ? doc.name.charAt(0) : 'D'),
                    date: a.appointmentDate || a.date || a.selectedDate,
                    startTime: a.startTime,
                    endTime: a.endTime,
                    status: a.status
                };
            });
    }, [localAppointments, doctors]);

    const normalizeSpecialty = (specialty) => {
        const value = specialty?.toLowerCase().trim();

        if (
            value === "general medicine" ||
            value === "general physician" ||
            value === "physician"
        ) return "general";

        if (value?.includes("cardio")) return "cardiology";
        if (value?.includes("neuro")) return "neurology";
        if (value?.includes("derma")) return "dermatology";
        if (value?.includes("pedia")) return "pediatrics";
        if (value?.includes("ortho")) return "orthopedics";

        return value;
    };

    const filteredDoctors = useMemo(() => {
        return doctors.filter(d => {
            const matchesSearch = !searchQuery ||
                d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.specialization?.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesSpec = selectedSpecialty === 'All' || 
                normalizeSpecialty(d.specialization) === normalizeSpecialty(selectedSpecialty);
                
            return matchesSearch && matchesSpec;
        });
    }, [doctors, searchQuery, selectedSpecialty]);

    const analytics = useMemo(() => ({
        healthTrend: [
            { name: 'Mon', value: 72 }, { name: 'Tue', value: 78 },
            { name: 'Wed', value: 85 }, { name: 'Thu', value: 82 },
            { name: 'Fri', value: 90 }, { name: 'Sat', value: 88 },
            { name: 'Sun', value: 92 },
        ],
    }), []);

    // Date options for booking (today + 6 days)
    const dateOptions = useMemo(() => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            days.push({
                value: d.toISOString().split('T')[0],
                day: d.toLocaleDateString('en-US', { weekday: 'short' }),
                date: d.getDate(),
                month: d.toLocaleDateString('en-US', { month: 'short' }),
                isToday: i === 0,
            });
        }
        return days;
    }, []);

    // Fetch medical records
    useEffect(() => {
        if (!currentUser?.id) return;
        const fetchRecords = async () => {
            try {
                const res = await API.get(`/medical-records/${currentUser.id}`);
                setMedicalRecords(res.data || []);
            } catch (err) {
                console.warn('medical-records fetch failed silently:', err.message);
                setMedicalRecords([]);
            }
        };
        fetchRecords();
    }, [currentUser?.id]);

    const handleFileUpload = (e) => {
        if (!e.target.files?.[0]) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', e.target.files[0]);
        formData.append('patient_id', currentUser.id);
        formData.append('record_type', 'Lab Report');

        console.log("API Request:", {
            endpoint: '/upload-file',
            method: 'POST',
            payload: formData
        });
        API.post(`/upload-file`, formData)
            .then(res => res.data)
            .then(() => {
                setIsUploading(false);
                API.get(`/medical-records/${currentUser.id}`)
                    .then(r => setMedicalRecords(r.data || []));
            })
            .catch((err) => {
                setIsUploading(false);
                toast.error(err.response?.data?.message || "Upload failed");
            });
    };

    // ─── Centralized Formatters ───

    // Format 24h time ("14:30") to 12h ("2:30 PM"); pass-through if already formatted
    const formatSafeDate = (val) => {
        if (!val) return 'No Date';
        const parsedDate = new Date(val);
        return isNaN(parsedDate.getTime()) ? 'No Date' : parsedDate.toLocaleDateString('en-GB');
    };

    const formatTime = (time) => {
        if (!time) return '';
        if (/AM|PM/i.test(time)) return time;
        const [hour, minute] = time.split(':');
        const h = parseInt(hour, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const formattedHour = h % 12 || 12;
        return `${formattedHour}:${minute} ${ampm}`;
    };



    // Fetch slots from backend (reusable)
    const fetchSlots = async (showLoader = true) => {
        if (!selectedDoctor || !selectedDate) return;
        if (showLoader) setSlotsLoading(true);
        try {
            const res = await API.get(`/slots/${selectedDoctor.id}?date=${selectedDate}`);
            setSlots(res.data || []);
        } catch {
            setSlots([]);
        } finally {
            setSlotsLoading(false);
        }
    };

    // Auto-fetch when entering slot step or changing date/doctor
    useEffect(() => {
        if (bookingStep !== 'slot' || !selectedDoctor || !selectedDate) return;
        setSelectedSlot(null);
        fetchSlots(true);
    }, [selectedDoctor, selectedDate, bookingStep]);

    // Periodic refresh every 10s while on slot step (keeps slots accurate)
    useEffect(() => {
        if (bookingStep !== 'slot' || !selectedDoctor || !selectedDate) return;
        const interval = setInterval(() => fetchSlots(false), 10000);
        return () => clearInterval(interval);
    }, [bookingStep, selectedDoctor?.id, selectedDate]);

    // Dedicated appointments fetch
    const fetchMyAppointments = async () => {
        if (!currentUser?.id) return;
        setAppointmentsLoading(true);
        try {
            const res = await API.get(`/appointments/patient/${currentUser.id}`);
            console.log("Appointments response:", res.data);
            setLocalAppointments(res.data || []);
            if (res.data) updateData('appointments', res.data);
        } catch {
            // Fallback: clear local state on error
            setLocalAppointments([]);
        } finally {
            setAppointmentsLoading(false);
        }
    };

    // ── Real-time Prescription Sync Polling ──
    useEffect(() => {
        if (!currentUser?.id) return;
        
        const pollInterval = setInterval(async () => {
            try {
                const res = await API.get(`/prescriptions`);
                const latestPrescriptions = (res.data || []).filter(p => String(p.patientId) === String(currentUser.id));
                
                if (latestPrescriptions.length > myPrescriptions.length) {
                    toast.success('New Prescription', 'Your doctor has issued a new prescription.');
                    updateData('prescriptions', res.data);
                }
            } catch (err) {
                // fail silently
            }
        }, 15000);

        return () => clearInterval(pollInterval);
    }, [currentUser?.id, myPrescriptions.length, updateData]);

    useEffect(() => {
        fetchMyAppointments();
    }, [currentUser?.id]);

    // ── Catch Rating State from VideoCall ──
    useEffect(() => {
        if (location.state?.showRating && location.state?.appointmentId) {
            if (localAppointments.length > 0) {
                const apt = myAppointments.find(a => String(a.id) === String(location.state.appointmentId));
                if (apt) {
                    setRatingAppointment(apt);
                    setShowRatingModal(true);
                }
                navigate(location.pathname, { replace: true, state: {} });
            }
        }
    }, [location.state, localAppointments, navigate, location.pathname, myAppointments]);

    const handleBookAppointment = async () => {
        if (!selectedSlot || !selectedDoctor || isBooking) return;
        if (bookingRef.current) return;
        bookingRef.current = true;

        if (!selectedSlot?.id) {
            toast.error('Invalid slot. Please reselect.');
            bookingRef.current = false;
            return;
        }

        // Prevent double booking checking against existing appointments' slotId
        const isAlreadyBooked = localAppointments.some(a => 
            String(a.slotId) === String(selectedSlot.id) && String(a.doctorId) === String(selectedDoctor.id)
        );
        if (isAlreadyBooked) {
            toast.error('Double Booking', 'You already have an appointment at this time.');
            bookingRef.current = false;
            return;
        }

        setIsBooking(true);
        setIsProcessingPayment(true);
        try {
            // Artificial 1.5s delay for payment processing UI
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock payment (fire-and-forget)
            try {
                const mockPayload = {
                    doctorId: selectedDoctor.id,
                    patientId: currentUser.id,
                    amount: consultationFee,
                    date: selectedDate,
                    timeSlot: selectedSlot.startTime || selectedSlot.time,
                };
                console.log("API Request:", { endpoint: '/payments/mock', method: 'POST', payload: mockPayload });
                await API.post('/payments/mock', mockPayload);
            } catch { /* optional endpoint */ }

            // Ensure strict string formatting for times
            let sTime = String(selectedSlot.startTime || selectedSlot.time || "09:00:00");
            if (sTime.split(':').length === 2) sTime += ":00"; // Ensure HH:MM:SS
            
            let eTime = String(selectedSlot.endTime || "00:00:00");
            if (eTime === "00:00:00" && sTime !== "00:00:00") {
                // Approximate 30m end time if missing
                const [h, m] = sTime.split(':').map(Number);
                const endM = (m + 30) % 60;
                const endH = h + Math.floor((m + 30) / 60);
                eTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;
            } else if (eTime.split(':').length === 2) {
                eTime += ":00";
            }

            // Book — exact backend contract
            // Sending 'date' and 'time' as plain strings to bypass backend Jackson LocalDate parsing issues
            const payload = {
                patientId: Number(currentUser.id),
                doctorId: Number(selectedDoctor.id),
                slotId: Number(selectedSlot.id),
                date: String(selectedDate), 
                time: sTime,
                paymentStatus: "PAID",
                status: "BOOKED",
                problemDescription: String(bookingDetails.problem || "Consultation")
            };

            console.log("Selected Slot:", selectedSlot);
            console.log("Selected Doctor:", selectedDoctor);
            console.log("Appointment Payload (Strict JSON):", JSON.stringify(payload, null, 2));

            await API.post('/appointments', payload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            toast.success('Booked!', 'Appointment confirmed.');

            // Optimistic slot update
            setSlots(prev => prev.map(s =>
                s.id === selectedSlot.id
                    ? { ...s, booked: true, available: false, isBooked: true }
                    : s
            ));
            setSelectedSlot(null);

            // Parallel refresh
            await Promise.all([
                fetchSlots(false),
                fetchMyAppointments(),
            ]);
            fetchData();
            setBookingStep('success');
        } catch (err) {
            console.error("Booking failed:", err.response?.data || err.message);
            if (err.response?.status === 409) {
                toast.error('Slot already booked');
                await fetchSlots(false);
                setSelectedSlot(null);
            } else if (err.response?.status === 400) {
                toast.error('Invalid Slot', err?.response?.data?.message || 'This slot is no longer valid.');
                await fetchSlots(true);
                setSelectedSlot(null);
            } else {
                toast.error('Failed', err?.response?.data?.message || 'Something went wrong. Please try again.');
            }
            // Keep user on the payment/booking step if it fails
            setBookingStep('payment'); 
        } finally {
            setIsBooking(false);
            setIsProcessingPayment(false);
            bookingRef.current = false;
        }
    };

    if (loadingDb) {
        return (
            <AppLayout activeTab={activeTab} setActiveTab={() => {}}>
                <div className="flex items-center justify-center h-64">
                    <Loader2 size={32} className="text-[var(--color-primary)] animate-spin" />
                </div>
            </AppLayout>
        );
    }

    const nextAppointment = myAppointments.find(a => a.status === 'scheduled');

    return (
        <AppLayout activeTab={activeTab} setActiveTab={() => {}}>
            <AnimatePresence mode="wait">
                {/* ─── OVERVIEW TAB ─── */}
                {activeTab === 'overview' && (
                    <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                        {/* Welcome Hero Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="relative overflow-hidden rounded-[var(--radius-xl)] p-6 md:p-8"
                            style={{
                                background: 'rgba(255,255,255,0.72)',
                                backdropFilter: 'blur(24px) saturate(160%)',
                                WebkitBackdropFilter: 'blur(24px) saturate(160%)',
                                border: '1px solid rgba(255,255,255,0.65)',
                                boxShadow: '0 8px 32px rgba(15,23,42,0.06), 0 0 0 1px rgba(255,255,255,0.5), inset 0 1px 0 rgba(255,255,255,0.7)',
                            }}
                        >
                            {/* Gradient accent line */}
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 opacity-60" />
                            
                            {/* Ambient glow */}
                            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gradient-to-br from-blue-400/[0.06] to-cyan-400/[0.04] blur-3xl pointer-events-none" />
                            <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-gradient-to-tr from-indigo-400/[0.04] to-transparent blur-3xl pointer-events-none" />

                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <p className="text-[11px] font-bold text-blue-500/70 uppercase tracking-[0.15em] mb-1.5">
                                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </p>
                                    <h2 className="text-[26px] md:text-[30px] font-extrabold text-slate-800 tracking-tight leading-tight">
                                        <span className="font-normal text-slate-400">{new Date().getHours() < 12 ? 'Good morning,' : new Date().getHours() < 18 ? 'Good afternoon,' : 'Good evening,'}</span>
                                        <br className="sm:hidden" />
                                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600"> {currentUser?.name?.split(' ')[0]}</span>
                                    </h2>
                                    <p className="text-slate-400 text-[13px] mt-1.5 font-medium">Check your health updates, appointments, and prescriptions.</p>
                                </div>
                                <div className="flex gap-2.5 shrink-0">
                                    <Button variant="secondary" icon={Brain} onClick={() => setIsAIPanelOpen(true)}>AI Check</Button>
                                    <Button icon={Plus} onClick={() => navigate('/dashboard/find-doctors')}>Book Appointment</Button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                            <StatCard icon={Calendar} label="Upcoming Appointments" value={myAppointments.length} color="from-blue-500 to-indigo-600" subtitle={nextAppointment ? `Next: ${formatSafeDate(nextAppointment.date)}` : "No upcoming dates"} />
                            <StatCard icon={Pill} label="Active Prescriptions" value={myPrescriptions.length} color="from-emerald-400 to-teal-500" subtitle="Currently active" />
                            <StatCard icon={Stethoscope} label="Doctors Consulted" value={new Set(myAppointments.map(a => a.doctorId)).size} color="from-indigo-500 to-purple-600" subtitle="Unique specialists" />
                            <StatCard icon={FileText} label="Medical Records" value={medicalRecords.length} color="from-rose-400 to-red-500" subtitle="Files securely stored" />
                        </div>

                        {/* Main Grid: 8 + 4 */}
                        <div className="grid grid-cols-12 gap-6">
                            {/* Next Consultation */}
                            <Card className="col-span-12 lg:col-span-8">
                                <div className="space-y-4">
                                    <h3 className="text-base font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                                        <Clock size={18} className="text-[var(--color-primary)]" /> Next Consultation
                                    </h3>
                                    {nextAppointment ? (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                                        <div className="w-20 h-20 bg-[var(--color-primary-light)] rounded-3xl flex flex-col items-center justify-center border border-[rgba(26,111,196,0.1)] shrink-0">
                                            <span className="text-xs font-bold text-[var(--color-primary)] uppercase">Today</span>
                                            <span className="text-2xl font-bold text-[var(--color-text-primary)]">{new Date().getDate()}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-bold text-[var(--color-text-primary)]">Dr. {nextAppointment.doctorName}</h4>
                                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-[var(--color-text-secondary)]">
                                                <span className="flex items-center gap-1"><Stethoscope size={14} className="text-[var(--color-primary)]" /> {nextAppointment.specialization}</span>
                                                <span className="flex items-center gap-1"><Clock size={14} className="text-[var(--color-primary)]" /> {nextAppointment.startTime && nextAppointment.endTime ? `${formatTime(nextAppointment.startTime)} - ${formatTime(nextAppointment.endTime)}` : "—"}</span>
                                            </div>
                                        </div>
                                        <Button icon={Video} onClick={() => navigate(`/video-call/${nextAppointment.id || nextAppointment.appointmentId}`)}>Join Call</Button>
                                    </div>
                                    ) : (
                                        <EmptyState
                                            icon={Calendar}
                                            title="No upcoming consultations"
                                            description="Book a session with our specialists to get started."
                                            action={<Button onClick={() => navigate('/dashboard/find-doctors')}>Find a Doctor</Button>}
                                        />
                                    )}
                                </div>
                            </Card>

                            {/* Health Trends */}
                            <Card className="col-span-12 lg:col-span-4">
                                <div className="space-y-4">
                                    <h3 className="text-base font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                                        <TrendingUp size={18} className="text-emerald-600" /> Health Trends
                                    </h3>
                                    <div className="h-40">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={analytics.healthTrend}>
                                            <defs>
                                                <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Area type="monotone" dataKey="value" stroke="#14B8A6" strokeWidth={2} fill="url(#healthGrad)" />
                                            <Tooltip contentStyle={{ borderRadius: '18px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                    </div>
                                </div>
                            </Card>

                            {/* Active Meds */}
                            <Card className="col-span-12 lg:col-span-6">
                                <div className="space-y-4">
                                    <h3 className="text-base font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                                        <Pill size={18} className="text-indigo-600" /> Active Medications
                                    </h3>
                                    <div className="space-y-3">
                                    {[
                                        { name: 'Amoxicillin', status: 'Taken', time: '08:00 AM', color: 'emerald' },
                                        { name: 'Paracetamol', status: 'Pending', time: '02:00 PM', color: 'amber' },
                                        { name: 'Cetirizine', status: 'Upcoming', time: '09:00 PM', color: 'blue' },
                                    ].map((med, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-white/40 border border-white/20 backdrop-blur-md rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full bg-${med.color}-500`} />
                                                <div>
                                                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{med.name}</p>
                                                    <p className="text-xs text-[var(--color-text-secondary)]">{med.time}</p>
                                                </div>
                                            </div>
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full bg-${med.color}-50 text-${med.color}-600`}>{med.status}</span>
                                        </div>
                                    ))}
                                    </div>
                                </div>
                            </Card>

                            {/* Journey Timeline — real appointment data */}
                            <Card className="col-span-12 lg:col-span-6">
                                <div className="space-y-4">
                                    <h3 className="text-base font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                                        <History size={18} className="text-rose-500" /> Recent Activity
                                    </h3>
                                    {myAppointments.length === 0 ? (
                                        <EmptyState icon={History} title="No recent activity" description="Your appointment history will appear here." />
                                    ) : (
                                        <div className="space-y-3">
                                            {[...myAppointments]
                                                .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
                                                .slice(0, 5)
                                                .map((apt, i) => {
                                                    const s = (apt.status || 'PENDING').toLowerCase();
                                                    const statusColor = s === 'completed' || s === 'confirmed' ? 'emerald' : s === 'scheduled' ? 'blue' : s === 'cancelled' ? 'red' : 'amber';
                                                    return (
                                                    <div key={apt.id || i} className="flex items-start gap-3 p-3 bg-white/40 border border-white/20 backdrop-blur-md rounded-2xl">
                                                        <div className={`w-2 h-2 rounded-full bg-${statusColor}-500 mt-2 shrink-0`} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs text-[var(--color-text-secondary)] font-medium">{formatSafeDate(apt.appointmentDate || apt.date || apt.selectedDate)}</p>
                                                            <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">Dr. {apt.doctorName}</p>
                                                            <p className="text-xs text-[var(--color-text-secondary)]">
                                                                {apt.specialization !== '—' ? apt.specialization : ''}{apt.specialization !== '—' && apt.startTime ? ' • ' : ''}
                                                                {apt.startTime && apt.endTime ? `${formatTime(apt.startTime)} - ${formatTime(apt.endTime)}` : '—'}
                                                            </p>
                                                        </div>
                                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full bg-${statusColor}-50 text-${statusColor}-700 capitalize shrink-0`}>
                                                            {apt.status}
                                                        </span>
                                                    </div>
                                                    );
                                                })}
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </motion.div>
                )}

                {/* ─── FIND DOCTORS TAB ─── */}
                {activeTab === 'doctors' && (
                    <motion.div key="doctors" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                        {/* Step Indicator */}
                        {bookingStep !== 'select' && (
                            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-2">
                                {BOOKING_STEPS.map((step, i) => {
                                    const activeIdx = BOOKING_STEPS.findIndex(s => s.key === bookingStep);
                                    const isActive = step.key === bookingStep;
                                    const isCompleted = i < activeIdx;
                                    return (
                                        <React.Fragment key={step.key}>
                                            {i > 0 && (
                                                <div className={`h-0.5 w-6 sm:w-10 rounded-full transition-all duration-500 ${isCompleted ? 'bg-[var(--color-primary)]' : 'bg-slate-200'}`} />
                                            )}
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="relative">
                                                    {/* Pulsing Outer Ring */}
                                                    {isActive && <div className="absolute -inset-1.5 rounded-full bg-blue-400 opacity-30 animate-pulse"></div>}
                                                    <motion.div
                                                        animate={isActive ? { scale: [1, 1.15, 1] } : {}}
                                                        transition={{ duration: 0.4 }}
                                                        className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                                                            isCompleted ? 'bg-emerald-500 text-white shadow-sm' :
                                                            isActive ? 'bg-[var(--color-primary)] text-white shadow-md' :
                                                            'bg-slate-200 text-slate-500'
                                                        }`}
                                                    >
                                                        {isCompleted ? <CheckCircle size={14} /> : i + 1}
                                                    </motion.div>
                                                </div>
                                                <span className={`text-[10px] font-semibold hidden sm:block ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}`}>{step.label}</span>
                                            </div>
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        )}

                        {bookingStep === 'select' && (
                            <>
                                {/* ═══ Unified Filter Toolbar ═══ */}
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.08, type: 'spring', stiffness: 340, damping: 28 }}
                                    className="mb-[22px]"
                                    style={{
                                        padding: '18px 22px',
                                        borderRadius: '28px',
                                        background: 'rgba(255,255,255,0.58)',
                                        backdropFilter: 'blur(18px) saturate(150%)',
                                        WebkitBackdropFilter: 'blur(18px) saturate(150%)',
                                        border: '1px solid rgba(255,255,255,0.42)',
                                        boxShadow: '0 12px 35px rgba(15,23,42,0.05)',
                                    }}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                                        {/* Search Input */}
                                        <div className="relative w-full md:w-[320px] shrink-0">
                                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400/70" />
                                            <input
                                                placeholder="Search doctors, specialties..."
                                                className="w-full pl-11 pr-4 bg-white/70 border border-slate-200/50 text-[13.5px] text-slate-700 placeholder:text-slate-400/60 outline-none focus:border-blue-300/50 focus:bg-white/90 focus:ring-2 focus:ring-blue-500/8 transition-all duration-200"
                                                style={{ borderRadius: '18px', height: '52px' }}
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>

                                        {/* Divider — desktop only */}
                                        <div className="hidden md:block w-px h-7 bg-slate-200/50 shrink-0" />

                                        {/* Specialty Filter Chips */}
                                        <div className="flex flex-wrap items-center gap-[10px]">
                                            {specialties.map(spec => (
                                                <button
                                                    key={spec}
                                                    onClick={() => setSelectedSpecialty(spec)}
                                                    className={`px-3.5 py-1.5 rounded-full text-[11.5px] font-semibold whitespace-nowrap transition-all duration-200 ${
                                                        selectedSpecialty === spec
                                                            ? 'bg-[var(--color-primary)] text-white shadow-sm'
                                                            : 'bg-white/70 text-slate-500 border border-slate-200/50 hover:bg-white hover:text-[var(--color-primary)] hover:border-blue-200/50'
                                                    }`}
                                                >
                                                    {spec}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Doctor Cards Grid */}
                                {filteredDoctors.length === 0 ? (
                                    <EmptyState icon={Search} title="No doctors found" description="Try adjusting your search or filters." />
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {filteredDoctors.map((doc) => {
                                            const expYears = doc.experienceYears || (doc.id % 15) + 2;
                                            const computedRating = Math.min(5.0, (3.8 + (expYears * 0.08))).toFixed(1);
                                            const isAvailableToday = (doc.id % 3) !== 0; // deterministic mock 
                                            return (
                                            <Card key={doc.id} className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                                <div className="space-y-4">
                                                    <div className="flex items-start gap-4">
                                                        <div className="relative">
                                                            <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-light)] flex items-center justify-center text-xl font-bold text-[var(--color-primary)] shrink-0 shadow-inner">
                                                                {doc.profileImageUrl ? <img src={doc.profileImageUrl} alt="doc" className="w-full h-full rounded-2xl object-cover" /> : doc.name?.charAt(0)}
                                                            </div>
                                                            {isAvailableToday && (
                                                                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-[var(--color-text-primary)] leading-tight">Dr. {doc.name}</h4>
                                                            <p className="text-xs text-[var(--color-primary)] font-semibold mt-0.5">{doc.specialization}</p>
                                                            <div className="flex items-center gap-1.5 mt-1.5">
                                                                <Star size={12} className="text-amber-400 fill-amber-400" />
                                                                <span className="text-xs font-bold text-slate-700">{computedRating}</span>
                                                                <span className="text-[10px] text-slate-400 font-medium tracking-wide">({doc.reviews} REVIEWS)</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${doc.availability.load === 'High' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                                {doc.availability.load === 'High' ? 'Busy' : 'Available'}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md flex items-center gap-1">
                                                                <Clock size={10} /> 15m Consult
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        className="w-full shadow-sm"
                                                        onClick={() => { setSelectedDoctor(doc); setBookingStep('slot'); setSelectedDate(new Date().toISOString().split('T')[0]); setSelectedSlot(null); setBookingDetails({ problem: '' }); }}
                                                    >
                                                        Book Consult
                                                    </Button>
                                                </div>
                                            </Card>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}

                        {/* STEP 2: Select Date + Slot + Problem */}
                        {bookingStep === 'slot' && selectedDoctor && (
                            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                            <Card className="max-w-2xl mx-auto">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-light)] flex items-center justify-center text-lg font-bold text-[var(--color-primary)] shrink-0">
                                        {selectedDoctor.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Book with Dr. {selectedDoctor.name}</h3>
                                        <p className="text-xs text-[var(--color-primary)] font-medium">{selectedDoctor.specialization}</p>
                                    </div>
                                </div>

                                {/* Date Picker Ribbon */}
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                                        <Calendar size={15} className="text-[var(--color-primary)]" /> Select Date
                                    </label>
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {dateOptions.map((d) => (
                                            <button
                                                key={d.value}
                                                onClick={() => setSelectedDate(d.value)}
                                                className={`flex flex-col items-center px-3.5 py-2.5 rounded-2xl min-w-[64px] border-2 transition-all duration-200 ${
                                                    selectedDate === d.value
                                                        ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-lg shadow-blue-200/50'
                                                        : 'bg-white/50 backdrop-blur-md text-[var(--color-text-secondary)] border-white/30 hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary-light)]'
                                                }`}
                                            >
                                                <span className="text-[10px] font-semibold uppercase">{d.isToday ? 'Today' : d.day}</span>
                                                <span className="text-lg font-bold">{d.date}</span>
                                                <span className="text-[10px] font-medium">{d.month}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Slot Grid */}
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                                        <Clock size={15} className="text-[var(--color-primary)]" /> Time Slots
                                    </label>
                                    {slotsLoading ? (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                            {Array.from({ length: 10 }).map((_, i) => (
                                                <div key={i} className="h-10 rounded-full bg-slate-100/80 animate-pulse" />
                                            ))}
                                        </div>
                                    ) : slots.length === 0 ? (
                                        <EmptyState icon={Clock} title="No slots available" description={new Date(selectedDate).toDateString() === new Date().toDateString() ? 'All slots are booked or passed. Try another date.' : 'No slots available for this day.'} />
                                    ) : (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                            {slots.filter(s => s.startTime && s.endTime).map((slot) => {
                                                const isBooked = !slot.available || localAppointments.some(a => String(a.slotId) === String(slot.id) && String(a.doctorId) === String(selectedDoctor.id));
                                                const isSelected = !isBooked && selectedSlot?.id === slot.id;
                                                return (
                                                <motion.button
                                                    key={slot.id}
                                                    whileHover={!isBooked && !isBooking ? { scale: 1.04, y: -2 } : {}}
                                                    whileTap={!isBooked && !isBooking ? { scale: 0.96 } : {}}
                                                    onClick={() => { if (!isBooked && !isBooking) setSelectedSlot(slot); }}
                                                    disabled={isBooked || isBooking}
                                                    className={`py-2.5 px-2 rounded-2xl text-sm font-medium border-2 transition-all duration-200 relative flex flex-col items-center justify-center min-h-[50px] overflow-hidden ${
                                                        isBooked
                                                            ? 'bg-red-50 text-red-400 border-red-300 pointer-events-none opacity-60 cursor-not-allowed'
                                                            : isSelected
                                                            ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                                            : 'bg-white text-gray-700 border-gray-200 hover:border-blue-600/60 hover:bg-blue-50'
                                                    }`}
                                                >
                                                    <span className={isBooked ? 'line-through' : ''}>
                                                        {slot.startTime && slot.endTime ? `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}` : "Invalid Slot"}
                                                    </span>
                                                    {isBooked && (
                                                        <span className="text-[10px] text-red-500 font-bold bg-red-100 border border-red-200 px-1.5 py-0.5 rounded-full absolute -top-1.5 -right-1.5 scale-90 shadow-sm z-10">
                                                            Booked
                                                        </span>
                                                    )}
                                                </motion.button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Problem Description */}
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">Describe your concern</label>
                                    <textarea
                                        rows={3}
                                        className="w-full px-4 py-3 input-field focus:input-field-focus resize-none placeholder-[var(--color-text-secondary)]/50 text-[var(--color-text-primary)] !rounded-2xl"
                                        placeholder="Brief description of your symptoms or reason for visit..."
                                        value={bookingDetails.problem}
                                        onChange={(e) => setBookingDetails(prev => ({ ...prev, problem: e.target.value }))}
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <Button variant="secondary" onClick={() => { setBookingStep('select'); setSelectedDoctor(null); }}>Back</Button>
                                    <Button
                                        className="flex-1"
                                        disabled={!selectedSlot || isBooking || !bookingDetails.problem.trim()}
                                        onClick={() => setBookingStep('payment')}
                                        icon={ArrowRight}
                                    >
                                        {isBooking ? 'Processing...' : 'Continue to Payment'}
                                    </Button>
                                </div>
                            </Card>
                            </motion.div>
                        )}

                        {/* STEP 3: Payment */}
                        {bookingStep === 'payment' && selectedDoctor && selectedSlot && (
                            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                            <Card className="max-w-lg mx-auto">
                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-bold text-[var(--color-text-primary)]">Choose Payment Method</h3>
                                    <p className="text-xs text-[var(--color-text-secondary)] mt-1 flex items-center justify-center gap-1">
                                        Your payment is secured with 256-bit SSL encryption 🔒
                                    </p>
                                </div>

                                {/* Order summary card at top */}
                                <div className="flex items-center gap-4 p-4 bg-[var(--color-primary-light)]/40 border border-[rgba(26,111,196,0.08)] rounded-2xl mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-light)] flex items-center justify-center text-lg font-bold text-[var(--color-primary)] shrink-0">
                                        {selectedDoctor.name?.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-[var(--color-text-primary)]">Dr. {selectedDoctor.name}</p>
                                        <p className="text-xs text-[var(--color-primary)] font-medium mb-1">{selectedDoctor.specialization}</p>
                                        <p className="text-[10px] text-[var(--color-text-secondary)] flex items-center gap-1">
                                            <Calendar size={10} /> {new Date(selectedDate).toLocaleDateString()}
                                            <Clock size={10} className="ml-1" /> {formatTime(selectedSlot.startTime)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm text-[var(--color-text-secondary)] block">Amount</span>
                                        <span className="text-lg font-bold text-[var(--color-primary)]">₹500</span>
                                    </div>
                                </div>

                                {/* Payment method tabs */}
                                <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                                    {['upi', 'card', 'netbanking'].map(method => (
                                        <button
                                            key={method}
                                            onClick={() => setPaymentMethod(method)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                                                paymentMethod === method ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                                            }`}
                                        >
                                            {method === 'upi' && 'UPI'}
                                            {method === 'card' && 'Credit / Debit Card'}
                                            {method === 'netbanking' && 'Net Banking'}
                                        </button>
                                    ))}
                                </div>

                                {/* Tab Content: UPI */}
                                {paymentMethod === 'upi' && (
                                    <div className="space-y-4 mb-6">
                                        <div>
                                            <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">Enter UPI ID</label>
                                            <input
                                                placeholder="yourname@upi"
                                                value={upiDetails.id}
                                                onChange={e => setUpiDetails(prev => ({ ...prev, id: e.target.value }))}
                                                className="w-full px-4 py-2.5 input-field focus:input-field-focus placeholder-[var(--color-text-secondary)]/50 text-sm font-medium text-[var(--color-text-primary)]"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-px bg-slate-200"></div>
                                            <span className="text-xs text-[var(--color-text-secondary)] font-medium">OR</span>
                                            <div className="flex-1 h-px bg-slate-200"></div>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[
                                                { id: 'gpay', name: 'GPay', emoji: 'G' },
                                                { id: 'phonepe', name: 'PhonePe', emoji: 'P' },
                                                { id: 'paytm', name: 'Paytm', emoji: 'T' },
                                                { id: 'bhim', name: 'BHIM', emoji: 'B' },
                                            ].map(app => (
                                                <button
                                                    key={app.id}
                                                    onClick={() => setUpiDetails(prev => ({ ...prev, app: app.id }))}
                                                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                                                        upiDetails.app === app.id ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]' : 'border-slate-200 bg-white hover:border-slate-300'
                                                    }`}
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[var(--color-text-primary)] mb-1">
                                                        {app.emoji}
                                                    </div>
                                                    <span className="text-[10px] font-semibold text-[var(--color-text-primary)]">{app.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Tab Content: Card */}
                                {paymentMethod === 'card' && (
                                    <div className="space-y-4 mb-6">
                                        <div className="relative">
                                            <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">Card Number</label>
                                            <input
                                                placeholder="1234 5678 9012 3456"
                                                value={cardDetails.number}
                                                maxLength={19}
                                                onChange={e => {
                                                    const val = e.target.value.replace(/\D/g, '').substring(0, 16);
                                                    const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
                                                    setCardDetails(prev => ({ ...prev, number: formatted }));
                                                }}
                                                className="w-full px-4 py-2.5 input-field focus:input-field-focus placeholder-[var(--color-text-secondary)]/50 text-sm font-medium text-[var(--color-text-primary)]"
                                            />
                                            {cardDetails.number.startsWith('4') && <span className="absolute right-3 top-8 text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">VISA</span>}
                                            {cardDetails.number.startsWith('5') && <span className="absolute right-3 top-8 text-xs font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">MC</span>}
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">Expiry Date</label>
                                                <input
                                                    placeholder="MM/YY"
                                                    value={cardDetails.expiry}
                                                    maxLength={5}
                                                    onChange={e => {
                                                        let val = e.target.value.replace(/\D/g, '').substring(0, 4);
                                                        if (val.length >= 3) {
                                                            val = val.substring(0, 2) + '/' + val.substring(2);
                                                        }
                                                        setCardDetails(prev => ({ ...prev, expiry: val }));
                                                    }}
                                                    className="w-full px-4 py-2.5 input-field focus:input-field-focus placeholder-[var(--color-text-secondary)]/50 text-sm font-medium text-[var(--color-text-primary)]"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">CVV</label>
                                                <input
                                                    type="password"
                                                    placeholder="•••"
                                                    maxLength={4}
                                                    value={cardDetails.cvv}
                                                    onChange={e => setCardDetails(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') }))}
                                                    className="w-full px-4 py-2.5 input-field focus:input-field-focus placeholder-[var(--color-text-secondary)]/50 text-sm font-medium text-[var(--color-text-primary)]"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-1">Cardholder Name</label>
                                            <input
                                                placeholder="Name on card"
                                                value={cardDetails.name}
                                                onChange={e => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                                                className="w-full px-4 py-2.5 input-field focus:input-field-focus placeholder-[var(--color-text-secondary)]/50 text-sm font-medium text-[var(--color-text-primary)]"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Tab Content: Net Banking */}
                                {paymentMethod === 'netbanking' && (
                                    <div className="grid grid-cols-3 gap-3 mb-6">
                                        {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'Other'].map(bank => (
                                            <button
                                                key={bank}
                                                onClick={() => setSelectedBank(bank)}
                                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                                                    selectedBank === bank ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]' : 'border-slate-200 bg-white hover:border-slate-300'
                                                }`}
                                            >
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[var(--color-text-primary)] mb-1 text-xs">
                                                    {bank.charAt(0)}
                                                </div>
                                                <span className="text-[10px] font-semibold text-[var(--color-text-primary)]">{bank}</span>
                                                {selectedBank === bank && <CheckCircle size={12} className="absolute top-1 text-[var(--color-primary)]" style={{ right: '0.25rem', top: '0.25rem'}} />}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3 mt-4">
                                    <Button variant="secondary" onClick={() => setBookingStep('slot')}>Back</Button>
                                    <Button
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                        loading={isProcessingPayment}
                                        disabled={isBooking || isProcessingPayment}
                                        onClick={handleBookAppointment}
                                    >
                                        {isBooking ? 'Processing...' : `Pay ₹500`}
                                    </Button>
                                </div>
                            </Card>
                            </motion.div>
                        )}

                        {/* STEP 4: Success */}
                        {bookingStep === 'success' && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
                            <Card className="max-w-lg mx-auto text-center py-10">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                                    className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
                                >
                                    <CheckCircle size={40} />
                                </motion.div>
                                <motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
                                    Appointment Confirmed!
                                </motion.h3>
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-sm text-[var(--color-text-secondary)] mb-8">
                                    Your booking has been confirmed successfully.
                                </motion.p>

                                {/* Summary */}
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="space-y-2.5 mb-8 max-w-sm mx-auto text-left">
                                    {[
                                        { label: 'Doctor', value: `Dr. ${selectedDoctor?.name}`, icon: Stethoscope },
                                        { label: 'Date', value: selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' }) : '', icon: Calendar },
                                        { label: 'Time', value: selectedSlot?.startTime && selectedSlot?.endTime ? `${formatTime(selectedSlot.startTime)} - ${formatTime(selectedSlot.endTime)}` : "N/A", icon: Clock },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-white/40 backdrop-blur-md border border-white/20 rounded-2xl">
                                            <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                                                <item.icon size={14} className="text-emerald-500" />
                                                {item.label}
                                            </div>
                                            <span className="text-sm font-semibold text-[var(--color-text-primary)]">{item.value}</span>
                                        </div>
                                    ))}
                                </motion.div>

                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="flex gap-3 justify-center">
                                    <Button variant="secondary" onClick={() => { setBookingStep('select'); setSelectedDoctor(null); setSelectedSlot(null); }}>Book Another</Button>
                                    <Button onClick={() => { setBookingStep('select'); setSelectedDoctor(null); setSelectedSlot(null); navigate('/dashboard/appointments'); }}>View Appointments</Button>
                                </motion.div>

                                {/* Auto-redirect to appointments after 2.5s */}
                                <AutoRedirect onRedirect={() => { setBookingStep('select'); setSelectedDoctor(null); setSelectedSlot(null); navigate('/dashboard/appointments'); }} />
                            </Card>
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {/* ─── APPOINTMENTS TAB ─── */}
                {activeTab === 'appointments' && (
                    <motion.div key="appointments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Appointments</h2>
                        <Card className="!p-0 overflow-hidden">
                            {appointmentsLoading ? (
                                <div className="p-4 space-y-2">
                                    <SkeletonLoader type="row" count={4} />
                                </div>
                            ) : (
                            <Table
                                columns={[
                                    { header: 'Doctor', accessor: 'doctorName', render: (row) => (
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center font-bold text-xs shrink-0">
                                                {row.doctorAvatar?.length > 1 ? (
                                                    <img src={row.doctorAvatar} alt="Doctor" className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    row.doctorAvatar || 'D'
                                                )}
                                            </div>
                                            <span className="font-medium text-[var(--color-text-primary)]">{row.doctorName}</span>
                                        </div>
                                    )},
                                    { header: 'Specialty', accessor: 'doctorSpecialty', render: (row) => (
                                        <span className="text-[var(--color-text-secondary)]">{row.doctorSpecialty}</span>
                                    )},
                                    { header: 'Date', accessor: 'date', render: (row) => {
                                        console.log("Appointment object:", row);
                                        return <span>{formatSafeDate(row.appointmentDate || row.date || row.selectedDate)}</span>;
                                    }},
                                    { header: 'Time', accessor: 'startTime', render: (row) => (
                                        <span>{row.startTime && row.endTime ? `${formatTime(row.startTime)} - ${formatTime(row.endTime)}` : '—'}</span>
                                    )},
                                    { header: 'Status', render: (row) => {
                                        const s = (row.status || '').toLowerCase();
                                        const colorMap = {
                                            scheduled: 'bg-blue-50 text-blue-600',
                                            confirmed: 'bg-emerald-50 text-emerald-600',
                                            completed: 'bg-emerald-50 text-emerald-600',
                                            pending: 'bg-amber-50 text-amber-600',
                                            cancelled: 'bg-red-50 text-red-500',
                                            'in-progress': 'bg-amber-50 text-amber-600',
                                        };
                                        const color = colorMap[s] || 'bg-white/40 border border-white/20 text-[var(--color-text-secondary)] backdrop-blur-md';
                                        return (
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${color}`}>
                                                {row.status}
                                            </span>
                                        );
                                    }},
                                    { header: 'Actions', render: (row) => {
                                        const s = (row.status || '').toLowerCase();
                                        const canJoin = ['scheduled', 'confirmed', 'in-progress', 'pending'].includes(s);
                                        if (!canJoin) return <span className="text-xs text-slate-400">—</span>;
                                        return (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); navigate(`/video-call/${row.id || row.appointmentId}`); }}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[11px] font-semibold rounded-full shadow-sm shadow-blue-500/20 hover:shadow-md hover:-translate-y-0.5 transition-all"
                                            >
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                                                Join Call
                                            </button>
                                        );
                                    }},
                                ]}
                                data={myAppointments.filter(a => a.date || a.startTime)}
                                rowClassName={(row) => {
                                    const s = (row.status || '').toLowerCase();
                                    if (s === 'pending' || s === 'in-progress') return 'border-l-4 border-l-amber-400';
                                    if (s === 'completed' || s === 'confirmed') return 'border-l-4 border-l-green-400';
                                    if (s === 'cancelled') return 'border-l-4 border-l-red-400';
                                    return 'border-l-4 border-l-blue-400';
                                }}
                                emptyMessage="No appointments yet. Book your first consultation!"
                                emptyIcon={Calendar}
                            />
                            )}
                        </Card>
                    </motion.div>
                )}

                {/* ─── PRESCRIPTIONS TAB ─── */}
                {activeTab === 'prescriptions' && (
                    <PatientPrescriptions prescriptions={myPrescriptions} />
                )}

                {/* ─── RECORDS TAB ─── */}
                {activeTab === 'records' && (
                    <motion.div key="records" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Medical Records</h2>
                                <p className="text-sm text-[var(--color-text-secondary)]">Securely stored with end-to-end encryption.</p>
                            </div>
                            <div className="relative">
                                <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                <Button icon={UploadCloud} loading={isUploading}>
                                    {isUploading ? 'Uploading...' : 'Upload Record'}
                                </Button>
                            </div>
                        </div>
                        {medicalRecords.length === 0 ? (
                            <EmptyState icon={FilePlus} title="No records uploaded yet" description="Upload your medical records to keep them safe." />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {medicalRecords.map((record, i) => (
                                    <Card key={i} className="hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="w-10 h-10 bg-[var(--color-primary-light)] rounded-2xl flex items-center justify-center">
                                                <FilePlus size={18} className="text-[var(--color-primary)]" />
                                            </div>
                                            <button className="p-1.5 text-[var(--color-text-secondary)] hover:text-blue-600 transition-colors">
                                                <DownloadCloud size={16} />
                                            </button>
                                        </div>
                                        <h4 className="font-semibold text-[var(--color-text-primary)]">{record.record_type || 'Lab Report'}</h4>
                                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">{new Date(record.uploaded_at).toLocaleDateString()}</p>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <PatientRatingModal 
                isOpen={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                appointment={ratingAppointment}
                currentUser={currentUser}
                onSuccess={() => {
                    toast.success("Review Submitted", "Thank you for your feedback!");
                }}
            />

        </AppLayout>
    );
};

export default PatientDashboard;
