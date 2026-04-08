import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_TIPS = [
    "Stay hydrated throughout the day",
    "Take short breaks from screen time",
    "Maintain proper posture while working",
    "Aim for at least 7-8 hours of sleep"
];

export const AIThinkingState = ({ text = "Analyzing wellness data..." }) => {
    // Override the generic thinking state into the highly requested AI Wellness Insights
    const [currentTip, setCurrentTip] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTip(prev => (prev + 1) % DEFAULT_TIPS.length);
        }, 7000); // Rotate every 7 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            whileHover={{ y: -3 }}
            className="relative h-full rounded-3xl widget-aura transition-transform duration-300"
        >
            <div className="flex flex-col h-full p-6 liquid-glass !rounded-3xl overflow-hidden group cursor-default">
                {/* Slow Rotating Ambient Glow */}
                <motion.div
                    className="absolute -inset-[100%] z-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                >
                    <div className="absolute top-1/4 left-1/4 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-300/10 via-blue-300/5 to-transparent blur-3xl rounded-full" />
                    <div className="absolute bottom-1/4 right-1/4 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-300/10 via-blue-300/5 to-transparent blur-3xl rounded-full" />
                </motion.div>

                {/* Header: AI Wellness Insights */}
                <div className="flex items-center gap-2 mb-6 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-50 to-blue-50 border border-blue-100 flex items-center justify-center shadow-inner relative">
                        <span className="text-[10px] font-bold tracking-wider text-blue-600">AI</span>
                        {/* Pulsing indicator */}
                        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500 border border-white"></span>
                        </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-700 tracking-tight">AI Wellness Insights</h3>
                </div>

                {/* Rotating Tips Content */}
                <div className="flex-1 flex items-center relative z-10">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={currentTip}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                            className="text-[15px] font-medium text-slate-600 leading-relaxed group-hover:text-slate-800 transition-colors"
                        >
                            "{DEFAULT_TIPS[currentTip]}"
                        </motion.p>
                    </AnimatePresence>
                </div>

                {/* Subtle Progress Bar / Decoration */}
                <div className="mt-auto pt-6 flex gap-1 relative z-10">
                    {DEFAULT_TIPS.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1 rounded-full transition-all duration-500 ${idx === currentTip ? 'w-4 bg-blue-500' : 'w-1 bg-slate-200'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    );
};
