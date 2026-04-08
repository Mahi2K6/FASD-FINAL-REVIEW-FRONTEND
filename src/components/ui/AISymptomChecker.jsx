import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Stethoscope, AlertCircle, CheckCircle2, ChevronRight, Sparkles, Send, RotateCcw } from 'lucide-react';
import Button from './Button';
import Input from './Input';

// ─────────────────────────────────────────────
// Rule-Based Symptom → Specialty Engine
// ─────────────────────────────────────────────
const SYMPTOM_MAP = [
    {
        keywords: ['chest pain', 'chest pressure', 'palpitation', 'heart', 'shortness of breath', 'blood pressure', 'hypertension'],
        specialty: 'Cardiologist',
        urgency: 'urgent',
        icon: '❤️',
        tip: 'Chest-related symptoms can indicate cardiac issues. Seek attention today.',
    },
    {
        keywords: ['headache', 'migraine', 'dizziness', 'seizure', 'stroke', 'numbness', 'tingling', 'memory', 'confusion', 'nerve', 'brain'],
        specialty: 'Neurologist',
        urgency: 'urgent',
        icon: '🧠',
        tip: 'Neurological symptoms vary widely. A specialist evaluation is recommended.',
    },
    {
        keywords: ['bone', 'joint', 'knee', 'back pain', 'spine', 'fracture', 'muscle', 'shoulder', 'ankle', 'wrist', 'hip', 'arthritis'],
        specialty: 'Orthopedist',
        urgency: 'routine',
        icon: '🦴',
        tip: 'Musculoskeletal issues are common. A targeted assessment can provide relief.',
    },
    {
        keywords: ['skin', 'rash', 'acne', 'eczema', 'psoriasis', 'itching', 'hair loss', 'nail', 'lesion', 'burn', 'allergy'],
        specialty: 'Dermatologist',
        urgency: 'routine',
        icon: '🩺',
        tip: 'Most skin conditions are treatable. Early diagnosis prevents progression.',
    },
    {
        keywords: ['stomach', 'abdomen', 'nausea', 'vomiting', 'diarrhea', 'constipation', 'bloating', 'liver', 'acid', 'reflux', 'ibs', 'gut'],
        specialty: 'Gastroenterologist',
        urgency: 'routine',
        icon: '🫃',
        tip: 'Digestive health is vital. Many GI issues respond well to early treatment.',
    },
    {
        keywords: ['cough', 'cold', 'flu', 'fever', 'sore throat', 'fatigue', 'weakness', 'infection', 'viral', 'body ache', 'runny nose'],
        specialty: 'General Physician',
        urgency: 'routine',
        icon: '🏥',
        tip: 'A general physician can diagnose and manage most common illnesses effectively.',
    },
    {
        keywords: ['eye', 'vision', 'blur', 'glaucoma', 'cataract', 'red eye', 'dry eyes', 'floaters'],
        specialty: 'Ophthalmologist',
        urgency: 'routine',
        icon: '👁️',
        tip: 'Eye health requires specialist care. Early intervention preserves vision.',
    },
    {
        keywords: ['ear', 'hearing', 'tinnitus', 'nose', 'throat', 'sinus', 'vertigo', 'ent', 'snoring', 'adenoid', 'tonsil'],
        specialty: 'ENT Specialist',
        urgency: 'routine',
        icon: '👂',
        tip: 'ENT conditions often improve significantly with proper specialist treatment.',
    },
    {
        keywords: ['urine', 'kidney', 'bladder', 'urination', 'prostate', 'uti', 'stones', 'nephritis', 'dialysis'],
        specialty: 'Urologist / Nephrologist',
        urgency: 'urgent',
        icon: '🫘',
        tip: 'Urinary symptoms should be evaluated promptly to rule out infection or blockage.',
    },
    {
        keywords: ['anxiety', 'depression', 'stress', 'sleep', 'insomnia', 'panic', 'mental', 'mood', 'trauma', 'ocd', 'bipolar'],
        specialty: 'Psychiatrist / Psychologist',
        urgency: 'routine',
        icon: '🧘',
        tip: 'Mental health is as important as physical. Seeking help is a sign of strength.',
    },
    {
        keywords: ['diabetes', 'thyroid', 'hormone', 'obesity', 'sugar', 'insulin', 'metabolism', 'adrenal', 'pituitary'],
        specialty: 'Endocrinologist',
        urgency: 'routine',
        icon: '⚗️',
        tip: 'Hormonal and metabolic conditions are manageable with proper specialist care.',
    },
    {
        keywords: ['child', 'baby', 'infant', 'fever in child', 'vaccination', 'growth', 'pediatric'],
        specialty: 'Pediatrician',
        urgency: 'routine',
        icon: '👶',
        tip: 'Children\'s health requires age-specific expertise. A pediatrician is the right choice.',
    },
    {
        keywords: ['emergency', 'unconscious', 'blood', 'accident', 'severe pain', 'collapse', 'breathing difficulty', 'overdose'],
        specialty: 'Emergency Medicine',
        urgency: 'emergency',
        icon: '🚨',
        tip: 'CALL EMERGENCY SERVICES (108) IMMEDIATELY. Do not wait for an appointment.',
    },
];

