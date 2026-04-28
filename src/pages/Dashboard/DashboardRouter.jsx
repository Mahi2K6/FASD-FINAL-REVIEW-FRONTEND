import React, { useState, Suspense, lazy } from 'react';
import { useAppContext } from '../../AppContext';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';



const AdminDashboard = lazy(() => import('./AdminDashboard'));
const PatientDashboard = lazy(() => import('./PatientDashboard'));
const DoctorDashboard = lazy(() => import('./DoctorDashboard'));
const PharmacistDashboard = lazy(() => import('./PharmacistDashboard'));
const DoctorEarnings = lazy(() => import('./DoctorEarnings'));
const ProfilePage = lazy(() => import('./ProfilePage'));
const SettingsPage = lazy(() => import('../Settings/Settings'));
const ChangePasswordPage = lazy(() => import('../ChangePassword/ChangePassword'));
const NotificationsPage = lazy(() => import('../Notifications/Notifications'));
const BillingPage = lazy(() => import('../Billing/Billing'));
const SavedCardsManager = lazy(() => import('../../components/payment/SavedCardsManager'));
const PrescriptionMarketplace = lazy(() => import('../Prescriptions/PrescriptionMarketplace'));

const DashboardLoader = () => (
    <div className="w-full h-[80vh] flex flex-col items-center justify-center gap-6">
        <div className="relative">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                className="w-14 h-14 rounded-full border-[3px] border-slate-100 border-t-[var(--color-primary)]"
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                    animate={{ scale: [0.85, 1, 0.85] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-6 h-6 rounded-lg bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-accent)]/10"
                />
            </div>
        </div>
        <div className="flex flex-col items-center gap-1.5">
            <motion.p 
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-slate-500 font-semibold tracking-wide text-sm"
            >
                Preparing Workspace
            </motion.p>
            <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                    <motion.div
                        key={i}
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                        className="w-1 h-1 rounded-full bg-slate-300"
                    />
                ))}
            </div>
        </div>
    </div>
);


const DashboardRouter = () => {
    const { currentUser } = useAppContext();
    const location = useLocation();


    const activeUser = currentUser || JSON.parse(localStorage.getItem('user'));

    if (!activeUser) return <Navigate to="/login" replace />;

    const renderDashboard = () => {
        const path = location.pathname;

        // ─── Shared utility pages (role-agnostic) ───
        if (path.includes('profile')) {
            return <ProfilePage />;
        }
        if (path.includes('settings/password') || path.includes('change-password')) {
            return <ChangePasswordPage />;
        }
        if (path.includes('settings')) {
            return <SettingsPage />;
        }
        if (path.includes('notifications')) {
            return <NotificationsPage />;
        }
        if (path.includes('billing')) {
            return <BillingPage />;
        }
        if (path.includes('savedcards') || path.includes('payment-methods')) {
            return <div className="max-w-3xl mx-auto"><SavedCardsManager /></div>;
        }

        // ─── Prescription Marketplace ───
        if (path.includes('pharmacy') || path.includes('marketplace')) {
            return <PrescriptionMarketplace />;
        }

        // ─── Doctor Portal sub-paths ───
        if (path.startsWith('/doctor-dashboard') || path.startsWith('/doctor-earnings')) {
            return <DoctorDashboard />;
        }

        // ─── Pharmacist Portal sub-paths ───
        if (path.startsWith('/pharmacist-dashboard')) {
            return <PharmacistDashboard />;
        }

        // ─── Admin Portal sub-paths ───
        if (path.startsWith('/admin-dashboard')) {
            return <AdminDashboard />;
        }

        // ─── Patient Portal sub-paths ───
        if (path.startsWith('/dashboard') || path.startsWith('/patient-dashboard')) {
            if (activeUser.role?.toLowerCase() === 'patient') return <PatientDashboard />;
        }

        // ─── Fallback: role-based default ───
        switch (activeUser.role?.toLowerCase()) {
            case 'admin':
                return <AdminDashboard />;
            case 'patient':
                return <PatientDashboard />;
            case 'doctor':
                return <DoctorDashboard />;
            case 'pharmacist':
                return <PharmacistDashboard />;
            default:
                return <Navigate to="/dashboard" replace />;
        }
    };

    return (
        <Suspense fallback={<DashboardLoader />}>
            {renderDashboard()}
        </Suspense>
    );
};

export default DashboardRouter;
