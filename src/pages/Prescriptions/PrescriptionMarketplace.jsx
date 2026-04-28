import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Pill, Clock, Calendar, User, Star, Truck, ShoppingCart, Package,
    ChevronRight, CheckCircle2, Loader2, X, AlertCircle, MapPin, Shield
} from 'lucide-react';
import { useAppContext } from '../../AppContext';
import { useToast } from '../../components/ui/ToastNotification';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import AppLayout from '../../components/layout/AppLayout';

/* ═══════════════════════════════════════════════════════════════
 *  MedConnect — Prescription Marketplace
 *  ─────────────────────────────────────────────────────────────
 *  Allows patients to view their prescriptions, browse available
 *  pharmacies, and place medicine orders.
 * ═══════════════════════════════════════════════════════════════ */

// Mock pharmacy data — in production, this comes from GET /api/pharmacies/available
const MOCK_PHARMACIES = [
    {
        id: 'PH-001',
        name: 'MedConnect Pharmacy',
        pharmacistName: 'Rajesh Kumar',
        rating: 4.8,
        reviews: 234,
        deliveryTime: '30-45 min',
        deliveryFee: 29,
        discount: 12,
        verified: true,
        avatar: '💊',
    },
    {
        id: 'PH-002',
        name: 'HealthFirst Pharma',
        pharmacistName: 'Priya Sharma',
        rating: 4.6,
        reviews: 189,
        deliveryTime: '45-60 min',
        deliveryFee: 19,
        discount: 8,
        verified: true,
        avatar: '🏥',
    },
    {
        id: 'PH-003',
        name: 'CarePoint Pharmacy',
        pharmacistName: 'Amit Patel',
        rating: 4.5,
        reviews: 156,
        deliveryTime: '60-90 min',
        deliveryFee: 0,
        discount: 15,
        verified: false,
        avatar: '🩺',
    },
];

// Estimate price based on medicine name (simulated)
const estimatePrice = (medicineName) => {
    const hash = medicineName.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return 50 + (hash % 400);
};

