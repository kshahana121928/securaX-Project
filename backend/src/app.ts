import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import emergencyRoutes from './routes/emergencyRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import journeyRoutes from './routes/journeyRoutes.js';
import safetyRoutes from './routes/safetyRoutes.js';
import evidenceRoutes from './routes/evidenceRoutes.js';
import helperRoutes from './routes/helperRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', process.env.FRONTEND_URL || ''],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve uploaded evidence files statically
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SecuraX Emergency API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Mount modular REST APIs
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/journey', journeyRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/helpers', helperRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
