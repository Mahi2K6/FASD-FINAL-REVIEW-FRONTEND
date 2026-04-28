import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const TopNav = () => {
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
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed top-0 left-0 right-0 z-[1000] px-6 py-3 border-b transition-all duration-500 will-change-[background-color,backdrop-filter,border-color,box-shadow] ${scrolled
                    ? 'backdrop-blur-2xl bg-white/75 border-[rgba(0,0,0,0.04)] shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_20px_rgba(0,0,0,0.03)]'
                    : 'bg-transparent border-transparent'
                }`}
        >
            <div className="container mx-auto max-w-7xl flex items-center justify-between w-full h-14">

                {/* Brand Focus Area */}
                <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3 cursor-pointer group">

                    {/* Logo Icon */}
                    <motion.div
                        whileHover={{ scale: 1.05, rotate: [-2, 2, -2, 0] }}
                        transition={{ duration: 0.4 }}
                        className="relative flex justify-center items-center z-10"
                    >
                        <img src="/medconnect.png" alt="MedConnect Logo" className="w-[32px] h-[32px] object-contain drop-shadow-sm" />
                    </motion.div>

                    {/* Typography Setup */}
                    <div className="flex flex-col ml-1">
                        <h1 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tight leading-none">
                            MED<span className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] bg-clip-text text-transparent">CONNECT</span>
                        </h1>
                        <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-[0.12em] mt-0.5">
                            Smart Healthcare
                        </span>
                    </div>
                </Link>

                {/* Empty Center & Right Side for minimalist SaaS layout */}
                <div className="flex-1"></div>

            </div>
        </motion.header>
    );
};

export default TopNav;
