import React from 'react';
import { Mail, Phone, MapPin, Twitter, Send, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';

export const GlobalFooter = () => {
    return (
        <motion.footer
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-[100vw] mt-auto relative z-20 border-t border-slate-800 flex flex-col items-center -mb-4 pb-8 pt-16"
            style={{
                background: 'linear-gradient(180deg, #0b1220 0%, #070e1a 100%)',
                marginLeft: 'calc(-50vw + 50%)',
                marginRight: 'calc(-50vw + 50%)'
            }}
        >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-900/50 to-transparent"></div>

            <div className="w-full max-w-7xl px-6 md:px-12 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
                    {/* Column 1: Brand */}
                    <div className="flex flex-col items-start text-left">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-white/5 backdrop-blur-md shadow-sm border border-white/10 flex items-center justify-center p-1.5 grayscale brightness-200">
                                <img src="/medconnect.png" alt="MedConnect Logo" className="w-full h-full object-contain" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold tracking-widest text-lg text-white uppercase leading-none">MEDCONNECT</span>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                            Your trusted healthcare platform connecting patients with doctors, pharmacists, and professionals.
                        </p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className="flex flex-col items-start text-left lg:items-center">
                        <div>
                            <h4 className="font-semibold text-white text-sm tracking-wider uppercase mb-6">Quick Links</h4>
                            <div className="flex flex-col gap-4">
                                <a href="#" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">Home</a>
                                <a href="#" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">Login</a>
                                <a href="#" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">Register</a>
                            </div>
                        </div>
                    </div>

                    {/* Column 3: Services */}
                    <div className="flex flex-col items-start text-left lg:items-center">
                        <div>
                            <h4 className="font-semibold text-white text-sm tracking-wider uppercase mb-6">Services</h4>
                            <div className="flex flex-col gap-4">
                                <a href="#" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">Online Consultation</a>
                                <a href="#" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">Video Appointments</a>
                                <a href="#" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">e-Prescriptions</a>
                                <a href="#" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">Pharmacy Delivery</a>
                            </div>
                        </div>
                    </div>

                    {/* Column 4: Contact */}
                    <div className="flex flex-col items-start text-left lg:items-end">
                        <div>
                            <h4 className="font-semibold text-white text-sm tracking-wider uppercase mb-6">Contact</h4>
                            <div className="flex flex-col gap-4">
                                <a href="mailto:support@medconnect.com" className="text-sm text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-3">
                                    <Mail size={16} className="text-slate-500" /> support@medconnect.com
                                </a>
                                <a href="tel:+917993802715" className="text-sm text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-3">
                                    <Phone size={16} className="text-slate-500" /> +91 7993802715
                                </a>
                                <span className="text-sm text-slate-400 flex items-start gap-3">
                                    <MapPin size={18} className="text-slate-500 flex-shrink-0 mt-0.5" />
                                    <span>Health Tech Park, India</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Separator & Copyright & Socials */}
                <div className="w-full pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-sm text-slate-500 font-medium">© 2026 MedConnect. All rights reserved.</p>

                    <div className="flex items-center gap-4">
                        <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] group">
                            <Twitter size={18} className="group-hover:scale-110 transition-transform" />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] group">
                            <Send size={18} className="group-hover:scale-110 transition-transform" />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] group">
                            <Linkedin size={18} className="group-hover:scale-110 transition-transform" />
                        </a>
                    </div>
                </div>
            </div>
        </motion.footer>
    );
};
