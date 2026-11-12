import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initSocket } from './sockets/socketHandler.js';
import { seedDatabase } from './seed/seedData.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect Database
    await connectDB();

    // 2. Seed database with demonstration data
    await seedDatabase();

    // 3. Setup HTTP & Socket.IO server
    const server = http.createServer(app);

    const io = new SocketIOServer(server, {
      cors: {
        origin: ['http://localhost:5173', 'http://127.0.0.1:5173', process.env.FRONTEND_URL || ''],
        credentials: true,
      },
    });

    initSocket(io);

    // 4. Start listening
    server.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🛡️  SECURAX EMERGENCY RESPONSE PLATFORM - BACKEND READY`);
      console.log(`📡 Server listening on: http://localhost:${PORT}`);
      console.log(`🚦 Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Failed to start SecuraX server:', error);
    process.exit(1);
  }
};

startServer();
