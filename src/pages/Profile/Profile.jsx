// Redirect to real ProfilePage — this file exists only as a legacy import safety net.
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../../AppContext';

const Profile = () => {
    const { currentUser } = useAppContext();
    const role = (currentUser?.role || 'PATIENT').toUpperCase();
    const base = role === 'DOCTOR' ? '/doctor-dashboard' : role === 'PHARMACIST' ? '/pharmacist-dashboard' : role === 'ADMIN' ? '/admin-dashboard' : '/dashboard';
    return <Navigate to={`${base}/profile`} replace />;
};

export default Profile;
