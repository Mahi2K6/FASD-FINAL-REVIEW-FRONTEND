import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../../AppContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastNotification';

const SocialAuthOptions = ({ role }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { socialLogin } = useAppContext();
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => {
        if (isOpen && role === 'patient' && window.google) {
            window.google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'mock-client.apps.googleusercontent.com',
                callback: handleCredentialResponse
            });
            window.google.accounts.id.renderButton(
                document.getElementById('google_hidden_btn'),
                { theme: 'outline', size: 'large' }
            );
        }
    }, [isOpen, role]);

    const handleCredentialResponse = async (response) => {
        if (!response.credential) return;
        
        setIsLoading(true);
        try {
            const result = await socialLogin({
                token: response.credential,
                role: 'patient'
            });
            
            if (result.success) {
                navigate('/patient-dashboard');
            } else {
                toast.error('Google Auth Error', result.error);
            }
        } catch (error) {
            toast.error('Network Error', 'Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (role !== 'patient') {
            setIsOpen(false);
        }
    }, [role]);

    if (role !== 'patient') return null;

    const handleGoogleLogin = () => {
        const btn = document.querySelector('#google_hidden_btn div[role=button]');
        if (btn) btn.click();
        else window.google?.accounts?.id?.prompt();
    };

    const handleAppleLogin = () => console.log("Apple login clicked");
    const handleFacebookLogin = () => console.log("Facebook login clicked");

    return (
        <div className="mt-4 w-full flex flex-col items-center">
            <div className="relative flex py-4 items-center w-full">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="shrink-0 px-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">Or</span>
                <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-3.5 px-4 bg-white/70 backdrop-blur-sm border border-slate-200 text-slate-600 rounded-full text-sm font-semibold shadow-sm hover:shadow-md hover:bg-white hover:text-slate-900 transition-all duration-200"
            >
                {isOpen ? 'Hide Social Accounts' : 'Continue with Social Accounts'}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, translateY: 10 }}
                        animate={{ opacity: 1, height: 'auto', translateY: 0 }}
                        exit={{ opacity: 0, height: 0, translateY: -10 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="w-full overflow-hidden flex flex-col gap-3 mt-4"
                    >
                        {/* Hidden Target for Google API */}
                        <div id="google_hidden_btn" className="hidden"></div>
                        
                        {/* Google Button */}
                        <motion.button
                            type="button"
                            disabled={isLoading}
                            whileHover={isLoading ? {} : { scale: 1.02, filter: 'brightness(1.02)' }}
                            whileTap={isLoading ? {} : { scale: 0.96 }}
                            onClick={handleGoogleLogin}
                            className={`w-full h-[48px] sm:h-[52px] flex items-center justify-center gap-3 bg-white border border-slate-200 rounded-full shadow-sm transition-all text-slate-700 font-semibold ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md'}`}
                        >
                            {isLoading ? (
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                            )}
                            {isLoading ? 'Connecting...' : 'Continue with Google'}
                        </motion.button>

                        <motion.button
                            type="button"
                            disabled={isLoading}
                            whileHover={isLoading ? {} : { scale: 1.02, filter: 'brightness(1.15)' }}
                            whileTap={isLoading ? {} : { scale: 0.96 }}
                            onClick={handleAppleLogin}
                            className={`w-full h-[48px] sm:h-[52px] flex items-center justify-center gap-3 bg-slate-900 text-white rounded-full shadow-sm transition-all font-semibold ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md'}`}
                        >
                            <svg className="w-5 h-5 fill-white" viewBox="0 0 384 512">
                                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                            </svg>
                            Continue with Apple
                        </motion.button>

                        <motion.button
                            type="button"
                            disabled={isLoading}
                            whileHover={isLoading ? {} : { scale: 1.02, filter: 'brightness(1.1)' }}
                            whileTap={isLoading ? {} : { scale: 0.96 }}
                            onClick={handleFacebookLogin}
                            className={`w-full h-[48px] sm:h-[52px] flex items-center justify-center gap-3 bg-[#1877F2] text-white rounded-full shadow-sm transition-all font-semibold ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md'}`}
                        >
                            <svg className="w-[22px] h-[22px] fill-white" viewBox="0 0 24 24">
                               <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            Continue with Facebook
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SocialAuthOptions;
