import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : '');

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) {
      setSocket(null);
      return;
    }

    const socketUrl = import.meta.env.VITE_API_URL;
    if (!socketUrl) {
      console.error("Socket URL is missing! Check VITE_API_URL.");
      return;
    }

    const token = localStorage.getItem('token');
    const s = io(socketUrl, {
      auth: { token },
      transports: ['websocket'], // Force WebSocket to avoid Render sticky session issues
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    s.on('connect_error', (err) => {
      console.error("Socket Connection Error:", err.message);
    });

    setSocket(s);

    return () => {
      if (s) s.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
