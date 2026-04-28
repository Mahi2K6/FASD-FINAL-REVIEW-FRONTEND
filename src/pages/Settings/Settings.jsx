import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Settings as SettingsIcon, Sun, Moon, Bell, BellOff, Shield, Eye, EyeOff,
    Mail, Calendar, Pill, Truck, Save, CheckCircle, Loader2, RotateCcw
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAppContext } from '../../AppContext';
import { useToast } from '../../components/ui/ToastNotification';

/* ═══════════════════════════════════════════════════════════════
 *  MedConnect — Account Settings
 *  Real, functional settings page with persistent preferences.
 * ═══════════════════════════════════════════════════════════════ */

const STORAGE_KEY = 'medconnect_settings';

const defaultSettings = {
    theme: 'light',
    notifications: {
        email: true,
        appointmentReminders: true,
        prescriptionUpdates: true,
        pharmacyUpdates: true,
    },
    privacy: {
        showPhone: true,
        shareRecords: false,
    },
};

const Toggle = ({ checked, onChange, label, description, icon: Icon }) => (
    <div className="flex items-center justify-between py-3.5 border-b border-slate-100 last:border-0">
        <div className="flex items-start gap-3">
            {Icon && (
                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center mt-0.5 shrink-0">
                    <Icon size={16} className="text-slate-500" />
                </div>
            )}
            <div>
                <p className="text-sm font-semibold text-slate-700">{label}</p>
                {description && <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>}
            </div>
        </div>
        <button
            onClick={onChange}
            className={`relative w-11 h-6 rounded-full transition-all duration-200 ${
                checked ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-slate-200'
            }`}
        >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                checked ? 'translate-x-[22px]' : 'translate-x-0.5'
            }`} />
        </button>
    </div>
);

const Settings = () => {
    const { currentUser } = useAppContext();
    const toast = useToast();
    const [settings, setSettings] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
        } catch { return defaultSettings; }
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const role = currentUser?.role?.toLowerCase() || 'patient';

    const updateSetting = (path, value) => {
        setSaved(false);
        setSettings(prev => {
            const keys = path.split('.');
            const updated = { ...prev };
            let obj = updated;
            for (let i = 0; i < keys.length - 1; i++) {
                obj[keys[i]] = { ...obj[keys[i]] };
                obj = obj[keys[i]];
            }
            obj[keys[keys.length - 1]] = value;
            return updated;
        });
    };

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
            setSaving(false);
            setSaved(true);
            toast.success('Settings Saved', 'Your preferences have been updated.');
        }, 600);
    };

    const handleReset = () => {
        setSettings(defaultSettings);
        localStorage.removeItem(STORAGE_KEY);
        setSaved(false);
        toast.success('Settings Reset', 'All preferences restored to defaults.');
    };

    return (
        <AppLayout activeTab="settings" setActiveTab={() => {}}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto space-y-6"
            >
                <div>
                    <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <SettingsIcon size={22} className="text-blue-500" />
                        Account Settings
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">Manage your preferences and privacy</p>
                </div>

                {/* Theme */}
                <Card hover={false}>
                    <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <Sun size={15} className="text-amber-500" />
                        Appearance
                    </h3>
                    <div className="flex gap-3">
                        {[
                            { key: 'light', label: 'Light', icon: Sun, color: 'from-amber-400 to-orange-400' },
                            { key: 'dark', label: 'Dark', icon: Moon, color: 'from-indigo-500 to-purple-600' },
                        ].map(({ key, label, icon: I, color }) => (
                            <button
                                key={key}
                                onClick={() => updateSetting('theme', key)}
                                className={`flex-1 flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                                    settings.theme === key
                                        ? 'border-blue-400 bg-blue-50/60 shadow-sm'
                                        : 'border-slate-100 bg-white hover:border-slate-200'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                                    <I size={18} className="text-white" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-slate-700">{label}</p>
                                    <p className="text-[10px] text-slate-400">{key === 'light' ? 'Default theme' : 'Easy on eyes'}</p>
                                </div>
                                {settings.theme === key && <CheckCircle size={16} className="text-blue-500 ml-auto" />}
                            </button>
                        ))}
                    </div>
                </Card>

                {/* Notifications */}
                <Card hover={false}>
                    <h3 className="text-sm font-bold text-slate-700 mb-1 flex items-center gap-2">
                        <Bell size={15} className="text-blue-500" />
                        Notification Preferences
                    </h3>
                    <p className="text-[11px] text-slate-400 mb-3">Choose which notifications you receive</p>
                    <Toggle
                        icon={Mail}
                        label="Email Notifications"
                        description="Receive updates via email"
                        checked={settings.notifications.email}
                        onChange={() => updateSetting('notifications.email', !settings.notifications.email)}
                    />
                    <Toggle
                        icon={Calendar}
                        label="Appointment Reminders"
                        description="Get notified before scheduled consultations"
                        checked={settings.notifications.appointmentReminders}
                        onChange={() => updateSetting('notifications.appointmentReminders', !settings.notifications.appointmentReminders)}
                    />
                    <Toggle
                        icon={Pill}
                        label="Prescription Updates"
                        description="Alerts when prescriptions are added or changed"
                        checked={settings.notifications.prescriptionUpdates}
                        onChange={() => updateSetting('notifications.prescriptionUpdates', !settings.notifications.prescriptionUpdates)}
                    />
                    {(role === 'patient' || role === 'pharmacist') && (
                        <Toggle
                            icon={Truck}
                            label="Pharmacy & Order Updates"
                            description="Order status and delivery notifications"
                            checked={settings.notifications.pharmacyUpdates}
                            onChange={() => updateSetting('notifications.pharmacyUpdates', !settings.notifications.pharmacyUpdates)}
                        />
                    )}
                </Card>

                {/* Privacy */}
                <Card hover={false}>
                    <h3 className="text-sm font-bold text-slate-700 mb-1 flex items-center gap-2">
                        <Shield size={15} className="text-emerald-500" />
                        Privacy Controls
                    </h3>
                    <p className="text-[11px] text-slate-400 mb-3">Control what information is visible to others</p>
                    <Toggle
                        icon={Eye}
                        label="Show Phone Number"
                        description="Allow doctors and pharmacists to see your phone number"
                        checked={settings.privacy.showPhone}
                        onChange={() => updateSetting('privacy.showPhone', !settings.privacy.showPhone)}
                    />
                    <Toggle
                        icon={Shield}
                        label="Share Medical Records"
                        description="Allow assigned doctors to access your medical history"
                        checked={settings.privacy.shareRecords}
                        onChange={() => updateSetting('privacy.shareRecords', !settings.privacy.shareRecords)}
                    />
                </Card>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-1">
                    <Button
                        icon={saving ? Loader2 : saved ? CheckCircle : Save}
                        loading={saving}
                        onClick={handleSave}
                        className="min-w-[160px]"
                    >
                        {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Settings'}
                    </Button>
                    <Button variant="ghost" icon={RotateCcw} onClick={handleReset}>
                        Reset to Defaults
                    </Button>
                </div>
            </motion.div>
        </AppLayout>
    );
};

export default Settings;
