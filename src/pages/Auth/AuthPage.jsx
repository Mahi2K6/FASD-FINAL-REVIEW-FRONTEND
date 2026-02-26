import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassInput } from '../../components/ui/GlassInput';
import { GlassButton } from '../../components/ui/GlassButton';
import { PillNav } from '../../components/ui/PillNav';
import { useAppContext } from '../../AppContext';
import { Mail, Lock, AlertCircle, ArrowRight, User, Stethoscope, BriefcaseMedical, Image as ImageIcon } from 'lucide-react';

export const AuthPage = ({ defaultIsSignUp = false }) => {
    const navigate = useNavigate();
    const { login, registerUser } = useAppContext();
    const [isSignUp, setIsSignUp] = useState(defaultIsSignUp);

    // --- LOGIN STATE ---
    const [credentials, setCredentials] = useState({ idOrEmail: '', password: '' });
    const [loginError, setLoginError] = useState('');

    // --- REGISTER STATE ---
    const [role, setRole] = useState('patient');
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', password: '', specialization: '', experience: '', pharmacyInfo: ''
    });

    const [phoneError, setPhoneError] = useState('');
    const [phoneSuccess, setPhoneSuccess] = useState(false);

    // Initialize isPending from localStorage to survive reloads
    const [isPending, setIsPending] = useState(() => {
        return localStorage.getItem('auraMed_pendingReg') === 'true';
    });
    const [registerError, setRegisterError] = useState('');

    const roles = [
        { id: 'patient', label: 'Patient', icon: User },
        { id: 'doctor', label: 'Doctor', icon: Stethoscope },
        { id: 'pharmacist', label: 'Pharmacist', icon: BriefcaseMedical },
    ];

    // --- HANDLERS ---
    const handleLogin = (e) => {
        e.preventDefault();
        const result = login(credentials.idOrEmail, credentials.password);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setLoginError(result.error);
        }
    };

    const handleRegister = (e) => {
        e.preventDefault();
        setRegisterError('');

        // Validate phone on submit
        if (!validatePhone(formData.phone)) {
            setPhoneError('Enter a valid 10-digit Indian mobile number');
            setPhoneSuccess(false);
            return;
        }

        const result = registerUser({ ...formData, role });

        if (!result.success) {
            setRegisterError(result.error);
            return;
        }

        if (role === 'doctor' || role === 'pharmacist') {
            setIsPending(true);
            localStorage.setItem('auraMed_pendingReg', 'true');
        } else {
            navigate('/dashboard');
        }
    };

    const handleRegisterChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validatePhone = (phone) => {
        return /^[6-9]\d{9}$/.test(phone);
    };

    const handlePhoneChange = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 10) val = val.slice(0, 10);

        setFormData({ ...formData, phone: val });

        if (val.length === 10) {
            if (validatePhone(val)) {
                setPhoneError('');
                setPhoneSuccess(true);
            } else {
                setPhoneError('Enter a valid 10-digit Indian mobile number');
                setPhoneSuccess(false);
            }
        } else {
            setPhoneError('');
            setPhoneSuccess(false);
        }
    };

    const handlePhoneBlur = () => {
        if (formData.phone && !validatePhone(formData.phone)) {
            setPhoneError('Enter a valid 10-digit Indian mobile number');
            setPhoneSuccess(false);
        }
    };

    // Pending Approval Screen for Medical Staff
    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
                </div>
                <GlassCard className="max-w-md w-full p-8 text-center bg-white/70 shadow-2xl relative z-10 border border-white/60">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-blue-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Registration Pending</h2>
                    <p className="text-slate-500 mb-8">
                        Your account has been created and is waiting for administrator approval. You will not be able to log in until approved.
                    </p>
                    <GlassButton
                        onClick={() => {
                            setIsPending(false);
                            setIsSignUp(false);
                            localStorage.removeItem('auraMed_pendingReg');
                            navigate('/login', { replace: true });
                        }}
                        variant="secondary"
                        className="w-full py-3"
                    >
                        Return to Login
                    </GlassButton>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative p-4 py-8 overflow-hidden font-sans">
            {/* Background ambient light elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-[100px]"></div>
                <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-[100px]"></div>
            </div>

            {/* Main Container - The Base Card */}
            <div className="relative w-full max-w-[900px] min-h-[600px] bg-white rounded-[32px] shadow-[0_15px_50px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col md:flex-row border border-slate-200">

                {/* --- LEFT SIDE: SIGN IN FORM --- */}
                <div
                    className={`w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white/80 backdrop-blur-xl z-10 transition-transform duration-700 ease-in-out md:absolute md:top-0 md:left-0 md:h-full 
                    ${isSignUp ? 'hidden md:flex md:translate-x-[100%] md:opacity-0 md:pointer-events-none' : 'flex md:translate-x-0 md:opacity-100'}`}
                >
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
                        <p className="text-blue-600 mt-2 text-sm font-medium">Log in to your account to continue</p>
                    </div>

                    {loginError && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-red-50 text-red-600 p-3 rounded-[28px] mb-6 flex items-center gap-2 border border-red-100 shadow-sm text-sm"
                        >
                            <AlertCircle size={18} />
                            <span className="font-medium">{loginError}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 pl-1">Email Address</label>
                            <div className="relative group">
                                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors z-10 ${loginError ? 'text-red-500' : 'group-focus-within:text-blue-600 text-slate-400'}`}>
                                    <Mail size={18} />
                                </div>
                                <GlassInput
                                    type="text"
                                    placeholder="Email or Username"
                                    value={credentials.idOrEmail}
                                    onChange={(e) => { setCredentials({ ...credentials, idOrEmail: e.target.value }); setLoginError(''); }}
                                    className="pl-11"
                                    required
                                    borderFull={false}
                                    error={!!loginError}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 pl-1">Password</label>
                            <div className="relative group">
                                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors z-10 ${loginError ? 'text-red-500' : 'group-focus-within:text-blue-600 text-slate-400'}`}>
                                    <Lock size={18} />
                                </div>
                                <GlassInput
                                    type="password"
                                    placeholder="••••••••"
                                    value={credentials.password}
                                    onChange={(e) => { setCredentials({ ...credentials, password: e.target.value }); setLoginError(''); }}
                                    className="pl-11"
                                    required
                                    borderFull={false}
                                    error={!!loginError}
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <motion.button
                                whileHover={{ scale: 1.02, translateY: -2 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="w-full py-3.5 text-base bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-medium shadow-[0_8px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_12px_25px_rgba(37,99,235,0.3)] transition-all duration-300 flex items-center justify-center"
                            >
                                Sign In
                                <ArrowRight size={18} className="ml-2" />
                            </motion.button>
                        </div>
                    </form>

                    {/* Mobile Only switch */}
                    <p className="mt-8 text-center text-sm text-slate-500 md:hidden">
                        Don't have an account? <button type="button" onClick={() => setIsSignUp(true)} className="text-blue-600 font-semibold hover:underline">Sign up</button>
                    </p>
                </div>

                {/* --- RIGHT SIDE: SIGN UP FORM --- */}
                <div
                    className={`w-full md:w-1/2 p-6 sm:p-10 flex flex-col justify-start overflow-y-auto hide-scrollbar bg-slate-50 z-10 transition-transform duration-700 ease-in-out md:absolute md:top-0 md:left-0 md:h-full 
                    ${isSignUp ? 'flex md:translate-x-[100%] md:opacity-100' : 'hidden md:flex md:translate-x-0 md:opacity-0 md:pointer-events-none'}`}
                >
                    <div className="text-center mb-6 pt-4">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Create Account</h2>
                        <p className="text-blue-600 mt-2 mb-4 text-sm font-medium">Select Account Type</p>
                        <PillNav tabs={roles} activeTab={role} setActiveTab={setRole} />
                    </div>

                    {registerError && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-red-50 text-red-600 p-3 rounded-[28px] mb-6 flex items-center gap-2 border border-red-100 shadow-sm text-sm"
                        >
                            <AlertCircle size={18} />
                            <span className="font-medium">{registerError}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-4 pb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1 pl-1">Full Name</label>
                                <GlassInput name="name" value={formData.name} onChange={handleRegisterChange} required placeholder="John Doe" borderFull={false} className="py-2.5 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1 pl-1">Email Address</label>
                                <GlassInput type="email" name="email" value={formData.email} onChange={handleRegisterChange} required placeholder="user@example.com" borderFull={false} className="py-2.5 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1 pl-1">Phone Number</label>
                                <GlassInput
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                    onBlur={handlePhoneBlur}
                                    error={!!phoneError}
                                    success={phoneSuccess}
                                    required
                                    placeholder="9876543210"
                                    borderFull={false}
                                    className="py-2.5 text-sm"
                                />
                                {phoneError && <p className="text-[11px] text-red-500 mt-1 pl-1 leading-tight">{phoneError}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1 pl-1">Password</label>
                                <GlassInput type="password" name="password" value={formData.password} onChange={handleRegisterChange} required placeholder="••••••••" borderFull={false} className="py-2.5 text-sm" />
                            </div>
                        </div>

                        <AnimatePresence mode="popLayout">
                            {role !== 'patient' && (
                                <motion.div
                                    key="professional-fields"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-4 pt-2 overflow-hidden"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {role === 'doctor' ? (
                                            <>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-700 mb-1 pl-1">Specialization</label>
                                                    <GlassInput name="specialization" value={formData.specialization} onChange={handleRegisterChange} required placeholder="e.g. Cardiology" borderFull={false} className="py-2.5 text-sm bg-white" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-700 mb-1 pl-1">Experience (Years)</label>
                                                    <GlassInput type="number" name="experience" value={formData.experience} onChange={handleRegisterChange} required placeholder="e.g. 10" borderFull={false} className="py-2.5 text-sm bg-white" />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-700 mb-1 pl-1">Pharmacy Name</label>
                                                    <GlassInput name="pharmacyInfo" value={formData.pharmacyInfo} onChange={handleRegisterChange} required placeholder="e.g. City Health Pharma" borderFull={false} className="py-2.5 text-sm bg-white" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-700 mb-1 pl-1">Experience (Years)</label>
                                                    <GlassInput type="number" name="experience" value={formData.experience} onChange={handleRegisterChange} required placeholder="e.g. 5" borderFull={false} className="py-2.5 text-sm bg-white" />
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Simulated ID Card Upload */}
                                    <div className="mt-4">
                                        <label className="block text-xs font-medium text-slate-700 mb-1 pl-1">Upload ID Card <span className="text-red-500">*</span></label>
                                        <div className="w-full border-2 border-dashed border-slate-300 rounded-[28px] p-4 flex flex-col items-center justify-center text-slate-500 bg-white hover:bg-slate-50 transition-colors cursor-pointer hover:border-blue-400">
                                            <ImageIcon size={24} className="mb-1 text-slate-400" />
                                            <span className="text-[11px] font-medium text-blue-600">Click to upload image</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="pt-4">
                            <motion.button
                                whileHover={{ scale: 1.02, translateY: -2 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="w-full py-3.5 text-base bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-medium shadow-[0_8px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_12px_25px_rgba(37,99,235,0.3)] transition-all duration-300 flex items-center justify-center"
                            >
                                Create Account
                            </motion.button>
                        </div>
                    </form>

                    {/* Mobile Only switch */}
                    <p className="mt-2 text-center text-sm text-slate-500 md:hidden">
                        Already have an account? <button type="button" onClick={() => setIsSignUp(false)} className="text-blue-600 font-semibold hover:underline">Log in</button>
                    </p>
                </div>

                {/* --- SLIDING OVERLAY (Desktop Only) --- */}
                <div
                    className={`hidden md:block absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-50 
                    ${isSignUp ? '-translate-x-full' : 'translate-x-0'}`}
                >
                    <div
                        className={`bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 relative -left-full h-full w-[200%] transition-transform duration-700 ease-in-out text-white border-x border-blue-400/20 
                        ${isSignUp ? 'translate-x-1/2' : 'translate-x-0'}`}
                    >
                        {/* Overlay pattern decoration */}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

                        {/* Overlay Left Content (Welcome Back!) -> Visible when Sign Up is active */}
                        <div
                            className={`absolute top-0 left-0 w-1/2 h-full flex flex-col items-center justify-center p-12 text-center transition-transform duration-700 ease-in-out 
                            ${isSignUp ? 'translate-x-0' : '-translate-x-[20%]'}`}
                        >
                            <h2 className="text-4xl font-bold mb-4 tracking-tight">Welcome Back!</h2>
                            <p className="mb-10 text-blue-100 leading-relaxed font-medium">
                                To keep connected with us please login with your personal info
                            </p>
                            <button
                                onClick={() => setIsSignUp(false)}
                                className="px-12 py-3 bg-transparent border-2 border-white/60 text-white rounded-full font-bold tracking-wide text-sm hover:scale-105 hover:bg-white/10 active:scale-95 transition-all outline-none"
                            >
                                Sign In
                            </button>
                        </div>

                        {/* Overlay Right Content (Hey There!) -> Visible when Sign In is active */}
                        <div
                            className={`absolute top-0 right-0 w-1/2 h-full flex flex-col items-center justify-center p-12 text-center transition-transform duration-700 ease-in-out 
                            ${isSignUp ? 'translate-x-[20%]' : 'translate-x-0'}`}
                        >
                            <h2 className="text-4xl font-bold mb-4 tracking-tight">Hello, Friend!</h2>
                            <p className="mb-10 text-blue-100 leading-relaxed font-medium">
                                Enter your personal details and start your healthcare journey with us
                            </p>
                            <button
                                onClick={() => setIsSignUp(true)}
                                className="px-12 py-3 bg-transparent border-2 border-white/60 text-white rounded-full font-bold tracking-wide text-sm hover:scale-105 hover:bg-white/10 active:scale-95 transition-all outline-none"
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
