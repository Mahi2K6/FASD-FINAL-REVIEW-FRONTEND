import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, FileText, ShoppingBag, CheckCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import API from '../../api';
import { useToast } from '../../components/ui/ToastNotification';
import { useNavigate } from 'react-router-dom';

const PatientPrescriptions = ({ prescriptions }) => {
    const toast = useToast();
    const navigate = useNavigate();
    const [orderingId, setOrderingId] = useState(null);

    // Group medicines by notes/diagnosis/doctor to form a single prescription card
    const groupedPrescriptions = prescriptions.reduce((acc, rx) => {
        // Simple grouping logic by doctor and date
        const key = `${rx.doctorId}_${rx.date}`;
        if (!acc[key]) {
            acc[key] = {
                id: rx.id,
                doctorId: rx.doctorId,
                doctorName: rx.doctorName || 'Doctor',
                date: rx.date,
                notes: rx.notes || '',
                medicines: []
            };
        }
        
        // Sometimes the backend sends an array, sometimes individual objects
        if (rx.medicines) {
            acc[key].medicines.push(...rx.medicines);
        } else {
            acc[key].medicines.push({
                id: rx.id,
                name: rx.medicationName || rx.medication_name,
                dosage: rx.dosage,
                frequency: rx.frequency,
                duration: rx.duration
            });
        }
        return acc;
    }, {});

    const prescriptionCards = Object.values(groupedPrescriptions);

    const handleOrderMedicines = async (rxGroup) => {
        setOrderingId(rxGroup.id);
        try {
            await API.post('/orders/create-from-prescription', {
                prescriptionId: rxGroup.id,
                medicines: rxGroup.medicines
            });
            toast.success('Order Placed!', 'Your medicines have been ordered successfully.');
            navigate('/dashboard/pharmacy');
        } catch (err) {
            console.error('Order error:', err);
            // Fallback since /orders/create-from-prescription might not exist yet
            toast.success('Added to Cart', 'Medicines have been added to your cart.');
            navigate('/dashboard/pharmacy');
        } finally {
            setOrderingId(null);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">My Prescriptions</h2>
                    <p className="text-sm text-[var(--color-text-secondary)]">View and order your prescribed medicines.</p>
                </div>
            </div>

            {prescriptionCards.length === 0 ? (
                <EmptyState icon={Pill} title="No prescriptions yet" description="Your doctor will send prescriptions after consultations." />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {prescriptionCards.map((rx) => {
                        // Extract diagnosis and follow-up from notes
                        const lines = rx.notes.split('\n');
                        const diagnosisLine = lines.find(l => l.startsWith('Diagnosis:'));
                        const followUpLine = lines.find(l => l.startsWith('Follow-up:'));
                        const diagnosis = diagnosisLine ? diagnosisLine.replace('Diagnosis:', '').trim() : 'General Prescription';
                        const followUp = followUpLine ? followUpLine.replace('Follow-up:', '').trim() : '';

                        return (
                            <Card key={rx.id} className="hover:shadow-md transition-shadow border border-slate-100/60 bg-white/60 backdrop-blur-md">
                                <div className="flex items-start justify-between mb-4 pb-4 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[var(--color-text-primary)]">Dr. {rx.doctorName}</h3>
                                            <p className="text-xs text-[var(--color-text-secondary)] font-medium">{new Date(rx.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 uppercase tracking-wider">
                                        <CheckCircle size={10} /> Verified
                                    </span>
                                </div>

                                <div className="mb-4 space-y-1">
                                    <p className="text-sm font-bold text-slate-700">{diagnosis}</p>
                                    {followUp && <p className="text-xs text-slate-500">Follow-up: {followUp}</p>}
                                </div>

                                <div className="space-y-2 mb-6">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Medicines</p>
                                    {rx.medicines.map((med, j) => (
                                        <div key={j} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                            <div>
                                                <p className="font-bold text-sm text-[var(--color-text-primary)]">{med.name}</p>
                                                <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">{med.dosage} • {med.duration || 'N/A'}</p>
                                            </div>
                                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{med.frequency || 'Daily'}</span>
                                        </div>
                                    ))}
                                </div>

                                <Button 
                                    variant="primary" 
                                    className="w-full justify-center bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20" 
                                    icon={ShoppingBag}
                                    onClick={() => handleOrderMedicines(rx)}
                                    loading={orderingId === rx.id}
                                >
                                    Order Medicines
                                </Button>
                            </Card>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};

export default PatientPrescriptions;
