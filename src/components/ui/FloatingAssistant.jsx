import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMagneticHover } from '../../hooks/useMagneticHover';
import { MessageCircle, X, Send } from 'lucide-react';

export const FloatingAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { ref: magneticRef, styles, handlers, isHovered } = useMagneticHover({ magneticStrength: 0.15, tiltStrength: 0 });
    const [msg, setMsg] = useState('');
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi there! I'm your AI health assistant. How can I help you today?", isUser: false, time: "10:00 AM" }
    ]);

    const handleSend = () => {
        if (!msg.trim()) return;

        const newMsg = {
            id: Date.now(),
            text: msg,
            isUser: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages([...messages, newMsg]);
        setMsg('');

        // Mock AI response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "Thanks for your message. I'm processing your request.",
                isUser: false,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }, 1000);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-auto">
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        ref={magneticRef}
                        style={{
                            x: styles.x,
                            y: styles.y,
                            '--mouse-x': styles['--mouse-x'],
                            '--mouse-y': styles['--mouse-y']
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 220, damping: 18, mass: 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onMouseMove={handlers.onMouseMove}
                        onMouseEnter={handlers.onMouseEnter}
                        onMouseLeave={handlers.onMouseLeave}
                        onClick={() => setIsOpen(true)}
                        className={`w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full text-white shadow-[0_4px_20px_rgba(79,70,229,0.4)] flex items-center justify-center group transition-shadow relative ${isHovered ? 'liquid-glass-panel liquid-glow-intense shadow-[0_8px_30px_rgba(79,70,229,0.6)]' : ''}`}
                    >
                        {/* Breathing glow */}
                        <div className={`absolute inset-0 rounded-full bg-blue-500 opacity-20 transition-opacity ${isHovered ? 'opacity-40 animate-none' : 'animate-pulse'}`}></div>
                        <MessageCircle size={28} className="group-hover:rotate-12 transition-transform relative z-10" />
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="bg-white/90 backdrop-blur-2xl border border-white shadow-[0_20px_60px_rgba(0,0,0,0.15)] rounded-[32px] w-[350px] sm:w-[380px] h-[500px] max-h-[85vh] flex flex-col overflow-hidden relative origin-bottom-right"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center shadow-md relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm relative border border-white/30">
                                    <span className="text-lg">🤖</span>
                                    {/* Online indicator */}
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-indigo-600 rounded-full"></div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm tracking-tight text-white/95">MediConnect AI</h4>
                                    <p className="text-xs text-blue-100 font-medium">Always here to help</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 relative">
                            {/* Background subtle decoration */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #3b82f6 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>

                            {messages.map(msg => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm shadow-sm relative ${msg.isUser
                                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm'
                                        : 'bg-white border border-slate-100 text-slate-700 rounded-bl-sm'
                                        }`}>
                                        <p className="leading-relaxed font-medium">{msg.text}</p>
                                        <span className={`text-[9px] font-bold block mt-1.5 uppercase tracking-wider ${msg.isUser ? 'text-blue-100/80 text-right' : 'text-slate-400'
                                            }`}>
                                            {msg.time}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-slate-100 relative z-10">
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 rounded-full p-1 pl-4 transition-all">
                                <input
                                    type="text"
                                    placeholder="Message MediConnect AI..."
                                    className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder-slate-400"
                                    value={msg}
                                    onChange={(e) => setMsg(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSend}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${msg.trim()
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-slate-200 text-slate-400'
                                        }`}
                                    disabled={!msg.trim()}
                                >
                                    <Send size={15} className={msg.trim() ? "ml-0.5" : ""} />
                                </motion.button>
                            </div>
                            <div className="text-center mt-2">
                                <span className="text-[10px] text-slate-400 font-medium">AI can make mistakes. Verify important info.</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
