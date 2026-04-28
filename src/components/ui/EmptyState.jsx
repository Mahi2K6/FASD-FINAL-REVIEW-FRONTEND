import React from 'react';
import { motion } from 'framer-motion';

/* ═══════════════════════════════════════════════════
 *  MedConnect — Premium Empty State
 *  Animated icon, gradient messaging, CTA support
 * ═══════════════════════════════════════════════════ */

const EmptyState = ({ icon: Icon, title, description, action }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center justify-center py-20 text-center relative"
        >
            {/* Ambient background glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-400/5 to-indigo-500/5 blur-3xl" />
            </div>

            {Icon && (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="relative mb-6"
                >
                    {/* Animated ring */}
                    <div className="absolute inset-0 -m-3 rounded-3xl border-2 border-dashed border-slate-200/60 animate-[spin_20s_linear_infinite]" />
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-50 to-white flex items-center justify-center shadow-sm border border-slate-100/80">
                        <Icon className="w-7 h-7 text-slate-300" strokeWidth={1.5} />
                    </div>
                </motion.div>
            )}

            <motion.div 
                className="space-y-2 relative z-10"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
            >
                <h3 className="text-[15px] font-bold text-slate-600 tracking-tight">{title}</h3>
                {description && (
                    <p className="text-[13px] text-slate-400 max-w-sm mx-auto leading-relaxed font-medium">{description}</p>
                )}
            </motion.div>

            {action && (
                <motion.div 
                    className="mt-6 relative z-10"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                >
                    {action}
                </motion.div>
            )}
        </motion.div>
    );
};

export default EmptyState;
