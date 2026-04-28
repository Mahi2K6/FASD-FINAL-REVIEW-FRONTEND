import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Video, VideoOff, Mic, MicOff, Phone, Clock, FileText,
    Maximize2, Minimize2, User, Stethoscope, X, Send, ChevronRight
} from 'lucide-react';
import { useAppContext } from '../../AppContext';
import { useToast } from '../../components/ui/ToastNotification';
import { useWebRTC } from '../../hooks/useWebRTC';

/* ═══════════════════════════════════════════════════════════════
 *  MedConnect — Premium Video Consultation Room
 *  ─────────────────────────────────────────────────────────────
 *  Real-time doctor ↔ patient video consultation using WebRTC.
 *  Supports webcam preview, live remote video, consultation
 *  timer, prescription notes panel, and call controls.
 * ═══════════════════════════════════════════════════════════════ */

const VideoCall = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const { currentUser, data } = useAppContext();
    const toast = useToast();

    // ── Media State ──
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const [stream, setStream] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const containerRef = useRef(null);

    // ── UI State ──
    const [showNotes, setShowNotes] = useState(false);
    const [notes, setNotes] = useState('');
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef(null);

    // Derive appointment info
    const appointment = (data?.appointments || []).find(
        a => a.id?.toString() === appointmentId || a.appointmentId?.toString() === appointmentId
    );
    const isDoctor = currentUser?.role?.toUpperCase() === 'DOCTOR';
    const remoteName = isDoctor
        ? (appointment?.patientName || appointment?.patient_name || 'Patient')
        : (appointment?.doctorName || appointment?.doctor_name || 'Doctor');

    // ── WebRTC Hook ──
    const { remoteStream, connectionState, remoteUser, cleanup: webrtcCleanup } = useWebRTC({
        roomId: appointmentId,
        userId: currentUser?.id?.toString() || 'anonymous',
        role: isDoctor ? 'doctor' : 'patient',
        localStream: stream,
    });

    // Derived connection states
    const isConnected = connectionState === 'connected';
    const isWaiting = connectionState === 'waiting' || connectionState === 'new';
    const isConnecting = connectionState === 'connecting';
    const hasRemoteVideo = remoteStream && remoteStream.getTracks().some(t => t.kind === 'video' && t.enabled);

    // ── Attach remote stream to video element ──
    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    // ── Init Webcam ──
    const startCamera = useCallback(async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720, facingMode: 'user' },
                audio: true
            });
            setStream(mediaStream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error('Camera access failed:', err);
            toast.error('Camera Error', 'Unable to access camera. Please check permissions.');
        }
    }, [toast]);

    useEffect(() => {
        startCamera();
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Timer — starts when WebRTC connection is established ──
    useEffect(() => {
        if (isConnected && !timerRef.current) {
            timerRef.current = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        }
        if (!isConnected && timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isConnected]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // ── Controls ──
    const toggleCamera = () => {
        if (stream) {
            stream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsCameraOn(prev => !prev);
        }
    };

    const toggleMic = () => {
        if (stream) {
            stream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMicOn(prev => !prev);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen?.();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen?.();
            setIsFullscreen(false);
        }
    };

    const endCall = async () => {
        // Stop local media
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        // Close WebRTC peer + signaling
        webrtcCleanup();
        // Stop timer
        if (timerRef.current) clearInterval(timerRef.current);
        toast.success('Call Ended', `Consultation lasted ${formatTime(elapsedTime)}`);

        if (isDoctor) {
            navigate('/doctor-dashboard/waiting', {
                state: { showPrescription: true, appointmentId }
            });
        } else {
            navigate('/dashboard/appointments', {
                state: { showRating: true, appointmentId }
            });
        }
    };

    // ── Connection Status Badge ──
    const getStatusConfig = () => {
        if (isConnected) return { label: 'Connected', dot: 'bg-emerald-400 animate-pulse', text: 'text-emerald-400' };
        if (isConnecting) return { label: 'Connecting...', dot: 'bg-blue-400 animate-pulse', text: 'text-blue-400' };
        if (connectionState === 'disconnected') return { label: 'Disconnected', dot: 'bg-red-400', text: 'text-red-400' };
        if (connectionState === 'failed') return { label: 'Connection Failed', dot: 'bg-red-500', text: 'text-red-400' };
        return { label: 'Waiting for participant...', dot: 'bg-amber-400 animate-pulse', text: 'text-amber-400' };
    };
    const statusConfig = getStatusConfig();

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[9999] flex flex-col"
            style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}
        >
            {/* ── Header Bar ── */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between px-6 py-3 bg-slate-900/80 backdrop-blur-xl border-b border-white/5"
            >
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Stethoscope size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-sm tracking-tight">MedConnect Consultation</h1>
                        <p className="text-slate-400 text-[11px] font-medium">
                            {appointment ? `APT-${appointmentId?.slice(0, 8)}` : 'Video Consultation'}
                            {appointment?.specialization && ` • ${appointment.specialization}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Connection Status */}
                    <div className="flex items-center gap-2 bg-slate-800/60 px-3.5 py-1.5 rounded-full border border-white/5">
                        <div className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
                        <span className={`text-[11px] font-semibold ${statusConfig.text}`}>{statusConfig.label}</span>
                    </div>

                    {/* Timer */}
                    <div className="flex items-center gap-2 bg-slate-800/60 px-3.5 py-1.5 rounded-full border border-white/5">
                        <Clock size={13} className="text-slate-400" />
                        <span className="text-white font-mono text-xs font-bold tracking-wider">{formatTime(elapsedTime)}</span>
                    </div>

                    {/* Notes Toggle */}
                    {isDoctor && (
                        <button
                            onClick={() => setShowNotes(!showNotes)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                showNotes
                                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                    : 'bg-slate-800/60 text-slate-400 border border-white/5 hover:bg-slate-700/60'
                            }`}
                        >
                            <FileText size={13} />
                            Notes
                        </button>
                    )}
                </div>
            </motion.div>

            {/* ── Video Area ── */}
            <div className="flex-1 flex overflow-hidden">
                <div className={`flex-1 flex ${showNotes ? 'pr-0' : ''} transition-all duration-300`}>
                    <div className="flex-1 relative p-4 flex gap-4">

                        {/* Remote Participant (Large) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex-1 rounded-3xl overflow-hidden bg-slate-800/50 border border-white/5 relative flex items-center justify-center"
                        >
                            {/* Real remote video stream */}
                            {isConnected && hasRemoteVideo ? (
                                <video
                                    ref={remoteVideoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                            ) : isConnected && !hasRemoteVideo ? (
                                /* Connected but remote camera is off */
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center border-2 border-white/10 shadow-2xl">
                                        <User size={48} className="text-slate-300" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-white font-bold text-lg">{isDoctor ? '' : 'Dr. '}{remoteName}</p>
                                        <p className="text-slate-400 text-xs font-medium mt-0.5">Connected • Camera Off</p>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-emerald-400 text-[11px] font-semibold">Live Audio</span>
                                    </div>
                                </div>
                            ) : isConnecting ? (
                                /* Connecting state */
                                <div className="flex flex-col items-center gap-4">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                        className="w-12 h-12 rounded-full border-2 border-slate-600 border-t-blue-400"
                                    />
                                    <p className="text-blue-400 text-sm font-medium">Establishing connection...</p>
                                    <p className="text-slate-500 text-xs">Exchanging media keys</p>
                                </div>
                            ) : connectionState === 'disconnected' ? (
                                /* Disconnected state */
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                        <Phone size={28} className="text-red-400 rotate-[135deg]" />
                                    </div>
                                    <p className="text-red-400 text-sm font-semibold">Participant has left the call</p>
                                    <p className="text-slate-500 text-xs">The consultation has ended</p>
                                </div>
                            ) : (
                                /* Waiting for participant */
                                <div className="flex flex-col items-center gap-5">
                                    {/* Animated waiting rings */}
                                    <div className="relative w-24 h-24 flex items-center justify-center">
                                        <motion.div
                                            animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                                            className="absolute w-24 h-24 rounded-full border-2 border-blue-400/20"
                                        />
                                        <motion.div
                                            animate={{ scale: [1, 1.8, 1.8], opacity: [0.3, 0, 0] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
                                            className="absolute w-24 h-24 rounded-full border border-indigo-400/15"
                                        />
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center">
                                            <User size={28} className="text-blue-300" />
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-white font-bold text-base">Waiting for {isDoctor ? '' : 'Dr. '}{remoteName}</p>
                                        <p className="text-slate-500 text-xs mt-1 font-medium">Share this appointment link to join</p>
                                    </div>
                                    {/* Appointment ID chip */}
                                    <div className="flex items-center gap-2 bg-slate-800/60 px-4 py-2 rounded-full border border-white/5">
                                        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Room</span>
                                        <span className="text-white text-xs font-mono">{appointmentId}</span>
                                    </div>
                                    {/* Loading dots */}
                                    <div className="flex gap-1.5">
                                        {[0, 1, 2].map(i => (
                                            <motion.div
                                                key={i}
                                                animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 1, 0.4] }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
                                                className="w-1.5 h-1.5 rounded-full bg-blue-400/60"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Remote name badge — only show when connected */}
                            {(isConnected || hasRemoteVideo) && (
                                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full">
                                    <User size={12} className="text-white/70" />
                                    <span className="text-white/90 text-[11px] font-semibold">{isDoctor ? '' : 'Dr. '}{remoteName}</span>
                                    {isConnected && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                                </div>
                            )}
                        </motion.div>

                        {/* Local Video (Picture-in-Picture) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, x: 40 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="absolute bottom-8 right-8 w-56 h-40 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl shadow-black/40 bg-slate-900"
                            style={{ zIndex: 20 }}
                        >
                            {isCameraOn ? (
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover mirror"
                                    style={{ transform: 'scaleX(-1)' }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                    <VideoOff size={28} className="text-slate-500" />
                                </div>
                            )}
                            <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full">
                                <span className="text-white/80 text-[10px] font-semibold">You</span>
                                {!isMicOn && <MicOff size={10} className="text-red-400" />}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* ── Prescription Notes Panel (Doctor Only) ── */}
                <AnimatePresence>
                    {showNotes && isDoctor && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 360, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="bg-slate-900/90 backdrop-blur-xl border-l border-white/5 flex flex-col overflow-hidden"
                        >
                            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                                    <FileText size={15} className="text-blue-400" />
                                    Consultation Notes
                                </h3>
                                <button onClick={() => setShowNotes(false)} className="text-slate-500 hover:text-white transition-colors">
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="flex-1 p-4">
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Type consultation notes, symptoms observed, prescriptions to write..."
                                    className="w-full h-full bg-slate-800/60 text-white text-sm rounded-2xl p-4 border border-white/5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 placeholder-slate-500"
                                />
                            </div>

                            <div className="p-4 border-t border-white/5">
                                <button
                                    onClick={() => {
                                        toast.success('Notes Saved', 'Consultation notes saved successfully.');
                                    }}
                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all"
                                >
                                    <Send size={14} />
                                    Save Notes
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Bottom Control Bar ── */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center gap-3 py-5 bg-slate-900/80 backdrop-blur-xl border-t border-white/5"
            >
                {/* Mic Toggle */}
                <button
                    onClick={toggleMic}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isMicOn
                            ? 'bg-slate-700/80 text-white hover:bg-slate-600'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                    }`}
                    title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
                >
                    {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                </button>

                {/* Camera Toggle */}
                <button
                    onClick={toggleCamera}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isCameraOn
                            ? 'bg-slate-700/80 text-white hover:bg-slate-600'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                    }`}
                    title={isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
                >
                    {isCameraOn ? <Video size={20} /> : <VideoOff size={20} />}
                </button>

                {/* End Call */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={endCall}
                    className="w-16 h-12 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all"
                    title="End Call"
                >
                    <Phone size={22} className="rotate-[135deg]" />
                </motion.button>

                {/* Fullscreen */}
                <button
                    onClick={toggleFullscreen}
                    className="w-12 h-12 rounded-full bg-slate-700/80 text-white flex items-center justify-center hover:bg-slate-600 transition-all"
                    title="Toggle Fullscreen"
                >
                    {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
            </motion.div>
        </div>
    );
};

export default VideoCall;
