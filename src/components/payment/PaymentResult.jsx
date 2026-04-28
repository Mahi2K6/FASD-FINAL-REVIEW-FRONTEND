import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, RefreshCw, ArrowRight, Download } from 'lucide-react';
import Button from '../ui/Button';

const PaymentResult = ({ status, details, error, onRetry, onContinue }) => {
    const isSuccess = status === 'success';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex flex-col items-center justify-center py-8 px-4 text-center"
        >
            {isSuccess ? (
                <>
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                        className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6 relative"
                    >
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-emerald-400/20 rounded-full blur-xl"
                        />
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 relative z-10" strokeWidth={2.5} />
                    </motion.div>

                    <h2 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">Payment Successful!</h2>
                    <p className="text-slate-500 font-medium max-w-sm mb-8">
                        Your payment of <span className="font-bold text-slate-700">₹{details?.amount || '0'}</span> has been processed successfully.
                    </p>

                    {details && (
                        <div className="w-full max-w-sm bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-8 text-left">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Transaction ID</span>
                                <span className="text-sm font-mono font-bold text-slate-700">{details.transactionId || 'TXN-UNKNOWN'}</span>
                            </div>
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</span>
                                <span className="text-sm font-semibold text-slate-700">{new Date(details.timestamp || Date.now()).toLocaleDateString()}</span>
                            </div>
                            <div className="w-full h-px bg-slate-200/60 my-4" />
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-600">Total Paid</span>
                                <span className="text-lg font-bold text-emerald-600">₹{details.amount}</span>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                        <Button 
                            variant="secondary" 
                            className="flex-1 border-slate-200"
                            icon={Download}
                        >
                            Receipt
                        </Button>
                        <Button 
                            variant="primary" 
                            className="flex-[2]"
                            onClick={onContinue}
                            icon={ArrowRight}
                        >
                            View Appointment
                        </Button>
                    </div>
                </>
            ) : (
                <>
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                        className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 relative"
                    >
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-red-400/20 rounded-full blur-xl"
                        />
                        <AlertCircle className="w-12 h-12 text-red-500 relative z-10" strokeWidth={2.5} />
                    </motion.div>

                    <h2 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">Payment Failed</h2>
                    <p className="text-red-600 font-medium bg-red-50 px-4 py-2 rounded-lg max-w-sm mx-auto mb-8 border border-red-100">
                        {error || "An unexpected error occurred during processing."}
                    </p>

                    <p className="text-slate-500 text-sm mb-8 max-w-sm">
                        No amount has been deducted. Please try again with a different payment method or verify your details.
                    </p>

                    <div className="flex flex-col w-full max-w-sm gap-3">
                        <Button 
                            variant="primary" 
                            onClick={onRetry}
                            icon={RefreshCw}
                            className="w-full bg-gradient-to-r from-slate-700 to-slate-800 border-none shadow-lg"
                        >
                            Try Again
                        </Button>
                        <Button 
                            variant="ghost" 
                            onClick={onContinue}
                            className="w-full"
                        >
                            Cancel Payment
                        </Button>
                    </div>
                </>
            )}
        </motion.div>
    );
};

export default PaymentResult;
