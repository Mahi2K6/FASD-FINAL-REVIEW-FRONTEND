import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, BellOff, Calendar, Pill, Video, Package, CheckCircle, Trash2,
    Clock, Stethoscope, AlertCircle, X, Filter
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAppContext } from '../../AppContext';
import { useToast } from '../../components/ui/ToastNotification';

/* ═══════════════════════════════════════════════════════════════
 *  MedConnect — Notifications Center
 *  Real notification management with read/unread, filtering,
 *  and clear functionality.
 * ═══════════════════════════════════════════════════════════════ */

const NOTIFICATION_TYPES = {
    appointment: { icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Appointment' },
    prescription: { icon: Pill, color: 'text-indigo-500', bg: 'bg-indigo-50', label: 'Prescription' },
    consultation: { icon: Video, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Consultation' },
    pharmacy: { icon: Package, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Pharmacy' },
    system: { icon: AlertCircle, color: 'text-slate-500', bg: 'bg-slate-50', label: 'System' },
};

// Generate realistic notifications based on current user data
const generateNotifications = (data, role) => {
    const notifs = [];
    const now = Date.now();

    (data?.appointments || []).slice(0, 3).forEach((apt, i) => {
        notifs.push({
            id: `apt-${apt.id || i}`,
            type: 'appointment',
            title: role === 'doctor'
                ? `Appointment with ${apt.patientName || 'Patient'}`
                : `Appointment with Dr. ${apt.doctorName || 'Doctor'}`,
            message: `Scheduled for ${apt.appointmentDate || 'upcoming'}. ${apt.status === 'CONFIRMED' ? 'Confirmed by doctor.' : 'Awaiting confirmation.'}`,
            time: new Date(now - (i + 1) * 3600000).toISOString(),
            read: i > 0,
        });
    });

    (data?.prescriptions || []).slice(0, 2).forEach((rx, i) => {
        notifs.push({
            id: `rx-${rx.id || i}`,
            type: 'prescription',
            title: 'New Prescription Added',
            message: `Dr. ${rx.doctorName || rx.doctor_name || 'Doctor'} has prescribed ${rx.medicines?.length || 0} medicine(s).`,
            time: new Date(now - (i + 2) * 7200000).toISOString(),
            read: i > 0,
        });
    });

    notifs.push({
        id: 'sys-welcome',
        type: 'system',
        title: 'Welcome to MedConnect',
        message: 'Your account has been set up successfully. Explore all features from your dashboard.',
        time: new Date(now - 86400000 * 3).toISOString(),
        read: true,
    });

    if (role === 'patient') {
        notifs.push({
            id: 'consul-tip',
            type: 'consultation',
            title: 'Video Consultation Available',
            message: 'You can now join video consultations directly from your appointments tab.',
            time: new Date(now - 86400000).toISOString(),
            read: false,
        });
    }

    if (role === 'pharmacist') {
        notifs.push({
            id: 'pharma-order',
            type: 'pharmacy',
            title: 'New Order Received',
            message: 'A patient has placed an order for 3 medicines. Check your orders tab.',
            time: new Date(now - 1800000).toISOString(),
            read: false,
        });
    }

    return notifs.sort((a, b) => new Date(b.time) - new Date(a.time));
};

const Notifications = () => {
    const { data, currentUser } = useAppContext();
    const toast = useToast();
    const role = currentUser?.role?.toLowerCase() || 'patient';

    const [notifications, setNotifications] = useState(() => generateNotifications(data, role));
    const [filter, setFilter] = useState('all');

    const filtered = useMemo(() => {
        if (filter === 'all') return notifications;
        if (filter === 'unread') return notifications.filter(n => !n.read);
        return notifications.filter(n => n.type === filter);
    }, [notifications, filter]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        toast.success('All Read', 'All notifications marked as read.');
    };

    const clearAll = () => {
        setNotifications([]);
        toast.success('Cleared', 'All notifications have been removed.');
    };

    const removeOne = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const formatTimeAgo = (isoStr) => {
        const diff = Date.now() - new Date(isoStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    return (
        <AppLayout activeTab="notifications" setActiveTab={() => {}}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto space-y-5"
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Bell size={22} className="text-blue-500" />
                            Notifications
                            {unreadCount > 0 && (
                                <span className="text-[11px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">{unreadCount}</span>
                            )}
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <Button variant="ghost" size="sm" icon={CheckCircle} onClick={markAllRead}>Mark All Read</Button>
                        )}
                        {notifications.length > 0 && (
                            <Button variant="ghost" size="sm" icon={Trash2} onClick={clearAll}>Clear All</Button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 flex-wrap">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'unread', label: `Unread (${unreadCount})` },
                        { key: 'appointment', label: 'Appointments' },
                        { key: 'prescription', label: 'Prescriptions' },
                        { key: 'consultation', label: 'Consultations' },
                        { key: 'system', label: 'System' },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                                filter === key
                                    ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/20'
                                    : 'bg-white/70 text-slate-500 border border-slate-200 hover:border-blue-200'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Notification List */}
                {filtered.length === 0 ? (
                    <Card className="text-center py-16" hover={false}>
                        <BellOff size={36} className="text-slate-300 mx-auto mb-3" />
                        <h3 className="text-sm font-bold text-slate-600 mb-1">
                            {filter === 'all' ? 'No Notifications' : 'No matching notifications'}
                        </h3>
                        <p className="text-xs text-slate-400">
                            {filter === 'all' ? "You're all caught up!" : 'Try a different filter.'}
                        </p>
                    </Card>
                ) : (
                    <div className="space-y-2">
                        <AnimatePresence>
                            {filtered.map((notif) => {
                                const config = NOTIFICATION_TYPES[notif.type] || NOTIFICATION_TYPES.system;
                                const Icon = config.icon;

                                return (
                                    <motion.div
                                        key={notif.id}
                                        layout
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10, height: 0 }}
                                        onClick={() => markAsRead(notif.id)}
                                        className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all group ${
                                            notif.read
                                                ? 'bg-white/50 border-slate-100 hover:bg-slate-50/80'
                                                : 'bg-blue-50/40 border-blue-200/50 hover:bg-blue-50/60'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                                            <Icon size={18} className={config.color} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className={`text-sm font-semibold ${notif.read ? 'text-slate-600' : 'text-slate-800'}`}>
                                                    {notif.title}
                                                </h4>
                                                {!notif.read && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <Clock size={10} className="text-slate-400" />
                                                <span className="text-[10px] text-slate-400 font-medium">{formatTimeAgo(notif.time)}</span>
                                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                                                    {config.label}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeOne(notif.id); }}
                                            className="text-slate-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                                        >
                                            <X size={14} />
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </motion.div>
        </AppLayout>
    );
};

export default Notifications;
