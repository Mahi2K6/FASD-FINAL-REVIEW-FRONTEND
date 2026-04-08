import React, { useState, useRef, useEffect } from 'react';
import { Search, X, User, Pill, FileText, Calendar, Building2, Stethoscope, Store, Activity } from 'lucide-react';
import { useAppContext } from '../../AppContext';
import { useLocation } from 'react-router-dom';

function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

const UniversalSearch = ({ value, onChange }) => {
    const { data } = useAppContext();
    const location = useLocation();
    
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

    const debouncedSearchTerm = useDebounce(value, 300);

    // Central Search Context Configuration
    const SEARCH_CONTEXT = {
        "/": { label: "Dashboard", icon: Search, placeholder: "Search dashboard insights...", scope: ['all'] },
        "/find-doctors": { label: "Doctors", icon: Stethoscope, placeholder: "Search doctors by name or specialty...", scope: ['doctors'] },
        "/appointments": { label: "Appointments", icon: Calendar, placeholder: "Search appointments...", scope: ['appointments'] },
        "/prescriptions": { label: "Prescriptions", icon: Pill, placeholder: "Search prescriptions...", scope: ['medicines', 'prescriptions'] },
        "/records": { label: "Records", icon: Activity, placeholder: "Search medical records...", scope: ['records'] },
        "/medicines": { label: "Medicines", icon: Pill, placeholder: "Search medicines...", scope: ['medicines'] },
        "/patients": { label: "Patients", icon: User, placeholder: "Search patients...", scope: ['patients'] }
    };

    // Safe detection that prioritizes most specific route (length sorting) 
    // to prevent '/dashboard' from swallowing '/dashboard/records'
    const sortedKeys = Object.keys(SEARCH_CONTEXT).sort((a, b) => b.length - a.length);
    const currentKey = sortedKeys.find(key => key !== "/" ? location.pathname.includes(key) : location.pathname === key);
    
    const context = currentKey ? SEARCH_CONTEXT[currentKey] : { label: "Search", icon: Search, placeholder: "Search...", scope: ['all'] };
    
    // Fallback Icon
    const CtxIcon = context.icon || Search;

    // Keyboard Shortcut (Cmd+K / Ctrl+K)
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsExpanded(true);
            }
        };
        document.addEventListener('keydown', handleGlobalKeyDown);
        return () => document.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    // Focus & Clear
    useEffect(() => {
        if (isExpanded) {
            // Auto-focus when opening the pill
            setTimeout(() => {
                if (inputRef.current) inputRef.current.focus();
            }, 50);
        } else {
            if (onChange) onChange({ target: { value: '' }});
        }
    }, [isExpanded, onChange]);

    useEffect(() => {
        setIsSearching(value !== debouncedSearchTerm);
        setSelectedIndex(-1);
    }, [value, debouncedSearchTerm]);

    // Click Outside Collapse
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsExpanded(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    // Construct Results
    let results = [];
    if (debouncedSearchTerm && debouncedSearchTerm.trim().length > 1) {
        const lowerQ = debouncedSearchTerm.toLowerCase();
        const scope = context.scope || ['all'];

        if (scope.includes('all') || scope.includes('doctors') || scope.includes('users')) {
            const doctors = (data?.users || []).filter(u => u.role === 'doctor' &&
                (u.name?.toLowerCase().includes(lowerQ) || u.specialization?.toLowerCase().includes(lowerQ))
            );
            if (doctors.length) results.push({ category: 'Doctors', icon: Stethoscope, items: doctors.slice(0, 3).map(d => ({ id: d.id, name: `Dr. ${d.name}`, sub: `${d.specialization}` })) });
        }

        if (scope.includes('all') || scope.includes('patients') || scope.includes('users')) {
            const patients = (data?.users || []).filter(u => u.role === 'patient' && u.name?.toLowerCase().includes(lowerQ));
            if (patients.length) results.push({ category: 'Patients', icon: User, items: patients.slice(0, 3).map(p => ({ id: p.id, name: p.name, sub: 'Patient Profile' })) });
        }

        if (scope.includes('all') || scope.includes('medicines') || scope.includes('prescriptions')) {
            const uniqueMeds = new Map();
            (data?.prescriptions || []).forEach(p => {
                p.medicines.forEach(m => {
                    if (m.name.toLowerCase().includes(lowerQ)) {
                        if (!uniqueMeds.has(m.name)) {
                            uniqueMeds.set(m.name, { id: `${p.id}-${m.name}`, name: m.name, sub: `Prescribed by Dr. ${p.doctorName}`, type: 'prescription', refId: p.id });
                        }
                    }
                });
            });
            if (uniqueMeds.size > 0) results.push({ category: 'Medicines', icon: Pill, items: Array.from(uniqueMeds.values()).slice(0, 3) });
        }
    }

    const flatResults = results.flatMap(group => group.items.map(item => ({ ...item, category: group.category })));

    const handleResultClick = (item) => {
        setIsExpanded(false);
        if (onChange) onChange({ target: { value: '' } });
        console.log(`Navigating to result:`, item.id);
    };

    const handleKeyDown = (e) => {
        if (!isExpanded) return;
        if (flatResults.length === 0 && e.key !== 'Escape') return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < flatResults.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : flatResults.length - 1));
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            handleResultClick(flatResults[selectedIndex]);
        } else if (e.key === 'Escape') {
            setIsExpanded(false);
        }
    };

    return (
        <div ref={wrapperRef} className="search-container">
            
            {/* Results Dropdown (Expands Upwards) */}
            <div className={`absolute bottom-[calc(100%+16px)] left-1/2 -translate-x-1/2 w-[420px] max-w-[90vw] bg-white/95 max-sm:backdrop-blur-xl sm:backdrop-blur-3xl border border-white/60 rounded-3xl shadow-[0_24px_60px_rgba(0,0,0,0.15)] overflow-hidden pointer-events-auto transition-all duration-300 origin-bottom ${isExpanded && value.length > 1 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}`}>
                {isExpanded && debouncedSearchTerm.length > 1 && (
                    isSearching ? (
                        <div className="p-8 space-y-4">
                            <div className="h-4 bg-slate-200 rounded animate-pulse w-1/3"></div>
                            <div className="h-12 bg-slate-100 rounded-3xl animate-pulse"></div>
                            <div className="h-12 bg-slate-100 rounded-3xl animate-pulse w-5/6"></div>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="p-2 pb-4 max-h-[400px] overflow-y-auto">
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
                                                onClick={() => handleResultClick(item)}
                                                onMouseEnter={() => setSelectedIndex(globalIndex)}
                                                className={`mx-3 px-4 py-3 text-left rounded-3xl cursor-pointer transition-colors flex items-center justify-between group ${isSelected ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-slate-50'}`}
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
                    )
                )}
            </div>

            {/* The Search Pill */}
            <div 
                onClick={() => { if (!isExpanded) setIsExpanded(true); }}
                className={`search-pill pointer-events-auto cursor-pointer ${isExpanded ? 'search-pill-expanded' : 'search-pill-collapsed'}`}
            >
                {/* Collapsed view label - crossfades out */}
                <div className={`flex items-center gap-2 whitespace-nowrap overflow-hidden transition-all duration-300 ${isExpanded ? 'w-0 opacity-0' : 'w-full opacity-100 justify-center'}`}>
                    <CtxIcon size={18} className="text-blue-500 shrink-0" />
                    <span className="font-semibold text-[15px] text-slate-700">{context.label}</span>
                </div>

                {/* Expanded view input - crossfades in */}
                <div className={`flex items-center h-full transition-all duration-300 ${isExpanded ? 'opacity-100 flex-1 w-full pl-0' : 'opacity-0 w-0 pointer-events-none'}`}>
                    <Search className="text-blue-500 shrink-0" size={20} />
                    <input
                        ref={inputRef}
                        type="text"
                        value={value || ''}
                        onChange={onChange}
                        onKeyDown={handleKeyDown}
                        placeholder={context.placeholder}
                        className="search-input min-w-0"
                    />
                    {value && (
                        <button onClick={(e) => { e.stopPropagation(); if (onChange) onChange({ target: { value: '' } }); setIsExpanded(false); }} className="text-slate-400 hover:text-red-500 transition-colors bg-white/20 hover:bg-white/40 p-1.5 rounded-full z-10 shrink-0 ml-2">
                            <X size={16} />
                        </button>
                    )}
                    {!value && (
                        <div className="hidden sm:flex items-center gap-1 opacity-50 shrink-0 select-none pointer-events-none ml-2">
                            <kbd className="font-sans text-[10px] font-bold bg-slate-900/10 border border-slate-900/10 px-1.5 py-0.5 rounded text-slate-600">⌘</kbd>
                            <kbd className="font-sans text-[10px] font-bold bg-slate-900/10 border border-slate-900/10 px-1.5 py-0.5 rounded text-slate-600">K</kbd>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UniversalSearch;
