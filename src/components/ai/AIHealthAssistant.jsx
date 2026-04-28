import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Bot, Activity, X, Search, Calendar, Pill, HeartPulse, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HEALTH_TIPS = [
    "Stay hydrated: Drink at least 8 glasses of water a day.",
    "Walk 20 mins daily to improve cardiovascular health.",
    "Sleep 7-8 hours a night for optimal recovery.",
    "Practice mindfulness to reduce daily stress.",
    "Schedule regular checkups with your primary care doctor."
];

const AIHealthAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTipIndex, setActiveTipIndex] = useState(0);
    const [showFakeExplanation, setShowFakeExplanation] = useState(false);
    const navigate = useNavigate();
    const panelRef = useRef(null);

    // Rotate health tips
    useEffect(() => {
        if (!isOpen) return;
        const interval = setInterval(() => {
            setActiveTipIndex(prev => (prev + 1) % HEALTH_TIPS.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [isOpen]);

    // Handle outside click & ESC
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
                setShowFakeExplanation(false);
            }
        };
        const handleClickOutside = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setIsOpen(false);
                setShowFakeExplanation(false);
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            setTimeout(() => document.addEventListener('mousedown', handleClickOutside), 10);
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleAction = (action) => {
        switch(action) {
            case 'doctor':
                setIsOpen(false);
                navigate('/dashboard/find-doctors');
                break;
            case 'appointment':
                setIsOpen(false);
                navigate('/dashboard/appointments');
                break;
            case 'prescription':
                setShowFakeExplanation(true);
                break;
            case 'tips':
                setActiveTipIndex(prev => (prev + 1) % HEALTH_TIPS.length);
                break;
            case 'symptoms':
                setIsOpen(false);
                window.dispatchEvent(new CustomEvent('open-symptom-checker'));
                break;
            default:
                break;
        }
    };

    return (
        <div className="fixed bottom-7 right-7 z-[90] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={panelRef}
                        initial={{ opacity: 0, scale: 0.9, y: 20, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.9, y: 20, filter: 'blur(10px)' }}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        className="mb-6 w-[calc(100vw-40px)] sm:w-[360px] h-[520px] rounded-[28px] overflow-hidden flex flex-col shadow-[0_24px_80px_rgba(15,23,42,0.2)] border border-white/60 bg-[rgba(255,255,255,0.85)] backdrop-blur-2xl relative"
                        style={{ transformOrigin: 'bottom right' }}
                    >
                        {/* Background subtle glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#3B82F6]/15 to-[#7C5CFC]/15 rounded-full blur-[60px] pointer-events-none" />

                        {/* Header */}
                        <div className="p-6 pb-4 border-b border-slate-200/40 flex justify-between items-start relative z-10 bg-white/40">
                            <div className="flex gap-4 items-center">
                                <div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-[#3B82F6] to-[#7C5CFC] flex items-center justify-center shadow-[0_8px_20px_rgba(59,130,246,0.25)] relative overflow-hidden">
                                    <div className="absolute inset-0 bg-white/20 animate-pulse" style={{ animationDuration: '3s' }} />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/30" />
                                    <Brain className="text-white relative z-10" size={24} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-[17px] leading-tight">AI Health Assistant</h3>
                                    <p className="text-[11px] font-semibold text-slate-500 mt-1 tracking-wide uppercase">Your Smart Companion</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-500 transition-colors"
                            >
                                <X size={16} strokeWidth={2.5} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 relative z-10 hide-scrollbar">
                            
                            {/* Greeting */}
                            <div className="bg-gradient-to-br from-[#EFF6FF] to-[#F8FAFC] px-5 py-4 min-h-[96px] flex flex-col justify-center rounded-2xl border border-white shadow-[0_2px_12px_rgba(15,23,42,0.03)] relative overflow-hidden">
                                <div className="absolute -top-2 -right-2 p-4 opacity-10 text-blue-500 pointer-events-none">
                                    <Sparkles size={48} />
                                </div>
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <p className="text-slate-800 font-bold mb-1.5 flex items-center gap-2 pt-1 leading-snug">
                                        Hi there! 👋
                                    </p>
                                    <p className="text-[13px] text-slate-600 leading-[1.4] font-medium">
                                        How can I help you today? I can assist with appointments, prescriptions, or finding the right specialist.
                                        <motion.span 
                                            animate={{ opacity: [1, 0, 1] }} 
                                            transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }} 
                                            className="inline-block w-[4px] h-[14px] bg-[#3B82F6] ml-1.5 rounded-full align-middle opacity-80" 
                                        />
                                    </p>
                                </motion.div>
                            </div>

                            {/* Fake Explanation Modal Layer */}
                            <AnimatePresence>
                                {showFakeExplanation && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, backdropFilter: 'blur(0px)' }}
                                        animate={{ opacity: 1, y: 0, backdropFilter: 'blur(12px)' }}
                                        exit={{ opacity: 0, y: -10, backdropFilter: 'blur(0px)' }}
                                        className="absolute inset-0 bg-white/80 z-20 p-6 flex flex-col"
                                    >
                                        <button onClick={() => setShowFakeExplanation(false)} className="self-end p-2 text-slate-400 hover:text-slate-600 bg-white rounded-full shadow-sm">
                                            <X size={18} strokeWidth={2.5} />
                                        </button>
                                        <div className="flex-1 flex flex-col items-center justify-center text-center -mt-8">
                                            <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-[#8B5CF6]/10 to-[#A855F7]/10 text-[#8B5CF6] flex items-center justify-center mb-5 shadow-sm border border-purple-100">
                                                <Pill size={32} strokeWidth={1.5} />
                                            </div>
                                            <h4 className="text-lg font-bold text-slate-800 mb-2">Prescription Analysis</h4>
                                            <p className="text-[13px] text-slate-600 font-medium leading-relaxed mb-8 px-4">
                                                Based on your current medications, it looks like you are prescribed Amoxicillin 500mg. Take one capsule every 8 hours with food to avoid nausea.
                                            </p>
                                            <button 
                                                onClick={() => setShowFakeExplanation(false)}
                                                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#7C5CFC] text-white font-semibold text-sm shadow-[0_8px_24px_rgba(59,130,246,0.3)] hover:brightness-110 transition-all"
                                            >
                                                Understood
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Actions Grid */}
                            <div>
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-3 ml-1">Quick Actions</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <ActionCard icon={Search} label="Find Doctor" color="blue" onClick={() => handleAction('doctor')} />
                                    <ActionCard icon={Calendar} label="Book Appt" color="teal" onClick={() => handleAction('appointment')} />
                                    <ActionCard icon={Pill} label="Rx Details" color="purple" onClick={() => handleAction('prescription')} />
                                    <ActionCard icon={HeartPulse} label="Health Tips" color="rose" onClick={() => handleAction('tips')} />
                                    <div className="col-span-2">
                                        <ActionCard icon={Activity} label="Symptom Checker" color="blue" onClick={() => handleAction('symptoms')} />
                                    </div>
                                </div>
                            </div>

                            {/* Rotating Health Tip */}
                            <div className="mt-auto">
                                <div className="p-4 rounded-[20px] bg-white border border-slate-100 flex items-start gap-3 shadow-[0_2px_8px_rgba(15,23,42,0.03)] hover:shadow-[0_4px_16px_rgba(15,23,42,0.05)] transition-shadow">
                                    <div className="mt-0.5 w-6 h-6 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                                        <Sparkles size={12} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Daily Insight</p>
                                        <AnimatePresence mode="wait">
                                            <motion.p
                                                key={activeTipIndex}
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -4 }}
                                                transition={{ duration: 0.3 }}
                                                className="text-[12px] text-slate-700 font-semibold leading-snug"
                                            >
                                                {HEALTH_TIPS[activeTipIndex]}
                                            </motion.p>
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>

                            {/* Chat Preview */}
                            <div className="relative group cursor-text mt-1">
                                <div className="absolute inset-0 bg-gradient-to-r from-[#3B82F6] to-[#7C5CFC] rounded-[18px] blur-[6px] opacity-15 group-hover:opacity-30 transition-opacity duration-300" />
                                <div className="relative bg-white border border-slate-100 shadow-sm rounded-[18px] p-3.5 flex items-center gap-3">
                                    <MessageSquare size={16} className="text-[#3B82F6]" strokeWidth={2.5} />
                                    <span className="text-[13px] text-slate-400 font-medium truncate">Ask me anything...</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Orb */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className="w-[68px] h-[68px] rounded-full relative group cursor-pointer shadow-[0_16px_40px_rgba(59,130,246,0.3)] z-50 flex items-center justify-center"
                    >
                        {/* Dynamic breathing glows */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#7C5CFC] opacity-90 backdrop-blur-xl border border-white/30" />
                        <motion.div 
                            className="absolute inset-0 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#7C5CFC] blur-[24px] -z-10"
                            animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.15, 1] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/30 to-transparent pointer-events-none" />
                        
                        {/* Floating subtle animation */}
                        <motion.div
                            animate={{ y: [-2, 2, -2] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="relative z-10 flex items-center justify-center"
                        >
                            <Sparkles size={28} className="text-white drop-shadow-md group-hover:rotate-12 transition-transform duration-500" strokeWidth={1.5} />
                        </motion.div>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

const ActionCard = ({ icon: Icon, label, color, onClick }) => {
    const colorMap = {
        blue: 'from-[#3B82F6]/5 to-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20 hover:border-[#3B82F6]/40 hover:shadow-[0_4px_16px_rgba(59,130,246,0.15)]',
        teal: 'from-[#14B8A6]/5 to-[#14B8A6]/10 text-[#14B8A6] border-[#14B8A6]/20 hover:border-[#14B8A6]/40 hover:shadow-[0_4px_16px_rgba(20,184,166,0.15)]',
        purple: 'from-[#7C5CFC]/5 to-[#7C5CFC]/10 text-[#7C5CFC] border-[#7C5CFC]/20 hover:border-[#7C5CFC]/40 hover:shadow-[0_4px_16px_rgba(124,92,252,0.15)]',
        rose: 'from-[#FB7185]/5 to-[#FB7185]/10 text-[#FB7185] border-[#FB7185]/20 hover:border-[#FB7185]/40 hover:shadow-[0_4px_16px_rgba(251,113,133,0.15)]'
    };

    return (
        <motion.button
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`p-3.5 rounded-[20px] bg-gradient-to-br border flex flex-col items-center justify-center gap-2.5 transition-all duration-300 ${colorMap[color]}`}
        >
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Icon size={18} strokeWidth={2.5} />
            </div>
            <span className="text-[11px] font-bold tracking-tight">{label}</span>
        </motion.button>
    );
};

export default AIHealthAssistant;
