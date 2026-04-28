/**
 * ═══════════════════════════════════════════════════════════════
 *  MedConnect — WebRTC Signaling Server
 *  ─────────────────────────────────────────────────────────────
 *  Lightweight Socket.IO server for WebRTC signaling.
 *  Handles room management based on appointmentId.
 *
 *  Run:  node signaling-server.js
 *  Port: 3001 (configurable via SIGNAL_PORT env)
 * ═══════════════════════════════════════════════════════════════
 */

const { createServer } = require('http');
const { Server } = require('socket.io');

const PORT = process.env.SIGNAL_PORT || 3001;

const httpServer = createServer((req, res) => {
    // Health check endpoint
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', rooms: io.sockets.adapter.rooms.size }));
        return;
    }
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('MedConnect Signaling Server');
});

const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
});

// Track room participants
const rooms = new Map(); // roomId → Set<socketId>

io.on('connection', (socket) => {
    console.log(`[Signal] Connected: ${socket.id}`);

    /**
     * join-room — User joins an appointment room.
     * If two participants are in the room, signal the new joiner
     * to create an offer to the existing participant.
     */
    socket.on('join-room', ({ roomId, userId, role }) => {
        socket.join(roomId);
        socket.data.roomId = roomId;
        socket.data.userId = userId;
        socket.data.role = role;

        if (!rooms.has(roomId)) {
            rooms.set(roomId, new Set());
        }
        rooms.get(roomId).add(socket.id);

        const roomSize = rooms.get(roomId).size;
        console.log(`[Signal] ${role} (${userId}) joined room ${roomId} — ${roomSize} participant(s)`);

        // Notify everyone in the room about the new participant
        socket.to(roomId).emit('user-joined', {
            userId,
            role,
            socketId: socket.id,
        });

        // If there's already someone in the room, tell the new joiner
        // to initiate a peer connection (create offer)
        if (roomSize === 2) {
            socket.emit('ready-to-call', { roomId });
        }
    });

    /**
     * offer — Forward SDP offer to the other participant in the room.
     */
    socket.on('offer', ({ roomId, sdp }) => {
        console.log(`[Signal] Offer from ${socket.id} in room ${roomId}`);
        socket.to(roomId).emit('offer', {
            sdp,
            senderId: socket.id,
        });
    });

    /**
     * answer — Forward SDP answer to the offer creator.
     */
    socket.on('answer', ({ roomId, sdp }) => {
        console.log(`[Signal] Answer from ${socket.id} in room ${roomId}`);
        socket.to(roomId).emit('answer', {
            sdp,
            senderId: socket.id,
        });
    });

    /**
     * ice-candidate — Forward ICE candidate to the other participant.
     */
    socket.on('ice-candidate', ({ roomId, candidate }) => {
        socket.to(roomId).emit('ice-candidate', {
            candidate,
            senderId: socket.id,
        });
    });

    /**
     * leave-room — Explicit room leave.
     */
    socket.on('leave-room', ({ roomId }) => {
        handleLeave(socket, roomId);
    });

    /**
     * disconnect — Cleanup on socket disconnect.
     */
    socket.on('disconnect', () => {
        const roomId = socket.data.roomId;
        if (roomId) {
            handleLeave(socket, roomId);
        }
        console.log(`[Signal] Disconnected: ${socket.id}`);
    });
});

function handleLeave(socket, roomId) {
    socket.leave(roomId);
    if (rooms.has(roomId)) {
        rooms.get(roomId).delete(socket.id);
        if (rooms.get(roomId).size === 0) {
            rooms.delete(roomId);
        }
    }
    // Notify remaining participant that the other user left
    socket.to(roomId).emit('user-left', {
        userId: socket.data.userId,
        role: socket.data.role,
        socketId: socket.id,
    });
    console.log(`[Signal] ${socket.data.role} (${socket.data.userId}) left room ${roomId}`);
}

httpServer.listen(PORT, '0.0.0.0', () => {
    const os = require('os');
    const nets = os.networkInterfaces();
    let localIP = 'localhost';
    for (const iface of Object.values(nets)) {
        for (const cfg of iface) {
            if (cfg.family === 'IPv4' && !cfg.internal) {
                localIP = cfg.address;
                break;
            }
        }
    }
    console.log(`\n  ╔════════════════════════════════════════════╗`);
    console.log(`  ║  MedConnect Signaling Server               ║`);
    console.log(`  ║  Local:   http://localhost:${PORT}            ║`);
    console.log(`  ║  Network: http://${localIP}:${PORT}       ║`);
    console.log(`  ║  Health:  http://localhost:${PORT}/health      ║`);
    console.log(`  ╚════════════════════════════════════════════╝\n`);
});
