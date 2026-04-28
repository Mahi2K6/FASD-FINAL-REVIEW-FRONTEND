import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, X } from 'lucide-react';

/* ═══════════════════════════════════════════════
   CommandSearch — Universal Floating Command Palette
   ──────────────────────────────────────────────
   ✦ Bottom-center floating trigger pill
   ✦ Expands into full command palette on activation
   ✦ Supports ⌘K, / keyboard shortcuts
   ✦ Context-aware placeholders per active tab
   ✦ Dispatches CustomEvent for page-level search wiring
   ═══════════════════════════════════════════════ */

const CONTEXT_PLACEHOLDERS = {
    overview:      'Search health data, appointments, records...',
    doctors:       'Search doctors, specialties, consultations...',
    appointments:  'Search appointments, dates, doctors...',
    prescriptions: 'Search prescriptions, medications...',
    records:       'Search medical records, files...',
    patients:      'Search patients, history, records...',
    schedule:      'Search schedule, time slots...',
    inventory:     'Search inventory, medications, stock...',
    approvals:     'Search pending approvals...',
    default:       'Search anything...',
};

const CommandSearch = ({ activeTab = 'overview' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);
    const containerRef = useRef(null);

    const placeholder = CONTEXT_PLACEHOLDERS[activeTab] || CONTEXT_PLACEHOLDERS.default;

    /* ─── Open / close handlers ─── */
    const openSearch = useCallback(() => {
        setIsOpen(true);
        // Auto-focus after animation starts
        requestAnimationFrame(() => {
            setTimeout(() => inputRef.current?.focus(), 80);
        });
    }, []);

    const closeSearch = useCallback(() => {
        setIsOpen(false);
        setQuery('');
        // Dispatch clear event
        window.dispatchEvent(new CustomEvent('medconnect-search', { detail: { query: '' } }));
    }, []);

    /* ─── Keyboard shortcuts: ⌘K and / ─── */
    useEffect(() => {
        const handleKeyDown = (e) => {
            // ⌘K or Ctrl+K
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (isOpen) closeSearch();
                else openSearch();
            }
            // / key (only when not typing in an input)
            if (e.key === '/' && !isOpen && 
                !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
                e.preventDefault();
                openSearch();
            }
            // Escape
            if (e.key === 'Escape' && isOpen) {
                closeSearch();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, openSearch, closeSearch]);

    /* ─── Dispatch search query to listening pages ─── */
    useEffect(() => {
        window.dispatchEvent(new CustomEvent('medconnect-search', { detail: { query } }));
    }, [query]);

    /* ─── Click outside to close ─── */
    useEffect(() => {
        if (!isOpen) return;
        const handleClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                closeSearch();
            }
        };
        // Delay to avoid catching the opening click
        const timeout = setTimeout(() => {
            document.addEventListener('mousedown', handleClick);
        }, 100);
        return () => {
            clearTimeout(timeout);
            document.removeEventListener('mousedown', handleClick);
        };
    }, [isOpen, closeSearch]);

    return ReactDOM.createPortal(
        <>
            {/* ═══ Backdrop dim ═══ */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[9990]"
                        style={{
                            background: 'rgba(15,23,42,0.16)',
                            backdropFilter: 'blur(6px)',
                            WebkitBackdropFilter: 'blur(6px)',
                        }}
                        onClick={closeSearch}
                    />
                )}
            </AnimatePresence>

            {/* ═══ Bottom-center container ═══ */}
            <div 
                className="fixed z-[9995]"
                style={{
                    left: '50%',
                    bottom: '28px',
                    transform: 'translateX(-50%)',
                }}
            >
                <AnimatePresence mode="wait">
                    {!isOpen ? (
                        /* ═══ Trigger Pill — Compact ═══ */
                        <motion.button
                            key="trigger"
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 380, damping: 28, mass: 0.7 }}
                            onClick={openSearch}
                            className="pill-float flex items-center gap-2.5 cursor-pointer select-none group"
                            style={{
                                width: 140,
                                height: 48,
                                borderRadius: '999px',
                                background: 'rgba(255,255,255,0.78)',
                                backdropFilter: 'blur(20px) saturate(170%)',
                                WebkitBackdropFilter: 'blur(20px) saturate(170%)',
                                border: '1px solid rgba(255,255,255,0.5)',
                                boxShadow: '0 8px 30px rgba(15,23,42,0.08), 0 0 0 1px rgba(255,255,255,0.45), 0 0 20px rgba(72,145,255,0.05), inset 0 1px 0 rgba(255,255,255,0.4)',
                                padding: '0 18px',
                            }}
                            whileHover={{ 
                                y: -3, 
                                scale: 1.04,
                                boxShadow: '0 14px 40px rgba(15,23,42,0.12), 0 0 0 1px rgba(255,255,255,0.6), 0 0 30px rgba(72,145,255,0.10), inset 0 1px 0 rgba(255,255,255,0.55)',
                            }}
                            whileTap={{ scale: 0.96 }}
                        >
                            <Search size={15} className="text-slate-400 group-hover:text-blue-500 transition-colors duration-200 shrink-0" strokeWidth={2} />
                            <span className="text-[13px] text-slate-400 font-medium group-hover:text-slate-600 transition-colors duration-200 whitespace-nowrap">Search</span>
                            <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white/70 border border-slate-200/50 text-[9px] font-bold text-slate-400 shadow-sm ml-auto">
                                <Command size={9} />K
                            </kbd>
                        </motion.button>
                    ) : (
                        /* ═══ Expanded Command Palette ═══ */
                        <motion.div
                            ref={containerRef}
                            key="palette"
                            initial={{ opacity: 0, y: 30, scale: 0.92, filter: 'blur(8px)' }}
                            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(4px)' }}
                            transition={{ type: 'spring', stiffness: 360, damping: 28, mass: 0.7 }}
                            style={{
                                width: 680,
                                maxWidth: '85vw',
                                height: 64,
                                borderRadius: '999px',
                                background: 'rgba(255,255,255,0.95)',
                                backdropFilter: 'blur(28px) saturate(190%)',
                                WebkitBackdropFilter: 'blur(28px) saturate(190%)',
                                border: '1px solid rgba(255,255,255,0.6)',
                                boxShadow: '0 18px 50px rgba(15,23,42,0.10), 0 0 0 1px rgba(255,255,255,0.45), 0 0 40px rgba(72,145,255,0.12), inset 0 1px 0 rgba(255,255,255,0.6)',
                            }}
                        >
                            <div className="flex items-center gap-3 h-full px-6">
                                {/* Search icon — animated color */}
                                <motion.div
                                    initial={{ rotate: -20, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    transition={{ delay: 0.05, type: 'spring', stiffness: 300 }}
                                >
                                    <Search size={18} className="text-blue-500 shrink-0" strokeWidth={2} />
                                </motion.div>

                                {/* Input field */}
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder={placeholder}
                                    className="flex-1 bg-transparent text-[15px] text-slate-700 placeholder:text-slate-400/70 outline-none font-medium"
                                    autoComplete="off"
                                    spellCheck="false"
                                />

                                {/* Right side controls */}
                                <div className="flex items-center gap-2 shrink-0">
                                    {query && (
                                        <motion.button
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            onClick={() => setQuery('')}
                                            className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                                        >
                                            <X size={12} className="text-slate-500" />
                                        </motion.button>
                                    )}
                                    <kbd className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50/80 border border-blue-100/60 text-[10px] font-bold text-blue-500 shadow-sm">
                                        <Command size={10} />K
                                    </kbd>
                                    <button
                                        onClick={closeSearch}
                                        className="px-3 py-1 rounded-full text-[11px] font-semibold text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 transition-all"
                                    >
                                        ESC
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>,
        document.body
    );
};

export default CommandSearch;
