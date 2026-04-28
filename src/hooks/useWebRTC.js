import { useEffect, useRef, useState, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════════════
 *  useWebRTC — WebRTC Peer Connection Hook (Local Signaling)
 *  ─────────────────────────────────────────────────────────────
 *  Manages the full WebRTC lifecycle using BroadcastChannel
 *  for local cross-tab signaling (no backend required):
 *    1. BroadcastChannel creation
 *    2. RTCPeerConnection creation
 *    3. Local media track attachment
 *    4. SDP offer/answer exchange
 *    5. ICE candidate relay
 *    6. Remote stream reception
 *    7. Cleanup on unmount or call end
 * ═══════════════════════════════════════════════════════════════ */

// Free STUN servers for NAT traversal
const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
    ],
};

export const useWebRTC = ({ roomId, userId, role, localStream }) => {
    const [remoteStream, setRemoteStream] = useState(null);
    const [connectionState, setConnectionState] = useState('new');
    // 'new' | 'connecting' | 'connected' | 'disconnected' | 'waiting' | 'failed'
    const [remoteUser, setRemoteUser] = useState(null);

    const channelRef = useRef(null);
    const peerRef = useRef(null);
    const remoteStreamRef = useRef(new MediaStream());
    const isNegotiatingRef = useRef(false);
    const hasJoinedRef = useRef(false);

    // ── Helper to emit over BroadcastChannel ──
    const emit = useCallback((event, data) => {
        if (channelRef.current) {
            channelRef.current.postMessage({ event, data });
        }
    }, []);

    // ── Create Peer Connection ──
    const createPeerConnection = useCallback(() => {
        if (peerRef.current) {
            peerRef.current.close();
        }

        const pc = new RTCPeerConnection(ICE_SERVERS);

        // Add local tracks to the peer connection
        if (localStream) {
            localStream.getTracks().forEach(track => {
                pc.addTrack(track, localStream);
            });
        }

        // Receive remote tracks
        pc.ontrack = (event) => {
            event.streams[0].getTracks().forEach(track => {
                // Prevent duplicate tracks
                if (!remoteStreamRef.current.getTracks().find(t => t.id === track.id)) {
                    remoteStreamRef.current.addTrack(track);
                }
            });
            // Force state update by creating a new MediaStream reference with the same tracks
            setRemoteStream(new MediaStream(remoteStreamRef.current.getTracks()));
        };

        // Send ICE candidates to the signaling server
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                emit('ice-candidate', {
                    roomId,
                    candidate: event.candidate,
                });
            }
        };

        // Track connection state changes
        pc.onconnectionstatechange = () => {
            const state = pc.connectionState;
            console.log(`[WebRTC] Connection state: ${state}`);
            if (state === 'connected') {
                setConnectionState('connected');
            } else if (state === 'disconnected' || state === 'closed') {
                setConnectionState('disconnected');
            } else if (state === 'failed') {
                setConnectionState('failed');
            } else if (state === 'connecting') {
                setConnectionState('connecting');
            }
        };

        pc.oniceconnectionstatechange = () => {
            console.log(`[WebRTC] ICE state: ${pc.iceConnectionState}`);
            if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
                setConnectionState('connected');
            }
        };

        pc.onnegotiationneeded = async () => {
            // Prevent multiple simultaneous negotiations
            if (isNegotiatingRef.current) return;
            isNegotiatingRef.current = true;
        };

        peerRef.current = pc;
        return pc;
    }, [localStream, roomId, emit]);

    // ── Create and Send Offer ──
    const createOffer = useCallback(async () => {
        const pc = peerRef.current;
        if (!pc) return;

        try {
            setConnectionState('connecting');
            const offer = await pc.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
            });
            await pc.setLocalDescription(offer);
            emit('offer', {
                roomId,
                sdp: pc.localDescription,
            });
            console.log('[WebRTC] Offer sent');
        } catch (err) {
            console.error('[WebRTC] Failed to create offer:', err);
            setConnectionState('failed');
        }
    }, [roomId, emit]);

    // ── Handle Incoming Offer → Create Answer ──
    const handleOffer = useCallback(async ({ sdp }) => {
        const pc = peerRef.current;
        if (!pc) return;

        try {
            setConnectionState('connecting');
            await pc.setRemoteDescription(new RTCSessionDescription(sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            emit('answer', {
                roomId,
                sdp: pc.localDescription,
            });
            console.log('[WebRTC] Answer sent');
            isNegotiatingRef.current = false;
        } catch (err) {
            console.error('[WebRTC] Failed to handle offer:', err);
            setConnectionState('failed');
        }
    }, [roomId, emit]);

    // ── Handle Incoming Answer ──
    const handleAnswer = useCallback(async ({ sdp }) => {
        const pc = peerRef.current;
        if (!pc) return;

        try {
            await pc.setRemoteDescription(new RTCSessionDescription(sdp));
            console.log('[WebRTC] Remote description set from answer');
            isNegotiatingRef.current = false;
        } catch (err) {
            console.error('[WebRTC] Failed to handle answer:', err);
        }
    }, []);

    // ── Handle Incoming ICE Candidate ──
    const handleIceCandidate = useCallback(async ({ candidate }) => {
        const pc = peerRef.current;
        if (!pc || !candidate) return;

        try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
            // Ignore non-critical ICE errors
            console.warn('[WebRTC] ICE candidate error (non-critical):', err.message);
        }
    }, []);

    // ── Initialize BroadcastChannel + Join Room ──
    useEffect(() => {
        if (!roomId || !userId || !localStream || hasJoinedRef.current) return;

        // Connect to local signaling channel
        const channel = new BroadcastChannel('medconnect-signaling');
        channelRef.current = channel;

        console.log(`[Signal] Connected to local broadcast signaling channel`);

        // Create peer connection BEFORE joining room
        createPeerConnection();

        // Join the appointment room (broadcast to other tabs)
        emit('join-room', { roomId, userId, role });
        hasJoinedRef.current = true;
        setConnectionState('waiting');

        // Handle incoming messages from other tabs
        channel.onmessage = (messageEvent) => {
            const { event, data } = messageEvent.data;
            
            // Ignore messages for other rooms
            if (data.roomId !== roomId) return;

            switch (event) {
                case 'join-room':
                    console.log(`[Signal] Remote user joined: ${data.role} (${data.userId})`);
                    setRemoteUser({ userId: data.userId, role: data.role });
                    // Acknowledge presence to the newly joined user
                    emit('user-joined', { roomId, userId, role });
                    // The Doctor (or patient if doctor is already there) creates the offer
                    if (role === 'doctor') {
                        console.log('[Signal] Room ready — creating offer');
                        createOffer();
                    }
                    break;
                case 'user-joined':
                    console.log(`[Signal] Acknowledged remote user: ${data.role} (${data.userId})`);
                    setRemoteUser({ userId: data.userId, role: data.role });
                    if (role === 'doctor') {
                        console.log('[Signal] Room ready — creating offer');
                        createOffer();
                    }
                    break;
                case 'offer':
                    handleOffer(data);
                    break;
                case 'answer':
                    handleAnswer(data);
                    break;
                case 'ice-candidate':
                    handleIceCandidate(data);
                    break;
                case 'leave-room':
                    console.log(`[Signal] Remote user left: ${data.role} (${data.userId})`);
                    setRemoteUser(null);
                    setRemoteStream(null);
                    setConnectionState('disconnected');
                    remoteStreamRef.current = new MediaStream();
                    break;
                default:
                    break;
            }
        };

        // Cleanup
        return () => {
            if (peerRef.current) {
                peerRef.current.close();
                peerRef.current = null;
            }
            if (channelRef.current) {
                emit('leave-room', { roomId, userId, role });
                channelRef.current.close();
                channelRef.current = null;
            }
            hasJoinedRef.current = false;
            isNegotiatingRef.current = false;
        };
    }, [roomId, userId, localStream, role, createPeerConnection, createOffer, handleOffer, handleAnswer, handleIceCandidate, emit]);

    // ── Cleanup Function (for explicit end call) ──
    const cleanup = useCallback(() => {
        if (peerRef.current) {
            peerRef.current.close();
            peerRef.current = null;
        }
        if (channelRef.current) {
            emit('leave-room', { roomId, userId, role });
            channelRef.current.close();
            channelRef.current = null;
        }
        hasJoinedRef.current = false;
        setRemoteStream(null);
        setRemoteUser(null);
        setConnectionState('disconnected');
    }, [roomId, userId, role, emit]);

    return {
        remoteStream,
        connectionState,
        remoteUser,
        cleanup,
    };
};
