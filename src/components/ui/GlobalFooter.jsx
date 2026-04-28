import React from 'react';
import { Mail, Phone, MapPin, Twitter, Send, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';

const GlobalFooter = () => {
    return (
        <motion.footer
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-[100vw] mt-auto relative z-20 border-t border-slate-800/50 flex flex-col items-center -mb-4 pb-10 pt-20"
            style={{
                background: 'linear-gradient(180deg, #080f1e 0%, #060b16 100%)',
                marginLeft: 'calc(-50vw + 50%)',
                marginRight: 'calc(-50vw + 50%)'
            }}
        >
            {/* Top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-900/40 to-transparent"></div>

            <div className="w-full max-w-7xl px-6 md:px-12 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
                    {/* Column 1: Brand */}
                    <div className="flex flex-col items-start text-left">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-white/5 backdrop-blur-md shadow-sm border border-white/8 flex items-center justify-center p-1.5 grayscale brightness-200">
                                <img src="/medconnect.png" alt="MedConnect Logo" className="w-full h-full object-contain" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold tracking-[0.12em] text-lg text-white uppercase leading-none">MEDCONNECT</span>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                            Your trusted healthcare platform connecting patients with doctors, pharmacists, and professionals.
                        </p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className="flex flex-col items-start text-left lg:items-center">
                        <div>
                            <h4 className="font-semibold text-white text-xs tracking-[0.12em] uppercase mb-6">Quick Links</h4>
                            <div className="flex flex-col gap-3.5">
                                <a href="#" className="text-sm text-slate-400 hover:text-blue-400 transition-colors duration-200">Home</a>
                                <a href="#" className="text-sm text-slate-400 hover:text-blue-400 transition-colors duration-200">Login</a>
                                <a href="#" className="text-sm text-slate-400 hover:text-blue-400 transition-colors duration-200">Register</a>
                            </div>
                        </div>
                    </div>

                    {/* Column 3: Services */}
                    <div className="flex flex-col items-start text-left lg:items-center">
                        <div>
                            <h4 className="font-semibold text-white text-xs tracking-[0.12em] uppercase mb-6">Services</h4>
                            <div className="flex flex-col gap-3.5">
                                <a href="#" className="text-sm text-slate-400 hover:text-blue-400 transition-colors duration-200">Online Consultation</a>
                                <a href="#" className="text-sm text-slate-400 hover:text-blue-400 transition-colors duration-200">Video Appointments</a>
                                <a href="#" className="text-sm text-slate-400 hover:text-blue-400 transition-colors duration-200">e-Prescriptions</a>
                                <a href="#" className="text-sm text-slate-400 hover:text-blue-400 transition-colors duration-200">Pharmacy Delivery</a>
                            </div>
                        </div>
                    </div>

                    {/* Column 4: Contact */}
                    <div className="flex flex-col items-start text-left lg:items-end">
                        <div>
                            <h4 className="font-semibold text-white text-xs tracking-[0.12em] uppercase mb-6">Contact</h4>
                            <div className="flex flex-col gap-3.5">
                                <a href="mailto:support@medconnect.com" className="text-sm text-slate-400 hover:text-blue-400 transition-colors duration-200 flex items-center gap-3">
                                    <Mail size={15} className="text-slate-500" strokeWidth={1.8} /> support@medconnect.com
                                </a>
                                <a href="tel:+917993802715" className="text-sm text-slate-400 hover:text-blue-400 transition-colors duration-200 flex items-center gap-3">
                                    <Phone size={15} className="text-slate-500" strokeWidth={1.8} /> +91 7993802715
                                </a>
                                <span className="text-sm text-slate-400 flex items-start gap-3">
                                    <MapPin size={16} className="text-slate-500 flex-shrink-0 mt-0.5" strokeWidth={1.8} />
                                    <span>Health Tech Park, India</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Separator & Copyright & Socials */}
                <div className="w-full pt-8 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-sm text-slate-500 font-medium">© 2026 MedConnect. All rights reserved.</p>

                    <div className="flex items-center gap-3">
                        {[
                            { icon: Twitter, label: 'Twitter' },
                            { icon: Send, label: 'Telegram' },
                            { icon: Linkedin, label: 'LinkedIn' },
                        ].map(({ icon: SocialIcon, label }) => (
                            <motion.a
                                key={label}
                                href="#"
                                whileHover={{ scale: 1.08, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/8 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/[0.08] transition-all duration-200"
                            >
                                <SocialIcon size={17} strokeWidth={1.8} />
                            </motion.a>
                        ))}
                    </div>
                </div>
            </div>
        </motion.footer>
    );
};

export default GlobalFooter;