const PrescriptionMarketplace = () => {
    const { data, currentUser } = useAppContext();
    const navigate = useNavigate();
    const toast = useToast();

    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [selectedPharmacy, setSelectedPharmacy] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [isOrdering, setIsOrdering] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(null);
    const [loading, setLoading] = useState(true);

    const prescriptions = useMemo(() => {
        return (data?.prescriptions || [])
            .filter(p => {
                const patientId = currentUser?.id?.toString();
                return (
                    p.patient_id?.toString() === patientId ||
                    p.patientId?.toString() === patientId
                );
            })
            .sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0));
    }, [data?.prescriptions, currentUser?.id]);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 600);
        return () => clearTimeout(timer);
    }, []);

    // Compute cart total
    const cartTotal = useMemo(() => {
        if (!selectedPrescription?.medicines) return 0;
        return selectedPrescription.medicines.reduce((sum, med) => {
            return sum + estimatePrice(med.name || med.medicineName || 'Medicine');
        }, 0);
    }, [selectedPrescription]);

    const handleOrder = async () => {
        if (!selectedPharmacy || !selectedPrescription) return;
        setIsOrdering(true);

        // Simulate order placement
        await new Promise(resolve => setTimeout(resolve, 1500));

        const order = {
            id: 'ORD-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
            prescriptionId: selectedPrescription.id,
            pharmacyId: selectedPharmacy.id,
            pharmacyName: selectedPharmacy.name,
            total: cartTotal - (cartTotal * (selectedPharmacy.discount || 0) / 100) + (selectedPharmacy.deliveryFee || 0),
            status: 'CONFIRMED',
            estimatedDelivery: selectedPharmacy.deliveryTime,
            placedAt: new Date().toISOString(),
        };

        setOrderPlaced(order);
        setIsOrdering(false);
        setShowOrderModal(false);
        toast.success('Order Placed!', `Your medicines will arrive in ${selectedPharmacy.deliveryTime}`);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
            });
        } catch { return 'N/A'; }
    };

    if (loading) {
        return (
            <AppLayout activeTab="prescriptions" setActiveTab={() => {}}>
                <div className="flex items-center justify-center h-64">
                    <Loader2 size={32} className="text-[var(--color-primary)] animate-spin" />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout activeTab="prescriptions" setActiveTab={() => {}}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                {/* ── Header ── */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                            <Pill size={22} className="text-blue-500" />
                            Prescription Marketplace
                        </h2>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                            Order medicines from verified pharmacies
                        </p>
                    </div>
                </div>

                {/* ── Order Success Card ── */}
                <AnimatePresence>
                    {orderPlaced && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <Card className="!bg-emerald-50/80 !border-emerald-200/60">
                                <div className="flex items-start gap-4 p-1">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle2 size={24} className="text-emerald-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-emerald-800 text-sm">Order Confirmed!</h4>
                                        <p className="text-emerald-700 text-xs mt-0.5">
                                            Order #{orderPlaced.id} • {orderPlaced.pharmacyName}
                                        </p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-xs text-emerald-600 flex items-center gap-1">
                                                <Truck size={12} /> Est. {orderPlaced.estimatedDelivery}
                                            </span>
                                            <span className="text-xs font-bold text-emerald-800">
                                                ₹{orderPlaced.total?.toFixed(0)}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setOrderPlaced(null)}
                                        className="text-emerald-400 hover:text-emerald-600 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {prescriptions.length === 0 ? (
                    <Card className="text-center py-16">
                        <Pill size={40} className="text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-700 mb-1">No Prescriptions Yet</h3>
                        <p className="text-sm text-slate-500 max-w-sm mx-auto">
                            After your consultation, your doctor will add prescriptions that will appear here.
                        </p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* ── Left Column: Prescriptions List ── */}
                        <div className="lg:col-span-1 space-y-3">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
                                Your Prescriptions ({prescriptions.length})
                            </h3>
                            {prescriptions.map((rx, idx) => {
                                const isSelected = selectedPrescription?.id === rx.id;
                                const doctorName = rx.doctor_name || rx.doctorName || 'Doctor';
                                const medicines = rx.medicines || rx.items || [];
                                const date = rx.created_at || rx.createdAt || rx.date;

                                return (
                                    <motion.div
                                        key={rx.id || idx}
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setSelectedPrescription({ ...rx, medicines });
                                            setSelectedPharmacy(null);
                                        }}
                                        className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                                            isSelected
                                                ? 'bg-blue-50/80 border-blue-200 shadow-md shadow-blue-500/10'
                                                : 'bg-white/70 border-slate-200/60 hover:border-blue-200/60 hover:shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${isSelected ? 'bg-blue-100' : 'bg-slate-100'}`}>
                                                    📋
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">Dr. {doctorName}</p>
                                                    <p className="text-[10px] text-slate-500">{formatDate(date)}</p>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className={`${isSelected ? 'text-blue-500' : 'text-slate-300'} transition-colors`} />
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {medicines.slice(0, 3).map((med, mIdx) => (
                                                <span key={mIdx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                                                    {med.name || med.medicineName || 'Medicine'}
                                                </span>
                                            ))}
                                            {medicines.length > 3 && (
                                                <span className="text-[10px] text-slate-400 font-medium">+{medicines.length - 3} more</span>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* ── Right Column: Details + Pharmacies ── */}
                        <div className="lg:col-span-2 space-y-5">
                            {selectedPrescription ? (
                                <>
                                    {/* Medicine List */}
                                    <Card hover={false}>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                <Package size={16} className="text-blue-500" />
                                                Prescribed Medicines
                                            </h3>
                                            <span className="text-xs text-slate-500 font-medium">
                                                {selectedPrescription.medicines.length} items
                                            </span>
                                        </div>
                                        <div className="space-y-3">
                                            {selectedPrescription.medicines.map((med, idx) => {
                                                const name = med.name || med.medicineName || 'Medicine';
                                                const dosage = med.dosage || med.dose || '';
                                                const quantity = med.quantity || med.qty || '';
                                                const price = estimatePrice(name);

                                                return (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl border border-slate-100"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-lg">
                                                                💊
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-800">{name}</p>
                                                                <p className="text-[11px] text-slate-500">
                                                                    {dosage && `${dosage}`}
                                                                    {quantity && ` • Qty: ${quantity}`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-700">₹{price}</span>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                                            <span className="text-xs text-slate-500 font-medium">Subtotal</span>
                                            <span className="text-base font-bold text-slate-800">₹{cartTotal}</span>
                                        </div>
                                    </Card>

                                    {/* Pharmacy Cards */}
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1 mb-3">
                                            Available Pharmacies
                                        </h3>
                                        <div className="space-y-3">
                                            {MOCK_PHARMACIES.map((pharmacy, idx) => {
                                                const isSelected = selectedPharmacy?.id === pharmacy.id;
                                                const discountedTotal = cartTotal - (cartTotal * pharmacy.discount / 100);
                                                const finalTotal = discountedTotal + pharmacy.deliveryFee;

                                                return (
                                                    <motion.div
                                                        key={pharmacy.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.08 }}
                                                        whileHover={{ y: -2 }}
                                                        onClick={() => setSelectedPharmacy(pharmacy)}
                                                        className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                                                            isSelected
                                                                ? 'bg-blue-50/80 border-blue-200 shadow-md shadow-blue-500/10 ring-1 ring-blue-300/30'
                                                                : 'bg-white/70 border-slate-200/60 hover:border-blue-200/60 hover:shadow-sm'
                                                        }`}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-start gap-3">
                                                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">
                                                                    {pharmacy.avatar}
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <h4 className="text-sm font-bold text-slate-800">{pharmacy.name}</h4>
                                                                        {pharmacy.verified && (
                                                                            <Shield size={13} className="text-blue-500" />
                                                                        )}
                                                                    </div>
                                                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                                                        <User size={10} className="inline mr-1" />
                                                                        {pharmacy.pharmacistName}
                                                                    </p>
                                                                    <div className="flex items-center gap-3 mt-1.5">
                                                                        <span className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold">
                                                                            <Star size={11} fill="currentColor" /> {pharmacy.rating}
                                                                            <span className="text-slate-400 font-normal">({pharmacy.reviews})</span>
                                                                        </span>
                                                                        <span className="flex items-center gap-1 text-[11px] text-slate-500">
                                                                            <Truck size={11} /> {pharmacy.deliveryTime}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="text-right">
                                                                <p className="text-base font-bold text-slate-800">₹{finalTotal.toFixed(0)}</p>
                                                                {pharmacy.discount > 0 && (
                                                                    <p className="text-[10px] text-emerald-600 font-semibold">{pharmacy.discount}% off</p>
                                                                )}
                                                                {pharmacy.deliveryFee === 0 && (
                                                                    <p className="text-[10px] text-blue-500 font-semibold">Free delivery</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Order Button */}
                                    {selectedPharmacy && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <Button
                                                icon={ShoppingCart}
                                                size="lg"
                                                className="w-full"
                                                onClick={() => setShowOrderModal(true)}
                                            >
                                                Place Order • ₹{(cartTotal - (cartTotal * selectedPharmacy.discount / 100) + selectedPharmacy.deliveryFee).toFixed(0)}
                                            </Button>
                                        </motion.div>
                                    )}
                                </>
                            ) : (
                                <Card className="text-center py-16" hover={false}>
                                    <Pill size={36} className="text-slate-300 mx-auto mb-3" />
                                    <h4 className="text-sm font-bold text-slate-600 mb-1">Select a Prescription</h4>
                                    <p className="text-xs text-slate-400">
                                        Click on a prescription from the left to view medicines and order.
                                    </p>
                                </Card>
                            )}
                        </div>
                    </div>
                )}
            </motion.div>

            {/* ── Order Confirmation Modal ── */}
            <AnimatePresence>
                {showOrderModal && selectedPharmacy && selectedPrescription && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                        onClick={() => !isOrdering && setShowOrderModal(false)}
                    >
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100"
                        >
                            <button
                                onClick={() => setShowOrderModal(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors"
                                disabled={isOrdering}
                            >
                                <X size={18} />
                            </button>

                            <div className="text-center mb-5">
                                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">
                                    🛒
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">Confirm Order</h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {selectedPrescription.medicines.length} medicine{selectedPrescription.medicines.length > 1 ? 's' : ''} from {selectedPharmacy.name}
                                </p>
                            </div>

                            <div className="space-y-2 mb-4 max-h-40 overflow-auto">
                                {selectedPrescription.medicines.map((med, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm px-3 py-2 bg-slate-50 rounded-xl">
                                        <span className="text-slate-700 font-medium">{med.name || med.medicineName || 'Medicine'}</span>
                                        <span className="text-slate-500 font-semibold">₹{estimatePrice(med.name || med.medicineName || 'Medicine')}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-1.5 border-t border-slate-100 pt-3 mb-5">
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Subtotal</span>
                                    <span>₹{cartTotal}</span>
                                </div>
                                {selectedPharmacy.discount > 0 && (
                                    <div className="flex justify-between text-xs text-emerald-600 font-medium">
                                        <span>Discount ({selectedPharmacy.discount}%)</span>
                                        <span>-₹{(cartTotal * selectedPharmacy.discount / 100).toFixed(0)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Delivery</span>
                                    <span>{selectedPharmacy.deliveryFee > 0 ? `₹${selectedPharmacy.deliveryFee}` : 'Free'}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-slate-800 pt-2 border-t border-slate-100">
                                    <span>Total</span>
                                    <span>₹{(cartTotal - (cartTotal * selectedPharmacy.discount / 100) + selectedPharmacy.deliveryFee).toFixed(0)}</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4">
                                <AlertCircle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                <p className="text-[10px] text-amber-700 leading-relaxed">
                                    This is a simulated order. In production, this would integrate with a real pharmacy delivery system.
                                </p>
                            </div>

                            <Button
                                size="lg"
                                className="w-full"
                                loading={isOrdering}
                                onClick={handleOrder}
                                icon={CheckCircle2}
                            >
                                {isOrdering ? 'Placing Order...' : 'Confirm & Pay'}
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AppLayout>
    );
};

export default PrescriptionMarketplace;
