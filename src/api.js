import axios from 'axios';

// Ensure the base URL correctly handles the environment variable
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

const API = axios.create({
    baseURL: baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Automatically attach Authorization token
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Remove Content-Type if sending FormData (e.g. file uploads)
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Better error handling and undefined status prevention
API.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || '';
        const status = error.response?.status;
        const resData = error.response?.data;

        console.error(`API Error [${status || 'NETWORK_ERROR'}] on URL: ${url}`);
        
        if (resData) {
            console.error("API Error Payload:", typeof resData === 'string' ? resData : JSON.stringify(resData));
        }

        // Only wipe session on 401 from non-auth endpoints
        if (status === 401 && !url.includes('/auth/')) {
            console.warn('Clearing session due to 401 on:', url);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);

export default API;
