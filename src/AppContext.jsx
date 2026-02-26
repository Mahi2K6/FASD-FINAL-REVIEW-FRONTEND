import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const initialData = {
    users: [
        { id: 'ADMIN', role: 'admin', password: '123', name: 'System Admin' },
        { id: 'DOC1', role: 'doctor', password: '123', name: 'Sarah Jenkins', specialization: 'Cardiology', experience: 12, status: 'approved', rating: 4.8, patients: 1450, availability: { status: 'online', nextSlot: '10:30 AM', load: 'Medium' } },
        { id: 'PAT1', role: 'patient', password: '123', name: 'John Doe', age: 34, bloodGroup: 'O+' },
        { id: 'PHARM1', role: 'pharmacist', password: '123', name: 'MediCare Pharmacy', status: 'approved' }
    ],
    approvals: [],
    appointments: [
        { id: 'APT1', patientId: 'PAT1', doctorId: 'DOC1', doctorName: 'Dr. Sarah Jenkins', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '10:30 AM', status: 'upcoming', type: 'Video Consult' },
        { id: 'APT2', patientId: 'PAT1', doctorId: 'DOC1', doctorName: 'Dr. Sarah Jenkins', date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], time: '11:00 AM', status: 'completed', type: 'In-Person', diagnosis: 'Mild Hypertension' }
    ],
    prescriptions: [
        { id: 'RX1', patientId: 'PAT1', doctorId: 'DOC1', date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], medicines: [{ name: 'Amlodipine 5mg', dosage: '1 tablet daily', duration: '30 days', instructions: 'After breakfast' }] }
    ],
    orders: [
        { id: 'ORD1', patientId: 'PAT1', status: 'Out for Delivery', date: new Date().toISOString(), items: [{ name: 'Amlodipine 5mg', quantity: 1, price: 15.00 }], total: 15.00, pharmacyId: 'PHARM1' }
    ],
    notifications: [
        { id: 'NOT1', userId: 'PAT1', title: 'Appointment Confirmed', message: 'Your appointment with Dr. Sarah Jenkins is confirmed for tomorrow.', time: '2 hours ago', read: false, type: 'appointment' },
        { id: 'NOT2', userId: 'PAT1', title: 'Prescription Ready', message: 'Your prescription from Dr. Sarah Jenkins is ready to view.', time: '1 day ago', read: true, type: 'prescription' },
        { id: 'NOT3', userId: 'PAT1', title: 'Order Update', message: 'Your pharmacy order ORD1 is Out for Delivery.', time: '10 mins ago', read: false, type: 'order' }
    ],
    doctorInsights: {
        totalPatientsToday: 24,
        averageTime: '15 mins',
        satisfactionRate: '98%',
        ratingTrend: [4.2, 4.4, 4.5, 4.8]
    },
    reviews: [],
    chats: []
};

export const AppProvider = ({ children }) => {
    const [data, setData] = useState(() => {
        try {
            const saved = localStorage.getItem('auraMedAppData_v4');
            return saved ? { ...initialData, ...JSON.parse(saved) } : initialData;
        } catch (e) {
            console.error('Error parsing app data', e);
            return initialData;
        }
    });

    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('auraMedAppUser_v4');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (e) {
            console.error('Error parsing current user', e);
            return null;
        }
    });

    // Global state to control Floating Search visibility gracefully (e.g. hide during checkout)
    const [isSearchGlobalVisible, setIsSearchGlobalVisible] = useState(true);

    useEffect(() => {
        localStorage.setItem('auraMedAppData_v4', JSON.stringify(data));
    }, [data]);

    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('auraMedAppUser_v4', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('auraMedAppUser_v4');
        }
    }, [currentUser]);

    const login = (idOrEmail, password) => {
        const user = data.users.find(
            u => (u.id === idOrEmail || u.email === idOrEmail) && u.password === password
        );
        if (user) {
            if (['doctor', 'pharmacist'].includes(user.role) && user.status !== 'approved') {
                return { success: false, error: 'Your account is still pending admin approval.' };
            }
            if (user.status === 'rejected') {
                return { success: false, error: 'Your account registration was declined.' };
            }
            setCurrentUser(user);
            return { success: true };
        }

        // Detailed error check
        const userExists = data.users.find(u => u.id === idOrEmail || u.email === idOrEmail);
        if (userExists) {
            return { success: false, error: 'Incorrect password. Please try again.' };
        }

        return { success: false, error: 'No account found with that email/ID.' };
    };

    const logout = () => {
        setCurrentUser(null);
    };

    const registerUser = (userData) => {
        // Prevent duplicate emails
        const emailExists = data.users.some(u => u.email === userData.email);
        if (emailExists) {
            return { success: false, error: 'An account with this email already exists.' };
        }

        const isDoctorOrPharm = Object.keys(userData).includes('specialization') || userData.role === 'pharmacist' || userData.role === 'doctor';

        const newUser = {
            ...userData,
            id: `USR${Date.now()}`,
            status: isDoctorOrPharm ? 'pending' : 'approved',
            createdAt: new Date().toISOString()
        };

        setData(prev => ({
            ...prev,
            users: [...prev.users, newUser],
            approvals: isDoctorOrPharm ? [...prev.approvals, newUser] : prev.approvals
        }));

        if (!isDoctorOrPharm) {
            setCurrentUser(newUser);
        }

        return { success: true, user: newUser };
    };

    // Generic updater
    const updateData = (key, newData) => {
        setData(prev => ({ ...prev, [key]: newData }));
    };

    return (
        <AppContext.Provider value={{ data, updateData, currentUser, login, logout, registerUser, isSearchGlobalVisible, setIsSearchGlobalVisible }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
