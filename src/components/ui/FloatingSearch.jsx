import React, { useState, useRef, useEffect } from 'react';
import { Search, X, User, Pill, FileText, Calendar, Building2, Stethoscope, Store } from 'lucide-react';
import { motion, AnimatePresence, useTransform } from 'framer-motion';
import { useMagneticHover } from '../../hooks/useMagneticHover';
import { useAppContext } from '../../AppContext';
import { Link } from 'react-router-dom';

// Debounce hook
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export const FloatingSearch = ({ value, onChange }) => {
    const { data } = useAppContext();
    const [focused, setFocused] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const wrapperRef = useRef(null);
    const { ref: magneticRef, styles, handlers, isHovered } = useMagneticHover({ magneticStrength: 0.2, tiltStrength: 0 });

    const debouncedSearchTerm = useDebounce(value, 300);

    useEffect(() => {
        setIsSearching(value !== debouncedSearchTerm);
        setSelectedIndex(-1); // Reset selection when search changes
    }, [value, debouncedSearchTerm]);

    useEffect(() => {
        let lastScrollY = window.scrollY;
        let scrollTimeout;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                // Scrolling down - hide
                if (!focused) wrapperRef.current?.classList.add('translate-y-[150%]', 'opacity-0', 'pointer-events-none');
            } else {
                // Scrolling up - show
                wrapperRef.current?.classList.remove('translate-y-[150%]', 'opacity-0', 'pointer-events-none');
            }
            lastScrollY = currentScrollY;

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                wrapperRef.current?.classList.remove('translate-y-[150%]', 'opacity-0', 'pointer-events-none');
            }, 800);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setFocused(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener("mousedown", handleClickOutside);
            clearTimeout(scrollTimeout);
        };
    }, [focused, wrapperRef]);

    let results = [];
    if (debouncedSearchTerm && debouncedSearchTerm.trim().length > 1) {
        const lowerQ = debouncedSearchTerm.toLowerCase();

        // 1. Search Doctors
        const doctors = data.users.filter(u => u.role === 'doctor' &&
            (u.name?.toLowerCase().includes(lowerQ) || u.specialization?.toLowerCase().includes(lowerQ))
        );
        if (doctors.length) results.push({ category: 'Doctors', icon: Stethoscope, items: doctors.slice(0, 3).map(d => ({ id: d.id, name: `Dr. ${d.name}`, sub: `${d.specialization} • ${d.experience} Years Exp` })) });

        // 2. Search Patients (Admin/Doctor)
        const patients = data.users.filter(u => u.role === 'patient' &&
            u.name?.toLowerCase().includes(lowerQ)
        );
        if (patients.length) results.push({ category: 'Patients', icon: User, items: patients.slice(0, 3).map(p => ({ id: p.id, name: p.name, sub: 'Patient Profile' })) });

        // 3. Search Prescriptions / Medicines
        const uniqueMeds = new Map();
        data.prescriptions.forEach(p => {
            p.medicines.forEach(m => {
                if (m.name.toLowerCase().includes(lowerQ)) {
                    // Prevent duplicates
                    if (!uniqueMeds.has(m.name)) {
                        uniqueMeds.set(m.name, {
                            id: `${p.id}-${m.name}`,
                            name: m.name,
                            sub: `Prescribed by Dr. ${p.doctorName}`,
                            type: 'prescription',
                            refId: p.id
                        });
                    }
                }
            });
        });
        if (uniqueMeds.size > 0) results.push({ category: 'Medicines & Prescriptions', icon: Pill, items: Array.from(uniqueMeds.values()).slice(0, 3) });

        // 4. Search Pharmacies
        const pharmacies = data.users.filter(u => u.role === 'pharmacist' &&
            (u.pharmacyName?.toLowerCase().includes(lowerQ) || u.name?.toLowerCase().includes(lowerQ))
        );
        if (pharmacies.length) results.push({ category: 'Pharmacies', icon: Store, items: pharmacies.slice(0, 3).map(p => ({ id: p.id, name: p.pharmacyName || p.name, sub: 'Pharmacy Partner' })) });
    }

    const getPlaceholder = () => {
        if (location.pathname.includes('/patient')) return "Search doctors by name or specialty...";
        if (location.pathname.includes('/doctor')) return "Search patients or medical records...";
        if (location.pathname.includes('/admin')) return "Search users, doctors, patients...";
        if (location.pathname.includes('/pharmacist')) return "Search medicines or pharmacies...";
        return "Search doctors, prescriptions, patients...";
    };

    const handleResultClick = (item, category) => {
        setFocused(false);
        onChange({ target: { value: '' } });
        // Minimal routing logic based on category
        if (category === 'Doctors') {
            console.log("Navigating to Doctor Profile", item.id);
            // navigate(`/ doctor - profile / ${ item.id } `);
        } else if (category === 'Patients') {
            console.log("Navigating to Patient Details", item.id);
        } else if (category === 'Pharmacies') {
            console.log("Navigating to Pharmacy Details", item.id);
        } else {
            console.log("Navigating to Record", item.refId);
        }
    };

    // Flatten results for keyboard navigation
    const flatResults = results.flatMap(group =>
        group.items.map(item => ({ ...item, category: group.category }))
    );

    const handleKeyDown = (e) => {
        if (!focused || flatResults.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < flatResults.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : flatResults.length - 1));
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            const selectedItem = flatResults[selectedIndex];
            handleResultClick(selectedItem, selectedItem.category);
        } else if (e.key === 'Escape') {
            setFocused(false);
        }
    };

    return (
        <div ref={wrapperRef} className="fixed bottom-[calc(14px+env(safe-area-inset-bottom))] md:bottom-[calc(18px+env(safe-area-inset-bottom))] lg:bottom-[calc(22px+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 w-[92%] md:w-[70%] lg:w-[420px] z-40 transition-all duration-500 ease-out">
            <AnimatePresence>
                {focused && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm -z-10"
                        onClick={() => setFocused(false)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {focused && debouncedSearchTerm.length > 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        className="absolute bottom-[calc(100%+16px)] left-0 right-0 bg-white/95 backdrop-blur-2xl border border-white/60 max-h-[400px] overflow-y-auto rounded-[32px] shadow-[0_24px_60px_rgba(0,0,0,0.15)] overflow-hidden pointer-events-auto"
                    >
                        {isSearching ? (
                            <div className="p-8 space-y-4">
                                <div className="h-4 bg-slate-200 rounded animate-pulse w-1/3"></div>
                                <div className="h-12 bg-slate-100 rounded-2xl animate-pulse"></div>
                                <div className="h-12 bg-slate-100 rounded-2xl animate-pulse w-5/6"></div>
                            </div>
                        ) : results.length > 0 ? (
                            <div className="p-2 pb-4">
                                {results.map((group, idx) => (
                                    <div key={idx} className="mb-2 last:mb-0">
                                        <div className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 sticky top-0 bg-white/95 backdrop-blur-md z-10">
                                            <group.icon size={14} className="text-blue-500" /> {group.category}
                                        </div>
                                        {group.items.map(item => {
                                            const globalIndex = flatResults.findIndex(r => r.id === item.id);
                                            const isSelected = globalIndex === selectedIndex;
                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={() => handleResultClick(item, group.category)}
                                                    onMouseEnter={() => setSelectedIndex(globalIndex)}
                                                    className={`mx-3 px-4 py-3 text-left rounded-2xl cursor-pointer transition-colors flex items-center justify-between group ${isSelected ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-slate-50'}`}
                                                >
                                                    <div>
                                                        <span className={`font-semibold block transition-colors ${isSelected ? 'text-blue-700' : 'text-slate-700 group-hover:text-blue-600'}`}>{item.name}</span>
                                                        {item.sub && <span className={`text-xs font-medium ${isSelected ? 'text-blue-500' : 'text-slate-500'}`}>{item.sub}</span>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                                <Search className="text-slate-300 mb-3" size={32} />
                                <span className="font-medium">No results found for "{debouncedSearchTerm}"</span>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom wrapper for combined tailwind -translate-x-1/2 and Framer motion magnetic X effect */}
            <motion.div
                ref={magneticRef}
                style={{
                    x: useTransform(styles.x, (val) => `calc(-50% + ${val}px)`), // Maintains Tailwind centering while injecting magnetic offset
                    y: styles.y,
                    '--mouse-x': styles['--mouse-x'],
                    '--mouse-y': styles['--mouse-y']
                }}
                onMouseMove={handlers.onMouseMove}
                onMouseEnter={handlers.onMouseEnter}
                onMouseLeave={handlers.onMouseLeave}
                className="absolute w-full bottom-0 left-1/2"
            >
                <motion.div
                    animate={{
                        scale: focused ? 1.02 : (isHovered ? 1.01 : 1),
                        y: focused ? -4 : 0
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`bg-white/90 backdrop-blur-xl border flex items-center gap-3 px-6 h-[54px] rounded-full transition-shadow duration-300 ${focused
                        ? 'shadow-[0_15px_40px_rgba(37,99,235,0.15)] border-blue-300 ring-4 ring-blue-500/10 liquid-glass-panel liquid-glow-intense'
                        : isHovered
                            ? 'shadow-[0_12px_35px_rgba(0,0,0,0.12)] border-white liquid-glass-panel'
                            : 'shadow-[0_8px_25px_rgba(0,0,0,0.08)] border-white/60 hover:bg-white/95'
                        }`}
                >
                    <Search className={focused ? "text-blue-500" : "text-slate-400 shrink-0"} size={22} />
                    <input
                        type="text"
                        value={value}
                        onChange={onChange}
                        onFocus={() => setFocused(true)}
                        onKeyDown={handleKeyDown}
                        placeholder={getPlaceholder()}
                        className="bg-transparent outline-none text-slate-700 placeholder:text-slate-400 w-full text-base font-medium"
                    />
                    {value && (
                        <button onClick={() => { onChange({ target: { value: '' } }); setFocused(false); }} className="text-slate-400 hover:text-red-500 transition-colors bg-slate-50 hover:bg-red-50 p-1.5 rounded-full z-10 relative">
                            <X size={18} />
                        </button>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
};
