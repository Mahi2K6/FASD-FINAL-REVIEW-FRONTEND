import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ParallaxWrapper } from '../../components/ui/ParallaxWrapper';
import { TopNav } from '../../components/ui/TopNav';

export const LandingPage = () => {
    const navigate = useNavigate();

    // For smooth parallax fading
    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    // Right Side Feature Pills
    const features = [
        { id: 1, title: "Live Consultation", icon: "video", delay: 0.2 },
        { id: 2, title: "Health Monitoring", icon: "activity", delay: 0.4 },
        { id: 3, title: "Secure & Private", icon: "shield", delay: 0.6 }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-x-hidden">
            <TopNav />

            {/* Background Glow Blobs with Parallax */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <ParallaxWrapper depth={1}>
                    <motion.div
                        style={{ opacity }}
                        animate={{
                            y: [0, -30, 0, 30, 0],
                            x: [0, 30, 0, -30, 0],
                            rotate: [0, 90, 180, 270, 360]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute top-[-10%] left-[-10%] w-[35rem] h-[35rem] bg-blue-300 rounded-full mix-blend-multiply filter blur-[120px] pointer-events-none"
                    />
                </ParallaxWrapper>
                <ParallaxWrapper depth={1.2}>
                    <motion.div
                        style={{ opacity }}
                        animate={{
                            y: [0, 30, 0, -30, 0],
                            x: [0, -30, 0, 30, 0],
                            rotate: [360, 270, 180, 90, 0]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-300 rounded-full mix-blend-multiply filter blur-[120px] pointer-events-none"
                    />
                </ParallaxWrapper>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col w-full z-10">
                {/* Hero Section */}
                <section className="min-h-screen flex items-center pt-24 pb-16 px-6 lg:px-12 w-full max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center w-full">

                        {/* Left Content Area */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="flex flex-col items-start text-left max-w-2xl"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-6 border border-blue-100 shadow-sm"
                            >
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                                </span>
                                Future of Smart Healthcare
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                                className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-slate-900 leading-[1.1]"
                            >
                                Your Health,<br />
                                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent bg-[length:200%_auto]">Connected Digitally</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.6 }}
                                className="text-lg md:text-xl text-slate-600 leading-relaxed mb-10 max-w-lg"
                            >
                                Experience the future of virtual healthcare. Premium consultations, instant prescriptions, and seamless pharmacy delivery all in one unified platform.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                                className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
                            >
                                <button
                                    onClick={() => navigate('/register')}
                                    className="group relative overflow-hidden rounded-full px-8 py-4 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_12px_25px_rgba(37,99,235,0.4)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    Get Started Free
                                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="rounded-full px-8 py-4 text-base font-semibold bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    Sign In
                                </button>
                            </motion.div>

                            {/* Trust Stats */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7, duration: 0.8 }}
                                className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-slate-200/60 w-full"
                            >
                                <div>
                                    <div className="text-3xl font-bold tracking-tight text-slate-900 mb-1">500+</div>
                                    <div className="text-sm font-medium text-slate-500">Expert Doctors</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold tracking-tight text-slate-900 mb-1">10K+</div>
                                    <div className="text-sm font-medium text-slate-500">Active Patients</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold tracking-tight text-slate-900 mb-1">98%</div>
                                    <div className="text-sm font-medium text-slate-500">Satisfaction</div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Right Visual Area */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="relative h-[600px] w-full items-center justify-center hidden lg:flex perspective-1000"
                        >
                            <div className="relative w-full h-full max-w-md">
                                <motion.div
                                    animate={{ y: [-15, 15, -15], rotateZ: [-1, 1, -1] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-[40px] border border-white/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] backdrop-blur-3xl overflow-hidden"
                                >
                                    {/* Medical cross decor */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/40 rounded-full blur-3xl mix-blend-overlay" />

                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-blue-100/30 to-transparent" />
                                </motion.div>

                                {/* Floating Feature Pills */}
                                {features.map((feature, idx) => (
                                    <motion.div
                                        key={feature.id}
                                        initial={{ opacity: 0, x: 50, y: 20 }}
                                        animate={{ opacity: 1, x: 0, y: 0 }}
                                        transition={{ delay: 0.8 + feature.delay, duration: 0.6 }}
                                        className={`absolute ${idx === 0 ? 'top-[20%] -left-8' : idx === 1 ? 'top-[45%] -right-12' : 'bottom-[25%] -left-4'} z-10`}
                                    >
                                        <motion.div
                                            animate={{ y: [-8, 8, -8] }}
                                            transition={{ duration: 4 + idx, repeat: Infinity, ease: "easeInOut", delay: feature.delay }}
                                            className="flex items-center gap-4 bg-white/90 backdrop-blur-xl px-6 py-4 rounded-3xl shadow-[0_10px_30px_rgba(37,99,235,0.12)] border border-white/80 transition-shadow hover:shadow-[0_15px_40px_rgba(37,99,235,0.2)]"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
                                                {feature.icon === 'video' && <svg className="w-5 h-5 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
                                                {feature.icon === 'activity' && <svg className="w-5 h-5 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                                                {feature.icon === 'shield' && <svg className="w-5 h-5 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-800 tracking-tight">{feature.title}</div>
                                                <div className="text-xs font-medium text-slate-500 mt-0.5">Verified Feature</div>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Information Section for SCROLL testing */}
                <section className="min-h-[60vh] flex flex-col items-center justify-center px-6 lg:px-12 w-full max-w-7xl mx-auto py-20 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-3xl border border-slate-200/60 bg-white/50 backdrop-blur-sm rounded-[40px] p-12 shadow-sm"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">Transforming Care Delivery</h2>
                        <p className="text-lg text-slate-600 leading-relaxed mb-8">
                            MedConnect brings the clinic to your home. Join thousands of patients who have already switched to our modern, reliable, and secure health platform.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 text-left">
                            <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Instant Access</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">Connect with healthcare professionals in minutes, not days. Schedule at your convenience.</p>
                            </div>
                            <div className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Secure Records</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">Your medical history is encrypted and safely stored. Access your prescriptions anywhere.</p>
                            </div>
                        </div>
                    </motion.div>
                </section>
            </main>
        </div>
    );
};
