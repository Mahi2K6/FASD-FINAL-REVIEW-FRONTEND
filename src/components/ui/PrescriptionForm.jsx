import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Send, Pill, CheckCircle, FileText } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import API from '../../api';
import { useToast } from './ToastNotification';

const PrescriptionForm = ({ isOpen, onClose, currentPatient, currentUser, onSuccess }) => {
    const toast = useToast();
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [followUp, setFollowUp] = useState('');
    const [medicines, setMedicines] = useState([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // ── Load Draft ──
    React.useEffect(() => {
        if (isOpen && currentPatient) {
            const draftKey = `rx_draft_${currentPatient.id || currentPatient.patientId}`;
            const savedDraft = localStorage.getItem(draftKey);
            if (savedDraft) {
                try {
                    const parsed = JSON.parse(savedDraft);
                    if (parsed.diagnosis) setDiagnosis(parsed.diagnosis);
                    if (parsed.notes) setNotes(parsed.notes);
                    if (parsed.followUp) setFollowUp(parsed.followUp);
                    if (parsed.medicines && parsed.medicines.length > 0) setMedicines(parsed.medicines);
                } catch(e) {
                    console.error('Failed to load prescription draft');
                }
            } else {
                // Reset if no draft
                setDiagnosis('');
                setNotes('');
                setFollowUp('');
                setMedicines([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
            }
        }
    }, [isOpen, currentPatient]);

    // ── Save Draft ──
    React.useEffect(() => {
        if (isOpen && currentPatient) {
            const draftKey = `rx_draft_${currentPatient.id || currentPatient.patientId}`;
            const payload = { diagnosis, notes, followUp, medicines };
            // Only save if there's actual data typed in
            if (diagnosis || notes || followUp || medicines[0].name) {
                localStorage.setItem(draftKey, JSON.stringify(payload));
            }
        }
    }, [diagnosis, notes, followUp, medicines, isOpen, currentPatient]);

    const handleAddMedicine = () => {
        setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    };

    const handleRemoveMedicine = (index) => {
        const newMeds = [...medicines];
        newMeds.splice(index, 1);
        setMedicines(newMeds);
    };

    const handleChange = (index, field, value) => {
        const newMeds = [...medicines];
        newMeds[index][field] = value;
        setMedicines(newMeds);
    };

    const handleSubmitPrescription = async () => {
        console.log("Prescription Submit Clicked");
        const validMeds = medicines.filter(m => m.name && m.name.trim() !== '');
        
        // Validation
        const appointmentId = currentPatient?.id || currentPatient?.appointmentId;
        const patientId = currentPatient?.patientId || currentPatient?.id;
        const doctorId = currentUser?.id;

        if (!appointmentId || !patientId || !doctorId) {
            toast.error('Validation Error', 'Missing appointment or patient details.');
            return;
        }

        if (!diagnosis || !diagnosis.trim()) {
            toast.error('Validation Error', 'Please provide a diagnosis.');
            return;
        }

        if (validMeds.length === 0) {
            toast.error('Validation Error', 'Please add at least one medicine.');
            return;
        }

        for (let med of validMeds) {
            if (!med.dosage?.trim() || !med.frequency?.trim()) {
                toast.error('Validation Error', `Medicine "${med.name}" is missing dosage or frequency.`);
                return;
            }
        }

        const payload = {
            appointmentId: Number(appointmentId),
            patientId: Number(patientId),
            doctorId: Number(doctorId),
            diagnosis: diagnosis.trim(),
            notes: notes?.trim() || "",
            followUpRecommendation: followUp?.trim() || "",
            symptoms: "", // Can be added to UI later if needed
            consultationStatus: "COMPLETED",
            prescriptionStatus: "FINALIZED",
            medicines: validMeds.map(m => ({
                medicineName: m.name.trim(),
                dosage: m.dosage.trim(),
                frequency: m.frequency.trim(),
                duration: m.duration?.trim() || "N/A",
                instructions: m.instructions?.trim() || ""
            }))
        };

        console.log("Prescription Payload:", payload);

        setIsSubmitting(true);
        try {
            await API.post('/prescriptions', payload);

            // Mark appointment as completed if needed
            try {
                await API.put(`/appointments/${appointmentId}/status`, { status: 'completed' });
            } catch (e) {
                console.warn("Could not auto-complete appointment, it might already be completed.", e);
            }

            // Clear draft
            const draftKey = `rx_draft_${patientId}`;
            localStorage.removeItem(draftKey);

            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                setMedicines([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
                setDiagnosis('');
                setNotes('');
                setFollowUp('');
                if (onSuccess) onSuccess();
                onClose();
            }, 2000);
            
        } catch (err) {
            console.error('Prescription Response Error:', err.response?.data);
            const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to save prescription.';
            toast.error('Error', typeof errMsg === 'object' ? JSON.stringify(errMsg) : errMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (showSuccess) {
        return (
            <Modal isOpen={isOpen} onClose={() => {}} title="" size="sm">
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <motion.div 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }} 
                        transition={{ type: 'spring', damping: 15 }}
                        className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2 shadow-inner"
                    >
                        <CheckCircle size={40} />
                    </motion.div>
                    <h3 className="text-xl font-bold text-slate-800">Prescription Sent!</h3>
                    <p className="text-sm text-slate-500 text-center">The patient has been notified and can now order these medicines.</p>
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Prescription" size="2xl">
            <div className="space-y-6">
                {/* Header Info */}
                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-[var(--color-primary)] shadow-sm">
                            {currentPatient?.patientName?.charAt(0) || 'P'}
                        </div>
                        <div>
                            <h4 className="font-bold text-[var(--color-text-primary)]">{currentPatient?.patientName || 'Loading...'}</h4>
                            <p className="text-xs text-[var(--color-text-secondary)]">Dr. {currentUser?.name} • {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* Consultation Details */}
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                        <FileText size={16} className="text-blue-500" /> Consultation Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Diagnosis</label>
                            <input 
                                value={diagnosis} 
                                onChange={e => setDiagnosis(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                placeholder="E.g. Viral Pharyngitis"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Follow-up Recommendation</label>
                            <input 
                                value={followUp} 
                                onChange={e => setFollowUp(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                                placeholder="E.g. After 5 days if fever persists"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Doctor Notes</label>
                        <textarea 
                            value={notes} 
                            onChange={e => setNotes(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none resize-none"
                            placeholder="Additional advice, diet restrictions, etc."
                            rows={2}
                        />
                    </div>
                </div>

                {/* Medicines List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <Pill size={16} className="text-blue-500" /> Prescribed Medicines
                        </h4>
                        <button 
                            onClick={handleAddMedicine}
                            className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors outline-none"
                        >
                            <Plus size={14} /> Add Medicine
                        </button>
                    </div>

                    <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-2 hide-scrollbar">
                        {medicines.map((med, index) => (
                            <div key={index} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 relative group">
                                {medicines.length > 1 && (
                                    <button 
                                        onClick={() => handleRemoveMedicine(index)}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-red-100 text-red-500 hover:bg-red-50 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity outline-none"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                    <div className="md:col-span-4">
                                        <input value={med.name} onChange={e => handleChange(index, 'name', e.target.value)} placeholder="Medicine Name" className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <input value={med.dosage} onChange={e => handleChange(index, 'dosage', e.target.value)} placeholder="Dosage (500mg)" className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400" />
                                    </div>
                                    <div className="md:col-span-3">
                                        <input value={med.frequency} onChange={e => handleChange(index, 'frequency', e.target.value)} placeholder="Freq (1-0-1)" className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400" />
                                    </div>
                                    <div className="md:col-span-3">
                                        <input value={med.duration} onChange={e => handleChange(index, 'duration', e.target.value)} placeholder="Duration (5 Days)" className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400" />
                                    </div>
                                    <div className="md:col-span-12">
                                        <input value={med.instructions} onChange={e => handleChange(index, 'instructions', e.target.value)} placeholder="Special Instructions (e.g., After Food)" className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
                    <Button 
                        icon={Send} 
                        className="flex-[2] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-none shadow-lg shadow-blue-500/30"
                        onClick={handleSubmitPrescription}
                        loading={isSubmitting}
                        disabled={isSubmitting || (medicines.length === 1 && !medicines[0].name?.trim() && !diagnosis?.trim())}
                    >
                        Save & Send Prescription
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default PrescriptionForm;
