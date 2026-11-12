import { Request, Response } from 'express';
import { z } from 'zod';
import { EmergencySession } from '../models/EmergencySession.js';
import { LocationHistory } from '../models/LocationHistory.js';
import { User } from '../models/User.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { NotificationService } from '../services/notificationService.js';
import { getIO } from '../sockets/socketHandler.js';

const activateSosSchema = z.object({
  triggerType: z.enum(['one_tap_sos', 'silent_pin', 'voice_sos', 'shake_sos', 'timer_expired', 'cab_deviation']).default('one_tap_sos'),
  triggerSource: z.enum(['manual', 'automatic', 'disguise']).default('manual'),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    accuracy: z.number().optional(),
    address: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
});

export const activateEmergency = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const validated = activateSosSchema.parse(req.body);

  // Check if there is already an active session
  let session = await EmergencySession.findOne({
    userId: req.userId,
    status: 'active',
  });

  if (!session) {
    session = await EmergencySession.create({
      userId: req.userId,
      status: 'active',
      triggerType: validated.triggerType,
      triggerSource: validated.triggerSource,
      initialLocation: validated.location ? { ...validated.location, timestamp: new Date() } : undefined,
      lastLocation: validated.location ? { ...validated.location, timestamp: new Date() } : undefined,
      notes: validated.notes || '',
    });
  } else {
    // Update existing active session if location provided
    if (validated.location) {
      session.lastLocation = { ...validated.location, timestamp: new Date() };
      await session.save();
    }
  }

  // Save location history if coordinates provided
  if (validated.location) {
    await LocationHistory.create({
      userId: req.userId,
      emergencySessionId: session._id,
      coordinates: {
        lat: validated.location.lat,
        lng: validated.location.lng,
      },
      accuracy: validated.location.accuracy || 10,
      timestamp: new Date(),
    });
  }

  const shareUrl = `http://localhost:5173/track/${session.shareToken}`;

  // Broadcast real-time socket alert
  try {
    const io = getIO();
    io.to(`user:${req.userId}`).emit('emergency_status_changed', {
      status: 'active',
      session,
      shareUrl,
    });
  } catch (e) {
    console.warn('[Emergency Controller] Socket broadcast error:', e);
  }

  // Dispatch emergency notifications to emergency contacts
  const alertTypeMap: Record<string, any> = {
    one_tap_sos: 'SOS Activation',
    silent_pin: 'Silent Emergency PIN',
    voice_sos: 'SOS Activation',
    shake_sos: 'SOS Activation',
    timer_expired: 'Safety Timer Expired',
    cab_deviation: 'Cab Route Deviation',
  };

  await NotificationService.dispatchEmergencyAlerts({
    userId: req.userId!,
    emergencySessionId: session._id.toString(),
    alertType: alertTypeMap[validated.triggerType] || 'SOS Activation',
    location: validated.location,
    shareUrl,
    customMessage: validated.notes || 'Emergency triggered through SecuraX Safe Response System.',
  });

  res.status(201).json({
    success: true,
    message: 'Emergency session activated. Emergency contacts notified.',
    session,
    shareUrl,
    emergencyNumber112: 'tel:112',
    ambulanceNumber102: 'tel:102',
  });
};

export const silentEmergencyActivation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  req.body.triggerType = 'silent_pin';
  req.body.triggerSource = 'disguise';
  await activateEmergency(req, res);
};

export const cancelEmergency = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { reason, notes } = req.body;

  const session = await EmergencySession.findOne({
    userId: req.userId,
    status: 'active',
  });

  if (!session) {
    res.status(404).json({ success: false, message: 'No active emergency session found to cancel.' });
    return;
  }

  session.status = 'cancelled';
  session.cancelledAt = new Date();
  session.cancelReason = reason || 'User verified safe';
  if (notes) session.notes += ` | Cancel Note: ${notes}`;
  await session.save();

  // Socket notification of resolution
  try {
    const io = getIO();
    io.to(`user:${req.userId}`).emit('emergency_status_changed', {
      status: 'cancelled',
      session,
    });
    io.to(`emergency:${session._id}`).emit('emergency_status_changed', {
      status: 'cancelled',
      session,
    });
    io.to(`tracking:${session.shareToken}`).emit('emergency_status_changed', {
      status: 'cancelled',
      session,
    });
  } catch (e) {
    // Ignore socket error
  }

  res.json({
    success: true,
    message: 'Emergency session successfully resolved and cancelled.',
    session,
  });
};

export const getActiveEmergency = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const session = await EmergencySession.findOne({
    userId: req.userId,
    status: 'active',
  });

  res.json({
    success: true,
    isActive: !!session,
    session: session || null,
    shareUrl: session ? `http://localhost:5173/track/${session.shareToken}` : null,
  });
};

export const getEmergencyHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const sessions = await EmergencySession.find({ userId: req.userId }).sort({ startedAt: -1 }).limit(50);
  res.json({ success: true, count: sessions.length, sessions });
};

// Public Tracking View by shareToken (Does not require login)
export const getPublicTracking = async (req: Request, res: Response): Promise<void> => {
  const { shareToken } = req.params;

  const session = await EmergencySession.findOne({ shareToken });
  if (!session) {
    res.status(404).json({ success: false, message: 'Tracking link invalid or expired.' });
    return;
  }

  const user = await User.findById(session.userId).select('name phone bloodGroup emergencyNote');
  const recentLocations = await LocationHistory.find({ emergencySessionId: session._id })
    .sort({ timestamp: -1 })
    .limit(30);

  res.json({
    success: true,
    session,
    user,
    recentLocations,
  });
};
