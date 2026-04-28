import React from 'react';
import { motion } from 'framer-motion';

const Input = ({ className = '', borderFull = true, label, error, ...props }) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-[12px] font-semibold text-slate-500 uppercase tracking-[0.08em] mb-1.5">
                    {label}
                </label>
            )}
            <input
                className={`input-field focus:input-focus ${error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''} ${className}`}
                {...props}
            />
            {error && (
                <motion.p 
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-500 mt-1 font-medium"
                >
                    {error}
                </motion.p>
            )}
        </div>
    );
};

export default Input;
