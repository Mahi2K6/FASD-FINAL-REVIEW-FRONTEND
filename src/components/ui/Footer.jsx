import React from 'react';

export const Footer = () => {
    return (
        <footer className="relative bg-[#0b1121] overflow-hidden pt-20 pb-10 border-t border-slate-800/50 mt-20">
            {/* Top glass border glow */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent blur-[2px]"></div>

            {/* Soft background glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[40rem] h-[40rem] bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-10 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-5 pointer-events-none"></div>

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 mb-16">
                    {/* Left Section */}
                    <div className="md:col-span-4 lg:col-span-4 flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                                <img src="/medconnect.png" alt="Logo" className="w-[22px] h-[22px] object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight">
                                MEDCONNECT
                            </span>
                        </div>
                        <p className="text-slate-400 leading-relaxed text-sm pr-4">
                            "Your trusted healthcare platform connecting patients with doctors, pharmacists, and professionals."
                        </p>
                    </div>

                    {/* Middle Sections */}
                    <div className="md:col-span-4 lg:col-span-2">
                        <h4 className="text-slate-50 font-semibold mb-6 tracking-wide text-sm uppercase letter-spacing-1">Quick Links</h4>
                        <ul className="flex flex-col gap-4">
                            {['Home', 'Login', 'Register'].map((link) => (
                                <li key={link}>
                                    <a href="#" className="text-slate-400 hover:text-blue-400 hover:translate-x-1 transition-all duration-300 text-sm flex items-center gap-2 group w-max">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-blue-400 transition-colors shadow-[0_0_8px_rgba(59,130,246,0)] group-hover:shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="md:col-span-4 lg:col-span-3">
                        <h4 className="text-slate-50 font-semibold mb-6 tracking-wide text-sm uppercase letter-spacing-1">Services</h4>
                        <ul className="flex flex-col gap-4">
                            {['Online Consultation', 'Video Appointments', 'e-Prescriptions', 'Pharmacy Delivery'].map((service) => (
                                <li key={service}>
                                    <a href="#" className="text-slate-400 hover:text-blue-400 hover:translate-x-1 transition-all duration-300 text-sm flex items-center gap-2 group w-max">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-blue-400 transition-colors shadow-[0_0_8px_rgba(59,130,246,0)] group-hover:shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
                                        {service}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div className="md:col-span-12 lg:col-span-3">
                        <h4 className="text-slate-50 font-semibold mb-6 tracking-wide text-sm uppercase letter-spacing-1">Contact</h4>
                        <ul className="flex flex-col gap-4 text-sm text-slate-400">
                            <li className="flex items-start gap-3 group">
                                <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center shrink-0 border border-slate-700/50 group-hover:border-blue-500/50 group-hover:bg-blue-500/10 transition-colors">
                                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <span className="mt-1.5 group-hover:text-slate-200 transition-colors">support@medconnect.com</span>
                            </li>
                            <li className="flex items-start gap-3 group">
                                <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center shrink-0 border border-slate-700/50 group-hover:border-blue-500/50 group-hover:bg-blue-500/10 transition-colors">
                                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <span className="mt-1.5 group-hover:text-slate-200 transition-colors">+91 7993802715 MED CONNECT</span>
                            </li>
                            <li className="flex items-start gap-3 group">
                                <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center shrink-0 border border-slate-700/50 group-hover:border-blue-500/50 group-hover:bg-blue-500/10 transition-colors">
                                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <span className="mt-1.5 group-hover:text-slate-200 transition-colors">Health Tech Park, India</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Strip */}
                <div className="border-t border-slate-800/80 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-slate-500 text-sm">
                        © 2026 MedConnect. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 text-slate-500">
                        {/* Social Icons */}
                        <a href="#" className="w-9 h-9 rounded-full bg-slate-800/30 flex items-center justify-center hover:bg-slate-700 hover:text-blue-400 transition-all duration-300">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724a11.04 11.04 0 0 1-3.513 1.34A5.524 5.524 0 0 0 15 2c-3.051 0-5.525 2.474-5.525 5.525 0 .433.049.855.143 1.261C5.031 8.547 1.488 6.346.574 2.115A5.518 5.518 0 0 0 2.33 9.48a5.525 5.525 0 0 1-2.502-.691v.07c0 2.677 1.903 4.908 4.43 5.414a5.53 5.53 0 0 1-2.492.095c.703 2.193 2.742 3.788 5.163 3.832A11.076 11.076 0 0 1 0 19.544a15.615 15.615 0 0 0 8.463 2.48c10.155 0 15.707-8.412 15.615-15.614.004-.239.004-.478-.005-.715A11.173 11.173 0 0 0 24 4.557z" /></svg>
                        </a>
                        <a href="#" className="w-9 h-9 rounded-full bg-slate-800/30 flex items-center justify-center hover:bg-slate-700 hover:text-blue-400 transition-all duration-300">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" /></svg>
                        </a>
                        <a href="#" className="w-9 h-9 rounded-full bg-slate-800/30 flex items-center justify-center hover:bg-slate-700 hover:text-blue-400 transition-all duration-300">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
