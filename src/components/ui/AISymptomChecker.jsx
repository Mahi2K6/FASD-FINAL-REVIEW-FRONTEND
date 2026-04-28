import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Stethoscope, AlertCircle, CheckCircle2, ChevronRight, Sparkles, Send, RotateCcw, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import Input from './Input';
import API from '../../api';
import { useAppContext } from '../../AppContext';

const GEMINI_API_KEY = 'AIzaSyA_3uZnpA-g7s9BKdA-lpxmUHvTw0LxeVg';

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

/* ─── FAB Geometry (fixed viewport-anchored) ─── */
const FAB_RIGHT = 32;
const FAB_BOTTOM = 120;
const FAB_SIZE = 56;
const PANEL_RADIUS = 32;

function findNearestAvailableSlot(doctors, specialization) {
    const now = new Date();
    let bestMatch = null;

    doctors
        .filter(d => d.specialization?.toLowerCase() === specialization?.toLowerCase())
        .forEach(doctor => {
            if (!doctor.availability || doctor.availability.length === 0) return;

            doctor.availability.forEach(slot => {
                const slotDateTime = new Date(`${slot.date}T${slot.time}:00`);

                if (slotDateTime > now) {
                    if (!bestMatch || slotDateTime < bestMatch.slotDateTime) {
                        bestMatch = {
                            doctor,
                            slot,
                            slotDateTime
                        };
                    }
                }
            });
        });

    return bestMatch;
}

