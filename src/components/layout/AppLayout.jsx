import React, { useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import Sidebar from './Sidebar';
import DashboardHeader from '../ui/DashboardHeader';
import AISymptomChecker from '../ui/AISymptomChecker';
import AIHealthAssistant from '../ai/AIHealthAssistant';

import { useAppContext } from '../../AppContext';

/* ─── Must match Sidebar constants ─── */
const SIDEBAR_INSET = 18;
const SIDEBAR_WIDTH = 240;

const pageVariants = {
    initial: { opacity: 0, y: 14, filter: 'blur(6px)' },
    animate: { 
        opacity: 1, y: 0, filter: 'blur(0px)',
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
    },
    exit: { 
        opacity: 0, y: -6, filter: 'blur(3px)',
        transition: { duration: 0.2 }
    }
};

const AppLayout = ({ children, activeTab, setActiveTab }) => {
    const { currentUser } = useAppContext();
    const role = (currentUser?.role || 'PATIENT').toUpperCase();

    // Ambient background mouse tracking for subtle depth
    const mouseX = useMotionValue(50);
    const mouseY = useMotionValue(50);
    const springX = useSpring(mouseX, { stiffness: 30, damping: 60 });
    const springY = useSpring(mouseY, { stiffness: 30, damping: 60 });

    useEffect(() => {
        const handleMove = (e) => {
            mouseX.set((e.clientX / window.innerWidth) * 100);
            mouseY.set((e.clientY / window.innerHeight) * 100);
        };
        window.addEventListener('mousemove', handleMove, { passive: true });
        return () => window.removeEventListener('mousemove', handleMove);
    }, []);

    /* Content left offset = sidebar inset + sidebar width + gap */
    const contentLeft = SIDEBAR_INSET + SIDEBAR_WIDTH + SIDEBAR_INSET;

    return (
        /* ═══ Root Shell — locked to viewport, no document scroll ═══ */
        <div 
            className="relative bg-[var(--bg-base)]"
            style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}
        >
            {/* Ambient background — ultra-subtle cursor-reactive glow */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <motion.div
                    className="absolute w-[900px] h-[900px] rounded-full opacity-[0.025] blur-[200px]"
                    style={{
                        background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)',
                        left: springX,
                        top: springY,
                        translateX: '-50%',
                        translateY: '-50%'
                    }}
                />
                <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-[#3B82F6]/[0.015] to-transparent blur-[160px]" />
                <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#7C5CFC]/[0.012] to-transparent blur-[140px]" />
                <div className="absolute -top-20 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-bl from-[#14B8A6]/[0.01] to-transparent blur-[120px]" />
                {/* Subtle dot grid pattern */}
                <div className="absolute inset-0 opacity-[0.018]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, var(--brand-primary) 0.4px, transparent 0)', backgroundSize: '32px 32px' }} />
            </div>

            {/* Sidebar — Floating Fixed Panel (z-40) */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* ═══ Content Column — fills remaining viewport, scrolls independently ═══ */}
            <style>{`
                .dashboard-content-column {
                    left: 0;
                }
                @media (min-width: 768px) {
                    .dashboard-content-column {
                        left: ${contentLeft}px;
                    }
                }
            `}</style>
            <div
                className="dashboard-content-column absolute top-0 right-0 bottom-0 z-10 flex flex-col"
            >
                {/* Utility Bar — sticky inside scroll container */}
                <DashboardHeader
                    title={role.charAt(0) + role.slice(1).toLowerCase() + " Portal"}
                    activeTab={activeTab}
                />

                {/* Scrollable Main Content */}
                <main 
                    className="flex-1 overflow-y-auto px-4 py-5 md:px-8 md:py-6 lg:px-10 lg:py-7"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    <div className="max-w-[1360px] w-full mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                variants={pageVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>

            {/* ═══ Floating Assistant Layer — globally mounted, outside scroll ═══ */}
            <AISymptomChecker />
            <AIHealthAssistant />
        </div>
    );
};

export default AppLayout;
