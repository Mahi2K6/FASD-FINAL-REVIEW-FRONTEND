import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Stethoscope, HeartPulse, Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAppContext } from '../../AppContext';
import API from '../../api';
import { useToast } from '../../components/ui/ToastNotification';
import AppLayout from '../../components/layout/AppLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const Field = ({ label, icon: Icon, error, children }) => (
    <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5 flex items-center gap-1.5">
            {Icon && <Icon size={14} className="text-blue-500" />}
            {label}
        </label>
        {children}
        {error && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={11} /> {error}
            </p>
        )}
    </div>
);

const ProfilePage = () => {
    const { currentUser, setCurrentUser } = useAppContext();
    const toast = useToast();

    const role = currentUser?.role?.toLowerCase() || 'patient';

    const [form, setForm] = useState({
        name: currentUser?.name || '',
        phone: currentUser?.phone || '',
        specialization: currentUser?.specialization || '',
        emergencyContact: currentUser?.emergencyContact || '',
    });

    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Name is required';
        if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Enter a valid 10-digit Indian mobile number';
        if (form.emergencyContact && !/^[6-9]\d{9}$/.test(form.emergencyContact))
            e.emergencyContact = 'Enter a valid 10-digit Indian mobile number';
        return e;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
        setSaved(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }

        setSaving(true);
        try {
            const payload = {
                name: form.name.trim(),
                phone: form.phone,
                ...(role === 'doctor' || role === 'pharmacist' ? { specialization: form.specialization } : {}),
                emergencyContact: form.emergencyContact,
            };

            const res = await API.put('/users/profile', payload);
            const updatedUser = { ...currentUser, ...payload, ...(res.data || {}) };

            // Sync context + localStorage
            setCurrentUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setSaved(true);
            toast.success('Profile updated', 'Your information has been saved successfully.');
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to save profile.';
            toast.error('Update failed', msg);
        } finally {
            setSaving(false);
        }
    };

    const inputClass = (field) =>
        `input-field focus:input-focus ${
            errors[field] ? '!border-red-400' : ''
        }`;

    return (
        <AppLayout activeTab="profile" setActiveTab={() => {}}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto space-y-6"
            >
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white flex items-center justify-center text-3xl font-bold shadow-lg">
                        {form.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">{currentUser.name}</h2>
                        <p className="text-[var(--color-text-secondary)] text-sm">{currentUser.email}</p>
                    </div>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">Personal Details</h3>

                        {/* Name */}
                        <Field label="Full Name" icon={User} error={errors.name}>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                className={inputClass('name')}
                            />
                        </Field>

                        {/* Phone */}
                        <Field label="Phone Number" icon={Phone} error={errors.phone}>
                            <input
                                name="phone"
                                type="tel"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="9876543210"
                                maxLength={10}
                                className={inputClass('phone')}
                            />
                            {!errors.phone && form.phone.length === 10 && /^[6-9]\d{9}$/.test(form.phone) && (
                                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                                    <CheckCircle size={11} /> Valid number
                                </p>
                            )}
                        </Field>

                        {/* Specialization — shown for doctor & pharmacist */}
                        {(role === 'doctor' || role === 'pharmacist') && (
                            <Field label="Specialization / Pharmacy Name" icon={Stethoscope} error={errors.specialization}>
                                <input
                                    name="specialization"
                                    value={form.specialization}
                                    onChange={handleChange}
                                    placeholder={role === 'doctor' ? 'e.g. Cardiology' : 'e.g. City Health Pharma'}
                                    className={inputClass('specialization')}
                                />
                            </Field>
                        )}

                        {/* Emergency Contact */}
                        <Field label="Emergency Contact Number" icon={HeartPulse} error={errors.emergencyContact}>
                            <input
                                name="emergencyContact"
                                type="tel"
                                value={form.emergencyContact}
                                onChange={handleChange}
                                placeholder="Emergency phone number"
                                maxLength={10}
                                className={inputClass('emergencyContact')}
                            />
                        </Field>

                        {/* Read-only email */}
                        <div className="pt-1">
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Email Address</label>
                            <input
                                value={currentUser?.email || ''}
                                disabled
                                className="input-field !bg-gray-50 !border-gray-200 text-[var(--color-text-secondary)] cursor-not-allowed opacity-60"
                            />
                            <p className="text-xs text-[var(--color-text-secondary)] mt-1 pl-1">Email cannot be changed.</p>
                        </div>

                        {/* Submit */}
                        <div className="pt-2 flex items-center gap-3">
                            <Button
                                type="submit"
                                icon={saving ? Loader2 : saved ? CheckCircle : Save}
                                loading={saving}
                                className="min-w-[160px]"
                            >
                                {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
                            </Button>
                            {saved && (
                                <motion.span
                                    initial={{ opacity: 0, x: -6 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                                >
                                    <CheckCircle size={14} /> Profile updated successfully
                                </motion.span>
                            )}
                        </div>
                    </form>
                </Card>
            </motion.div>
        </AppLayout>
    );
};

export default ProfilePage;
