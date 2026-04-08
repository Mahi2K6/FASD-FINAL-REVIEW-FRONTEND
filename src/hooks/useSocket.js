import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

// Singleton socket instance — shared across the app
let socketInstance = null;

const getSocket = () => {
    if (!socketInstance) {
        // socketInstance = io(`http://${window.location.hostname}:3001`, {
        //     autoConnect: false,
        //     reconnection: true,
        //     reconnectionDelay: 1000,
        //     reconnectionAttempts: 10,
        //     transports: ['websocket', 'polling']
        // });

        // Disabled socket instance for Spring Boot migration
        socketInstance = {
            connected: false,
            connect: () => { },
            disconnect: () => { },
            once: () => { },
            on: () => { },
            off: () => { },
            emit: () => { }
        };
    }
    return socketInstance;
};

/**
 * useSocket — provides access to the singleton Socket.IO client.
 * Call connect(userId) after login to join that user's notification room.
 */
export const useSocket = () => {
    const socket = getSocket();
    const listenersRef = useRef([]);

    const connect = useCallback((userId) => {
        if (!socket.connected) {
            socket.connect();
        }
        socket.once('connect', () => {
            if (userId) {
                socket.emit('join:room', String(userId));
            }
        });
        // If already connected, join room immediately
        if (socket.connected && userId) {
            socket.emit('join:room', String(userId));
        }
    }, [socket]);

    const disconnect = useCallback(() => {
        if (socket.connected) {
            socket.disconnect();
        }
    }, [socket]);

    const on = useCallback((event, handler) => {
        socket.on(event, handler);
        listenersRef.current.push({ event, handler });
        return () => socket.off(event, handler);
    }, [socket]);

    const emit = useCallback((event, data) => {
        socket.emit(event, data);
    }, [socket]);

    useEffect(() => {
        // Cleanup all listeners registered through this hook instance on unmount
        return () => {
            listenersRef.current.forEach(({ event, handler }) => {
                socket.off(event, handler);
            });
            listenersRef.current = [];
        };
    }, [socket]);

    return { socket, connect, disconnect, on, emit };
};
