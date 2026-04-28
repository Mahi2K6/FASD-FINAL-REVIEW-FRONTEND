import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAppContext } from '../../AppContext';
import { useToast } from '../../components/ui/ToastNotification';
import API from '../../api';

/* ═══════════════════════════════════════════════════════════════
 *  MedConnect — Change Password
 *  Real password change form with validation and API integration.
 * ═══════════════════════════════════════════════════════════════ */

const PasswordInput = ({ label, value, onChange, error, placeholder }) => {
    const [show, setShow] = useState(false);
    return (
        <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
            <div className="relative">
                <input
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full px-4 py-3 bg-white rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                        error ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-blue-400'
                    }`}
                />
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
            {error && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={11} /> {error}
                </p>
            )}
        </div>
    );
};

const PasswordStrength = ({ password }) => {
    const getStrength = () => {
        if (!password) return { level: 0, label: '', color: '' };
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        if (password.length >= 12) score++;

        if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-red-400' };
        if (score <= 2) return { level: 2, label: 'Fair', color: 'bg-amber-400' };
        if (score <= 3) return { level: 3, label: 'Good', color: 'bg-blue-400' };
        return { level: 4, label: 'Strong', color: 'bg-emerald-400' };
    };

    const { level, label, color } = getStrength();
    if (!password) return null;

    return (
        <div className="mt-2">
            <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= level ? color : 'bg-slate-100'}`} />
                ))}
            </div>
            <p className={`text-[10px] font-semibold ${level <= 1 ? 'text-red-500' : level <= 2 ? 'text-amber-500' : level <= 3 ? 'text-blue-500' : 'text-emerald-500'}`}>
                {label}
            </p>
        </div>
    );
};

const ChangePassword = () => {
    const { currentUser } = useAppContext();
    const toast = useToast();

    const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const validate = () => {
        const e = {};
        if (!form.current) e.current = 'Current password is required';
        if (!form.newPass) e.newPass = 'New password is required';
        else if (form.newPass.length < 8) e.newPass = 'Minimum 8 characters required';
        if (!form.confirm) e.confirm = 'Please confirm your new password';
        else if (form.newPass !== form.confirm) e.confirm = 'Passwords do not match';
        if (form.current && form.newPass && form.current === form.newPass) e.newPass = 'New password must be different';
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setSaving(true);
        setErrors({});
        try {
            await API.post('/users/change-password', {
                currentPassword: form.current,
                newPassword: form.newPass,
            });
            setSuccess(true);
            setForm({ current: '', newPass: '', confirm: '' });
            toast.success('Password Changed', 'Your password has been updated successfully.');
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to change password.';
            toast.error('Update Failed', msg);
            if (err.response?.status === 401 || err.response?.status === 400) {
                setErrors({ current: 'Incorrect current password' });
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppLayout activeTab="settings" setActiveTab={() => {}}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-lg mx-auto space-y-6"
            >
                <div>
                    <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Lock size={22} className="text-rose-500" />
                        Change Password
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">Update your security credentials</p>
                </div>

                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl"
                    >
                        <ShieldCheck size={20} className="text-emerald-600" />
                        <div>
                            <p className="text-sm font-bold text-emerald-800">Password Updated Successfully</p>
                            <p className="text-[11px] text-emerald-600">Your account is now secured with the new password.</p>
                        </div>
                    </motion.div>
                )}

                <Card hover={false}>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Account info */}
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                                {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-700">{currentUser?.name}</p>
                                <p className="text-[11px] text-slate-400">{currentUser?.email}</p>
                            </div>
                        </div>

                        <PasswordInput
                            label="Current Password"
                            value={form.current}
                            onChange={e => { setForm(p => ({ ...p, current: e.target.value })); setErrors(p => ({ ...p, current: '' })); setSuccess(false); }}
                            error={errors.current}
                            placeholder="Enter your current password"
                        />

                        <div>
                            <PasswordInput
                                label="New Password"
                                value={form.newPass}
                                onChange={e => { setForm(p => ({ ...p, newPass: e.target.value })); setErrors(p => ({ ...p, newPass: '' })); setSuccess(false); }}
                                error={errors.newPass}
                                placeholder="Enter new password (min. 8 chars)"
                            />
                            <PasswordStrength password={form.newPass} />
                        </div>

                        <PasswordInput
                            label="Confirm New Password"
                            value={form.confirm}
                            onChange={e => { setForm(p => ({ ...p, confirm: e.target.value })); setErrors(p => ({ ...p, confirm: '' })); setSuccess(false); }}
                            error={errors.confirm}
                            placeholder="Re-enter new password"
                        />

                        {/* Requirements */}
                        <div className="bg-slate-50 rounded-xl p-3">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Requirements</p>
                            <div className="grid grid-cols-2 gap-1.5">
                                {[
                                    { check: form.newPass.length >= 8, label: 'At least 8 characters' },
                                    { check: /[A-Z]/.test(form.newPass), label: 'One uppercase letter' },
                                    { check: /[0-9]/.test(form.newPass), label: 'One number' },
                                    { check: /[^A-Za-z0-9]/.test(form.newPass), label: 'One special character' },
                                ].map(({ check, label }, i) => (
                                    <div key={i} className="flex items-center gap-1.5">
                                        <CheckCircle size={11} className={check ? 'text-emerald-500' : 'text-slate-300'} />
                                        <span className={`text-[10px] font-medium ${check ? 'text-emerald-600' : 'text-slate-400'}`}>{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            icon={saving ? Loader2 : ShieldCheck}
                            loading={saving}
                            className="w-full"
                            size="lg"
                        >
                            {saving ? 'Updating…' : 'Update Password'}
                        </Button>
                    </form>
                </Card>
            </motion.div>
        </AppLayout>
    );
};

export default ChangePassword;
