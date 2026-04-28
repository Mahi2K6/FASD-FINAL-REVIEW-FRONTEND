import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    CreditCard, DollarSign, Calendar, Pill, Video, Package, Download,
    ChevronDown, Filter, ArrowUpRight, ArrowDownLeft, CheckCircle, Clock, XCircle, AlertTriangle
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAppContext } from '../../AppContext';
import { useToast } from '../../components/ui/ToastNotification';
import { paymentService } from '../../services/paymentService';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';

/* ═══════════════════════════════════════════════════════════════
 *  MedConnect — Billing & Payments
 *  Full transaction history with filtering, role-aware data,
 *  and payment summaries.
 * ═══════════════════════════════════════════════════════════════ */



const TYPE_CONFIG = {
    consultation: { icon: Video, color: 'text-blue-500', bg: 'bg-blue-50' },
    medicine: { icon: Pill, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    pharmacy: { icon: Package, color: 'text-amber-500', bg: 'bg-amber-50' },
    platform: { icon: CreditCard, color: 'text-slate-500', bg: 'bg-slate-50' },
    refund: { icon: ArrowDownLeft, color: 'text-emerald-500', bg: 'bg-emerald-50' },
};

const STATUS_CONFIG = {
    completed: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Completed' },
    pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Pending' },
    failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Failed' },
};

const Billing = () => {
    const { data, currentUser } = useAppContext();
    const toast = useToast();
    const role = currentUser?.role?.toLowerCase() || 'patient';

    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await paymentService.fetchPaymentHistory();
            setTransactions(data);
        } catch (err) {
            setError(err.message || 'Failed to load billing history');
        } finally {
            setIsLoading(false);
        }
    };

    const filtered = useMemo(() => {
        if (filter === 'all') return transactions;
        return transactions.filter(t => t.type === filter);
    }, [transactions, filter]);

    const summary = useMemo(() => paymentService.getPaymentSummary(transactions), [transactions]);

    const formatDate = (iso) => {
        try {
            return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch { return 'N/A'; }
    };

    return (
        <AppLayout activeTab="billing" setActiveTab={() => {}}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto space-y-6"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <CreditCard size={22} className="text-blue-500" />
                            Billing & Payments
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            {role === 'doctor' ? 'Earnings and platform fees' : role === 'pharmacist' ? 'Order revenue and expenses' : 'Consultation and pharmacy payments'}
                        </p>
                    </div>
                    <Button variant="secondary" size="sm" icon={Download} onClick={() => toast.success('Export', 'Transaction history downloaded.')}>
                        Export
                    </Button>
                </div>

                {/* Summary Cards */}
                {isLoading ? (
                    <SkeletonLoader type="grid" count={1} />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            {
                                label: 'Total Spent',
                                value: `₹${summary.totalSpent.toLocaleString()}`,
                                color: 'from-blue-500 to-indigo-600',
                                icon: DollarSign,
                            },
                            {
                                label: 'Refunds Received',
                                value: `₹${summary.refundsReceived.toLocaleString()}`,
                                color: 'from-emerald-400 to-teal-500',
                                icon: ArrowDownLeft,
                            },
                            {
                                label: 'Pending Payments',
                                value: summary.pendingCount.toString(),
                                color: 'from-amber-400 to-orange-500',
                                icon: Clock,
                            },
                            {
                                label: 'Failed Payments',
                                value: summary.failedCount.toString(),
                                color: 'from-red-400 to-rose-500',
                                icon: XCircle,
                            },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className="relative overflow-hidden rounded-2xl p-5 bg-white/70 border border-slate-200/60 shadow-sm"
                            >
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                                <h3 className={`text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r ${stat.color}`}>{stat.value}</h3>
                                <div className={`absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br ${stat.color} opacity-5 blur-xl`} />
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Filters */}
                <div className="flex gap-2 flex-wrap">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'consultation', label: 'Consultations' },
                        { key: 'medicine', label: 'Medicines' },
                        { key: 'refund', label: 'Refunds' },
                        ...(role === 'doctor' ? [{ key: 'platform', label: 'Platform Fees' }] : []),
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

                {/* Transaction List */}
                {isLoading ? (
                    <Card hover={false} className="!p-5">
                        <SkeletonLoader type="table" count={1} />
                    </Card>
                ) : error ? (
                    <Card hover={false} className="!p-8 text-center bg-red-50/50 border-red-100">
                        <AlertTriangle className="text-red-400 mx-auto mb-3" size={32} />
                        <h3 className="text-sm font-bold text-red-800 mb-2">Failed to load transactions</h3>
                        <p className="text-xs text-red-600 mb-4">{error}</p>
                        <Button variant="secondary" onClick={loadData} size="sm">Try Again</Button>
                    </Card>
                ) : filtered.length === 0 ? (
                    <Card className="!p-0" hover={false}>
                        <EmptyState 
                            icon={CreditCard}
                            title="No Transactions"
                            description="Your payment history will appear here once you make a transaction."
                        />
                    </Card>
                ) : (
                    <Card hover={false} className="!p-0 overflow-hidden">
                        {/* Table header */}
                        <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <div className="col-span-5">Transaction</div>
                            <div className="col-span-2">Date</div>
                            <div className="col-span-2">Method</div>
                            <div className="col-span-1">Status</div>
                            <div className="col-span-2 text-right">Amount</div>
                        </div>

                        {filtered.map((txn, idx) => {
                            const typeConf = TYPE_CONFIG[txn.type] || TYPE_CONFIG.platform;
                            const statusConf = STATUS_CONFIG[txn.status] || STATUS_CONFIG.completed;
                            const TypeIcon = typeConf.icon;

                            return (
                                <motion.div
                                    key={txn.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className="grid grid-cols-12 gap-3 px-5 py-3.5 items-center border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                                >
                                    {/* Transaction */}
                                    <div className="col-span-5 flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-xl ${typeConf.bg} flex items-center justify-center shrink-0`}>
                                            <TypeIcon size={16} className={typeConf.color} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-700 truncate">{txn.description}</p>
                                            <p className="text-[10px] text-slate-400 font-mono">{txn.id}</p>
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div className="col-span-2">
                                        <p className="text-xs text-slate-600">{formatDate(txn.date)}</p>
                                    </div>

                                    {/* Method */}
                                    <div className="col-span-2">
                                        <p className="text-xs text-slate-500">{txn.method}</p>
                                    </div>

                                    {/* Status */}
                                    <div className="col-span-1">
                                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusConf.bg} ${statusConf.color}`}>
                                            <statusConf.icon size={10} />
                                            {statusConf.label}
                                        </span>
                                    </div>

                                    {/* Amount */}
                                    <div className="col-span-2 text-right">
                                        <span className={`text-sm font-bold ${txn.direction === 'in' ? 'text-emerald-600' : 'text-slate-800'}`}>
                                            {txn.direction === 'in' ? '+' : '-'}₹{txn.amount.toLocaleString()}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </Card>
                )}
            </motion.div>
        </AppLayout>
    );
};

export default Billing;
