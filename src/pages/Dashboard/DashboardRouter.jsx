import React, { useState } from 'react';
import { useAppContext } from '../../AppContext';
import { AdminDashboard } from './AdminDashboard';
import { PatientDashboard } from './PatientDashboard';
import { DoctorDashboard } from './DoctorDashboard';
import { PharmacistDashboard } from './PharmacistDashboard';
import { Navigate, useLocation } from 'react-router-dom';
import { FloatingSearch } from '../../components/ui/FloatingSearch';
import { AnimatePresence } from 'framer-motion';

export const DashboardRouter = () => {
    const { currentUser, isSearchGlobalVisible } = useAppContext();
    const [globalSearchVal, setGlobalSearchVal] = useState('');
    const location = useLocation();

    // Additional route failsafe (though DashboardRouter only mounts at /dashboard/*)
    const isRestrictedRoute = ['/payment', '/checkout', '/confirm', '/success', '/login', '/signup', '/pending'].some(path => location.pathname.includes(path));
    const shouldShowSearch = isSearchGlobalVisible && !isRestrictedRoute;

    if (!currentUser) return <Navigate to="/login" replace />;

    const renderDashboard = () => {
        switch (currentUser.role) {
            case 'admin':
                return <AdminDashboard />;
            case 'patient':
                return <PatientDashboard />;
            case 'doctor':
                return <DoctorDashboard />;
            case 'pharmacist':
                return <PharmacistDashboard />;
            default:
                return <Navigate to="/login" replace />;
        }
    };

    return (
        <>
            {renderDashboard()}
            <AnimatePresence>
                {shouldShowSearch && (
                    <FloatingSearch
                        value={globalSearchVal}
                        onChange={(e) => setGlobalSearchVal(e.target.value)}
                    />
                )}
            </AnimatePresence>
        </>
    );
};
