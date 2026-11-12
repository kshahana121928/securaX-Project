import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // In dev mode with Vite proxy, connecting to '/' uses the proxy rule
    const newSocket = io('/', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      console.log('[SecuraX Socket] Connected:', newSocket.id);
      setIsConnected(true);

      if (user?.id) {
        newSocket.emit('join_user', user.id);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('[SecuraX Socket] Disconnected');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket && isConnected && user?.id) {
      socket.emit('join_user', user.id);
    }
  }, [socket, isConnected, user?.id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
