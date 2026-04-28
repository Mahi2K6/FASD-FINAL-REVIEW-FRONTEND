import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
// Derive a "route group" from a pathname so we only fire the branded
// overlay when the user crosses between truly different sections.
const getRouteGroup = (pathname) => {
    const segments = pathname.split('/').filter(Boolean);
    const base = segments[0] || '';
    // Group all dashboard sub-paths together
    if (['dashboard', 'patient-dashboard'].includes(base)) return 'patient';
    if (base === 'doctor-dashboard' || base === 'doctor-earnings') return 'doctor';
    if (base === 'pharmacist-dashboard') return 'pharmacist';
    if (base === 'admin-dashboard') return 'admin';
    if (base === 'profile' || base === 'settings') return 'utility';
    if (base === 'login' || base === 'register' || base === 'auth') return 'auth';
    if (base === 'checkout') return 'checkout';
    if (base === '') return 'landing';
    return base;
};

const PageLoaderTransition = () => {
    const location = useLocation();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const prevGroupRef = useRef(getRouteGroup(location.pathname));
    const timeoutRef = useRef(null);

    useEffect(() => {
        const currentGroup = getRouteGroup(location.pathname);
        const prevGroup = prevGroupRef.current;

        // Only show the branded overlay when crossing between route groups
        if (prevGroup !== currentGroup) {
            setIsTransitioning(true);

            // Clear any lingering timeout
            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            timeoutRef.current = setTimeout(() => {
                setIsTransitioning(false);
            }, 750); // total overlay duration
        }

        prevGroupRef.current = currentGroup;

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [location.pathname]);

    return (
        <AnimatePresence>
            {isTransitioning && (
                <motion.div
                    key="medconnect-transition"
                    className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                    {/* ── Backdrop ── */}
                    <motion.div
                        className="absolute inset-0"
                        initial={{ backdropFilter: 'blur(0px)' }}
                        animate={{ backdropFilter: 'blur(20px)' }}
                        exit={{ backdropFilter: 'blur(0px)' }}
                        transition={{ duration: 0.35 }}
                        style={{
                            background: 'radial-gradient(ellipse at center, rgba(239,246,255,0.97) 0%, rgba(248,250,252,0.98) 50%, rgba(255,255,255,0.99) 100%)',
                        }}
                    />

                    {/* ── Radial accent glow ── */}
                    <div
                        className="absolute w-[500px] h-[500px] rounded-full opacity-30 pointer-events-none"
                        style={{
                            background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(99,102,241,0.08) 40%, transparent 70%)',
                        }}
                    />

                    {/* ── Center content ── */}
                    <div className="relative flex flex-col items-center gap-5 z-10">
                        {/* Pulse ring */}
                        <motion.div
                            className="absolute w-24 h-24 rounded-full border-2 border-blue-400/20"
                            animate={{
                                scale: [1, 1.6, 1.6],
                                opacity: [0.5, 0, 0],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: 'easeOut',
                            }}
                        />
                        <motion.div
                            className="absolute w-24 h-24 rounded-full border border-indigo-400/15"
                            animate={{
                                scale: [1, 2, 2],
                                opacity: [0.3, 0, 0],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: 'easeOut',
                                delay: 0.3,
                            }}
                        />

                        {/* Logo */}
                        <motion.div
                            className="w-20 h-20 rounded-3xl bg-white shadow-[0_8px_40px_rgba(59,130,246,0.12),0_2px_12px_rgba(0,0,0,0.04)] border border-white/80 flex items-center justify-center p-3"
                            initial={{ scale: 0.88, opacity: 0, y: 6 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: -4 }}
                            transition={{
                                duration: 0.4,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                        >
                            <img
                                src="/medconnect.png"
                                alt="MedConnect"
                                className="w-full h-full object-contain"
                            />
                        </motion.div>

                        {/* Brand text */}
                        <motion.div
                            className="flex flex-col items-center gap-1"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: 0.1, duration: 0.35 }}
                        >
                            <span className="text-[15px] font-bold text-slate-700 tracking-tight">
                                MedConnect
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">
                                Healthcare Platform
                            </span>
                        </motion.div>

                        {/* Loading dots */}
                        <motion.div
                            className="flex gap-1.5 mt-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className="w-1.5 h-1.5 rounded-full bg-blue-400/60"
                                    animate={{
                                        scale: [0.8, 1.2, 0.8],
                                        opacity: [0.4, 1, 0.4],
                                    }}
                                    transition={{
                                        duration: 0.9,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                        delay: i * 0.15,
                                    }}
                                />
                            ))}
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PageLoaderTransition;
