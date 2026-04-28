import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import PillNav from '../../components/ui/PillNav';
import { useAppContext } from '../../AppContext';
import { Mail, Lock, AlertCircle, ArrowRight, User, Stethoscope, BriefcaseMedical, Image as ImageIcon, RefreshCw } from 'lucide-react';
import SocialAuthOptions from '../../components/ui/SocialAuthOptions';

const AuthPage = ({ defaultIsSignUp = false }) => {
    const navigate = useNavigate();
    const { login, registerUser } = useAppContext();
    const [isSignUp, setIsSignUp] = useState(defaultIsSignUp);

    // --- LOGIN STATE ---
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [loginError, setLoginError] = useState('');
    const [loginSuccess, setLoginSuccess] = useState('');

    // --- REGISTER STATE ---
    const [role, setRole] = useState('patient');
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', password: '', specialization: '', experience: '', pharmacyInfo: '', idCard: null
    });

    const [phoneError, setPhoneError] = useState('');
    const [phoneSuccess, setPhoneSuccess] = useState(false);

    // Inline real-time validation state
    const [emailError, setEmailError] = useState('');
    const [emailValid, setEmailValid] = useState(false);
    const [passwordHint, setPasswordHint] = useState(false); // true = >= 6 chars

    // Initialize isPending from state instead of localStorage
    const [isPending, setIsPending] = useState(false);
    const [registerError, setRegisterError] = useState('');

    // Custom text CAPTCHA
    const generateCaptcha = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
    };
    const [captcha, setCaptcha] = useState(generateCaptcha());
    const [captchaInput, setCaptchaInput] = useState('');
    const [captchaError, setCaptchaError] = useState('');

    const roles = [
        { id: 'patient', label: 'Patient', icon: User },
        { id: 'doctor', label: 'Doctor', icon: Stethoscope },
        { id: 'pharmacist', label: 'Pharmacist', icon: BriefcaseMedical },
    ];

    // --- HANDLERS ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');

        // Client-side validation
        if (!credentials.email.trim()) {
            setLoginError('Email address is required.');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
            setLoginError('Please enter a valid email address.');
            return;
        }
        if (!credentials.password) {
            setLoginError('Password is required.');
            return;
        }

        const result = await login(credentials.email, credentials.password);
        if (result.success && result.user) {
            const role = result.user.role?.toUpperCase();
            if (role === 'PATIENT') navigate('/patient-dashboard');
            else if (role === 'DOCTOR') navigate('/doctor-dashboard');
            else if (role === 'PHARMACIST') navigate('/pharmacist-dashboard');
            else if (role === 'ADMIN') navigate('/admin-dashboard');
            else navigate('/dashboard');
        } else {
            setLoginError(result.error);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setRegisterError('');

        // Validate name
        if (!formData.name.trim()) {
            setRegisterError('Full name is required.');
            return;
        }

        // Validate email
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setRegisterError('Please enter a valid email address.');
            return;
        }

        // Validate password
        if (!formData.password || formData.password.length < 6) {
            setRegisterError('Password must be at least 6 characters.');
            return;
        }

        // Validate phone on submit
        if (!validatePhone(formData.phone)) {
            setPhoneError('Enter a valid 10-digit Indian mobile number');
            setPhoneSuccess(false);
            return;
        }

        // Validate custom CAPTCHA
        if (captchaInput.toUpperCase() !== captcha) {
            setCaptchaError('CAPTCHA does not match. Please try again.');
            setCaptcha(generateCaptcha());
            setCaptchaInput('');
            return;
        }
        setCaptchaError('');

        const result = await registerUser({ ...formData, role });

        if (!result.success) {
            setRegisterError(result.error);
            return;
        }

        if (role === 'doctor' || role === 'pharmacist') {
            setIsPending(true);
        } else {
            setIsSignUp(false);
            setLoginSuccess("Registration successful. You can login now.");
        }
    };

    const handleRegisterChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Real-time email validation
        if (name === 'email') {
            const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            setEmailError(value && !valid ? 'Invalid email format' : '');
            setEmailValid(value.length > 0 && valid);
        }

        // Real-time password hint
        if (name === 'password') {
            setPasswordHint(value.length >= 6);
        }
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
            <div className="min-h-screen flex items-center justify-center page-bg p-4 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-[var(--color-primary)]/30 rounded-full mix-blend-multiply filter blur-3xl"></div>
                </div>
                <div
                    className="max-w-lg w-full p-8 text-center relative z-10 glass-card !rounded-[20px]"

                >
                    <div className="w-20 h-20 bg-[var(--color-primary-light)] rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-[var(--color-primary)] animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">Registration Pending</h2>
                    <p className="text-[var(--color-text-secondary)] mb-8">
                        Your account has been created and is waiting for administrator approval. You will not be able to log in until approved.
                    </p>
                    <Button
                        onClick={() => {
                            setIsPending(false);
                            setIsSignUp(false);
                            navigate('/login', { replace: true });
                        }}
                        variant="secondary"
                        className="w-full py-3"
                    >
                        Return to Login
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative p-4 py-8 overflow-hidden font-sans" style={{ background: 'linear-gradient(145deg, #EBF2FA 0%, #F2F6FB 40%, #E6EFF9 100%)' }}>
            {/* Premium animated background orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-30" style={{ background: 'radial-gradient(circle, rgba(27,108,168,0.15) 0%, transparent 70%)', animation: 'pulse 8s ease-in-out infinite' }}></div>
                <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full opacity-25" style={{ background: 'radial-gradient(circle, rgba(0,180,216,0.12) 0%, transparent 70%)', animation: 'pulse 10s ease-in-out infinite reverse' }}></div>
                <div className="absolute top-1/3 right-1/4 w-[200px] h-[200px] rounded-full opacity-15" style={{ background: 'radial-gradient(circle, rgba(27,108,168,0.1) 0%, transparent 70%)', animation: 'pulse 6s ease-in-out infinite 2s' }}></div>
            </div>

            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #1B6CA8 0.5px, transparent 0)', backgroundSize: '32px 32px' }}></div>

            {/* Main Container */}
            <div className="relative w-full max-w-[960px] min-h-[620px] bg-white/98 backdrop-blur-xl rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-[0_20px_60px_rgba(15,28,46,0.08),0_8px_20px_rgba(15,28,46,0.05)] border border-white/80" style={{ padding: 0 }}>

                {/* --- LEFT SIDE: SIGN IN FORM --- */}
                <div
                    className={`w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white z-10 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:absolute md:top-0 md:left-0 md:h-full 
                    ${isSignUp ? 'hidden md:flex md:translate-x-[100%] md:opacity-0 md:pointer-events-none' : 'flex md:translate-x-0 md:opacity-100'}`}
                >
                    {/* Brand mark */}
                    <div className="flex items-center gap-4 mb-12">
                        <img src="/medconnect.png" alt="MedConnect" className="w-14 h-14 md:w-16 md:h-16 drop-shadow-sm rounded-xl object-contain" />
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">MedConnect</h1>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-5xl font-bold text-slate-900 tracking-tight leading-tight">Welcome back</h2>
                        <p className="text-slate-500 text-lg mt-2">Sign in to access your healthcare dashboard</p>
                    </div>

                    {loginError && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-5 flex items-center gap-2.5 border border-red-100 text-sm"
                        >
                            <AlertCircle size={16} className="shrink-0" />
                            <span className="font-medium">{loginError}</span>
                        </motion.div>
                    )}

                    {loginSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-emerald-50 text-emerald-600 px-4 py-3 rounded-xl mb-5 flex items-center gap-2.5 border border-emerald-100 text-sm"
                        >
                            <span className="font-medium">{loginSuccess}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-[13px] font-semibold text-slate-700 mb-2">Email Address</label>
                            <div className="relative group">
                                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors z-10 ${loginError ? 'text-red-400' : 'group-focus-within:text-[#1B6CA8] text-slate-400'}`}>
                                    <Mail size={18} strokeWidth={2} />
                                </div>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={credentials.email}
                                    onChange={(e) => { setCredentials({ ...credentials, email: e.target.value }); setLoginError(''); }}
                                    className={`w-full pl-12 pr-4 py-3 text-[15px] bg-slate-50 border rounded-xl outline-none transition-all duration-200 placeholder:text-slate-400 ${loginError ? 'border-red-200 bg-red-50/30 focus:border-red-300 focus:ring-2 focus:ring-red-100' : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:bg-white'}`}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[13px] font-semibold text-slate-700 mb-2">Password</label>
                            <div className="relative group">
                                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors z-10 ${loginError ? 'text-red-400' : 'group-focus-within:text-[#1B6CA8] text-slate-400'}`}>
                                    <Lock size={18} strokeWidth={2} />
                                </div>
                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={credentials.password}
                                    onChange={(e) => { setCredentials({ ...credentials, password: e.target.value }); setLoginError(''); }}
                                    className={`w-full pl-12 pr-4 py-3 text-[15px] bg-slate-50 border rounded-xl outline-none transition-all duration-200 placeholder:text-slate-400 ${loginError ? 'border-red-200 bg-red-50/30 focus:border-red-300 focus:ring-2 focus:ring-red-100' : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:bg-white'}`}
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full py-3.5 text-[15px] bg-gradient-to-r from-[#1B6CA8] to-[#155E9A] text-white rounded-xl font-semibold shadow-lg hover:shadow-[0_8px_24px_rgba(27,108,168,0.35)] transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                            >
                                Sign In
                                <ArrowRight size={18} strokeWidth={2.5} />
                            </button>
                        </div>
                    </form>

                    {/* Mobile Only switch */}
                    <p className="mt-8 text-center text-sm text-slate-500 md:hidden">
                        Don't have an account? <button type="button" onClick={() => setIsSignUp(true)} className="text-[#1B6CA8] font-semibold hover:underline">Sign up</button>
                    </p>
                </div>

                {/* --- RIGHT SIDE: SIGN UP FORM --- */}
                <div
                    className={`w-full md:w-1/2 p-6 sm:p-10 flex flex-col justify-start overflow-y-auto hide-scrollbar bg-[#FAFBFD] z-10 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:absolute md:top-0 md:left-0 md:h-full 
                    ${isSignUp ? 'flex md:translate-x-[100%] md:opacity-100' : 'hidden md:flex md:translate-x-0 md:opacity-0 md:pointer-events-none'}`}
                >
                    <div className="mb-6 pt-2">
                        <h2 className="text-[26px] font-extrabold text-slate-900 tracking-tight leading-tight">Create Account</h2>
                        <p className="text-slate-500 mt-1.5 mb-5 text-[14px] font-normal">Choose your role to get started</p>
                        <PillNav tabs={roles} activeTab={role} setActiveTab={setRole} />
                    </div>

                    {registerError && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-5 flex items-center gap-2.5 border border-red-100 text-sm"
                        >
                            <AlertCircle size={16} className="shrink-0" />
                            <span className="font-medium">{registerError}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-4 pb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5 pl-0.5">Full Name</label>
                                <Input name="name" value={formData.name} onChange={handleRegisterChange} required placeholder="John Doe" borderFull={false} className="py-2.5 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5 pl-0.5">Email Address</label>
                                <Input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleRegisterChange}
                                    required
                                    placeholder="user@example.com"
                                    borderFull={false}
                                    className="py-2.5 text-sm"
                                    error={emailError ? true : undefined}
                                    success={emailValid ? true : undefined}
                                />
                                {emailError && (
                                    <p className="text-[11px] text-red-500 mt-1 pl-1 leading-tight flex items-center gap-1">
                                        <AlertCircle size={10} /> {emailError}
                                    </p>
                                )}
                                {!emailError && emailValid && (
                                    <p className="text-[11px] text-emerald-600 mt-1 pl-1 leading-tight">✓ Valid email</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5 pl-0.5">Phone Number</label>
                                <Input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                    onBlur={handlePhoneBlur}
                                    error={phoneError ? true : undefined}
                                    success={phoneSuccess ? true : undefined}
                                    required
                                    placeholder="9876543210"
                                    borderFull={false}
                                    className="py-2.5 text-sm"
                                />
                                {phoneError ? (
                                    <p className="text-[11px] text-red-500 mt-1 pl-1 leading-tight flex items-center gap-1">
                                        <AlertCircle size={10} /> {phoneError}
                                    </p>
                                ) : phoneSuccess ? (
                                    <p className="text-[11px] text-emerald-600 mt-1 pl-1 leading-tight">✓ Valid number</p>
                                ) : (
                                    <p className="text-[11px] text-slate-400 mt-1 pl-1 leading-tight">Must start with 6–9, 10 digits</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5 pl-0.5">Password</label>
                                <Input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleRegisterChange}
                                    required
                                    placeholder="••••••••"
                                    borderFull={false}
                                    className="py-2.5 text-sm"
                                />
                                <p className={`text-[11px] mt-1 pl-1 leading-tight transition-colors ${formData.password.length > 0 ? (passwordHint ? 'text-emerald-600' : 'text-red-500') : 'text-slate-400'}`}>
                                    {passwordHint ? '✓ Strong enough' : 'Min 6 characters'}
                                </p>
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
                                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 pl-0.5">Specialization</label>
                                                    <Input name="specialization" value={formData.specialization} onChange={handleRegisterChange} required placeholder="e.g. Cardiology" borderFull={false} className="py-2.5 text-sm bg-gray-50" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 pl-0.5">Experience (Years)</label>
                                                    <Input type="number" name="experience" value={formData.experience} onChange={handleRegisterChange} required placeholder="e.g. 10" borderFull={false} className="py-2.5 text-sm bg-gray-50" />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 pl-0.5">Pharmacy Name</label>
                                                    <Input name="pharmacyInfo" value={formData.pharmacyInfo} onChange={handleRegisterChange} required placeholder="e.g. City Health Pharma" borderFull={false} className="py-2.5 text-sm bg-gray-50" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 pl-0.5">Experience (Years)</label>
                                                    <Input type="number" name="experience" value={formData.experience} onChange={handleRegisterChange} required placeholder="e.g. 5" borderFull={false} className="py-2.5 text-sm bg-gray-50" />
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* ID Card File Upload */}
                                    <div className="mt-4">
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 pl-0.5">Upload ID Card <span className="text-red-500">*</span></label>
                                        <label className="w-full border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-slate-500 bg-white hover:bg-slate-50 transition-all cursor-pointer hover:border-[#1B6CA8]/40 group">
                                            <ImageIcon size={22} className="mb-1.5 text-slate-400 group-hover:text-[#1B6CA8] transition-colors" />
                                            <span className="text-[12px] font-medium text-[#1B6CA8]">
                                                {formData.idCard ? formData.idCard.name : 'Click to upload image or PDF'}
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*,application/pdf"
                                                className="hidden"
                                                onChange={(e) => setFormData(prev => ({ ...prev, idCard: e.target.files[0] }))}
                                            />
                                        </label>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Custom Text CAPTCHA */}
                        <div className="space-y-2 pt-2">
                            <label className="block text-xs font-semibold text-slate-600 pl-0.5">Security Verification</label>
                            <div className="flex items-center gap-3">
                                <div className="px-5 py-2.5 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl font-mono text-lg tracking-[0.35em] font-bold text-slate-800 select-none border border-slate-200 relative overflow-hidden shadow-inner">
                                    <span className="relative z-10">{captcha}</span>
                                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.08) 5px, rgba(0,0,0,0.08) 10px)' }} />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setCaptcha(generateCaptcha()); setCaptchaInput(''); setCaptchaError(''); }}
                                    className="p-2 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-[#1B6CA8] transition-all"
                                    title="Refresh CAPTCHA"
                                >
                                    <RefreshCw size={16} />
                                </button>
                            </div>
                            <input
                                type="text"
                                placeholder="Enter CAPTCHA above"
                                value={captchaInput}
                                onChange={(e) => { setCaptchaInput(e.target.value.toUpperCase()); setCaptchaError(''); }}
                                maxLength={6}
                                className="w-full border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 font-mono tracking-widest text-center text-sm uppercase outline-none focus:border-[#1B6CA8] focus:ring-2 focus:ring-[#1B6CA8]/10 focus:bg-white transition-all"
                            />
                            {captchaError && (
                                <p className="text-xs text-red-500 flex items-center gap-1 pl-1">
                                    <AlertCircle size={11} /> {captchaError}
                                </p>
                            )}
                        </div>

                        <div className="pt-4">
                            <motion.button
                                whileHover={validatePhone(formData.phone) && captchaInput.length === 6 ? { scale: 1.01, translateY: -1 } : {}}
                                whileTap={validatePhone(formData.phone) && captchaInput.length === 6 ? { scale: 0.98 } : {}}
                                type="submit"
                                disabled={!validatePhone(formData.phone) || captchaInput.length < 6}
                                className={`w-full py-3.5 text-[15px] rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${!validatePhone(formData.phone) || captchaInput.length < 6 ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-[#1B6CA8] to-[#155E9A] text-white shadow-[0_4px_16px_rgba(27,108,168,0.3)] hover:shadow-[0_8px_24px_rgba(27,108,168,0.35)]'}`}
                            >
                                Create Account
                                <ArrowRight size={18} strokeWidth={2.5} />
                            </motion.button>
                        </div>
                        
                        {/* Role-based Social Sign Up */}
                        <SocialAuthOptions role={role} />
                    </form>

                    {/* Mobile Only switch */}
                    <p className="mt-2 text-center text-sm text-slate-500 md:hidden">
                        Already have an account? <button type="button" onClick={() => setIsSignUp(false)} className="text-[#1B6CA8] font-semibold hover:underline">Log in</button>
                    </p>
                </div>

                {/* --- SLIDING OVERLAY (Desktop Only) --- */}
                <div
                    className={`hidden md:block absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] z-50 
                    ${isSignUp ? '-translate-x-full' : 'translate-x-0'}`}
                >
                    <div
                        className={`relative -left-full h-full w-[200%] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] text-white ${isSignUp ? 'translate-x-[50%]' : 'translate-x-0'} flex`}
                        style={{ background: 'linear-gradient(135deg, #0A1628 0%, #133B5C 40%, #1B6CA8 70%, #1A5F94 100%)' }}
                    >
                        {/* Dynamic animated background */}
                        <style>{`
                            @keyframes floatUp { 0% { transform: translateY(100%) rotate(0deg); opacity: 0; } 10% { opacity: 0.06; } 90% { opacity: 0.06; } 100% { transform: translateY(-100%) rotate(360deg); opacity: 0; } }
                            @keyframes floatDiag { 0% { transform: translate(0, 100%) scale(0.8); opacity: 0; } 15% { opacity: 0.08; } 85% { opacity: 0.08; } 100% { transform: translate(80px, -120%) scale(1.2); opacity: 0; } }
                            @keyframes glowPulse { 0%, 100% { opacity: 0.08; transform: scale(1); } 50% { opacity: 0.15; transform: scale(1.1); } }
                        `}</style>

                        {/* Mesh gradient overlay */}
                        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(0,180,216,0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(27,108,168,0.2) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 60%)' }}></div>

                        {/* Floating geometric shapes */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute w-16 h-16 border border-white/[0.06] rounded-xl" style={{ left: '15%', animation: 'floatUp 12s linear infinite' }}></div>
                            <div className="absolute w-10 h-10 border border-white/[0.05] rounded-full" style={{ left: '45%', animation: 'floatUp 18s linear infinite 3s' }}></div>
                            <div className="absolute w-20 h-20 border border-white/[0.04] rounded-2xl" style={{ left: '70%', animation: 'floatUp 15s linear infinite 6s' }}></div>
                            <div className="absolute w-8 h-8 bg-white/[0.03] rounded-lg" style={{ left: '30%', animation: 'floatDiag 20s linear infinite 2s' }}></div>
                            <div className="absolute w-12 h-12 border border-white/[0.05] rounded-full" style={{ left: '60%', animation: 'floatDiag 16s linear infinite 8s' }}></div>
                            <div className="absolute w-6 h-6 bg-white/[0.04] rounded-md" style={{ left: '80%', animation: 'floatUp 14s linear infinite 4s' }}></div>
                            <div className="absolute w-14 h-14 border border-white/[0.03] rounded-xl" style={{ left: '25%', animation: 'floatDiag 22s linear infinite 10s' }}></div>
                        </div>

                        {/* Glowing accent orbs */}
                        <div className="absolute w-[250px] h-[250px] rounded-full" style={{ top: '10%', left: '20%', background: 'radial-gradient(circle, rgba(0,180,216,0.12) 0%, transparent 60%)', animation: 'glowPulse 6s ease-in-out infinite' }}></div>
                        <div className="absolute w-[200px] h-[200px] rounded-full" style={{ bottom: '15%', right: '15%', background: 'radial-gradient(circle, rgba(27,108,168,0.1) 0%, transparent 60%)', animation: 'glowPulse 8s ease-in-out infinite 3s' }}></div>

                        {/* Subtle dot grid */}
                        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 0.5px, transparent 0)', backgroundSize: '24px 24px' }}></div>

                        {/* Overlay Left Content — Visible when Sign Up is active */}
                        <div
                            className={`absolute top-0 left-0 w-1/2 h-full flex flex-col items-center justify-center p-12 text-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] 
                            ${isSignUp ? 'translate-x-0 opacity-100' : '-translate-x-[20%] opacity-0'}`}
                        >
                            <img src="/medconnect.png" alt="MedConnect" className="w-16 h-16 rounded-2xl object-contain mb-6 shadow-lg" style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }} />
                            <h2 className="text-[30px] font-extrabold mb-3 tracking-tight leading-tight">Welcome Back</h2>
                            <p className="mb-8 text-blue-100/70 leading-relaxed text-[14px] max-w-[260px]">
                                Sign in to your account to continue managing your healthcare experience
                            </p>
                            <button
                                onClick={() => setIsSignUp(false)}
                                className="px-10 py-3 bg-white/10 backdrop-blur-sm border border-white/25 text-white rounded-xl font-semibold text-sm hover:bg-white/20 active:scale-95 transition-all outline-none shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
                            >
                                Sign In
                            </button>
                        </div>

                        {/* Overlay Right Content — Visible when Sign In is active */}
                        <div
                            className={`absolute top-0 right-0 w-1/2 h-full flex flex-col items-center justify-center p-12 text-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] 
                            ${isSignUp ? 'translate-x-[20%] opacity-0' : 'translate-x-0 opacity-100'}`}
                        >
                            <img src="/medconnect.png" alt="MedConnect" className="w-16 h-16 rounded-2xl object-contain mb-6 shadow-lg" style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }} />
                            <h2 className="text-[30px] font-extrabold mb-3 tracking-tight leading-tight">Get Started Today</h2>
                            <p className="mb-8 text-blue-100/70 leading-relaxed text-[14px] max-w-[260px]">
                                Register now to access seamless healthcare management, appointments, and prescriptions
                            </p>
                            <button
                                onClick={() => setIsSignUp(true)}
                                className="px-10 py-3 bg-white/10 backdrop-blur-sm border border-white/25 text-white rounded-xl font-semibold text-sm hover:bg-white/20 active:scale-95 transition-all outline-none shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
                            >
                                Create Account
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AuthPage;

