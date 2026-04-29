import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from './hooks/useSocket';
import { useToast } from './components/ui/ToastNotification';

import API from './api';
import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : ''; 
const AppContext = createContext();

const initialData = {
    users: [],
    approvals: [],
    appointments: [],
    prescriptions: [],
    orders: [],
    notifications: [],
    reviews: []
};

// authFetch removed in favor of axios API instance

export const AppProvider = ({ children }) => {
    const [data, setData] = useState(initialData);
    const { connect, disconnect, on } = useSocket();
    const toast = useToast();
    
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch {
            console.error('Failed to parse stored user, clearing localStorage');
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            return null;
        }
    });
    const [loadingDb, setLoadingDb] = useState(true);

    const [isSearchGlobalVisible, setIsSearchGlobalVisible] = useState(true);
    const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);

    const fetchData = useCallback(async () => {
        // Don't fetch if user isn't logged in
        if (!localStorage.getItem('token')) {
            setLoadingDb(false);
            return;
        }

        try {
            setLoadingDb(true);
            const isAdmin = currentUser?.role?.toUpperCase() === 'ADMIN';

            // Always fetch doctors from /users/doctors so patients can see them
            // For admin, also fetch all users from /users
            const [doctorsRes, allUsersRes, appointmentsRes, prescriptionsRes, ordersRes, notificationsRes] = await Promise.all([
                API.get('/users/doctors').then(res => res.data).catch(() => []),
                isAdmin ? API.get('/users').then(res => res.data).catch(() => []) : Promise.resolve(null),
                API.get('/appointments').then(res => res.data).catch(() => []),
                API.get('/prescriptions').then(res => res.data).catch(() => []),
                API.get('/orders').then(res => res.data).catch(() => []),
                API.get('/notifications').then(res => res.data).catch(() => [])
            ]);

            // Normalize doctors — ensure they all have role and status fields
            const normalizedDoctors = (doctorsRes || []).map(d => ({
                ...d,
                role: d.role || 'DOCTOR',
                status: d.status || 'ACTIVE'
            }));

            // For admin: use the full user list; for others: use doctors list
            const dbUsers = isAdmin ? (allUsersRes || []) : normalizedDoctors;
            const userMap = {};
            // Build map from both sources for name lookups
            normalizedDoctors.forEach(u => { userMap[u.id] = u; });
            dbUsers.forEach(u => { userMap[u.id] = u; });

            const mappedAppointments = (appointmentsRes || []).map(a => ({
                id: a.id,
                patientId: a.patient_id,
                patientName: userMap[a.patient_id]?.name || 'Unknown',
                doctorId: a.doctor_id,
                doctorName: userMap[a.doctor_id]?.name || 'Unknown',
                specialization: userMap[a.doctor_id]?.specialization || 'General',
                date: a.appointment_date,
                timeSlot: a.appointment_time,
                problem: a.notes,
                status: a.status
            }));

            const mappedPrescriptions = (prescriptionsRes || []).map(p => ({
                id: p.id,
                patientId: p.patient_id,
                patientName: userMap[p.patient_id]?.name || 'Unknown',
                doctorId: p.doctor_id,
                doctorName: userMap[p.doctor_id]?.name || 'Unknown',
                status: p.status || (p.notes === 'status:ready' ? 'ready' : 'pending'),
                date: p.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                medicines: [
                    { name: p.medication_name, dosage: p.dosage, quantity: p.frequency }
                ]
            }));

            const mappedOrders = (ordersRes || []).map(o => ({
                id: o.id,
                patientId: o.patient_id,
                prescriptionId: o.prescription_id,
                status: o.status,
                total: o.total_amount,
                date: o.created_at?.split('T')[0]
            }));

            const mappedNotifications = (notificationsRes || []).map(n => ({
                id: n.id,
                userId: n.user_id,
                title: n.title || n.type,
                message: n.message,
                read: n.is_read,
                time: n.created_at
            }));

            setData({
                users: dbUsers,
                approvals: dbUsers.filter(u => u.status?.toUpperCase() === 'PENDING'),
                appointments: mappedAppointments,
                prescriptions: mappedPrescriptions,
                orders: mappedOrders,
                notifications: mappedNotifications,
                reviews: []
            });
        } catch (error) {
            console.error('Error fetching backend data:', error);
        } finally {
            setLoadingDb(false);
        }
    }, []);

    useEffect(() => {
        if (currentUser?.id) {
            fetchData();
            connect(currentUser.id);
        } else {
            setLoadingDb(false);
            // disconnect();
        }
    }, [currentUser?.id, connect, fetchData]);

    // Real-time Listeners
    useEffect(() => {
        if (!currentUser?.id) return;
        
        // Listen for new prescriptions or specific user notifications on the STOMP topic
        const offUserTopic = on(`/topic/user-${currentUser.id}`, (data) => {
            // Check if it's a notification, prescription, or appointment update
            if (data.type === 'notification') {
                toast.info(data.title || 'New Notification', data.message);
            } else if (data.status) {
                toast.success('Update Received', `Status is now ${data.status}`);
            }
            fetchData();
        });

        return () => {
            offUserTopic();
        };
    }, [currentUser?.id, on, toast, fetchData]);

    // Polling for pending users
    useEffect(() => {
        let interval;
        if (currentUser && currentUser.status === 'pending') {
            interval = setInterval(async () => {
                try {
                    const res = await API.get(`/users/${currentUser.id}`);
                    const updatedUser = res.data;
                    if (updatedUser && updatedUser.status !== 'pending') {
                        setCurrentUser(updatedUser);
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                        toast.success('Account Approved', 'Your MedConnect account is now active!');
                    }
                } catch (error) {
                    console.error("Error polling user status:", error);
                }
            }, 5000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [currentUser, toast]);

    const login = async (email, password) => {
        try {
            const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';
            const response = await axios.post(`${baseURL}/auth/login`, {
                email,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            const { accessToken, token: rawToken, user } = response.data || {};
            const token = accessToken || rawToken;

            if (!token || !user) {
                return { success: false, error: 'Invalid response from server. Missing token or user data.' };
            }

            // Store token FIRST so subsequent API calls can use it
            localStorage.setItem('token', token);

            // Check account status before granting access
            const status = user.status?.toUpperCase();
            if (status === 'REJECTED') {
                localStorage.removeItem('token');
                return { success: false, error: 'Your account registration was declined.' };
            }
            if (status === 'PENDING') {
                localStorage.removeItem('token');
                return { success: false, error: 'Your account is pending admin approval.' };
            }

            // Persist user in localStorage and update React context
            localStorage.setItem('user', JSON.stringify(user));
            setCurrentUser(user);

            toast.success('Welcome Back', `Logged in as ${user.name}`);
            return { success: true, user };
        } catch (error) {
            console.error("Login Error Details:", error);
            
            // 1. Check for Network Errors (Backend Offline / CORS)
            if (!error.response) {
                 return { success: false, error: 'Network Error: Cannot connect to backend server. Is it running?' };
            }

            // 2. Extract error message robustly
            let errMsg = 'Login failed.';
            const resData = error.response.data;

            if (typeof resData === 'string') {
                errMsg = resData;
            } else if (resData?.message) {
                errMsg = resData.message;
            } else if (resData?.error) {
                errMsg = resData.error;
            }

            // 3. Catch specific backend crash traces (e.g. JWT secret byte error)
            if (error.response.status >= 500) {
                 if (errMsg.toLowerCase().includes('jwt') || errMsg.toLowerCase().includes('bytes')) {
                      errMsg = `Backend JWT Configuration Error: ${errMsg}`;
                 } else {
                      errMsg = `Server Error (${error.response.status}): ${errMsg}`;
                 }
            }

            return { success: false, error: errMsg };
        }
    };

    const socialLogin = async (providerData) => {
        try {
            const response = await API.post('/auth/google', providerData);
            const data = response.data;
            const user = data.user || data;

            if (user.status === 'rejected') {
                return { success: false, error: 'Your account registration was declined.' };
            }

            setCurrentUser(user);
            localStorage.setItem('user', JSON.stringify(user));
            if (data.token) localStorage.setItem('token', data.token);

            // connect(user.id);
            toast.success('Welcome', `Logged in via Google as ${user.name}`);
            return { success: true, user: user, token: data.token };
        } catch (error) {
            console.error("Social Login Error:", error);
            const errMsg = error.response?.data?.error || 'Network error during social login.';
            return { success: false, error: errMsg };
        }
    };

    // FIXED: now removes token from localStorage
    const logout = () => {
        setCurrentUser(null);
        setData(initialData);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        // disconnect();
    };

    const registerUser = async (userData) => {
        try {

            // Build multipart/form-data payload for Spring Boot backend
            const fd = new FormData();
            fd.append('name', userData.name);
            fd.append('email', userData.email);
            fd.append('password', userData.password);
            fd.append('role', userData.role.toUpperCase()); // PATIENT, DOCTOR, PHARMACIST
            fd.append('phone', userData.phone);
            if (userData.specialization) fd.append('specialization', userData.specialization);
            if (userData.experience) fd.append('experience', String(userData.experience));
            if (userData.pharmacyInfo) fd.append('pharmacyInfo', userData.pharmacyInfo);
            if (userData.emergencyContact) fd.append('emergencyContact', userData.emergencyContact);
            if (userData.idCard) fd.append('idCard', userData.idCard); // File object

            const response = await API.post('/auth/register', fd);
            toast.success('Registration Sent', 'Your application is pending administrative review.');
            return { success: true };
        } catch (err) {
            console.error("Registration error:", err);
            const errMsg = err.response?.data?.message || err.response?.data?.error || 'Registration failed via network.';
            return { success: false, error: errMsg };
        }
    };

    const updateData = async (key, newData) => {
        if (!Array.isArray(newData)) return;
        setData(prev => ({ ...prev, [key]: newData }));
    };

    return (
        <AppContext.Provider value={{ 
            data, setData, updateData, 
            currentUser, setCurrentUser, 
            login, logout, registerUser, socialLogin,
            isSearchGlobalVisible, setIsSearchGlobalVisible, 
            isAIPanelOpen, setIsAIPanelOpen,
            loadingDb, fetchData 
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
