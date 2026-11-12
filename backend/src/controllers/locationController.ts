import { Response } from 'express';
import { z } from 'zod';
import { LocationHistory } from '../models/LocationHistory.js';
import { EmergencySession } from '../models/EmergencySession.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { getIO } from '../sockets/socketHandler.js';

const locationUpdateSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  accuracy: z.number().optional(),
  speed: z.number().optional(),
  heading: z.number().optional(),
  altitude: z.number().optional(),
  address: z.string().optional(),
});

export const updateLocation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const validated = locationUpdateSchema.parse(req.body);

  // Check if there's an active emergency session
  const activeSession = await EmergencySession.findOne({
    userId: req.userId,
    status: 'active',
  });

  const locationRecord = await LocationHistory.create({
    userId: req.userId,
    emergencySessionId: activeSession?._id,
    coordinates: {
      lat: validated.lat,
      lng: validated.lng,
    },
    accuracy: validated.accuracy || 10,
    speed: validated.speed || 0,
    heading: validated.heading || 0,
    altitude: validated.altitude || 0,
    timestamp: new Date(),
  });

  // Update session lastLocation if active
  if (activeSession) {
    activeSession.lastLocation = {
      lat: validated.lat,
      lng: validated.lng,
      accuracy: validated.accuracy || 10,
      address: validated.address || '',
      timestamp: new Date(),
    };
    await activeSession.save();

    // Broadcast via socket
    try {
      const io = getIO();
      const payload = {
        userId: req.userId,
        sessionId: activeSession._id,
        shareToken: activeSession.shareToken,
        coordinates: { lat: validated.lat, lng: validated.lng },
        accuracy: validated.accuracy,
        speed: validated.speed,
        heading: validated.heading,
        timestamp: Date.now(),
      };
      io.to(`emergency:${activeSession._id}`).emit('emergency_location_updated', payload);
      io.to(`tracking:${activeSession.shareToken}`).emit('tracking_location_updated', payload);
      io.to(`user:${req.userId}`).emit('location_updated', payload);
    } catch (e) {
      // Ignore socket error
    }
  }

  res.json({
    success: true,
    message: 'Location recorded',
    location: locationRecord,
    inActiveEmergency: !!activeSession,
  });
};

export const getCurrentLocation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const latest = await LocationHistory.findOne({ userId: req.userId }).sort({ timestamp: -1 });

  res.json({
    success: true,
    location: latest || null,
  });
};

export const getLocationHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const history = await LocationHistory.find({ userId: req.userId })
    .sort({ timestamp: -1 })
    .limit(limit);

  res.json({
    success: true,
    count: history.length,
    history,
  });
};
