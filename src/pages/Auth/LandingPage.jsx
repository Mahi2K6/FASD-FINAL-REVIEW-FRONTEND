import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import ParallaxWrapper from '../../components/ui/ParallaxWrapper';
import TopNav from '../../components/ui/TopNav';
import { Activity, Shield, Video, Users, Stethoscope, FileText, ChevronRight, Clock, Calendar } from 'lucide-react';
import API from '../../api';

// Animated Counter Component
const AnimatedCounter = ({ value }) => {
    const springValue = useSpring(0, { bounce: 0, duration: 2000 });
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        springValue.set(value);
    }, [value, springValue]);

    useEffect(() => {
        return springValue.onChange((latest) => {
            setDisplayValue(Math.floor(latest));
        });
    }, [springValue]);

    return <span>{displayValue}</span>;
};

const LandingPage = () => {
    const navigate = useNavigate();

    const [stats, setStats] = useState({ doctors: 0, patients: 0, consultations: 0 });

    useEffect(() => {
        API.get('/stats')
            .then(res => {
                const data = res.data;
                if (data && typeof data.doctors !== 'undefined') {
                    setStats(data);
                }
            })
            .catch(err => console.error(err));
    }, []);

    // For smooth parallax fading
    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    // Right Side Feature Pills
    const features = [
        { id: 1, title: "24/7 Access", icon: <Clock size={20} className="text-blue-600" />, delay: 0.2 },
        { id: 2, title: "Health Monitoring", icon: <Activity size={20} className="text-blue-600" />, delay: 0.4 },
        { id: 3, title: "Secure & Private", icon: <Shield size={20} className="text-blue-600" />, delay: 0.6 }
    ];

    return (
        <div className="min-h-screen flex flex-col relative overflow-x-hidden font-sans" 
             style={{ 
                 background: 'linear-gradient(145deg, #EBF2FA 0%, #F0F6FF 40%, #E8F0FB 70%, #EDF4FC 100%)',
                 backgroundSize: '200% 200%',
                 animation: 'gradientMove 20s ease infinite'
             }}>
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
                        className="absolute top-[-10%] left-[-10%] w-[35rem] h-[35rem] bg-[var(--color-primary)]/20 rounded-full mix-blend-multiply filter blur-[120px] pointer-events-none"
                    />
                </ParallaxWrapper>
                <ParallaxWrapper depth={1.3}>
                    <div
                        className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-[var(--color-accent)]/15 rounded-full mix-blend-multiply filter blur-[120px] pointer-events-none"
                    ></div>
                </ParallaxWrapper>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col w-full z-10">
                {/* Hero Section */}
                <section className="mt-8 pt-24 pb-16 px-6 lg:px-16 w-full max-w-7xl mx-auto flex items-center">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">

                        {/* Left Content Area */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="flex flex-col items-start text-left max-w-2xl mt-8 lg:mt-0"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] text-sm font-semibold mb-6 border border-[rgba(26,111,196,0.15)] shadow-sm"
                            >
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-primary)] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--color-primary)]"></span>
                                </span>
                                Future of Smart Healthcare
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                                className="text-5xl md:text-7xl lg:text-8xl font-black text-[var(--color-text-primary)] tracking-[-0.03em] leading-[1.05]"
                            >
                                Healthcare, <br />
                                <span className="bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary-dark)] to-[var(--color-primary)] bg-clip-text text-transparent bg-[length:200%_auto]">Connected Digitally</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.6 }}
                                className="text-lg md:text-xl text-[var(--color-text-secondary)] leading-relaxed mb-12 max-w-lg font-medium"
                            >
                                Experience the future of virtual healthcare with real-time doctor consultations, smart health monitoring, and secure digital prescriptions.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                                className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
                            >
                                <Link
                                    to="/auth"
                                    className="group relative overflow-hidden rounded-full px-8 py-4 text-base font-semibold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white shadow-[0_6px_20px_rgba(26,111,196,0.2)] hover:shadow-[0_10px_30px_rgba(26,111,196,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <span className="relative z-10 flex items-center gap-2">Get Started <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></span>
                                </Link>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="rounded-full px-8 py-4 text-base font-semibold bg-white/70 backdrop-blur-md text-[var(--color-text-primary)] border border-white/50 shadow-sm hover:bg-white hover:border-white hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center"
                                >
                                    Sign In
                                </button>
                            </motion.div>

                            {/* Trust Stats - Glass Container */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7, duration: 0.8 }}
                                className="mt-10 w-full max-w-2xl"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 glass-card !rounded-2xl !p-8 transition-all duration-500">
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)] mb-4 border border-[rgba(26,111,196,0.12)] shadow-sm">
                                            <Stethoscope size={20} />
                                        </div>
                                        <div className="text-4xl font-bold tracking-tight text-[var(--color-text-primary)] flex items-baseline mb-1">
                                            <AnimatedCounter value={stats.doctors} />+
                                        </div>
                                        <div className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-widest">Doctors</div>
                                    </div>
                                    
                                    <div className="hidden sm:block w-px h-[70%] bg-slate-300/60 mx-auto my-auto"></div>
                                    
                                    <motion.div className="flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)] mb-4 border border-[rgba(26,111,196,0.12)] shadow-sm">
                                            <Calendar size={20} className="group-hover:scale-110 transition-transform"/>
                                        </div>
                                        <div className="text-4xl font-bold tracking-tight text-[var(--color-text-primary)] flex items-baseline mb-1">
                                            <AnimatedCounter value={stats.patients} />+
                                        </div>
                                        <div className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-widest">Patients</div>
                                    </motion.div>

                                    <div className="hidden sm:block w-px h-[70%] bg-slate-300/60 mx-auto my-auto"></div>

                                    <motion.div className="flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)] mb-4 border border-[rgba(26,111,196,0.12)] shadow-sm">
                                            <Video size={20} className="group-hover:scale-110 transition-transform"/>
                                        </div>
                                        <div className="text-4xl font-bold tracking-tight text-[var(--color-text-primary)] flex items-baseline mb-1">
                                            <AnimatedCounter value={stats.consultations || 0} />+
                                        </div>
                                        <div className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-widest">Visits</div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Right Visual Area */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="relative h-[500px] w-full hidden lg:flex items-center justify-center perspective-1000"
                        >
                            <div className="relative w-full h-full max-w-md">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-300/20 rounded-[40px] blur-xl transform group-hover:scale-105 transition-transform duration-700"></div>
                                <motion.div
                                    animate={{ y: [-15, 15, -15], rotateZ: [-1, 1, -1] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-blue-100/80 rounded-[40px] border border-white/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] max-sm:backdrop-blur-xl sm:backdrop-blur-3xl overflow-hidden"
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
                                        className={`absolute ${idx === 0 ? 'top-[20%] -left-12' : idx === 1 ? 'top-[45%] -right-16' : 'bottom-[25%] -left-8'} z-10`}
                                    >
                                        <motion.div
                                            animate={{ y: [0, -10, 0] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: feature.delay }}
                                            className="flex items-center gap-4 bg-white/70 backdrop-blur-2xl px-6 py-4 rounded-full shadow-xl border border-white/60 hover:scale-105 transition-transform cursor-default"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-white/80 border border-white flex items-center justify-center shadow-sm">
                                                {feature.icon}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 tracking-tight text-sm">{feature.title}</div>
                                                <div className="text-[10px] font-semibold text-slate-500 mt-0.5 uppercase tracking-wider">Verified Feature</div>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="min-h-[80vh] flex flex-col items-center justify-center px-6 lg:px-24 w-full max-w-7xl mx-auto py-32 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-3xl mb-24"
                    >
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.03em] text-[var(--color-text-primary)] mb-8 font-sans">Powering Modern Care</h2>
                        <p className="text-xl text-[var(--color-text-secondary)] leading-relaxed font-medium">
                            Everything you need to manage your health digitally, engineered into an elegant and fast platform.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 w-full">
                        {[
                            {
                                icon: <Video size={28} className="text-[var(--color-primary)]" />,
                                title: "Virtual Consultations",
                                desc: "High-definition, secure video calls with top medical experts from the comfort of your home.",
                                bg: "bg-blue-50/50"
                            },
                            {
                                icon: <Shield size={28} className="text-[var(--color-primary)]" />,
                                title: "Bank-Grade Security",
                                desc: "Your health data is encrypted and securely stored in compliance with major healthcare standards.",
                                bg: "bg-blue-50/50"
                            },
                            {
                                icon: <Activity size={28} className="text-[var(--color-primary)]" />,
                                title: "Health Analytics",
                                desc: "Track your vitals over time and identify health trends before they become issues.",
                                bg: "bg-blue-50/50"
                            }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.6, delay: idx * 0.2 }}
                                className={`flex flex-col items-start p-8 rounded-2xl glass-card hover:glass-card-hover hover:-translate-y-1 transition-all duration-300 w-full`}
                            >
                                <div className={`w-14 h-14 rounded-xl bg-[var(--color-primary-light)] flex items-center justify-center mb-6 shadow-inner border border-[rgba(26,111,196,0.08)]`}>
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">{item.title}</h3>
                                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed font-medium">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default LandingPage;
