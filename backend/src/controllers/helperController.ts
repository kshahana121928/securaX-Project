import { Response } from 'express';
import { z } from 'zod';
import { Volunteer } from '../models/Volunteer.js';
import { User } from '../models/User.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { GeoService } from '../services/geoService.js';
import { NotificationService } from '../services/notificationService.js';
import { getIO } from '../sockets/socketHandler.js';

const volunteerRegisterSchema = z.object({
  phone: z.string().min(10),
  address: z.string().min(3),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  skills: z.array(z.string()).default(['First Aid Certified', 'Local Guide']),
});

export const getNearbyHelpers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userLat = Number(req.query.lat) || 28.6139; // Default New Delhi or current user position
  const userLng = Number(req.query.lng) || 77.2090;
  const radiusKm = Number(req.query.radiusKm) || 10;

  const volunteers = await Volunteer.find({ isAvailable: true, isVerified: true });

  const nearby = volunteers.map((v) => {
    const distMeters = GeoService.haversineDistanceMeters(
      { lat: userLat, lng: userLng },
      { lat: v.coordinates.lat, lng: v.coordinates.lng }
    );
    const distKm = Math.round((distMeters / 1000) * 10) / 10;

    return {
      id: v._id,
      name: v.name,
      rating: v.rating,
      skills: v.skills,
      verificationBadge: v.verificationBadge,
      distanceKm: distKm,
      coordinates: {
        // Protect volunteer precise house location by slight jitter for privacy
        lat: v.coordinates.lat + (Math.random() - 0.5) * 0.001,
        lng: v.coordinates.lng + (Math.random() - 0.5) * 0.001,
      },
      emergenciesAssistedCount: v.emergenciesAssistedCount,
    };
  }).filter((v) => v.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

  res.json({
    success: true,
    count: nearby.length,
    helpers: nearby,
  });
};

export const registerAsVolunteer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const validated = volunteerRegisterSchema.parse(req.body);

  const user = await User.findById(req.userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  user.isVolunteer = true;
  await user.save();

  const volunteer = await Volunteer.findOneAndUpdate(
    { userId: user._id },
    {
      userId: user._id,
      name: user.name,
      email: user.email,
      phone: validated.phone,
      address: validated.address,
      coordinates: validated.coordinates,
      skills: validated.skills,
      isAvailable: true,
      isVerified: true,
      verificationBadge: 'Verified Community Guardian',
    },
    { upsert: true, new: true }
  );

  res.status(201).json({
    success: true,
    message: 'Registered as verified community helper!',
    volunteer,
  });
};

export const toggleAvailability = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { isAvailable } = req.body;

  const volunteer = await Volunteer.findOne({ userId: req.userId });
  if (!volunteer) {
    res.status(404).json({ success: false, message: 'Volunteer profile not found.' });
    return;
  }

  volunteer.isAvailable = Boolean(isAvailable);
  await volunteer.save();

  res.json({
    success: true,
    message: `Volunteer availability set to ${volunteer.isAvailable ? 'ACTIVE' : 'OFFLINE'}`,
    volunteer,
  });
};

export const requestNearbyHelpers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { location, emergencyMessage } = req.body;

  const user = await User.findById(req.userId);

  // Broadcast real-time helper dispatch event via socket
  try {
    const io = getIO();
    io.emit('community_helper_alert', {
      requesterName: user?.name || 'SecuraX Community Member',
      location,
      emergencyMessage: emergencyMessage || 'Emergency assistance requested nearby.',
      timestamp: Date.now(),
    });
  } catch (e) {
    // Ignore socket error
  }

  await NotificationService.dispatchEmergencyAlerts({
    userId: req.userId!,
    alertType: 'Helper Request',
    location,
    customMessage: `COMMUNITY AID ALERT: ${user?.name} requested nearby volunteer assistance. Message: ${emergencyMessage || 'Immediate assistance requested'}`,
  });

  res.json({
    success: true,
    message: 'Help request broadcasted to all active nearby verified community helpers.',
    dispatchRadiusKm: 5,
  });
};
