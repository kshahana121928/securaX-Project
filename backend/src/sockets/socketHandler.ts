import { Server, Socket } from 'socket.io';

let ioInstance: Server | null = null;

export const initSocket = (io: Server): void => {
  ioInstance = io;

  io.on('connection', (socket: Socket) => {
    console.log(`[SecuraX Socket] Client connected: ${socket.id}`);

    // Join user specific private room
    socket.on('join_user', (userId: string) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`[SecuraX Socket] Socket ${socket.id} joined user:${userId}`);
      }
    });

    // Join emergency session room
    socket.on('join_emergency', (sessionId: string) => {
      if (sessionId) {
        socket.join(`emergency:${sessionId}`);
        console.log(`[SecuraX Socket] Socket ${socket.id} joined emergency:${sessionId}`);
      }
    });

    // Join public tracking room (for share link viewers)
    socket.on('join_tracking', (shareToken: string) => {
      if (shareToken) {
        socket.join(`tracking:${shareToken}`);
        console.log(`[SecuraX Socket] Socket ${socket.id} joined tracking:${shareToken}`);
      }
    });

    // Real-time location stream from client device
    socket.on('stream_location', (data: {
      userId: string;
      sessionId?: string;
      shareToken?: string;
      coordinates: { lat: number; lng: number };
      accuracy?: number;
      speed?: number;
      heading?: number;
      timestamp: number;
    }) => {
      // Broadcast to user devices
      if (data.userId) {
        io.to(`user:${data.userId}`).emit('location_updated', data);
      }
      // Broadcast to active emergency listeners
      if (data.sessionId) {
        io.to(`emergency:${data.sessionId}`).emit('emergency_location_updated', data);
      }
      // Broadcast to external shared link viewers
      if (data.shareToken) {
        io.to(`tracking:${data.shareToken}`).emit('tracking_location_updated', data);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[SecuraX Socket] Client disconnected: ${socket.id}`);
    });
  });
};

export const getIO = (): Server => {
  if (!ioInstance) {
    throw new Error('Socket.io has not been initialized yet.');
  }
  return ioInstance;
};
