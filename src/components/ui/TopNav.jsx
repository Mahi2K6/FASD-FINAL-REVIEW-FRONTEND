import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const TopNav = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [scrolled]);

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 will-change-[background-color,backdrop-filter,border-color,box-shadow] ${scrolled
                    ? 'bg-white/55 backdrop-blur-[20px] border-b border-white/40 shadow-[0_4px_30px_rgba(0,0,0,0.04)] pb-0'
                    : 'bg-transparent border-b border-transparent pt-2'
                }`}
        >
            <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
                <div className={`flex items-center justify-between w-full transition-all duration-500 ${scrolled ? 'h-20' : 'h-24'}`}>

                    {/* Brand Focus Area */}
                    <div onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-4 cursor-pointer group">

                        {/* Enhanced Logo Container */}
                        <div className="relative">
                            {/* Soft glowing background */}
                            <motion.div
                                className="absolute inset-0 bg-blue-400 rounded-2xl blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                            />
                            <motion.div
                                whileHover={{ scale: 1.04, rotate: [-2, 2, -2, 0] }}
                                transition={{ duration: 0.4 }}
                                className="relative w-12 h-12 flex justify-center items-center bg-white/60 backdrop-blur-md rounded-2xl shadow-[0_4px_20px_rgba(59,130,246,0.15)] border border-white/80 group-hover:border-blue-200 transition-colors z-10"
                            >
                                <img src="/medconnect.png" alt="MedConnect Logo" className="w-[28px] h-[28px] object-contain drop-shadow-sm" />
                            </motion.div>
                        </div>

                        {/* Typography Setup */}
                        <div className="flex flex-col">
                            <span className="font-bold tracking-widest text-xl text-slate-800 uppercase flex items-center">
                                MED<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">CONNECT</span>
                            </span>
                            <span className="text-xs font-medium text-slate-500 tracking-wide mt-0.5">
                                Smart Healthcare Network
                            </span>
                        </div>
                    </div>

                    {/* Empty Center & Right Side for minimalist SaaS layout */}
                    <div className="flex-1"></div>

                </div>
            </div>
        </motion.header>
    );
};
