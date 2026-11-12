import { Response } from 'express';
import { z } from 'zod';
import { Journey } from '../models/Journey.js';
import { EmergencySession } from '../models/EmergencySession.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { GeoService } from '../services/geoService.js';
import { NotificationService } from '../services/notificationService.js';
import { getIO } from '../sockets/socketHandler.js';

const startJourneySchema = z.object({
  startPoint: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional(),
  }),
  destination: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional(),
  }),
  plannedRoute: z.array(z.object({ lat: z.number(), lng: z.number() })).optional(),
  expectedDurationMinutes: z.number().min(1).default(30),
  cabDetails: z.object({
    cabProvider: z.string().default('Cab Service'),
    vehicleNumber: z.string().default(''),
    driverName: z.string().default(''),
    driverPhone: z.string().optional(),
  }).optional(),
  trustedContactIds: z.array(z.string()).optional(),
  safetyCheckFrequencyMinutes: z.number().default(15),
});

export const startJourney = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const validated = startJourneySchema.parse(req.body);

  // If no planned route coordinates provided, generate sample route line between start and destination
  let route = validated.plannedRoute;
  if (!route || route.length === 0) {
    const steps = 6;
    route = [];
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      route.push({
        lat: validated.startPoint.lat + (validated.destination.lat - validated.startPoint.lat) * ratio,
        lng: validated.startPoint.lng + (validated.destination.lng - validated.startPoint.lng) * ratio,
      });
    }
  }

  const startTime = new Date();
  const estimatedArrivalTime = new Date(startTime.getTime() + validated.expectedDurationMinutes * 60 * 1000);

  const journey = await Journey.create({
    userId: req.userId,
    startPoint: validated.startPoint,
    destination: validated.destination,
    plannedRoute: route,
    expectedDurationMinutes: validated.expectedDurationMinutes,
    startTime,
    estimatedArrivalTime,
    status: 'active',
    cabDetails: validated.cabDetails || {
      cabProvider: 'Cab / Auto',
      vehicleNumber: 'KA-01-AB-1234',
      driverName: 'Ramesh Kumar',
      driverPhone: '+91 98111 22334',
    },
    trustedContactIds: validated.trustedContactIds || [],
    safetyCheckFrequencyMinutes: validated.safetyCheckFrequencyMinutes,
    lastKnownLocation: {
      lat: validated.startPoint.lat,
      lng: validated.startPoint.lng,
      timestamp: startTime,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Cab journey monitoring started successfully',
    journey,
  });
};

export const getActiveJourney = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const journey = await Journey.findOne({
    userId: req.userId,
    status: { $in: ['active', 'deviation_alert', 'overdue'] },
  }).populate('trustedContactIds');

  // Check if journey is overdue
  if (journey && journey.status === 'active') {
    const now = new Date();
    if (now > journey.estimatedArrivalTime) {
      journey.status = 'overdue';
      await journey.save();
    }
  }

  res.json({
    success: true,
    journey: journey || null,
  });
};

export const journeySafetyCheckIn = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { journeyId, isSafe, reason } = req.body;

  const journey = await Journey.findOne({ _id: journeyId, userId: req.userId });
  if (!journey) {
    res.status(404).json({ success: false, message: 'Journey not found' });
    return;
  }

  if (isSafe) {
    journey.status = 'active';
    journey.safetyChecks.push({
      checkTime: new Date(),
      status: 'safe',
      responseTime: new Date(),
    });
    await journey.save();

    res.json({ success: true, message: 'Safety confirmed. Safe journey continues.', journey });
  } else {
    // User signaled distress / NOT safe
    journey.status = 'emergency';
    await journey.save();

    // Trigger Emergency SOS automatically!
    const session = await EmergencySession.create({
      userId: req.userId,
      status: 'active',
      triggerType: 'cab_deviation',
      triggerSource: 'automatic',
      notes: `User marked NOT SAFE during Cab Journey (${journey.cabDetails.vehicleNumber}). Reason: ${reason || 'Immediate Assistance Requested'}`,
      lastLocation: journey.lastKnownLocation ? {
        lat: journey.lastKnownLocation.lat,
        lng: journey.lastKnownLocation.lng,
      } : undefined,
    });

    const shareUrl = `http://localhost:5173/track/${session.shareToken}`;

    await NotificationService.dispatchEmergencyAlerts({
      userId: req.userId!,
      emergencySessionId: session._id.toString(),
      alertType: 'SOS Activation',
      location: journey.lastKnownLocation ? {
        lat: journey.lastKnownLocation.lat,
        lng: journey.lastKnownLocation.lng,
      } : undefined,
      shareUrl,
      customMessage: `🚨 EMERGENCY: User reported distress during ride in ${journey.cabDetails.vehicleNumber} (${journey.cabDetails.driverName}).`,
    });

    res.json({
      success: true,
      message: 'Emergency SOS activated! Contacts notified of distress.',
      session,
      journey,
    });
  }
};

export const endJourney = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { journeyId } = req.body;

  const journey = await Journey.findOne({ _id: journeyId, userId: req.userId });
  if (!journey) {
    res.status(404).json({ success: false, message: 'Active journey not found' });
    return;
  }

  journey.status = 'completed';
  journey.actualEndTime = new Date();
  await journey.save();

  res.json({ success: true, message: 'Journey marked completed safely.', journey });
};

export const checkRouteDeviation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { journeyId, currentCoordinates, thresholdMeters = 300 } = req.body;

  const journey = await Journey.findOne({ _id: journeyId, userId: req.userId });
  if (!journey) {
    res.status(404).json({ success: false, message: 'Journey not found' });
    return;
  }

  // Update last known location
  journey.lastKnownLocation = {
    lat: currentCoordinates.lat,
    lng: currentCoordinates.lng,
    timestamp: new Date(),
  };

  const check = GeoService.checkRouteDeviation(
    currentCoordinates,
    journey.plannedRoute,
    thresholdMeters
  );

  if (check.isDeviated) {
    journey.status = 'deviation_alert';
    await journey.save();

    // Alert user via socket
    try {
      const io = getIO();
      io.to(`user:${req.userId}`).emit('route_deviation_alert', {
        journeyId: journey._id,
        distanceMeters: check.distanceMeters,
        thresholdMeters,
        currentCoordinates,
      });
    } catch (e) {
      // Ignore socket error
    }
  }

  await journey.save();

  res.json({
    success: true,
    isDeviated: check.isDeviated,
    distanceMeters: check.distanceMeters,
    thresholdMeters,
    journeyStatus: journey.status,
  });
};
