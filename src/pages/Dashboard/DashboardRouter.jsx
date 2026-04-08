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

const DashboardLoader = () => (
    <div className="w-full h-[80vh] flex flex-col items-center justify-center">
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-blue-600 mb-4"
        />
        <motion.p 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-slate-500 font-medium tracking-wide text-sm"
        >
            Preparing Workspace...
        </motion.p>
    </div>
);


const DashboardRouter = () => {
    const { currentUser } = useAppContext();
    const location = useLocation();


    const activeUser = currentUser || JSON.parse(localStorage.getItem('user'));

    if (!activeUser) return <Navigate to="/login" replace />;

    const renderDashboard = () => {
        if (location.pathname.includes('profile')) {
            return <ProfilePage />;
        }

        if (location.pathname.includes('doctor-earnings') && activeUser.role?.toLowerCase() === 'doctor') {
            return <DoctorEarnings />;
        }

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
