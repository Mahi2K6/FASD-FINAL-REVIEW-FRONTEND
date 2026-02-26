import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassInput } from '../../components/ui/GlassInput';
import { GlassButton } from '../../components/ui/GlassButton';
import { useAppContext } from '../../AppContext';
import { Mail, Lock, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';

export const Login = () => {
    const navigate = useNavigate();
    const { login } = useAppContext();
    const [credentials, setCredentials] = useState({ idOrEmail: '', password: '' });
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        const result = login(credentials.idOrEmail, credentials.password);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
            {/* Left Branding Panel (Desktop Only 40%) */}
            <div className="hidden lg:flex w-[40%] bg-gradient-to-br from-blue-600 to-indigo-600 flex-col justify-center p-16 text-white relative flex-shrink-0">
                {/* Decorative background pattern elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-300 rounded-full mix-blend-overlay filter blur-3xl"></div>
                </div>

                <div className="z-10 relative">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-[28px] flex items-center justify-center mb-8 border border-white/20">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>

                    <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4 leading-tight">
                        Virtual Healthcare<br />Made Simple
                    </h1>
                    <p className="text-blue-100 text-lg mb-12 max-w-md">
                        Secure virtual consultations, prescriptions, and medical access in one platform.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white"><CheckCircle size={14} /></div>
                            <span className="font-medium text-blue-50">Secure & Private</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white"><CheckCircle size={14} /></div>
                            <span className="font-medium text-blue-50">Fast Appointments</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white"><CheckCircle size={14} /></div>
                            <span className="font-medium text-blue-50">Trusted Doctors</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Form Panel (60%) */}
            <div className="w-full lg:w-[60%] flex items-center justify-center p-4 sm:p-8 relative">
                {/* Absolute Header with Create Account link */}
                <div className="absolute top-0 right-0 p-6 z-20 w-full flex justify-end">
                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-slate-500 hidden sm:inline">Don't have an account?</span>
                        <Link to="/register">
                            <GlassButton variant="secondary" className="px-5 py-2.5 text-sm font-semibold text-blue-600 rounded-full border border-slate-300 hover:bg-slate-100 shadow-sm transition-all">
                                Create Account
                            </GlassButton>
                        </Link>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
                    className="w-full max-w-md z-10 mt-12 sm:mt-0"
                >
                    <div className="bg-white/80 backdrop-blur-xl rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-white/40 p-8 sm:p-10 relative overflow-hidden">
                        {/* Decorative subtle top border highlight */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500"></div>

                        {/* Top Branding */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                            className="flex flex-col items-center mb-6"
                        >
                            <img src="/medconnect.png" alt="MedConnect Logo" className="w-12 h-12 object-contain mb-3 drop-shadow-sm" />
                            <h2 className="text-xl font-bold tracking-tight text-slate-800">
                                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">MEDCONNECT</span>
                            </h2>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">Future of Smart Healthcare</p>
                        </motion.div>

                        <div className="text-center mb-8">
                            <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Welcome Back</h3>
                            <p className="text-slate-500 mt-2 text-sm sm:text-base">Sign in to access your dashboard</p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-red-50 text-red-600 p-4 rounded-[28px] mb-6 flex items-center gap-3 border border-red-100 shadow-sm"
                            >
                                <AlertCircle size={20} />
                                <span className="text-sm font-medium">{error}</span>
                            </motion.div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2 pl-1">Email or ID Number</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500 text-slate-400 z-10">
                                        <Mail size={20} />
                                    </div>
                                    <GlassInput
                                        type="text"
                                        placeholder="admin@system.com / ADMIN"
                                        value={credentials.idOrEmail}
                                        onChange={(e) => setCredentials({ ...credentials, idOrEmail: e.target.value })}
                                        className="pl-12 rounded-full border border-slate-200 focus:ring-2 focus:ring-blue-500/30 transition-shadow bg-white/60 shadow-inner"
                                        required
                                        borderFull={true}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2 pl-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500 text-slate-400 z-10">
                                        <Lock size={20} />
                                    </div>
                                    <GlassInput
                                        type="password"
                                        placeholder="••••••••"
                                        value={credentials.password}
                                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                        className="pl-12 rounded-full border border-slate-200 focus:ring-2 focus:ring-blue-500/30 transition-shadow bg-white/60 shadow-inner"
                                        required
                                        borderFull={true}
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <motion.button
                                    whileHover={{ scale: 1.02, translateY: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className="w-full py-3.5 text-base bg-blue-600 text-white rounded-full font-medium shadow-md hover:shadow-[0_10px_20px_rgba(59,130,246,0.3)] transition-all duration-300 flex items-center justify-center border border-blue-500 hover:bg-blue-700"
                                >
                                    Sign In
                                    <ArrowRight size={18} className="ml-2" />
                                </motion.button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