const URGENCY_CONFIG = {
    emergency: { label: 'Emergency — Call 108', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' },
    urgent: { label: 'Urgent — See today', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500' },
    routine: { label: 'Routine — Book appointment', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' },
};

const analyzeSymptoms = (input) => {
    if (!input || input.trim().length < 3) return null;
    const lower = input.toLowerCase();
    
    let bestMatch = null;
    let bestScore = 0;

    for (const entry of SYMPTOM_MAP) {
        const score = entry.keywords.filter(kw => lower.includes(kw)).length;
        if (score > bestScore) {
            bestScore = score;
            bestMatch = entry;
        }
    }

    if (!bestMatch || bestScore === 0) {
        return {
            specialty: 'General Physician',
            urgency: 'routine',
            icon: '🏥',
            tip: 'Your symptoms don\'t match a specific specialist. A general physician can evaluate and refer you appropriately.',
        };
    }

    return bestMatch;
};

// ─────────────────────────────────────────────
// AI Symptom Checker Component
// ─────────────────────────────────────────────
const AISymptomChecker = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [symptoms, setSymptoms] = useState('');
    const [result, setResult] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const inputRef = useRef(null);

    const handleAnalyze = () => {
        if (!symptoms.trim()) return;
        setIsAnalyzing(true);
        setResult(null);
        // Small deliberate delay for perceived intelligence
        setTimeout(() => {
            setResult(analyzeSymptoms(symptoms));
            setIsAnalyzing(false);
        }, 900);
    };

    const handleReset = () => {
        setSymptoms('');
        setResult(null);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const urgency = result ? URGENCY_CONFIG[result.urgency] : null;

    return (
        <>
            {/* FAB Trigger Button */}
            <motion.button
                onClick={() => setIsOpen(true)}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.94 }}
                title="AI Symptom Checker"
                className="fixed bottom-8 right-5 z-[990] w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(37,99,235,0.35)] pointer-events-auto"
                style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                    border: '1.5px solid rgba(255,255,255,0.3)',
                }}
            >
                <Sparkles size={22} className="text-white" strokeWidth={2} />
                {/* Aura pulse */}
                <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-blue-500 pointer-events-none" />
            </motion.button>

            {/* Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-[991] bg-slate-900/20 backdrop-blur-[2px]"
                        />

                        {/* Drawer Panel */}
                        <motion.div
                            initial={{ opacity: 0, x: 80, scale: 0.97 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 80, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
                            className="fixed bottom-4 right-4 top-20 z-[992] w-[360px] max-w-[calc(100vw-2rem)] flex flex-col pointer-events-auto"
                            style={{
                                backdropFilter: 'blur(30px) saturate(160%)',
                                WebkitBackdropFilter: 'blur(30px) saturate(160%)',
                                background: 'linear-gradient(145deg, rgba(255,255,255,0.92), rgba(248,250,252,0.88))',
                                border: '1px solid rgba(255,255,255,0.6)',
                                borderRadius: '28px',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.15), inset 0 1px rgba(255,255,255,0.8)',
                            }}
                        >
                            {/* Glass shimmer */}
                            <div className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden">
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    background: 'linear-gradient(120deg, rgba(255,255,255,0.5), rgba(255,255,255,0.0))',
                                    opacity: 0.4
                                }} />
                            </div>

                            {/* Header */}
                            <div className="relative z-10 flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100/60 flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-sm"
                                        style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}>
                                        <Sparkles size={17} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 leading-tight">AI Symptom Checker</h3>
                                        <p className="text-[10px] text-slate-500 font-medium">Not a substitute for medical advice</p>
                                    </div>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X size={16} />
                                </motion.button>
                            </div>

                            {/* Body */}
                            <div className="relative z-10 flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

                                {/* Input Area */}
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                        Describe your symptoms
                                    </label>
                                    <textarea
                                        ref={inputRef}
                                        value={symptoms}
                                        onChange={e => setSymptoms(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAnalyze(); }}
                                        placeholder="e.g. I have a severe headache with dizziness and nausea since yesterday..."
                                        className="w-full bg-white/70 border border-[rgba(26,111,196,0.15)] rounded-2xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[rgba(26,111,196,0.15)] focus:border-[var(--color-primary)] resize-none shadow-sm transition-all"
                                        rows={4}
                                        style={{ backdropFilter: 'blur(10px)' }}
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1 pl-1">Tip: Press Ctrl+Enter to analyze</p>
                                </div>

                                {/* Analyze Button */}
                                <Button
                                    variant="primary"
                                    onClick={handleAnalyze}
                                    disabled={!symptoms.trim() || isAnalyzing}
                                    className="w-full py-3 gap-2 text-sm"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                                            />
                                            Analyzing symptoms...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={15} />
                                            Analyze Symptoms
                                        </>
                                    )}
                                </Button>

                                {/* Result Card */}
                                <AnimatePresence>
                                    {result && !isAnalyzing && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 12, scale: 0.97 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                                            className="flex flex-col gap-3"
                                        >
                                            {/* Specialist Match */}
                                            <div className="bg-blue-50/80 border border-blue-200/60 rounded-3xl p-4">
                                                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">Recommended Specialist</p>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-3xl">{result.icon}</span>
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-base">{result.specialty}</p>
                                                        <p className="text-xs text-slate-500 mt-0.5">{result.tip}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Urgency Badge */}
                                            <div className={`${urgency.bg} border ${urgency.border} rounded-3xl p-4 flex items-center gap-3`}>
                                                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${urgency.dot} ${result.urgency === 'emergency' ? 'animate-ping' : ''}`} />
                                                <div>
                                                    <p className={`text-sm font-bold ${urgency.color}`}>{urgency.label}</p>
                                                    {result.urgency === 'emergency' && (
                                                        <p className="text-xs text-red-600 font-semibold mt-0.5">Emergency: 108 | Ambulance: 102</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Disclaimer */}
                                            <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-3 flex items-start gap-2">
                                                <AlertCircle size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
                                                <p className="text-[10px] text-slate-400 leading-relaxed">
                                                    This is an AI suggestion based on described symptoms, not a medical diagnosis. Always consult a qualified healthcare professional.
                                                </p>
                                            </div>

                                            {/* Reset */}
                                            <button
                                                onClick={handleReset}
                                                className="flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-blue-600 transition-colors py-1"
                                            >
                                                <RotateCcw size={11} />
                                                Check different symptoms
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Empty state hint */}
                                {!result && !isAnalyzing && (
                                    <div className="flex flex-col items-center justify-center py-4 gap-2 text-center">
                                        <Stethoscope size={32} className="text-slate-200" />
                                        <p className="text-xs text-slate-400">
                                            Describe your symptoms above for an AI-powered specialist recommendation.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default AISymptomChecker;
