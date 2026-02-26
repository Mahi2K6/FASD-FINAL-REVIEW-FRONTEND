import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassInput } from '../../components/ui/GlassInput';
import { GlassButton } from '../../components/ui/GlassButton';
import { PillNav } from '../../components/ui/PillNav';
import { useAppContext } from '../../AppContext';
import { User, Stethoscope, BriefcaseMedical, Mail, Lock, Phone, ArrowLeft, Image as ImageIcon } from 'lucide-react';

const roles = [
    { id: 'patient', label: 'Patient', icon: User },
    { id: 'doctor', label: 'Doctor', icon: Stethoscope },
    { id: 'pharmacist', label: 'Pharmacist', icon: BriefcaseMedical },
];

export const Register = () => {
    const navigate = useNavigate();
    const { registerUser } = useAppContext();
    const [role, setRole] = useState('patient');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        specialization: '',
        experience: '',
        pharmacyInfo: ''
    });

    const [phoneError, setPhoneError] = useState('');
    const [phoneSuccess, setPhoneSuccess] = useState(false);

    const [isPending, setIsPending] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate phone on submit
        if (!validatePhone(formData.phone)) {
            setPhoneError('Enter a valid 10-digit Indian mobile number');
            setPhoneSuccess(false);
            return;
        }

        registerUser({ ...formData, role });

        if (role === 'doctor' || role === 'pharmacist') {
            setIsPending(true);
        } else {
            navigate('/dashboard');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validatePhone = (phone) => {
        return /^[6-9]\d{9}$/.test(phone);
    };

    const handlePhoneChange = (e) => {
        // Strip non-digits
        let val = e.target.value.replace(/\D/g, '');
        // Limit to 10
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

    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <GlassCard className="max-w-md w-full p-8 text-center bg-white/70">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-blue-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Registration Pending</h2>
                    <p className="text-slate-500 mb-8">
                        Your {role} account has been created and is waiting for administrator approval. You will not be able to log in until approved.
                    </p>
                    <GlassButton onClick={() => navigate('/login')} variant="secondary" className="w-full py-3">
                        Return to Login
                    </GlassButton>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative p-4 py-12">
            <div className="absolute top-0 left-0 p-6 z-20">
                <Link to="/login" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
                    <ArrowLeft size={20} />
                    <span className="font-medium">Back to Login</span>
                </Link>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-xl z-10"
            >
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
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Create Account</h3>
                    <p className="text-slate-500 mt-2 mb-6">Join our premium medical network</p>
                    <PillNav tabs={roles} activeTab={role} setActiveTab={setRole} />
                </div>

                <GlassCard className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 pl-1">Full Name</label>
                                <GlassInput name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" borderFull={false} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 pl-1">Email</label>
                                <GlassInput type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" borderFull={false} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 pl-1">Phone Number</label>
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
                                />
                                {phoneError && <p className="text-xs text-red-500 mt-1 pl-1">{phoneError}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 pl-1">Password</label>
                                <GlassInput type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" borderFull={false} />
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
                                                    <label className="block text-sm font-medium text-slate-700 mb-1 pl-1">Specialization</label>
                                                    <GlassInput name="specialization" value={formData.specialization} onChange={handleChange} required placeholder="e.g. Cardiology" borderFull={false} />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1 pl-1">Experience (Years)</label>
                                                    <GlassInput type="number" name="experience" value={formData.experience} onChange={handleChange} required placeholder="e.g. 10" borderFull={false} />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1 pl-1">Pharmacy Name</label>
                                                    <GlassInput name="pharmacyInfo" value={formData.pharmacyInfo} onChange={handleChange} required placeholder="e.g. City Health Pharma" borderFull={false} />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1 pl-1">Experience (Years)</label>
                                                    <GlassInput type="number" name="experience" value={formData.experience} onChange={handleChange} required placeholder="e.g. 5" borderFull={false} />
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Simulated ID Card Upload (Required for professionals) */}
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-slate-700 mb-2 pl-1">Upload ID Card <span className="text-red-500">*</span></label>
                                        <div className="w-full border-2 border-dashed border-slate-300 rounded-[28px] p-6 flex flex-col items-center justify-center text-slate-500 bg-white/30 hover:bg-white/50 transition-colors cursor-pointer">
                                            <ImageIcon size={32} className="mb-2 text-slate-400" />
                                            <span className="text-sm font-medium">Click to upload or drag and drop</span>
                                            <span className="text-xs mt-1">PNG, JPG up to 5MB (Simulated)</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="pt-6">
                            <GlassButton type="submit" className="w-full py-4 text-base">
                                Create Account
                            </GlassButton>
                        </div>
                    </form>
                </GlassCard>
            </motion.div>
        </div>
    );
};
