import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { SafetyCheckIn } from '../models/SafetyCheckIn.js';
import { PINConfiguration } from '../models/PINConfiguration.js';
import { EmergencySession } from '../models/EmergencySession.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { NotificationService } from '../services/notificationService.js';
import { getIO } from '../sockets/socketHandler.js';

const startTimerSchema = z.object({
  durationMinutes: z.number().min(1).max(720),
  note: z.string().optional(),
});

export const startSafetyTimer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const validated = startTimerSchema.parse(req.body);

  // Cancel any existing active check-in
  await SafetyCheckIn.updateMany(
    { userId: req.userId, status: 'active' },
    { status: 'expired' }
  );

  const startTime = new Date();
  const expiresAt = new Date(startTime.getTime() + validated.durationMinutes * 60 * 1000);

  const checkIn = await SafetyCheckIn.create({
    userId: req.userId,
    durationMinutes: validated.durationMinutes,
    startTime,
    expiresAt,
    status: 'active',
    note: validated.note || 'Safety check-in timer',
  });

  res.status(201).json({
    success: true,
    message: `Safety timer set for ${validated.durationMinutes} minutes.`,
    checkIn,
  });
};

export const getActiveSafetyTimer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const checkIn = await SafetyCheckIn.findOne({
    userId: req.userId,
    status: 'active',
  }).sort({ createdAt: -1 });

  res.json({
    success: true,
    checkIn: checkIn || null,
  });
};

export const respondSafetyTimer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { checkInId, status, location } = req.body; // status: 'safe' | 'help_needed' | 'expired_escalated'

  const checkIn = await SafetyCheckIn.findOne({ _id: checkInId, userId: req.userId });
  if (!checkIn) {
    res.status(404).json({ success: false, message: 'Check-in timer session not found.' });
    return;
  }

  if (status === 'safe') {
    checkIn.status = 'safe';
    checkIn.responseTime = new Date();
    await checkIn.save();

    res.json({ success: true, message: 'Safety confirmed. Timer concluded.', checkIn });
    return;
  }

  // If status is help_needed or expired_escalated, escalate to Emergency SOS!
  checkIn.status = 'escalated';
  checkIn.responseTime = new Date();

  const session = await EmergencySession.create({
    userId: req.userId,
    status: 'active',
    triggerType: 'timer_expired',
    triggerSource: 'automatic',
    notes: `Safety check-in timer (${checkIn.durationMinutes} mins) expired without safe response. Automatic SOS escalated.`,
    lastLocation: location ? {
      lat: location.lat,
      lng: location.lng,
      accuracy: location.accuracy || 10,
      timestamp: new Date(),
    } : undefined,
  });

  checkIn.emergencySessionId = session._id;
  await checkIn.save();

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
    // Ignore socket error
  }

  await NotificationService.dispatchEmergencyAlerts({
    userId: req.userId!,
    emergencySessionId: session._id.toString(),
    alertType: 'Safety Timer Expired',
    location,
    shareUrl,
    customMessage: `🚨 SAFETY TIMER EXPIRED: User did not respond to check-in timer (${checkIn.durationMinutes} minutes). Automatic emergency response initiated.`,
  });

  res.json({
    success: true,
    message: 'Safety check-in escalated to Emergency SOS. Emergency contacts alerted.',
    checkIn,
    session,
    shareUrl,
  });
};

// PIN Management & Verification (Feature 5: Fake PIN / Silent SOS)
export const verifyPIN = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { pin, location } = req.body;

  let pinConfig = await PINConfiguration.findOne({ userId: req.userId });
  if (!pinConfig) {
    // Auto-create default PINs: Normal '1234', Emergency '9999'
    const normalHash = await bcrypt.hash('1234', 10);
    const emergencyHash = await bcrypt.hash('9999', 10);
    pinConfig = await PINConfiguration.create({
      userId: req.userId,
      normalPinHash: normalHash,
      secretEmergencyPinHash: emergencyHash,
    });
  }

  // 1. Check if Secret Emergency PIN was entered
  const isEmergencyPin = await bcrypt.compare(pin, pinConfig.secretEmergencyPinHash);
  if (isEmergencyPin) {
    // SILENT EMERGENCY ACTIVATION
    // Silently create an emergency session and dispatch alerts
    let session = await EmergencySession.findOne({ userId: req.userId, status: 'active' });
    if (!session) {
      session = await EmergencySession.create({
        userId: req.userId,
        status: 'active',
        triggerType: 'silent_pin',
        triggerSource: 'disguise',
        notes: 'Secret Emergency PIN entered. Silent emergency response initiated.',
        lastLocation: location ? {
          lat: location.lat,
          lng: location.lng,
          accuracy: location.accuracy || 10,
          timestamp: new Date(),
        } : undefined,
      });
    }

    const shareUrl = `http://localhost:5173/track/${session.shareToken}`;

    await NotificationService.dispatchEmergencyAlerts({
      userId: req.userId!,
      emergencySessionId: session._id.toString(),
      alertType: 'Silent Emergency PIN',
      location,
      shareUrl,
      customMessage: '🚨 SILENT ALARM: User entered secret emergency duress PIN. Immediate stealth assistance needed.',
    });

    // IMPORTANT: Return NORMAL-looking success response!
    // Do not reveal that emergency was triggered to prevent alerting an attacker.
    res.json({
      success: true,
      pinType: 'disguise_normal', // Client handles this stealthily
      message: 'Access granted.',
      redirectUrl: '/dashboard',
    });
    return;
  }

  // 2. Check if Normal PIN was entered
  const isNormalPin = await bcrypt.compare(pin, pinConfig.normalPinHash);
  if (isNormalPin) {
    res.json({
      success: true,
      pinType: 'normal',
      message: 'Normal PIN verified. Access granted.',
      redirectUrl: '/dashboard',
    });
    return;
  }

  // Neither matched
  pinConfig.failedAttempts += 1;
  await pinConfig.save();

  res.status(401).json({
    success: false,
    message: 'Incorrect security PIN. Please try again.',
  });
};

export const setupPINs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { normalPin, secretEmergencyPin, currentPassword } = req.body;

  if (!normalPin || normalPin.length < 4 || !secretEmergencyPin || secretEmergencyPin.length < 4) {
    res.status(400).json({ success: false, message: 'PINs must be at least 4 digits.' });
    return;
  }

  if (normalPin === secretEmergencyPin) {
    res.status(400).json({
      success: false,
      message: 'Normal PIN and Secret Emergency PIN cannot be identical.',
    });
    return;
  }

  const normalPinHash = await bcrypt.hash(normalPin, 10);
  const secretEmergencyPinHash = await bcrypt.hash(secretEmergencyPin, 10);

  await PINConfiguration.findOneAndUpdate(
    { userId: req.userId },
    {
      normalPinHash,
      secretEmergencyPinHash,
      isConfigured: true,
      failedAttempts: 0,
    },
    { upsert: true, new: true }
  );

  res.json({
    success: true,
    message: 'Security PINs updated successfully. Secret Emergency PIN is now armed.',
  });
};

export const getPINStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const pinConfig = await PINConfiguration.findOne({ userId: req.userId });

  res.json({
    success: true,
    isConfigured: !!pinConfig?.isConfigured,
    hasEmergencyPin: true,
    defaultPinHint: 'Default Normal PIN: 1234 | Default Secret Duress PIN: 9999',
  });
};
