import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, RefreshCcw, Maximize2, Minimize2, CheckCircle2 } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';

export const VideoConsultation = ({ doctorName, consultationType = "Video Consultation", onEndCall }) => {
    const [stream, setStream] = useState(null);
    const [hasPermission, setHasPermission] = useState(null); // null = requesting, true = granted, false = denied
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(true);
    const [callDuration, setCallDuration] = useState(0);
    const [isConnecting, setIsConnecting] = useState(true);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const videoRef = useRef(null);
    const containerRef = useRef(null);

    // Format timer
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Initialize media
    useEffect(() => {
        let activeStream = null;

        const startCamera = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setStream(mediaStream);
                setHasPermission(true);

                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }

                // Simulate connection delay
                setTimeout(() => {
                    setIsConnecting(false);
                }, 2500);

                activeStream = mediaStream;
            } catch (err) {
                console.error("Error accessing media devices.", err);
                setHasPermission(false);
                setErrorMessage("Camera & microphone access required for consultation");
                setIsConnecting(false);
            }
        };

        startCamera();

        // Cleanup
        return () => {
            if (activeStream) {
                activeStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Timer logic
    useEffect(() => {
        let interval;
        if (!isConnecting && hasPermission) {
            interval = setInterval(() => {
                setCallDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isConnecting, hasPermission]);

    // Handle toggles
    const toggleMic = () => {
        if (stream) {
            stream.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsMicOn(!isMicOn);
        }
    };

    const toggleCam = () => {
        if (stream) {
            stream.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsCamOn(!isCamOn);
        }
    };

    const handleEndCall = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        onEndCall();
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
            setIsFullScreen(true);
        } else {
            document.exitFullscreen();
            setIsFullScreen(false);
        }
    };

    const modalContent = (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xl"
            >
                <motion.div
                    ref={containerRef}
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className={`relative flex flex-col overflow-hidden bg-slate-900 border border-slate-700/50 shadow-2xl rounded-[36px] ${isFullScreen ? 'w-full h-full rounded-none border-none' : 'w-full max-w-5xl aspect-video max-h-[90vh]'
                        }`}
                >
                    {/* TOP BAR */}
                    <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 sm:px-6 bg-gradient-to-b from-slate-900/90 to-transparent pointer-events-none">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700 shadow-md">
                                    <span className="text-white font-bold">{doctorName?.charAt(0) || 'D'}</span>
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 bg-emerald-500"></div>
                            </div>
                            <div>
                                <h3 className="text-white font-semibold flex items-center gap-2 pointer-events-auto shadow-sm">
                                    Dr. {doctorName}
                                </h3>
                                <p className="text-slate-300 text-xs font-medium flex items-center gap-1.5 shadow-sm">
                                    {isConnecting ? 'Connecting...' : consultationType}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1.5 rounded-full bg-slate-800/80 backdrop-blur border border-slate-700 pointer-events-auto">
                                <span className={`font-mono font-medium ${isConnecting ? 'text-slate-400' : 'text-emerald-400'} text-sm`}>
                                    {isConnecting ? '00:00' : formatTime(callDuration)}
                                </span>
                            </div>
                            <button
                                onClick={toggleFullScreen}
                                className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 backdrop-blur border border-slate-700 text-slate-300 hover:text-white transition-colors pointer-events-auto"
                            >
                                {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* MAIN VIDEO AREA */}
                    <div className="flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden">

                        {/* Connecting State */}
                        {isConnecting && !errorMessage && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-sm">
                                <div className="relative w-24 h-24 mb-6">
                                    <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full animate-ping"></div>
                                    <div className="absolute inset-2 border-4 border-blue-400/50 rounded-full animate-pulse"></div>
                                    <div className="absolute inset-4 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                                        <VideoIcon className="text-white" size={24} />
                                    </div>
                                </div>
                                <h3 className="text-xl font-medium text-white mb-2">Connecting to secure consultation...</h3>
                                <p className="text-slate-400 text-sm">Please allow camera and microphone access</p>
                            </div>
                        )}

                        {/* Permission Denied Error */}
                        {errorMessage && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/95 p-6">
                                <GlassCard className="max-w-md w-full p-8 text-center bg-red-500/10 border-red-500/20 rounded-[32px]">
                                    <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto mb-4">
                                        <VideoOff size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Access Denied</h3>
                                    <p className="text-red-200 mb-6">{errorMessage}</p>
                                    <GlassButton onClick={handleEndCall} className="w-full bg-slate-800 text-white hover:bg-slate-700 border-slate-700 rounded-full py-3">
                                        Return to Dashboard
                                    </GlassButton>
                                </GlassCard>
                            </div>
                        )}

                        {/* Self / Doctor Video Streams */}
                        <div className="w-full h-full relative">
                            {/* In a real app, the remote doctor's video would be full screen here */}
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                                {!isConnecting && hasPermission ? (
                                    <div className="text-center">
                                        <div className="w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-6 shadow-2xl relative">
                                            <span className="text-6xl text-slate-600 font-bold">{doctorName?.charAt(0) || 'D'}</span>
                                            {/* Doctor Audio indicator */}
                                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center border-4 border-slate-900">
                                                <MicOff size={12} className="text-slate-400" />
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-semibold text-slate-300">Dr. {doctorName} is joining...</h3>
                                        <p className="text-slate-500 mt-2">Waiting for doctor to connect their camera</p>
                                    </div>
                                ) : null}
                            </div>

                            {/* Self View (PiP) */}
                            <motion.div
                                drag
                                dragConstraints={containerRef}
                                dragElastic={0.1}
                                dragMomentum={false}
                                className={`absolute bottom-24 right-6 w-32 sm:w-48 aspect-[3/4] sm:aspect-video bg-slate-800 rounded-2xl overflow-hidden border-2 border-slate-700/80 shadow-2xl z-20 transition-all duration-300 cursor-move ${isConnecting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                            >
                                {/* Live Camera Feed */}
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className={`w-full h-full object-cover transform scale-x-[-1] ${!isCamOn ? 'hidden' : ''}`}
                                />

                                {/* Fallback when self cam is off */}
                                {!isCamOn && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                                        <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                                            <span className="text-slate-400 font-bold">You</span>
                                        </div>
                                    </div>
                                )}

                                {/* Self status badges */}
                                <div className="absolute bottom-2 left-2 flex gap-1">
                                    {!isMicOn && (
                                        <div className="w-6 h-6 rounded-full bg-red-500/80 backdrop-blur flex items-center justify-center shadow-lg">
                                            <MicOff size={10} className="text-white" />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* BOTTOM CONTROLS */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 sm:gap-4 p-2 sm:p-3 bg-slate-800/60 backdrop-blur-2xl border border-slate-700/50 rounded-full shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]">
                        <TippyTooltip content={isMicOn ? "Turn off mic" : "Turn on mic"}>
                            <button
                                onClick={toggleMic}
                                disabled={isConnecting}
                                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all ${isMicOn
                                        ? 'bg-slate-700/80 hover:bg-slate-600 text-white'
                                        : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
                                    } ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                            </button>
                        </TippyTooltip>

                        <TippyTooltip content={isCamOn ? "Turn off camera" : "Turn on camera"}>
                            <button
                                onClick={toggleCam}
                                disabled={isConnecting}
                                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all ${isCamOn
                                        ? 'bg-slate-700/80 hover:bg-slate-600 text-white'
                                        : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
                                    } ${isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isCamOn ? <VideoIcon size={20} /> : <VideoOff size={20} />}
                            </button>
                        </TippyTooltip>

                        <div className="w-px h-8 bg-slate-700/50 mx-1 sm:mx-2"></div>

                        <TippyTooltip content="End Call">
                            <button
                                onClick={handleEndCall}
                                className="px-6 sm:px-8 h-12 sm:h-14 rounded-full bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 text-white flex items-center justify-center gap-2 transition-transform transform hover:scale-105 active:scale-95 font-semibold"
                            >
                                <PhoneOff size={20} />
                                <span className="hidden sm:inline">End Call</span>
                            </button>
                        </TippyTooltip>
                    </div>

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );

    // Render using portal to escape dashboard constraining layouts
    if (typeof document !== 'undefined') {
        return ReactDOM.createPortal(modalContent, document.body);
    }
    return null;
};

// Simple internal tooltip wrapper to avoid adding new deps easily
const TippyTooltip = ({ children, content }) => {
    const [show, setShow] = useState(false);
    return (
        <div
            className="relative flex items-center justify-center"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {children}
            <AnimatePresence>
                {show && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute -top-10 px-3 py-1.5 bg-slate-900 border border-slate-700 text-xs text-white rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none"
                    >
                        {content}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-b border-r border-slate-700 transform rotate-45"></div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