// ─────────────────────────────────────────────
// AI Symptom Checker Component
// ─────────────────────────────────────────────
const AISymptomChecker = () => {
    const { data } = useAppContext();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState('symptom'); // 'symptom' | 'agent'
    
    // Symptom Mode State
    const [symptoms, setSymptoms] = useState('');
    const [result, setResult] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState(null);
    const inputRef = useRef(null);
    const scrollRef = useRef(null);
    const isAnalyzingRef = useRef(false);

    // Agent Mode State
    const [agentRequest, setAgentRequest] = useState('');
    const [agentResult, setAgentResult] = useState(null);
    const [isAgentAnalyzing, setIsAgentAnalyzing] = useState(false);
    const [agentError, setAgentError] = useState(null);
    const isAgentAnalyzingRef = useRef(false);

    // Auto-scroll helper
    const scrollToBottom = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, []);

    useEffect(() => {
        if (result || agentResult || isAnalyzing || isAgentAnalyzing) {
            // Use requestAnimationFrame to ensure DOM has updated
            requestAnimationFrame(() => {
                setTimeout(scrollToBottom, 50);
            });
        }
    }, [result, agentResult, isAnalyzing, isAgentAnalyzing, scrollToBottom]);

    // Timeout helper
    const fetchWithTimeout = async (resource, options = {}) => {
        const { timeout = 10000 } = options;
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal  
        });
        clearTimeout(id);
        return response;
    };

    // Listen for custom event from AIHealthAssistant to open the checker
    React.useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-symptom-checker', handleOpen);
        return () => window.removeEventListener('open-symptom-checker', handleOpen);
    }, []);

    const handleAnalyze = async () => {
        if (!symptoms.trim() || isAnalyzingRef.current) return;
        isAnalyzingRef.current = true;
        setIsAnalyzing(true);
        setResult(null);
        setError(null);
        
        // Rule-based fallback — always produces a valid result
        const ruleBasedResult = analyzeSymptoms(symptoms);

        try {
            // Direct Gemini Integration since Backend is currently unavailable
            const prompt = `
            You are a healthcare triage assistant.
            Analyze patient symptoms: ${symptoms}
            Return ONLY valid JSON.
            Format:
            {
              "conditions": ["condition1", "condition2"],
              "specialty": "Specialty Name",
              "urgency": "Low|Moderate|Urgent|Emergency",
              "summary": "Short explanation"
            }
            Rules:
            - Keep response concise
            - Suggest likely non-diagnostic conditions
            - Recommend one medical specialty (e.g. Cardiologist, General Physician, Neurologist, Orthopedist)
            - Include urgency level
            - Never claim final diagnosis
            `;

            const response = await fetchWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
                timeout: 10000 // 10s timeout
            });

            if (!response.ok) {
                throw new Error('Gemini API returned non-OK status');
            }

            const jsonResponse = await response.json();
            
            // Safe optional chaining — never crash on missing fields
            const rawText = jsonResponse?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!rawText) {
                throw new Error('Empty AI response');
            }

            // Robust regex to extract JSON from any markdown code blocks
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in AI response');
            }

            // Safe JSON parse
            let aiData;
            try {
                aiData = JSON.parse(jsonMatch[0]);
            } catch (parseErr) {
                console.warn('JSON parse failed, falling back to rule engine:', parseErr.message);
                throw new Error('JSON parse failed');
            }

            // Normalize AI response with safe defaults
            const normalizedResult = {
                conditions: Array.isArray(aiData?.conditions) ? aiData.conditions : [],
                specialty: aiData?.specialty || ruleBasedResult?.specialty || 'General Physician',
                urgency: aiData?.urgency || ruleBasedResult?.urgency || 'routine',
                summary: aiData?.summary || ruleBasedResult?.tip || 'Based on your symptoms, we recommend consulting a specialist.',
                reasoning: aiData?.reasoning || null,
                confidence: aiData?.confidence || null,
            };

            // Cross-reference with AppContext doctors safely
            const requiredSpecialty = normalizedResult.specialty;
            const matchingDoctors = (data?.users || [])
                .filter(u => u.role === 'DOCTOR' && u.specialization?.toLowerCase()?.includes(requiredSpecialty.toLowerCase()))
                .slice(0, 5);

            normalizedResult.recommendedDoctors = matchingDoctors;
            setResult(normalizedResult);

        } catch (err) {
            console.warn('AI Analysis failed, using rule-based engine:', err.message);
            
            // NEVER show generic red error — always produce a valid medical result
            if (ruleBasedResult) {
                const fallbackSpecialty = ruleBasedResult.specialty || 'General Physician';
                const matchingDoctors = (data?.users || [])
                    .filter(u => u.role === 'DOCTOR' && u.specialization?.toLowerCase()?.includes(fallbackSpecialty.toLowerCase()))
                    .slice(0, 5);

                setResult({
                    conditions: [],
                    specialty: fallbackSpecialty,
                    urgency: ruleBasedResult.urgency || 'routine',
                    summary: `${ruleBasedResult.tip || 'Based on your symptoms, a specialist consultation is recommended.'} (Analysis powered by MedConnect symptom engine)`,
                    recommendedDoctors: matchingDoctors,
                });
            } else {
                // Ultimate fallback — General Physician recommendation
                setResult({
                    conditions: [],
                    specialty: 'General Physician',
                    urgency: 'routine',
                    summary: 'We recommend consulting a General Physician for an initial evaluation of your symptoms. (Analysis powered by MedConnect symptom engine)',
                    recommendedDoctors: (data?.users || [])
                        .filter(u => u.role === 'DOCTOR')
                        .slice(0, 3),
                });
            }
        } finally {
            setIsAnalyzing(false);
            isAnalyzingRef.current = false;
        }
    };

    const handleReset = () => {
        setSymptoms('');
        setResult(null);
        setError(null);
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    // Normalize AI urgency values to URGENCY_CONFIG keys
    const normalizeUrgency = (raw) => {
        if (!raw) return 'routine';
        const lower = raw.toLowerCase();
        if (lower === 'emergency') return 'emergency';
        if (lower === 'urgent' || lower === 'high') return 'urgent';
        return 'routine'; // covers 'low', 'moderate', 'routine', and any unknown value
    };
    const urgency = result?.urgency ? URGENCY_CONFIG[normalizeUrgency(result.urgency)] : null;

    // ─────────────────────────────────────────────
    // Agent Mode Logic
    // ─────────────────────────────────────────────
    const handleAgentAnalyze = async () => {
        if (!agentRequest.trim() || isAgentAnalyzingRef.current) return;
        isAgentAnalyzingRef.current = true;
        setIsAgentAnalyzing(true);
        setAgentResult(null);
        setAgentError(null);

        // Rule-based fallback for specialty detection
        const ruleBasedResult = analyzeSymptoms(agentRequest);
        const fallbackSpecialty = ruleBasedResult?.specialty || 'General Physician';
        
        // Helper: build a draft appointment from a specialty string
        const buildFallbackBooking = (specialty, reason) => {
            let searchSpecialty = specialty;
            if (searchSpecialty.toLowerCase().includes('general') || searchSpecialty.toLowerCase().includes('physician')) {
                searchSpecialty = 'General';
            }
            const bestMatch = findNearestAvailableSlot(data?.users || [], searchSpecialty);
            if (bestMatch) {
                const { doctor: bestDoctor, slot: firstAvailableSlot } = bestMatch;
                const suggestedSlot = `${firstAvailableSlot.date} • ${firstAvailableSlot.time}`;
                setAgentResult({
                    intent: 'book_appointment',
                    reasoning: reason,
                    specialty: specialty,
                    symptom: agentRequest,
                    draftAppointment: {
                        id: 'APT-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
                        doctorId: bestDoctor.id,
                        doctorName: bestDoctor.name,
                        specialization: bestDoctor.specialization,
                        selectedDate: firstAvailableSlot.date,
                        selectedTime: firstAvailableSlot.time,
                        slotId: firstAvailableSlot.id,
                        status: 'PENDING_PAYMENT',
                        slot: suggestedSlot,
                        doctor: bestDoctor
                    }
                });
                return true;
            }
            return false;
        };

        try {
            const prompt = `
            You are a healthcare triage booking assistant.
            User request: "${agentRequest}"
            
            Extract the intent and symptoms.
            Return ONLY valid JSON.
            Format:
            {
              "symptom": "extracted symptom or condition",
              "intent": "book_appointment",
              "priority": "fastest|highest_rated|normal",
              "specialty": "Specialty Name",
              "reasoning": "Why this specialty and priority was chosen"
            }
            Rules:
            - Recommend one specific medical specialty (e.g. Cardiologist, General Physician, Neurologist, Orthopedist)
            - Keep reasoning concise
            `;

            const response = await fetchWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
                timeout: 10000
            });

            if (!response.ok) {
                throw new Error('Gemini API returned non-OK status');
            }

            const jsonResponse = await response.json();
            
            // Safe optional chaining — never crash on missing fields
            const rawText = jsonResponse?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!rawText) throw new Error('Empty AI response');

            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('No JSON in AI response');

            // Safe JSON parse
            let aiData;
            try {
                aiData = JSON.parse(jsonMatch[0]);
            } catch (parseErr) {
                console.warn('Agent JSON parse failed:', parseErr.message);
                throw new Error('JSON parse failed');
            }

            // Safe defaults for AI data
            aiData.specialty = aiData?.specialty || fallbackSpecialty;
            aiData.reasoning = aiData?.reasoning || 'Based on your symptoms, this specialist is recommended.';
            aiData.symptom = aiData?.symptom || agentRequest;
            aiData.intent = aiData?.intent || 'book_appointment';

            let requiredSpecialty = aiData.specialty;
            if (requiredSpecialty.toLowerCase().includes('general') || requiredSpecialty.toLowerCase().includes('physician')) {
                requiredSpecialty = 'General';
            }
            
            const bestMatch = findNearestAvailableSlot(data?.users || [], requiredSpecialty);
            
            if (!bestMatch) {
                // Try fallback specialty if AI's specialty has no slots
                if (!buildFallbackBooking(fallbackSpecialty, `No ${aiData.specialty} slots available. Recommending ${fallbackSpecialty} instead.`)) {
                    setAgentError("No future appointments available right now. Please try booking manually.");
                }
                return;
            }

            const { doctor: bestDoctor, slot: firstAvailableSlot } = bestMatch;
            const suggestedSlot = `${firstAvailableSlot.date} • ${firstAvailableSlot.time}`;

            const draftAppointment = {
                id: 'APT-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
                doctorId: bestDoctor.id,
                doctorName: bestDoctor.name,
                specialization: bestDoctor.specialization,
                selectedDate: firstAvailableSlot.date,
                selectedTime: firstAvailableSlot.time,
                slotId: firstAvailableSlot.id,
                status: 'PENDING_PAYMENT',
                slot: suggestedSlot,
                doctor: bestDoctor
            };

            setAgentResult({ ...aiData, draftAppointment });
        } catch (err) {
            console.warn('Agent failed, using rule-based fallback:', err.message);
            
            // NEVER show generic error — always try to produce a booking
            const reason = `${ruleBasedResult?.tip || 'Based on your symptoms, a specialist consultation is recommended.'} (Powered by MedConnect symptom engine)`;
            if (!buildFallbackBooking(fallbackSpecialty, reason)) {
                setAgentError("No future appointments available right now. Please try booking manually from Find Doctors.");
            }
        } finally {
            setIsAgentAnalyzing(false);
            isAgentAnalyzingRef.current = false;
        }
    };

    const handleAgentReset = () => {
        setAgentRequest('');
        setAgentResult(null);
        setAgentError(null);
    };

    const handleCheckout = () => {
        if (agentResult?.draftAppointment?.id) {
            setIsOpen(false);
            navigate("/checkout", {
                state: {
                    doctor: agentResult.draftAppointment.doctor,
                    appointment: agentResult.draftAppointment
                }
            });
        }
    };

    return ReactDOM.createPortal(
        <>
            {/* ═══ Panel — expands from FAB origin ═══ */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-[9998] bg-slate-900/15 backdrop-blur-[3px]"
                        />

                        {/* Panel — origin-aware expansion from bottom-right */}
                        <motion.div
                            initial={{ 
                                opacity: 0, 
                                scale: 0.4, 
                                y: 60, 
                                x: 40,
                                filter: 'blur(8px)',
                                transformOrigin: 'bottom right' 
                            }}
                            animate={{ 
                                opacity: 1, 
                                scale: 1, 
                                y: 0, 
                                x: 0,
                                filter: 'blur(0px)',
                                transformOrigin: 'bottom right' 
                            }}
                            exit={{ 
                                opacity: 0, 
                                scale: 0.5, 
                                y: 40, 
                                x: 30,
                                filter: 'blur(6px)',
                                transformOrigin: 'bottom right' 
                            }}
                            transition={{ type: 'spring', stiffness: 380, damping: 32, mass: 0.7 }}
                            className="fixed z-[9999] flex flex-col pointer-events-auto"
                            style={{
                                bottom: 110,
                                right: FAB_RIGHT,
                                width: 420,
                                height: 720,
                                maxHeight: '80vh',
                                maxWidth: '90vw',
                                borderRadius: PANEL_RADIUS,
                                backdropFilter: 'blur(40px) saturate(170%)',
                                WebkitBackdropFilter: 'blur(40px) saturate(170%)',
                                background: 'linear-gradient(145deg, rgba(255,255,255,0.94), rgba(248,250,252,0.90))',
                                border: '1px solid rgba(255,255,255,0.65)',
                                boxShadow: '0 24px 80px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
                            }}
                        >
                            {/* Inner glass shimmer */}
                            <div 
                                className="absolute inset-0 pointer-events-none overflow-hidden"
                                style={{ borderRadius: PANEL_RADIUS }}
                            >
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    background: 'linear-gradient(120deg, rgba(255,255,255,0.5), rgba(255,255,255,0.0))',
                                    opacity: 0.35
                                }} />
                            </div>

                            {/* Header */}
                            <div className="relative z-10 flex flex-col px-6 pt-5 pb-4 border-b border-slate-100/50 flex-shrink-0 gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
                                            style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}>
                                            <Sparkles size={16} className="text-white" />
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-800 leading-tight">MedConnect AI</h3>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                        onClick={() => setIsOpen(false)}
                                        className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        <X size={16} />
                                    </motion.button>
                                </div>
                                
                                {/* Segmented Tabs */}
                                <div className="flex p-1 bg-slate-100/80 rounded-xl">
                                    <button
                                        onClick={() => setMode('symptom')}
                                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${mode === 'symptom' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Symptom Checker
                                    </button>
                                    <button
                                        onClick={() => setMode('agent')}
                                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${mode === 'agent' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        AI Agent
                                    </button>
                                </div>
                            </div>

                            {/* Body */}
                            <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4 hide-scrollbar scroll-smooth">
                                <AnimatePresence mode="wait">
                                {mode === 'symptom' ? (
                                    <motion.div layout key="symptom" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-col gap-4">
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
                                        className="w-full bg-white/70 border border-slate-200/60 rounded-2xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[rgba(26,111,196,0.12)] focus:border-[var(--color-primary)] resize-none shadow-sm transition-all"
                                        rows={4}
                                        style={{ backdropFilter: 'blur(10px)' }}
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1.5 pl-1">Tip: Press ⌘+Enter to analyze</p>
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
                                    {isAnalyzing && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="flex flex-col gap-4 mt-2"
                                        >
                                            <div className="flex items-center justify-center gap-3 py-4">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                                                <p className="text-sm font-semibold text-blue-600 animate-pulse">AI is analyzing symptoms...</p>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="h-20 bg-slate-100/60 rounded-2xl animate-pulse"></div>
                                                <div className="h-16 bg-slate-100/60 rounded-2xl animate-pulse"></div>
                                                <div className="h-24 bg-slate-100/60 rounded-2xl animate-pulse"></div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {error && !isAnalyzing && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center mt-2"
                                        >
                                            <AlertCircle size={24} className="text-red-400 mx-auto mb-2" />
                                            <p className="text-sm text-red-600 font-medium">{error}</p>
                                            <button onClick={handleReset} className="mt-3 text-xs text-slate-500 hover:text-slate-700 underline">Try again</button>
                                        </motion.div>
                                    )}

                                    {result && !isAnalyzing && (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: 12, height: 0 }}
                                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                                            className="flex flex-col gap-4 mt-2"
                                        >
                                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Symptom Analysis</h4>
                                            </div>

                                            {/* Conditions */}
                                            {result.conditions && result.conditions.length > 0 && (
                                                <div className="bg-slate-50/80 border border-slate-200/50 rounded-2xl p-4">
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Possible Conditions</p>
                                                    <ul className="space-y-1">
                                                        {result.conditions.map((cond, idx) => (
                                                            <li key={idx} className="text-sm text-slate-700 font-medium flex items-center gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> {cond}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-3">
                                                {/* Recommended Specialty */}
                                                <div className="bg-blue-50/80 border border-blue-200/50 rounded-2xl p-4">
                                                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1.5">Recommended Specialty</p>
                                                    <p className="font-bold text-slate-800 text-sm">{result.specialty}</p>
                                                </div>

                                                {/* Urgency Badge */}
                                                <div className={`${urgency?.bg || 'bg-slate-50'} border ${urgency?.border || 'border-slate-200'} rounded-2xl p-4 flex flex-col justify-center`}>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Urgency Level</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${urgency?.dot || 'bg-slate-400'} ${result.urgency?.toLowerCase() === 'emergency' ? 'animate-ping' : ''}`} />
                                                        <p className={`text-sm font-bold ${urgency?.color || 'text-slate-700'}`}>{urgency?.label || result.urgency}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* AI Summary */}
                                            {result.summary && (
                                                <p className="text-xs text-slate-600 leading-relaxed px-1">{result.summary}</p>
                                            )}

                                            {/* Recommended Doctors */}
                                            {result.recommendedDoctors && result.recommendedDoctors.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Recommended Doctors</p>
                                                    <div className="flex flex-col gap-2">
                                                        {result.recommendedDoctors.map(doc => (
                                                            <div key={doc.id} className="flex items-center justify-between p-3 bg-white border border-slate-200/60 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-blue-600 text-sm overflow-hidden">
                                                                        {doc.profile_picture ? <img src={doc.profile_picture} alt={doc.name} className="w-full h-full object-cover" /> : doc.name.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold text-slate-800 text-sm">Dr. {doc.name}</p>
                                                                        <p className="text-xs text-slate-500">{doc.specialization} • {doc.experience} yrs</p>
                                                                    </div>
                                                                </div>
                                                                <ChevronRight size={16} className="text-slate-300" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Disclaimer */}
                                            <div className="bg-slate-50/80 border border-slate-200/50 rounded-xl p-3 flex items-start gap-2 mt-2">
                                                <AlertCircle size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
                                                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                                                    AI suggestions are informational only and not a medical diagnosis. Always consult a qualified healthcare professional.
                                                </p>
                                            </div>

                                        {/* Reset */}
                                        <button
                                            onClick={handleReset}
                                            className="flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-blue-600 transition-colors py-2 mt-1"
                                        >
                                            <RotateCcw size={11} />
                                            Check different symptoms
                                        </button>
                                    </motion.div>
                                )}
                                </AnimatePresence>

                                {/* Empty state hint */}
                                {!result && !isAnalyzing && (
                                    <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
                                        <Stethoscope size={32} className="text-slate-200" />
                                        <p className="text-xs text-slate-400">
                                            Describe your symptoms above for an AI-powered specialist recommendation.
                                        </p>
                                    </div>
                                )}
                                </motion.div>
                                ) : (
                                    <motion.div layout key="agent" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
                                                Describe what you want AI to do...
                                            </label>
                                            <div className="relative">
                                                <textarea
                                                    placeholder="Example: Book fastest fever appointment, Find best neurologist tomorrow..."
                                                    className="w-full bg-white/70 border border-slate-200/60 rounded-2xl p-4 text-[13px] text-slate-700 placeholder:text-slate-400/60 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 resize-none"
                                                    rows={3}
                                                    value={agentRequest}
                                                    onChange={e => setAgentRequest(e.target.value)}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                                            handleAgentAnalyze();
                                                        }
                                                    }}
                                                />
                                            </div>

                                            <Button
                                                onClick={handleAgentAnalyze}
                                                disabled={!agentRequest.trim() || isAgentAnalyzing}
                                                className="w-full h-[46px] rounded-xl flex items-center justify-center gap-2 mt-1"
                                                variant="primary"
                                            >
                                                {isAgentAnalyzing ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        Processing request...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Bot size={16} />
                                                        Execute AI Action
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        <AnimatePresence>
                                            {isAgentAnalyzing && (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-4 mt-2">
                                                    <div className="flex items-center justify-center gap-3 py-4">
                                                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                                                        <p className="text-sm font-semibold text-blue-600 animate-pulse">AI Agent is taking action...</p>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div className="h-16 bg-slate-100/60 rounded-2xl animate-pulse"></div>
                                                        <div className="h-24 bg-slate-100/60 rounded-2xl animate-pulse"></div>
                                                        <div className="h-12 bg-slate-100/60 rounded-2xl animate-pulse"></div>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {agentError && !isAgentAnalyzing && (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center mt-2">
                                                    <AlertCircle size={24} className="text-red-400 mx-auto mb-2" />
                                                    <p className="text-sm text-red-600 font-medium">{agentError}</p>
                                                    <button onClick={handleAgentReset} className="mt-3 text-xs text-slate-500 hover:text-slate-700 underline">Try again</button>
                                                </motion.div>
                                            )}

                                            {agentResult && !isAgentAnalyzing && (
                                                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 mt-2">
                                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Action Result</h4>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        {/* Intent Section */}
                                                        <div className="bg-purple-50/80 border border-purple-200/50 rounded-2xl p-4">
                                                            <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-1.5">Intent Detected</p>
                                                            <p className="font-bold text-slate-800 text-sm capitalize">{(agentResult.intent || 'book appointment').replace('_', ' ')}</p>
                                                        </div>

                                                        {/* Slot Section */}
                                                        <div className="bg-amber-50/80 border border-amber-200/50 rounded-2xl p-4">
                                                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1.5">Suggested Slot</p>
                                                            <p className="font-bold text-slate-800 text-sm">{agentResult.draftAppointment?.slot}</p>
                                                        </div>
                                                    </div>

                                                    {/* Recommended Doctor */}
                                                    <div className="mt-1">
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">AI Selected Doctor</p>
                                                        <div className="flex items-center justify-between p-3 bg-white border border-blue-200/60 rounded-xl shadow-[0_4px_20px_rgba(37,99,235,0.06)]">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 text-sm">
                                                                    {agentResult.draftAppointment?.doctor?.name?.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-slate-800 text-sm">Dr. {agentResult.draftAppointment?.doctor?.name}</p>
                                                                    <p className="text-xs text-slate-500">{agentResult.draftAppointment?.doctor?.specialization} • {agentResult.draftAppointment?.doctor?.rating || '4.8'} ⭐</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Reasoning */}
                                                    {agentResult.reasoning && (
                                                        <div className="bg-slate-50/80 border border-slate-200/50 rounded-2xl p-4 mt-1">
                                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">AI Reasoning</p>
                                                            <p className="text-xs text-slate-600 leading-relaxed">{agentResult.reasoning}</p>
                                                        </div>
                                                    )}

                                                    {/* Continue Button */}
                                                    <div className="mt-2 text-center flex flex-col gap-2">
                                                        <p className="text-xs font-semibold text-blue-600">AI prepared your appointment.</p>
                                                        <Button onClick={handleCheckout} className="w-full h-[46px] rounded-xl flex items-center justify-center gap-2 shadow-md">
                                                            Continue to Checkout
                                                            <ChevronRight size={16} />
                                                        </Button>
                                                        
                                                        <button onClick={handleAgentReset} className="mt-2 text-[11px] text-slate-400 hover:text-slate-600 transition-colors">
                                                            Cancel & Start Over
                                                        </button>
                                                    </div>

                                                    <div className="bg-slate-50/80 border border-slate-200/50 rounded-xl p-3 flex items-start gap-2 mt-2">
                                                        <AlertCircle size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
                                                        <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                                                            AI selected appointment suggestions based on availability and relevance. No payment has been processed yet.
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {!agentResult && !isAgentAnalyzing && (
                                            <div className="flex flex-col items-center justify-center py-6 gap-2 text-center mt-4">
                                                <Bot size={32} className="text-slate-200" />
                                                <p className="text-xs text-slate-400 px-4">
                                                    Ask the AI Agent to book a doctor, find the fastest slot, or schedule a specialist.
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    , document.body);
};

export default AISymptomChecker;
