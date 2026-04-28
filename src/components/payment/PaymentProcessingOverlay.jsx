import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2 } from 'lucide-react';

const PaymentProcessingOverlay = ({ isVisible }) => {
    const [step, setStep] = useState(0);

    const steps = [
        "Establishing secure connection...",
        "Encrypting payment details...",
        "Authenticating with bank...",
        "Processing transaction..."
    ];

    useEffect(() => {
        if (!isVisible) {
            setStep(0);
            return;
        }
        
        let currentStep = 0;
        const interval = setInterval(() => {
            currentStep++;
            if (currentStep < steps.length) {
                setStep(currentStep);
            } else {
                clearInterval(interval);
            }
        }, 800);

        return () => clearInterval(interval);
    }, [isVisible]);

    if (!isVisible) return null;

    return ReactDOM.createPortal(
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
                    />
                    
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative bg-white/95 backdrop-blur-3xl p-8 rounded-[32px] shadow-2xl border border-white/50 flex flex-col items-center w-[320px]"
                    >
                        {/* Animated Ring */}
                        <div className="relative w-24 h-24 mb-8">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 rounded-full border-[3px] border-slate-100 border-t-blue-500 border-r-blue-400"
                            />
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-2 rounded-full border-[3px] border-slate-100 border-b-purple-500 border-l-purple-400 opacity-60"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <ShieldCheck className="text-blue-500" size={32} strokeWidth={2} />
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-slate-800 mb-2">Processing Payment</h3>
                        
                        <div className="h-6 flex items-center justify-center w-full">
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={step}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    className="text-sm font-medium text-slate-500 text-center"
                                >
                                    {steps[step]}
                                </motion.p>
                            </AnimatePresence>
                        </div>

                        <div className="w-full h-1 bg-slate-100 rounded-full mt-6 overflow-hidden">
                            <motion.div 
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                initial={{ width: "0%" }}
                                animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                        
                        <div className="mt-4 flex items-center gap-2">
                            <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />
                            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Do not refresh</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default PaymentProcessingOverlay;
