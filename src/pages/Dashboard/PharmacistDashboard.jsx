import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, Clock, Check, Package, Loader2, RefreshCw, Send, Activity, LayoutGrid, CheckCircle, Plus, Edit2, X, Save, AlertTriangle, Trash2 } from 'lucide-react';
import { useAppContext } from '../../AppContext';
import API from '../../api';
import AppLayout from '../../components/layout/AppLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatCard from '../../components/ui/StatCard';
import EmptyState from '../../components/ui/EmptyState';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../components/ui/ToastNotification';

const PharmacistDashboard = () => {
    const location = useLocation();

    // Derive activeTab from URL path — no more stale local state
    const pathSegment = location.pathname.split('/').pop();
    const activeTab = (['orders','inventory','history'].includes(pathSegment))
        ? pathSegment
        : 'orders';
    const { currentUser, data, updateData, logout, loadingDb } = useAppContext();
    const toast = useToast();

    // Inventory Native State
    const [inventory, setInventory] = useState([]);
    const [inventoryLoading, setInventoryLoading] = useState(true);

    // Edit functionality states
    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState({});

    // Add Modal form state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newMedicine, setNewMedicine] = useState({
        name: '', quantity: 0, price: 0, unit: 'tablets', category: 'Other', minThreshold: 10
    });

    // Delete confirmation state
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, name: '' });

    // Submit loading state
    const [submitting, setSubmitting] = useState(false);

    // Reusable fetch function
    const fetchInventory = async () => {
        try {
            setInventoryLoading(true);
            const res = await API.get('/inventory');
            console.log('Inventory loaded:', res.data?.length, 'items');
            setInventory(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Failed to fetch inventory', err);
            toast.error('Error', 'Failed to load inventory.');
        } finally {
            setInventoryLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    if (loadingDb || !currentUser || !data || !data.prescriptions) {
        return (
            <AppLayout activeTab={activeTab} setActiveTab={() => {}}>
                <div className="flex items-center justify-center h-64">
                    <Loader2 size={32} className="text-[var(--color-primary)] animate-spin" />
                </div>
            </AppLayout>
        );
    }

    // Pending approval guard
    if (currentUser?.status === 'pending') {
        return (
            <AppLayout activeTab={activeTab} setActiveTab={() => {}}>
                <div className="flex items-center justify-center h-[60vh]">
                    <Card className="max-w-md text-center">
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock size={28} className="text-amber-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-2">Account Under Review</h2>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                            Your pharmacy credentials are being verified by an admin. You'll be granted access once approved.
                        </p>
                        <Button variant="secondary" onClick={logout} className="w-full">Log Out</Button>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    const enrichedPrescriptions = useMemo(() => {
        return (data.prescriptions || []).map(p => {
            const patient = (data.users || []).find(u => u.id === p.patientId);
            const doctor = (data.doctors || []).find(d => d.id === p.doctorId);
            return {
                ...p,
                patientName: patient ? patient.name : (p.patientName || `Patient #${p.patientId}`),
                doctorName: doctor ? doctor.name : (p.doctorName || `Doctor #${p.doctorId}`),
            };
        });
    }, [data.prescriptions, data.users, data.doctors]);

    const pendingPrescriptions = enrichedPrescriptions.filter(p => p.status === 'pending');
    const readyPrescriptions = enrichedPrescriptions.filter(p => p.status === 'ready');
    const dispensedPrescriptions = enrichedPrescriptions.filter(p => p.status === 'dispensed');

    const lowStockCount = inventory.filter(i => i.quantity <= i.minThreshold).length;
    const totalMedicines = inventory.length;
    const totalValue = inventory.reduce((sum, i) => sum + ((i.price || 0) * (i.quantity || 0)), 0);

    const handleMarkReady = (rxId) => {
        const updated = (data.prescriptions || []).map(p =>
            p.id === rxId ? { ...p, status: 'ready' } : p
        );
        updateData('prescriptions', updated);
        console.log("API Request:", { endpoint: `/prescriptions/${rxId}/notes`, method: 'PUT', payload: { notes: 'status:ready' } });
        API.put(`/prescriptions/${rxId}/notes`, { notes: 'status:ready' })
          .catch(err => {
              console.error('Mark ready error:', err);
              toast.error('Error', err.response?.data?.message || 'Failed to update prescription status.');
          });
    };

    const handleMarkDispensed = (rxId) => {
        const updated = (data.prescriptions || []).map(p =>
            p.id === rxId ? { ...p, status: 'dispensed' } : p
        );
        updateData('prescriptions', updated);
        console.log("API Request:", { endpoint: `/prescriptions/${rxId}/notes`, method: 'PUT', payload: { notes: 'status:dispensed' } });
        API.put(`/prescriptions/${rxId}/notes`, { notes: 'status:dispensed' })
          .catch(err => {
              console.error('Mark dispensed error:', err);
              toast.error('Error', err.response?.data?.message || 'Failed to update prescription status.');
          });
    };

    const renderMedicines = (meds) => {
        let medList = meds;
        if (typeof meds === 'string') medList = meds.split(',');
        if (!Array.isArray(medList)) return null;
        return medList.map((m, i) => {
            const name = typeof m === 'object' ? m.name : m.trim();
            const dosage = typeof m === 'object' ? m.dosage : null;
            return (
                <span key={i} className="text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md border border-emerald-100 flex items-center gap-1 shrink-0">
                    <Activity size={10} className="opacity-50" />
                    {name} {dosage && <span className="opacity-60 font-medium ml-0.5">{dosage}</span>}
                </span>
            );
        });
    };

    const handleSaveEdit = async (id) => {
        try {
            const dataToUpdate = {
                quantity: Number(editValues.quantity),
                price: Number(editValues.price),
                minThreshold: Number(editValues.minThreshold)
            };
            console.log("API Request:", { endpoint: `/inventory/${id}`, method: 'PUT', payload: dataToUpdate });
            await API.put(`/inventory/${id}`, dataToUpdate);
            setEditingId(null);
            toast.success('Updated', 'Inventory updated successfully.');
            await fetchInventory();
        } catch (err) {
            console.error('Update error:', err.response?.data);
            const errorMsg = typeof err.response?.data === 'string'
                ? err.response.data
                : err.response?.data?.message || 'Failed to update inventory.';
            toast.error('Error', errorMsg);
        }
    };

    const handleDeleteMedicine = async (id) => {
        try {
            console.log("API Request:", { endpoint: `/inventory/${id}`, method: 'DELETE' });
            await API.delete(`/inventory/${id}`);
            toast.success('Deleted', 'Medicine removed from inventory.');
            setDeleteConfirm({ open: false, id: null, name: '' });
            await fetchInventory();
        } catch (err) {
            console.error('Delete error:', err.response?.data);
            const errorMsg = typeof err.response?.data === 'string'
                ? err.response.data
                : err.response?.data?.message || 'Failed to delete medicine.';
            toast.error('Error', errorMsg);
        }
    };

    const handleAddMedicine = async (e) => {
        e.preventDefault();

        // RAW STATE DUMP — see exactly what React state holds
        console.log('=== RAW newMedicine STATE ===', JSON.stringify(newMedicine));
        console.log('name type:', typeof newMedicine.name, '| value:', `"${newMedicine.name}"`);
        console.log('quantity type:', typeof newMedicine.quantity, '| value:', newMedicine.quantity);
        console.log('price type:', typeof newMedicine.price, '| value:', newMedicine.price);

        const trimmedName = (newMedicine.name || '').trim();
        const qty = Number(newMedicine.quantity) || 0;
        const prc = Number(newMedicine.price) || 0;

        // Strict client-side validation
        if (!trimmedName || trimmedName === '') {
            toast.error('Validation', 'Medicine name is required.');
            return;
        }
        if (qty <= 0) {
            toast.error('Validation', 'Quantity must be greater than 0.');
            return;
        }
        if (prc <= 0) {
            toast.error('Validation', 'Price must be greater than 0.');
            return;
        }

        const payload = {
            name: trimmedName,
            quantity: qty,
            price: prc,
            unit: (newMedicine.unit || 'tablets').trim(),
            category: newMedicine.category || 'Other',
            minThreshold: Number(newMedicine.minThreshold) || 10
        };

        console.log("API Request:", {
            endpoint: '/inventory',
            method: 'POST',
            payload: payload
        });

        setSubmitting(true);
        try {
            const res = await API.post('/inventory', payload);
            console.log("=== SUCCESS RESPONSE ===", res.data);
            setIsAddModalOpen(false);
            setNewMedicine({ name: '', quantity: 0, price: 0, unit: 'tablets', category: 'Other', minThreshold: 10 });
            toast.success('Added', 'Medicine added successfully.');
            await fetchInventory();
        } catch (err) {
            console.error("=== ADD MEDICINE ERROR ===");
            console.error("Status:", err.response?.status);
            console.error("Response data:", err.response?.data);

            const errorMsg = typeof err.response?.data === 'string'
                ? err.response.data
                : err.response?.data?.message || err.message || 'Failed to add medicine.';
            toast.error('Error', errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AppLayout activeTab={activeTab} setActiveTab={() => {}}>
            {/* Welcome Hero Card */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden rounded-[var(--radius-xl)] p-6 md:p-8 mb-6"
                style={{
                    background: 'rgba(255,255,255,0.72)',
                    backdropFilter: 'blur(24px) saturate(160%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(160%)',
                    border: '1px solid rgba(255,255,255,0.65)',
                    boxShadow: '0 8px 32px rgba(15,23,42,0.06), 0 0 0 1px rgba(255,255,255,0.5), inset 0 1px 0 rgba(255,255,255,0.7)',
                }}
            >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-fuchsia-400 to-pink-500 opacity-60" />
                <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gradient-to-br from-purple-400/[0.06] to-fuchsia-400/[0.04] blur-3xl pointer-events-none" />
                <div className="relative z-10">
                    <p className="text-[11px] font-bold text-purple-500/70 uppercase tracking-[0.15em] mb-1.5">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                    <h2 className="text-[26px] md:text-[30px] font-extrabold text-slate-800 tracking-tight leading-tight">
                        <span className="font-normal text-slate-400">{new Date().getHours() < 12 ? 'Good morning,' : new Date().getHours() < 18 ? 'Good afternoon,' : 'Good evening,'}</span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600"> {currentUser?.name?.split(' ')[0]}</span>
                    </h2>
                    <p className="text-slate-400 text-[13px] mt-1.5 font-medium">Manage pharmacy inventory and process prescriptions.</p>
                </div>
            </motion.div>

            {/* ─── GLOBAL STATS ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard label="Total Medicines" value={totalMedicines} icon={Package} color="from-blue-500 to-indigo-600" />
                <StatCard label="Low Stock ⚠️" value={lowStockCount} icon={AlertTriangle} color="from-rose-400 to-red-500" />
                <StatCard label="Total Stock Value" value={`₹${totalValue.toLocaleString()}`} icon={Activity} color="from-emerald-400 to-teal-500" />
                <StatCard label="Pending Rx" value={pendingPrescriptions.length} icon={Clock} color="from-amber-400 to-orange-500" />
            </div>

            <AnimatePresence mode="wait">
                {/* ─── ORDERS FEED ─── */}
                {activeTab === 'orders' && (
                    <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Rx Kanban Board</h2>
                        </div>

                        {/* Kanban Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
                            
                            {/* Column 1: Pending */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between pb-3 border-b-2 border-amber-200">
                                    <h3 className="font-bold text-amber-700 flex items-center gap-2 uppercase tracking-wide text-sm">
                                        <Clock size={16} /> Pending Fulfillment
                                    </h3>
                                    <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">{pendingPrescriptions.length}</span>
                                </div>
                                {pendingPrescriptions.length === 0 ? (
                                    <EmptyState icon={LayoutGrid} title="Clear Queue" description="No prescriptions pending." />
                                ) : (
                                    <div className="space-y-3">
                                        <AnimatePresence>
                                            {pendingPrescriptions.map((rx) => (
                                                <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} key={rx.id} className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-sm hover:shadow-md transition-all rounded-3xl p-5 group flex flex-col gap-4 relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400"></div>
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Rx #{rx.id}</div>
                                                            <h4 className="font-bold text-slate-800">{rx.patientName || 'Unknown Patient'}</h4>
                                                            <p className="text-xs font-medium text-slate-500 mt-0.5">Dr. {rx.doctorName || 'Unknown'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {renderMedicines(rx.medicines)}
                                                    </div>
                                                    <div className="pt-3 border-t border-slate-100 flex justify-end">
                                                        <Button size="sm" icon={RefreshCw} onClick={() => handleMarkReady(rx.id)} className="w-full justify-center !rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 border-0">
                                                            Process Order
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>

                            {/* Column 2: Ready */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between pb-3 border-b-2 border-emerald-200">
                                    <h3 className="font-bold text-emerald-700 flex items-center gap-2 uppercase tracking-wide text-sm">
                                        <Check size={16} /> Ready for Pickup
                                    </h3>
                                    <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">{readyPrescriptions.length}</span>
                                </div>
                                {readyPrescriptions.length === 0 ? (
                                    <EmptyState icon={Package} title="No packages ready" description="Processed orders will appear here." />
                                ) : (
                                    <div className="space-y-3">
                                        <AnimatePresence>
                                            {readyPrescriptions.map((rx) => (
                                                <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} key={rx.id} className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-sm hover:shadow-md transition-all rounded-3xl p-5 group flex flex-col gap-4 relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-400"></div>
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Rx #{rx.id}</div>
                                                            <h4 className="font-bold text-slate-800">{rx.patientName || 'Unknown Patient'}</h4>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5 opacity-60 grayscale">
                                                        {renderMedicines(rx.medicines)}
                                                    </div>
                                                    <div className="pt-3 border-t border-slate-100 flex justify-end">
                                                        <Button size="sm" icon={Send} onClick={() => handleMarkDispensed(rx.id)} className="w-full justify-center !rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 border-0 shadow-emerald-200 shadow-sm">
                                                            Handover & Dispense
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>

                            {/* Column 3: Dispensed */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
                                    <h3 className="font-bold text-slate-600 flex items-center gap-2 uppercase tracking-wide text-sm">
                                        <CheckCircle size={16} /> Dispensed
                                    </h3>
                                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{dispensedPrescriptions.length}</span>
                                </div>
                                {dispensedPrescriptions.length === 0 ? (
                                    <EmptyState icon={ShoppingBag} title="No recent dispensations" description="Completed pickups land here." />
                                ) : (
                                    <div className="space-y-3">
                                        <AnimatePresence>
                                            {dispensedPrescriptions.slice(0, 15).map((rx) => (
                                                <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} key={rx.id} className="bg-slate-50/50 backdrop-blur-xl border border-slate-100 rounded-3xl p-5 flex flex-col gap-3 relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                                        <CheckCircle size={64} />
                                                    </div>
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Rx #{rx.id}</div>
                                                            <h4 className="font-bold text-slate-500 line-through">{rx.patientName || 'Unknown Patient'}</h4>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 uppercase">Done</span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                            
                        </div>

                    </motion.div>
                )}

                {/* ─── INVENTORY TAB ─── */}
                {activeTab === 'inventory' && (
                    <motion.div key="inventory" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Inventory Intelligence</h2>
                            <Button icon={Plus} onClick={() => setIsAddModalOpen(true)}>Add Medicine</Button>
                        </div>
                        
                        {inventoryLoading ? (
                            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-slate-400" /></div>
                        ) : inventory.length === 0 ? (
                            <EmptyState icon={Package} title="No Inventory Found" description="Add your first medicine to manage stock." />
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                {inventory.map(item => {
                                    const isEditing = editingId === item.id;
                                    const qty = item.quantity || 0;
                                    const threshold = item.minThreshold || 10;
                                    
                                    const pctRaw = (qty / (qty + threshold)) * 100;
                                    const pct = Math.min(100, Math.max(0, isNaN(pctRaw) ? 0 : pctRaw));
                                    
                                    const isLow = qty <= threshold;
                                    const isWarning = qty > threshold && qty <= threshold * 2;
                                    const isGood = qty > threshold * 2;
                                    
                                    let colorClass = 'bg-emerald-400';
                                    let textColor = 'text-emerald-500';
                                    if (isLow) {
                                        colorClass = 'bg-red-400 animate-pulse';
                                        textColor = 'text-red-500';
                                    } else if (isWarning) {
                                        colorClass = 'bg-amber-400';
                                        textColor = 'text-amber-500';
                                    }

                                    const categoryMap = {
                                        'Antibiotic': 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
                                        'Painkiller': 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
                                        'Diabetes': 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
                                        'Cardiac': 'bg-red-50 text-red-700 ring-1 ring-red-200',
                                        'Gastric': 'bg-teal-50 text-teal-700 ring-1 ring-teal-200',
                                        'Antihistamine': 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200',
                                        'Other': 'bg-slate-50 text-slate-700 ring-1 ring-slate-200'
                                    };
                                    
                                    const catClass = categoryMap[item.category] || categoryMap['Other'];

                                    return (
                                        <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={item.id} className="bg-white rounded-2xl p-4 border border-[rgba(0,0,0,0.06)] shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-md hover:-translate-y-[2px] transition-all duration-200 flex flex-col justify-between h-full relative group">
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${catClass}`}>{item.category || 'Other'}</span>
                                                    {!isEditing && (
                                                        <span className="flex items-baseline gap-0.5">
                                                            <span className="text-slate-400 text-xs">₹</span>
                                                            <span className="font-bold text-slate-800 tabular-nums text-sm">{item.price}</span>
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="font-bold text-slate-800 text-base leading-tight mb-4">{item.name}</h4>
                                            </div>

                                            {isEditing ? (
                                                <div className="space-y-3 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Qty</label>
                                                            <input type="number" min="0" className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-sm font-bold" value={editValues.quantity} onChange={(e)=>setEditValues({...editValues, quantity: e.target.value})} />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Price</label>
                                                            <input type="number" step="0.01" className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-sm font-bold" value={editValues.price} onChange={(e)=>setEditValues({...editValues, price: e.target.value})} />
                                                        </div>
                                                        <div className="col-span-2">
                                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Min Threshold</label>
                                                            <input type="number" min="0" className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-sm font-bold" value={editValues.minThreshold} onChange={(e)=>setEditValues({...editValues, minThreshold: e.target.value})} />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 pt-2">
                                                        <Button size="sm" variant="danger" icon={X} onClick={() => setEditingId(null)} className="flex-1 justify-center !py-1">Cancel</Button>
                                                        <Button size="sm" icon={Save} onClick={() => handleSaveEdit(item.id)} className="flex-1 justify-center !py-1">Save</Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mt-4">
                                                    <div className="flex items-end justify-between mb-2">
                                                        <div>
                                                            <span className={`text-xl font-bold tabular-nums ${textColor}`}>{qty} <span className="text-[10px] text-slate-400 uppercase tracking-widest ml-0.5">Left</span></span>
                                                            {isLow && <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-widest flex items-center gap-1"><AlertTriangle size={10} /> Low Stock</p>}
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => {
                                                                setEditingId(item.id);
                                                                setEditValues({ quantity: item.quantity, price: item.price, minThreshold: item.minThreshold });
                                                            }} className="text-slate-400 hover:text-blue-500 transition-colors p-1 bg-slate-100 rounded-md">
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button onClick={() => setDeleteConfirm({ open: true, id: item.id, name: item.name })} className="text-slate-400 hover:text-red-500 transition-colors p-1 bg-slate-100 rounded-md">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="bg-slate-100 rounded-full h-1.5 w-full overflow-hidden">
                                                        <div className={`h-1.5 rounded-full transition-all duration-500 ${colorClass}`} style={{ width: `${pct}%` }}></div>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ─── HISTORY TAB ─── */}
                {activeTab === 'history' && (
                    <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Order History</h2>
                        <Card className="!p-0 overflow-hidden">
                            <Table
                                columns={[
                                    { header: 'Order', render: (row) => <span className="font-medium text-[var(--color-text-primary)]">#{row.id}</span> },
                                    { header: 'Patient', accessor: 'patientName' },
                                    { header: 'Doctor', accessor: 'doctorName' },
                                    { header: 'Status', render: (row) => (
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                            row.status === 'ready' ? 'bg-emerald-50 text-emerald-600' :
                                            row.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                            'bg-white/40 border border-white/20 text-[var(--color-text-secondary)] backdrop-blur-md'
                                        }`}>
                                            {row.status}
                                        </span>
                                    )},
                                    { header: 'Date', accessor: 'date' },
                                ]}
                                data={data.prescriptions || []}
                                emptyMessage="No order history"
                                emptyIcon={Clock}
                            />
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── ADD MEDICINE MODAL ─── */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Medicine">
                <form onSubmit={handleAddMedicine} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Medicine Name *</label>
                        <input type="text" required placeholder="e.g. Paracetamol 500mg" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={newMedicine.name} onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Quantity *</label>
                            <input type="number" min="1" step="1" required placeholder="100" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={newMedicine.quantity || ''} onChange={(e) => setNewMedicine({...newMedicine, quantity: e.target.value === '' ? '' : Number(e.target.value)})} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Price (₹) *</label>
                            <input type="number" step="0.01" min="0.01" required placeholder="25.00" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={newMedicine.price || ''} onChange={(e) => setNewMedicine({...newMedicine, price: e.target.value === '' ? '' : Number(e.target.value)})} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Unit</label>
                            <input type="text" className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="tablets" value={newMedicine.unit} onChange={(e) => setNewMedicine({...newMedicine, unit: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Min Threshold</label>
                            <input type="number" min="0" className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={newMedicine.minThreshold} onChange={(e) => setNewMedicine({...newMedicine, minThreshold: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                        <select className="w-full border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white" value={newMedicine.category} onChange={(e) => setNewMedicine({...newMedicine, category: e.target.value})}>
                            <option value="Antibiotic">Antibiotic</option>
                            <option value="Painkiller">Painkiller</option>
                            <option value="Diabetes">Diabetes</option>
                            <option value="Cardiac">Cardiac</option>
                            <option value="Gastric">Gastric</option>
                            <option value="Antihistamine">Antihistamine</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button type="submit" loading={submitting} disabled={submitting || !(newMedicine.name || '').trim() || !Number(newMedicine.quantity) || !Number(newMedicine.price)}>
                            {submitting ? 'Adding...' : 'Add Medicine'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* ─── DELETE CONFIRMATION MODAL ─── */}
            <Modal isOpen={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, id: null, name: '' })} title="Delete Medicine">
                <div className="text-center py-4">
                    <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash2 size={24} className="text-red-500" />
                    </div>
                    <p className="text-slate-700 font-medium mb-1">Are you sure you want to delete</p>
                    <p className="text-lg font-bold text-slate-900 mb-4">{deleteConfirm.name}?</p>
                    <p className="text-sm text-slate-500 mb-6">This action cannot be undone.</p>
                    <div className="flex justify-center gap-3">
                        <Button variant="secondary" onClick={() => setDeleteConfirm({ open: false, id: null, name: '' })}>Cancel</Button>
                        <Button variant="danger" icon={Trash2} onClick={() => handleDeleteMedicine(deleteConfirm.id)}>Delete</Button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
};

export default PharmacistDashboard;
