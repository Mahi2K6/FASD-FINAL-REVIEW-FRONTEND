import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../../AppContext';
import API from '../../api';
import AppLayout from '../../components/layout/AppLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatCard from '../../components/ui/StatCard';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/ToastNotification';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Users, CheckCircle, Settings, Check, X, GraduationCap, Store, Trash2, Star, Clock, BarChart3, TrendingUp, Loader2 } from 'lucide-react';

const AnimatedCount = ({ value }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        const duration = 1200;
        const totalFrames = Math.round(duration / 16);
        const increment = Math.max(1, Math.round(value / totalFrames));
        
        const timer = setInterval(() => {
            start += increment;
            if (start >= value) {
                setCount(value);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, 16);
        return () => clearInterval(timer);
    }, [value]);
    return <>{count}</>;
};

const AdminTopCard = ({ title, value, icon: Icon, gradient, sparkline }) => (
    <div className="glass-card hover:glass-card-hover flex flex-col gap-3 relative overflow-hidden p-5 border border-white/40 shadow-sm bg-white/60">
        <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2 text-[var(--color-primary)]">
                <Icon size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
            </div>
        </div>
        <div className="text-4xl font-extrabold text-slate-800 z-10">
            <AnimatedCount value={value || 0} />
        </div>
        <div className="flex items-end h-10 gap-1 w-full mt-2 z-10">
            {sparkline.map((h, i) => (
                <div key={i} className={`flex-1 rounded-t-sm bg-gradient-to-t ${gradient} opacity-60 hover:opacity-100 transition-all cursor-pointer`} style={{ height: `${h}%` }}></div>
            ))}
        </div>
        <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-2xl`}></div>
    </div>
);

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('analytics');
    const { currentUser, data, updateData, setIsSearchGlobalVisible, loadingDb, fetchData } = useAppContext();
    const toast = useToast();

    // ─── Derived filtered lists for UI display ───
    const users = data?.users || [];

    const approvedDoctors = users.filter(
        u => u.role === "DOCTOR" && u.status === "ACTIVE"
    );


    // ─── Dedicated Admin Local State ───
    const [_pendingUsers, _setPendingUsers] = useState([]);

    const [patients, setPatients] = useState([]);
    const [pharmacists, setPharmacists] = useState([]);
    const [rejectedUsers, setRejectedUsers] = useState([]);
    const [stats, setStats] = useState({});

    // Delete Confirmation State
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, userId: null, userName: '', role: '' });

    // Loading states to prevent double-clicks
    const [actionLoading, setActionLoading] = useState({});

    // Graph State
    const [graphMetric, setGraphMetric] = useState('visits');

    // Doctor Analytics Panel State
    const [selectedDoctorView, setSelectedDoctorView] = useState(null);

    // Native Admin Data
    const [localAppointments, setLocalAppointments] = useState([]);

    // Local Tab Filter State
    const [localSearchQuery, setLocalSearchQuery] = useState('');

    useEffect(() => {
        setLocalSearchQuery('');
    }, [activeTab]);

    // ─── Fetch Admin Data from dedicated endpoints ───
    const fetchAdminData = useCallback(async () => {
        try {
            const [pending, doctorsRes, patientsRes, pharmacistsRes, rejectedRes, statsRes, apptsRes] = await Promise.all([
                API.get('/admin/users/PENDING').catch(() => ({ data: [] })),
                API.get('/users/doctors').catch(() => ({ data: [] })),
                API.get('/admin/users/PATIENT').catch(() => ({ data: [] })),
                API.get('/admin/users/PHARMACIST').catch(() => ({ data: [] })),
                API.get('/admin/users/REJECTED').catch(() => ({ data: [] })),
                API.get('/admin/stats').catch(() => ({ data: {} })),
                API.get('/appointments').catch(() => ({ data: [] }))
            ]);
            _setPendingUsers(Array.isArray(pending.data) ? pending.data : []);
            setPatients(Array.isArray(patientsRes.data) ? patientsRes.data : []);
            setPharmacists(Array.isArray(pharmacistsRes.data) ? pharmacistsRes.data : []);
            setRejectedUsers(Array.isArray(rejectedRes.data) ? rejectedRes.data : []);
            setStats(statsRes.data || {});
            setLocalAppointments(Array.isArray(apptsRes.data) ? apptsRes.data : []);
        } catch (err) {
            console.error('Admin data fetch error:', err);
        }
    }, []);

    // Fetch on mount
    useEffect(() => {
        fetchAdminData();
    }, [fetchAdminData]);

    // Refetch pending users when approvals tab is selected
    useEffect(() => {
        if (activeTab === 'approvals') {
            const fetchPending = async () => {
                try {
                    const res = await API.get('/admin/users/PENDING').catch(() => ({ data: [] }));
                    console.log('Pending users:', res.data);
                    _setPendingUsers(Array.isArray(res.data) ? res.data : []);
                } catch (e) {
                    console.error('Failed to refresh pending list:', e);
                }
            };
            fetchPending();
        }
    }, [activeTab]);

    // Refetch rejected users when rejected tab is selected
    useEffect(() => {
        if (activeTab === 'rejected') {
            const fetchRejected = async () => {
                try {
                    const res = await API.get('/admin/users/REJECTED').catch(() => ({ data: [] }));
                    console.log('Rejected users:', res.data);
                    setRejectedUsers(Array.isArray(res.data) ? res.data : []);
                } catch (e) {
                    console.error('Failed to refresh rejected list:', e);
                }
            };
            fetchRejected();
        }
    }, [activeTab]);

    // Also sync from context data as fallback
    useEffect(() => {
        if (data.users && data.users.length > 0) {
            // Only use context fallback if dedicated fetch returned empty
            if (_pendingUsers.length === 0 && (data.approvals || []).length > 0) {
                _setPendingUsers(data.approvals);
            }

            if (patients.length === 0) {
                const ctxPatients = (data.users || []).filter(u => u.role?.toLowerCase() === 'patient');
                if (ctxPatients.length > 0) setPatients(ctxPatients);
            }
            if (pharmacists.length === 0) {
                const ctxPharmacists = (data.users || []).filter(u => u.role?.toLowerCase() === 'pharmacist');
                if (ctxPharmacists.length > 0) setPharmacists(ctxPharmacists);
            }
        }
    }, [data.users, data.approvals, _pendingUsers.length, patients.length, pharmacists.length]);

    useEffect(() => {
        if (!setIsSearchGlobalVisible) return;
        const isSearchableTab = ['doctors', 'patients', 'pharmacists', 'approvals', 'rejected'].includes(activeTab);
        setIsSearchGlobalVisible(isSearchableTab && !deleteConfirm.open && !selectedDoctorView);
        return () => setIsSearchGlobalVisible(true);
    }, [activeTab, deleteConfirm.open, selectedDoctorView, setIsSearchGlobalVisible]);

    const chartDataGroups = useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const group = { visits: [], appointments: [], newUsers: [] };

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayName = days[d.getDay()];

            const visits = (localAppointments || []).filter(a => a.appointment_date === dateStr && a.status === 'completed').length;
            const appts = (localAppointments || []).filter(a => a.appointment_date === dateStr).length;
            const allUsers = [...(data.users || []), ...patients, ...approvedDoctors, ...pharmacists];
            const newU = allUsers.filter(u => u.created_at && u.created_at.startsWith(dateStr)).length;

            group.visits.push({ name: dayName, value: visits || 0 });
            group.appointments.push({ name: dayName, value: appts || 0 });
            group.newUsers.push({ name: dayName, value: newU || 0 });
        }
        return group;
    }, [localAppointments, data.users, patients, approvedDoctors, pharmacists]);

    const doctorStats = useMemo(() => {
        if (!selectedDoctorView) return { visits: [], rating: [] };
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const v = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayName = days[d.getDay()];
            const visits = (localAppointments || []).filter(a => a.doctor_id === selectedDoctorView.id && a.appointment_date === dateStr).length;
            v.push({ name: dayName, value: visits || 0 });
        }

        const computedRatings = [
            { name: 'W1', value: 4.2 }, { name: 'W2', value: 4.4 }, { name: 'W3', value: 4.6 }, { name: 'W4', value: 4.8 }
        ];

        return { visits: v, rating: computedRatings };
    }, [selectedDoctorView, localAppointments]);

    if (loadingDb || !currentUser) {
        return (
            <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
                <div className="flex items-center justify-center h-64">
                    <Loader2 size={32} className="text-[var(--color-primary)] animate-spin" />
                </div>
            </AppLayout>
        );
    }

    // ─── Handler: Approve User ───
    const handleApprove = async (userId) => {
        if (actionLoading[`approve-${userId}`]) return;
        setActionLoading(prev => ({ ...prev, [`approve-${userId}`]: true }));
        try {
            await API.put(`/admin/users/${userId}/status`, { status: 'ACTIVE' });
            toast.success('Approved', 'User account has been activated.');
            await fetchAdminData();
        } catch (err) {
            console.error('Error approving user:', err);
            toast.error('Error', err?.response?.data?.message || 'Failed to approve user.');
        } finally {
            setActionLoading(prev => ({ ...prev, [`approve-${userId}`]: false }));
        }
    };

    // ─── Handler: Reject User ───
    const handleReject = async (userId) => {
        if (actionLoading[`reject-${userId}`]) return;
        setActionLoading(prev => ({ ...prev, [`reject-${userId}`]: true }));
        try {
            await API.put(`/admin/users/${userId}/status`, { status: 'REJECTED' });
            toast.error('Rejected', 'User account has been rejected.');
            await fetchAdminData();
        } catch (err) {
            console.error('Error rejecting user:', err);
            toast.error('Error', err?.response?.data?.message || 'Failed to reject user.');
        } finally {
            setActionLoading(prev => ({ ...prev, [`reject-${userId}`]: false }));
        }
    };

    // ─── Handler: Delete User ───
    const handleDeleteUser = async () => {
        if (!deleteConfirm.userId) return;
        const { userId, userName } = deleteConfirm;
        if (actionLoading[`delete-${userId}`]) return;
        setActionLoading(prev => ({ ...prev, [`delete-${userId}`]: true }));
        try {
            await API.delete(`/admin/delete/${userId}`);
            setDeleteConfirm({ open: false, userId: null, userName: '', role: '' });
            toast.success('Deleted', `${userName} has been removed.`);
            await fetchAdminData();
            fetchData();
        } catch (err) {
            console.error('Failed to delete user:', err);
            toast.error('Error', err?.response?.data?.message || 'Failed to delete user.');
        } finally {
            setActionLoading(prev => ({ ...prev, [`delete-${userId}`]: false }));
            setDeleteConfirm({ open: false, userId: null, userName: '', role: '' });
        }
    };

    // ─── Handler: Restore User (set back to PENDING) ───
    const handleRestore = async (userId) => {
        if (actionLoading[`restore-${userId}`]) return;
        setActionLoading(prev => ({ ...prev, [`restore-${userId}`]: true }));
        try {
            await API.put(`/admin/users/${userId}/status`, { status: 'PENDING' });
            toast.success('Restored', 'User moved back to Pending.');
            await fetchAdminData();
        } catch (err) {
            console.error('Error restoring user:', err);
            toast.error('Error', err?.response?.data?.message || 'Failed to restore user.');
        } finally {
            setActionLoading(prev => ({ ...prev, [`restore-${userId}`]: false }));
        }
    };

    // ─── Handler: Approve from Rejected ───
    const handleApproveFromRejected = async (userId) => {
        if (actionLoading[`approve-rej-${userId}`]) return;
        setActionLoading(prev => ({ ...prev, [`approve-rej-${userId}`]: true }));
        try {
            await API.put(`/admin/users/${userId}/status`, { status: 'ACTIVE' });
            toast.success('Approved', 'User account has been activated.');
            await fetchAdminData();
        } catch (err) {
            console.error('Error approving rejected user:', err);
            toast.error('Error', err?.response?.data?.message || 'Failed to approve user.');
        } finally {
            setActionLoading(prev => ({ ...prev, [`approve-rej-${userId}`]: false }));
        }
    };

    const getPatientApptCount = (patientId) => {
        return (localAppointments || []).filter(a => a.patient_id === patientId).length;
    };

    // Total counts for stats
    const totalUsers = patients.length + approvedDoctors.length + pharmacists.length;

    // Inline style for guaranteed clickability
    const clickableStyle = { position: 'relative', zIndex: 10, pointerEvents: 'all', cursor: 'pointer' };

    return (
        <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            <AnimatePresence mode="wait">
                {activeTab === 'analytics' && (
                    <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <AdminTopCard title="Total Users" value={totalUsers || (data.users || []).length} icon={Users} gradient="from-blue-400 to-indigo-500" sparkline={[30, 45, 60, 40, 80, 55, 90]} />
                            <AdminTopCard title="Patients" value={patients.length} icon={Users} gradient="from-emerald-400 to-teal-500" sparkline={[20, 50, 40, 70, 60, 85, 95]} />
                            <AdminTopCard title="Doctors" value={approvedDoctors.length} icon={GraduationCap} gradient="from-amber-400 to-orange-500" sparkline={[10, 25, 20, 45, 40, 55, 65]} />
                            <AdminTopCard title="Pharmacists" value={pharmacists.length} icon={Store} gradient="from-purple-400 to-fuchsia-500" sparkline={[5, 10, 15, 12, 20, 25, 30]} />
                            <StatCard icon={Activity} label="Appointments" value={stats.totalAppointments || localAppointments.length} color="purple" />
                            <StatCard icon={Activity} label="Prescriptions" value={stats.totalPrescriptions || (data.prescriptions || []).length} color="amber" />
                            <StatCard icon={Activity} label="Orders" value={stats.totalOrders || (data.orders || []).length} color="emerald" />
                            <StatCard icon={Clock} label="Pending Approvals" value={_pendingUsers.length} color="rose" />
                        </div>

                        {/* Analytics Chart */}
                        <Card>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                <h3 className="text-xl font-bold text-slate-800 tracking-tight">Platform Analytics</h3>
                                <div className="flex bg-[var(--color-primary-light)]/50 p-1 rounded-full">
                                    {['visits', 'appointments', 'newUsers'].map((metric) => (
                                        <button
                                            key={metric}
                                            onClick={() => setGraphMetric(metric)}
                                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 capitalize ${graphMetric === metric ? 'bg-white shadow-sm text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                                        >
                                            {metric.replace('new', 'New ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartDataGroups[graphMetric]} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={graphMetric === 'appointments' ? '#10b981' : graphMetric === 'newUsers' ? '#8b5cf6' : '#1a6fc4'} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={graphMetric === 'appointments' ? '#10b981' : graphMetric === 'newUsers' ? '#8b5cf6' : '#1a6fc4'} stopOpacity={0.0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '16px',
                                                border: '1px solid rgba(255,255,255,0.6)',
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                backdropFilter: 'blur(12px)',
                                            }}
                                            cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                                        />
                                        <Area
                                            isAnimationActive={true}
                                            animationDuration={1000}
                                            type="monotone"
                                            dataKey="value"
                                            stroke={graphMetric === 'appointments' ? '#10b981' : graphMetric === 'newUsers' ? '#8b5cf6' : '#1a6fc4'}
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorValue)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {activeTab === 'approvals' && (
                    <motion.div key="approvals" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <Card>
                            <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-6">Pending Registrations</h3>
                            {_pendingUsers.length === 0 ? (
                                <EmptyState icon={CheckCircle} title="All Caught Up" description="No pending registrations" />
                            ) : (
                                <div className="space-y-3">
                                    <AnimatePresence>
                                    {_pendingUsers.map((user, i) => (
                                        <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} key={user.id} className={`flex items-center justify-between p-4 bg-white/30 backdrop-blur-md rounded-2xl border ${i===0 ? 'border-amber-200' : 'border-white/20'}`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2.5 rounded-full relative ${user.role?.toLowerCase() === 'doctor' ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]' : 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]'}`}>
                                                    {i === 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75"></span>}
                                                    {i === 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>}
                                                    {user.role?.toLowerCase() === 'doctor' ? <Activity size={18} /> : <Users size={18} />}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-[var(--color-text-primary)]">
                                                        {user.name} 
                                                        <span className="text-[10px] font-bold text-[var(--color-primary-dark)] ml-2 uppercase bg-[var(--color-primary-light)] px-2 py-0.5 rounded-full inline-block mb-1">{user.role}</span>
                                                        {i === 0 && <span className="text-[10px] font-bold text-rose-600 bg-rose-100 ml-2 px-2 py-0.5 rounded-full inline-flex items-center gap-1"><Clock size={10} /> Urgent: 48h Wait</span>}
                                                    </h4>
                                                    <p className="text-sm text-[var(--color-text-secondary)]">{user.email} • {user.experience || 0} yrs exp.</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2" style={clickableStyle}>
                                                <button
                                                    onClick={() => handleApprove(user.id)}
                                                    disabled={!!actionLoading[`approve-${user.id}`]}
                                                    style={clickableStyle}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {actionLoading[`approve-${user.id}`] ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(user.id)}
                                                    disabled={!!actionLoading[`reject-${user.id}`]}
                                                    style={clickableStyle}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-white text-red-500 border border-red-200 hover:bg-red-50 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {actionLoading[`reject-${user.id}`] ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm({ open: true, userId: user.id, userName: user.name, role: user.role || 'User' })}
                                                    style={clickableStyle}
                                                    className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-all"
                                                    title="Delete permanently"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </Card>
                    </motion.div>
                )}

                {activeTab === 'rejected' && (
                    <motion.div key="rejected" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <Card>
                            <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-6">Rejected Users</h3>
                            {rejectedUsers.length === 0 ? (
                                <EmptyState icon={X} title="No Rejected Users" description="All users are either active or pending." />
                            ) : (
                                <div className="space-y-3">
                                    <AnimatePresence>
                                    {rejectedUsers.map(user => (
                                        <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} key={user.id} className="flex items-center justify-between p-4 bg-white/30 backdrop-blur-md rounded-2xl border border-white/20">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2.5 rounded-full bg-red-50 text-red-500">
                                                    {user.role?.toLowerCase() === 'doctor' ? <Activity size={18} /> : <Users size={18} />}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-[var(--color-text-primary)]">
                                                        {user.name}
                                                        <span className="text-[10px] font-bold uppercase ml-2 px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-200">{user.role}</span>
                                                        <span className="text-[10px] font-bold uppercase ml-1 px-2 py-0.5 rounded-full bg-red-100 text-red-600">REJECTED</span>
                                                    </h4>
                                                    <p className="text-sm text-[var(--color-text-secondary)]">{user.email} • {user.experience || 0} yrs exp.</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2" style={clickableStyle}>
                                                <button
                                                    onClick={() => handleRestore(user.id)}
                                                    disabled={!!actionLoading[`restore-${user.id}`]}
                                                    style={clickableStyle}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {actionLoading[`restore-${user.id}`] ? <Loader2 size={14} className="animate-spin" /> : <Clock size={14} />}
                                                    Hold
                                                </button>
                                                <button
                                                    onClick={() => handleApproveFromRejected(user.id)}
                                                    disabled={!!actionLoading[`approve-rej-${user.id}`]}
                                                    style={clickableStyle}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {actionLoading[`approve-rej-${user.id}`] ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm({ open: true, userId: user.id, userName: user.name, role: user.role || 'User' })}
                                                    style={clickableStyle}
                                                    className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-all"
                                                    title="Delete permanently"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </Card>
                    </motion.div>
                )}

                {activeTab === 'doctors' && (
                    <motion.div key="doctors" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <Card>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                <h3 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2"><GraduationCap size={20} className="text-blue-500" /> Doctors Directory</h3>
                                <input type="text" placeholder="Search doctors..." className="px-4 py-1.5 rounded-full border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] w-full sm:w-64" value={localSearchQuery} onChange={(e) => setLocalSearchQuery(e.target.value)} />
                            </div>
                            <div className="space-y-3">
                                <AnimatePresence>
                                {approvedDoctors.filter(d => d.name?.toLowerCase().includes(localSearchQuery.toLowerCase())).map(doc => (
                                    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} key={doc.id} onClick={() => setSelectedDoctorView(doc)} className="flex items-center justify-between p-4 bg-white/30 backdrop-blur-md rounded-2xl border border-white/20 hover:shadow-md transition-all cursor-pointer">
                                        <div>
                                            <h4 className="font-semibold text-[var(--color-text-primary)]">Dr. {doc.name}</h4>
                                            <p className="text-sm text-[var(--color-text-secondary)]">{doc.specialization || 'General'} • {doc.experience || 0} yrs exp</p>
                                        </div>
                                        <div className="flex items-center gap-2" style={clickableStyle}>
                                            {doc.status?.toLowerCase() === 'pending' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleApprove(doc.id); }}
                                                    disabled={!!actionLoading[`approve-${doc.id}`]}
                                                    style={clickableStyle}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {actionLoading[`approve-${doc.id}`] ? <Loader2 size={14} className="animate-spin" /> : null}
                                                    Approve
                                                </button>
                                            )}
                                            {doc.status?.toLowerCase() === 'active' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleReject(doc.id); }}
                                                    disabled={!!actionLoading[`reject-${doc.id}`]}
                                                    style={clickableStyle}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-white text-[var(--color-text-secondary)] border border-[rgba(26,111,196,0.15)] hover:bg-[var(--color-primary-light)] shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {actionLoading[`reject-${doc.id}`] ? <Loader2 size={14} className="animate-spin" /> : null}
                                                    Revoke
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ open: true, userId: doc.id, userName: doc.name, role: 'Doctor' }); }}
                                                style={clickableStyle}
                                                className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                                </AnimatePresence>
                                {approvedDoctors.length === 0 && <EmptyState icon={GraduationCap} title="No Doctors" description="No approved doctors found." />}
                            </div>
                        </Card>
                    </motion.div>
                )}

                {activeTab === 'patients' && (
                    <motion.div key="patients" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <Card>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                <h3 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2"><Users size={20} className="text-blue-500" /> Patients Database</h3>
                                <input type="text" placeholder="Search patients..." className="px-4 py-1.5 rounded-full border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] w-full sm:w-64" value={localSearchQuery} onChange={(e) => setLocalSearchQuery(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <AnimatePresence>
                                {patients.filter(p => (p.name || '').toLowerCase().includes(localSearchQuery.toLowerCase())).map(patient => (
                                    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} key={patient.id} className="p-5 bg-white/30 backdrop-blur-md rounded-2xl border border-white/20 flex flex-col justify-between">
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="font-semibold text-[var(--color-text-primary)]">{patient.name || 'Unnamed'}</h4>
                                            <span className="bg-[var(--color-primary-light)] text-[var(--color-primary)] text-[10px] uppercase px-2 py-1 rounded-full font-bold">{getPatientApptCount(patient.id)} Visits</span>
                                        </div>
                                        <div className="space-y-1 text-sm text-[var(--color-text-secondary)] mb-3">
                                            <p>✉️ {patient.email}</p>
                                            <p>📞 {patient.phone || 'N/A'}</p>
                                            <p>🎂 Age: {patient.age || 'N/A'}</p>
                                        </div>
                                        <div className="flex justify-end mt-auto pt-3 border-t border-gray-100/50">
                                            <button
                                                onClick={() => setDeleteConfirm({ open: true, userId: patient.id, userName: patient.name, role: 'Patient' })}
                                                style={clickableStyle}
                                                className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                                </AnimatePresence>
                                {patients.length === 0 && <p className="text-[var(--color-text-secondary)] col-span-2 text-center py-6">No patients found.</p>}
                            </div>
                        </Card>
                    </motion.div>
                )}

                {activeTab === 'pharmacists' && (
                    <motion.div key="pharmacists" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <Card>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                                <h3 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2"><Store size={20} className="text-blue-500" /> Pharmacists & Pharmacies</h3>
                                <input type="text" placeholder="Search pharmacists..." className="px-4 py-1.5 rounded-full border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] w-full sm:w-64" value={localSearchQuery} onChange={(e) => setLocalSearchQuery(e.target.value)} />
                            </div>
                            <div className="space-y-3">
                                <AnimatePresence>
                                {pharmacists.filter(p => (p.name || '').toLowerCase().includes(localSearchQuery.toLowerCase())).map(pharm => (
                                    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} key={pharm.id} className="flex items-center justify-between p-4 bg-white/30 backdrop-blur-md rounded-2xl border border-white/20">
                                        <div>
                                            <h4 className="font-semibold text-[var(--color-text-primary)]">{pharm.name}</h4>
                                            <p className="text-sm text-[var(--color-text-secondary)]">🏠 Central Pharmacy • ✉️ {pharm.email}</p>
                                        </div>
                                        <div className="flex items-center gap-2" style={clickableStyle}>
                                            {pharm.status?.toLowerCase() === 'pending' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleApprove(pharm.id); }}
                                                    disabled={!!actionLoading[`approve-${pharm.id}`]}
                                                    style={clickableStyle}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {actionLoading[`approve-${pharm.id}`] ? <Loader2 size={14} className="animate-spin" /> : null}
                                                    Approve
                                                </button>
                                            )}
                                            {pharm.status?.toLowerCase() === 'active' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleReject(pharm.id); }}
                                                    disabled={!!actionLoading[`reject-${pharm.id}`]}
                                                    style={clickableStyle}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-white text-[var(--color-text-secondary)] border border-[rgba(26,111,196,0.15)] hover:bg-[var(--color-primary-light)] shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {actionLoading[`reject-${pharm.id}`] ? <Loader2 size={14} className="animate-spin" /> : null}
                                                    Revoke
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ open: true, userId: pharm.id, userName: pharm.name, role: 'Pharmacist' }); }}
                                                style={clickableStyle}
                                                className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                                </AnimatePresence>
                                {pharmacists.length === 0 && <EmptyState icon={Store} title="No Pharmacists" description="No pharmacists registered." />}
                            </div>
                        </Card>
                    </motion.div>
                )}

                {activeTab === 'settings' && (
                    <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <Card className="flex flex-col items-center justify-center py-20 text-[var(--color-text-secondary)]">
                            <Settings size={48} className="mb-4 text-[var(--color-primary)]/30 animate-[spin_6s_linear_infinite]" />
                            <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">Platform Configuration</h3>
                            <p className="text-sm">Global configuration and module management coming soon.</p>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirm.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setDeleteConfirm({ open: false, userId: null, userName: '', role: '' })}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-sm glass-card !rounded-3xl flex flex-col items-center !p-8 text-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-6">
                                <Trash2 size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">Delete {deleteConfirm.role}?</h3>
                            <p className="text-[var(--color-text-secondary)] mb-6 text-sm">
                                Are you sure you want to delete <span className="font-semibold text-[var(--color-text-primary)]">{deleteConfirm.userName}</span>? This cannot be undone.
                            </p>
                            <div className="flex gap-3 w-full">
                                <Button variant="secondary" onClick={() => setDeleteConfirm({ open: false, userId: null, userName: '', role: '' })} className="flex-1">Cancel</Button>
                                <button
                                    onClick={handleDeleteUser}
                                    disabled={!!actionLoading[`delete-${deleteConfirm.userId}`]}
                                    style={clickableStyle}
                                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {actionLoading[`delete-${deleteConfirm.userId}`] ? <><Loader2 size={14} className="animate-spin" /> Deleting...</> : 'Delete'}
                                </button>
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
                            className="absolute inset-0 bg-black/40 backdrop-blur-md"
                            onClick={() => setSelectedDoctorView(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-4xl glass-card !rounded-3xl max-h-[90vh] overflow-y-auto flex flex-col !p-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button onClick={() => setSelectedDoctorView(null)} className="absolute top-6 right-6 p-2 rounded-full bg-[var(--color-primary-light)] hover:bg-[rgba(26,111,196,0.12)] text-[var(--color-text-secondary)] transition-colors">
                                <X size={18} />
                            </button>

                            <div className="flex items-start gap-6 mb-8">
                                <div className="w-20 h-20 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)] text-2xl font-bold">
                                    {selectedDoctorView.name.charAt(0)}
                                </div>
                                <div className="pt-1">
                                    <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1">Dr. {selectedDoctorView.name}</h2>
                                    <p className="text-[var(--color-text-secondary)] mb-2">{selectedDoctorView.specialization || 'General Practice'} • {selectedDoctorView.experience || 0} Years</p>
                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${selectedDoctorView.status?.toLowerCase() === 'active' ? 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]' : 'bg-amber-50 text-amber-700'}`}>
                                        {selectedDoctorView.status?.toLowerCase() === 'active' ? 'Active' : 'Pending'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                {[
                                    { icon: Clock, label: 'Avg Time', value: '30 min' },
                                    { icon: Star, label: 'Rating', value: '4.6/5' },
                                    { icon: Users, label: 'Patients', value: '124' },
                                    { icon: CheckCircle, label: 'Completion', value: '98%' },
                                ].map((s, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-[var(--color-primary-light)]/40 border border-[rgba(26,111,196,0.08)] flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-[var(--color-text-secondary)] text-sm"><s.icon size={14} className="text-[var(--color-primary)]" /> {s.label}</div>
                                        <p className="text-xl font-bold text-[var(--color-text-primary)]">{s.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <Card>
                                    <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2"><BarChart3 size={14} className="text-[var(--color-primary)]" /> Daily Visits</h4>
                                    <div className="h-40">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={doctorStats.visits} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                                <Area type="monotone" dataKey="value" stroke="#1a6fc4" strokeWidth={2} fillOpacity={0.2} fill="#1a6fc4" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>
                                <Card>
                                    <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2"><TrendingUp size={14} className="text-amber-500" /> Rating Trend</h4>
                                    <div className="h-40">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={doctorStats.rating} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[3.5, 5.0]} />
                                                <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} fillOpacity={0.2} fill="#f59e0b" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AppLayout>
    );
};

export default AdminDashboard;
