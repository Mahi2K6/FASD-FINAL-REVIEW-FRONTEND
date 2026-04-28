import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, CreditCard, ShieldCheck, Stethoscope, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useAppContext } from '../../AppContext';
import { useToast } from '../../components/ui/ToastNotification';
import API from '../../api';
import { paymentService } from '../../services/paymentService';
import PaymentMethodSelector from '../../components/payment/PaymentMethodSelector';
import PaymentProcessingOverlay from '../../components/payment/PaymentProcessingOverlay';
import PaymentResult from '../../components/payment/PaymentResult';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const doctor = location.state?.doctor;
    const appointment = location.state?.appointment;

    const { currentUser } = useAppContext();
    const toast = useToast();

    // Steps: 'review' -> 'processing' -> 'result'
    const [step, setStep] = useState('review');
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [paymentResult, setPaymentResult] = useState({ status: null, details: null, error: null });

    useEffect(() => {
        if (!doctor || !appointment) {
            navigate("/dashboard");
        }
    }, [doctor, appointment, navigate]);

    if (!doctor || !appointment) return null;

    const handleProceedToPayment = async () => {
        if (!selectedMethod) {
            toast.error('Payment Method Required', 'Please complete your payment details to continue.');
            return;
        }

        if (!doctor || !doctor.id) {
            toast.error("Doctor information missing. Please reselect slot.");
            return;
        }

        setStep('processing');
        
        try {
            // 1. Prepare Payment Payload
            const amount = doctor.consultationFee || 500;
            const token = localStorage.getItem("token");
            
            let paymentMethodStr = 'CARD';
            if (selectedMethod.type === 'upi') paymentMethodStr = 'UPI';
            else if (selectedMethod.type === 'saved_card') paymentMethodStr = 'SAVED_CARD';

            const paymentPayload = {
                amount: amount,
                paymentMethod: paymentMethodStr,
                appointmentId: appointment.id || 12, // Draft ID or dummy
                ...(selectedMethod.type === 'upi' && { upiId: selectedMethod.upiId })
            };

            // 2. Execute Payment Process Request
            console.log("API Request:", {
                endpoint: '/payments/process',
                method: 'POST',
                payload: paymentPayload
            });
            const paymentResponse = await API.post('/payments/process', paymentPayload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // If card was marked to save, save locally
            if (selectedMethod.type === 'card' && selectedMethod.saveCard) {
                paymentService.saveCard({
                    cardNumber: selectedMethod.cardNumber,
                    expiry: selectedMethod.expiry,
                    name: selectedMethod.name
                });
            }

            // 3. Payment succeeded, now book the appointment on backend
            // Ensure strict string formatting for times
            let sTime = String(appointment.selectedTime || appointment.slot?.split(' • ')[1] || "09:00:00");
            if (sTime.split(':').length === 2) sTime += ":00"; // Ensure HH:MM:SS
            
            let eTime = String(appointment.endTime || "00:00:00");
            if (eTime === "00:00:00" && sTime !== "00:00:00") {
                // Approximate 30m end time if missing
                const [h, m] = sTime.split(':').map(Number);
                const endM = (m + 30) % 60;
                const endH = h + Math.floor((m + 30) / 60);
                eTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;
            } else if (eTime.split(':').length === 2) {
                eTime += ":00";
            }

            // Sending 'date' and 'time' as plain strings to bypass backend Jackson LocalDate parsing issues
            const aptPayload = {
                patientId: Number(currentUser.id),
                doctorId: Number(doctor.id),
                slotId: Number(appointment.slotId),
                date: String(appointment.selectedDate || appointment.slot?.split(' • ')[0]),
                time: sTime,
                paymentStatus: "PAID",
                status: "BOOKED",
                problemDescription: String(appointment.reasoning || "Consultation")
            };

            console.log("Appointment Payload:", JSON.stringify(aptPayload, null, 2));

            const aptResponse = await API.post('/appointments', aptPayload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (aptResponse.data) {
                setPaymentResult({ status: 'success', details: paymentResponse.data, error: null });
                setStep('result');
            }
        } catch (error) {
            console.error("Payment Error:", error.response?.data);

            const message =
                error.response?.data?.reason ||
                error.response?.data?.message ||
                error.message;

            setPaymentResult({ 
                status: 'error', 
                details: null, 
                error: message || "Payment failed" 
            });
            setStep('result');
            toast.error(message || "Payment failed");
        }
    };

    const handleRetry = () => {
        setStep('review');
        setPaymentResult({ status: null, details: null, error: null });
    };

    const handleContinueAfterSuccess = () => {
        navigate('/dashboard/appointments');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-12 px-4 font-sans">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
            >
                {/* ─── Premium Header ─── */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-blue-100 hover:text-white transition-colors mb-8 text-sm font-medium z-10 relative"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                    <h1 className="text-3xl font-bold mb-2 tracking-tight relative z-10">Confirm Booking</h1>
                    <p className="text-blue-100 text-sm opacity-90 flex items-center gap-2 relative z-10">
                        <ShieldCheck size={16} /> Secure Payment Portal
                    </p>
                </div>

                {/* ─── Content ─── */}
                {step === 'review' && (
                    <div className="p-8 space-y-8">
                        {/* Doctor Info Card */}
                        <div className="flex items-center gap-5 p-5 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold text-2xl shadow-inner border-2 border-white">
                                {doctor.name?.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Dr. {doctor.name}</h2>
                                <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mt-1">
                                    <Stethoscope size={14} className="text-blue-500" />
                                    {doctor.specialization}
                                </p>
                            </div>
                        </div>

                        {/* Appointment Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-white border border-slate-100 rounded-2xl flex flex-col gap-2 shadow-sm">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Calendar size={14} /> Date
                                </span>
                                <span className="font-bold text-slate-700 text-base">{appointment.selectedDate || appointment.slot?.split(' • ')[0]}</span>
                            </div>
                            <div className="p-5 bg-white border border-slate-100 rounded-2xl flex flex-col gap-2 shadow-sm">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                    <Clock size={14} /> Time
                                </span>
                                <span className="font-bold text-slate-700 text-base">{appointment.selectedTime || appointment.slot?.split(' • ')[1]}</span>
                            </div>
                        </div>

                        {/* AI Reasoning / Concern */}
                        {appointment.reasoning && (
                            <div className="p-5 border border-indigo-100 bg-indigo-50/50 rounded-2xl flex gap-4 items-start">
                                <AlertCircle className="text-indigo-400 shrink-0 mt-0.5" size={20} />
                                <div>
                                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1.5 block">AI Agent Diagnosis Summary</span>
                                    <p className="text-sm font-medium text-slate-700 leading-relaxed">{appointment.reasoning}</p>
                                </div>
                            </div>
                        )}

                        {/* Fee Summary */}
                        <div className="border border-slate-100 rounded-2xl p-6 bg-slate-50/50">
                            <h3 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2">
                                <CreditCard size={16} className="text-slate-400"/> Payment Summary
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                                    <span>Consultation Fee</span>
                                    <span className="text-slate-800">₹{doctor.consultationFee || 500}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-medium text-slate-500">
                                    <span>Platform Fee</span>
                                    <span className="text-green-600 font-bold">Waived</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 mt-2 border-t border-slate-200 border-dashed">
                                    <span className="font-bold text-slate-800">Total Payable</span>
                                    <span className="text-xl font-black text-blue-600">₹{doctor.consultationFee || 500}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Selection */}
                        <div className="pt-2">
                            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                Select Payment Method
                            </h3>
                            <PaymentMethodSelector 
                                amount={doctor.consultationFee || 500} 
                                onMethodSelect={setSelectedMethod}
                            />
                        </div>

                        {/* Confirm Button */}
                        <button 
                            onClick={handleProceedToPayment}
                            disabled={!selectedMethod}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed active:scale-[0.98] transition-all text-white h-[56px] rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 mt-4"
                        >
                            <CheckCircle2 size={18} /> Confirm & Pay ₹{doctor.consultationFee || 500}
                        </button>
                    </div>
                )}

                {step === 'result' && (
                    <PaymentResult 
                        status={paymentResult.status}
                        details={paymentResult.details}
                        error={paymentResult.error}
                        onRetry={handleRetry}
                        onContinue={handleContinueAfterSuccess}
                    />
                )}
            </motion.div>

            <PaymentProcessingOverlay isVisible={step === 'processing'} />
        </div>
    );
};

export default Checkout;
