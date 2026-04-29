import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Singleton instance
let stompClient = null;

const getClient = () => {
    if (!stompClient) {
        const baseURL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:8081';
        stompClient = new Client({
            webSocketFactory: () => new SockJS(`${baseURL}/ws`),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            debug: (str) => {
                console.log("STOMP: " + str);
            }
        });
    }
    return stompClient;
};

export const useSocket = () => {
    const client = getClient();
    const subscriptionsRef = useRef({});
    const onConnectCallbacksRef = useRef([]);

    // Ensure callbacks are executed when connected
    useEffect(() => {
        client.onConnect = (frame) => {
            console.log('STOMP Connected:', frame);
            onConnectCallbacksRef.current.forEach(cb => cb());
            onConnectCallbacksRef.current = [];
        };
        client.onStompError = (frame) => {
            console.error('STOMP Error:', frame.headers['message']);
        };
    }, [client]);

    const connect = useCallback((userId) => {
        if (!client.active) {
            client.activate();
        }
    }, [client]);

    const disconnect = useCallback(() => {
        if (client.active) {
            client.deactivate();
        }
    }, [client]);

    const on = useCallback((destination, handler) => {
        const subscribe = () => {
            // Unsubscribe if already subscribed to prevent duplicates
            if (subscriptionsRef.current[destination]) {
                subscriptionsRef.current[destination].unsubscribe();
            }
            const sub = client.subscribe(destination, (message) => {
                if (message.body) {
                    try {
                        const parsed = JSON.parse(message.body);
                        handler(parsed);
                    } catch(e) {
                        handler(message.body);
                    }
                }
            });
            subscriptionsRef.current[destination] = sub;
        };

        if (client.connected) {
            subscribe();
        } else {
            onConnectCallbacksRef.current.push(subscribe);
        }

        return () => {
            if (subscriptionsRef.current[destination]) {
                subscriptionsRef.current[destination].unsubscribe();
                delete subscriptionsRef.current[destination];
            }
        };
    }, [client]);

    const emit = useCallback((destination, body) => {
        if (client.connected) {
            client.publish({ destination, body: typeof body === 'string' ? body : JSON.stringify(body) });
        }
    }, [client]);

    useEffect(() => {
        return () => {
            // Cleanup subscriptions on unmount
            Object.values(subscriptionsRef.current).forEach(sub => sub.unsubscribe());
            subscriptionsRef.current = {};
        };
    }, []);

    return { client, connect, disconnect, on, emit, connected: client.connected };
};
