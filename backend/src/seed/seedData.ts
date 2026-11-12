import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { EmergencyContact } from '../models/EmergencyContact.js';
import { PINConfiguration } from '../models/PINConfiguration.js';
import { UserSettings } from '../models/UserSettings.js';
import { EmergencySession } from '../models/EmergencySession.js';
import { LocationHistory } from '../models/LocationHistory.js';
import { Journey } from '../models/Journey.js';
import { Volunteer } from '../models/Volunteer.js';
import { Notification } from '../models/Notification.js';

export const seedDatabase = async (): Promise<void> => {
  console.log('[SecuraX Seed] Checking database for existing demonstration data...');

  const existingDemoUser = await User.findOne({ email: 'demo@securax.com' });
  if (existingDemoUser) {
    console.log('[SecuraX Seed] Demonstration data already initialized.');
    return;
  }

  console.log('[SecuraX Seed] Seeding demo data for evaluation and portfolio demonstration...');

  // 1. Demo User
  const passwordHash = await bcrypt.hash('SecuraX@123', 10);
  const demoUser = await User.create({
    name: 'Aahana Sharma',
    email: 'demo@securax.com',
    phone: '+91 98765 43210',
    passwordHash,
    role: 'user',
    bloodGroup: 'O+',
    medicalNotes: 'No known drug allergies. Asthmatic (inhaler kept in purse).',
    emergencyNote: 'In case of severe emergency, contact Dr. Rajesh Sharma (+91 98111 22334) immediately.',
    isVolunteer: false,
  });

  // 2. PIN Configuration
  const normalPinHash = await bcrypt.hash('1234', 10);
  const secretEmergencyPinHash = await bcrypt.hash('9999', 10);
  await PINConfiguration.create({
    userId: demoUser._id,
    normalPinHash,
    secretEmergencyPinHash,
    fakeScreenGreeting: 'Session verified. Welcome to Calculator.',
    isConfigured: true,
  });

  // 3. User Settings
  await UserSettings.create({
    userId: demoUser._id,
    voiceTriggerKeyword: 'help securax',
    isVoiceSOSActive: true,
    shakeSensitivity: 'medium',
    isShakeSOSEnabled: true,
    safetyCheckGracePeriodSeconds: 60,
    routeDeviationThresholdMeters: 300,
    simulatedExternalServices: true,
    offlineSyncEnabled: true,
  });

  // 4. Emergency Contacts (3-5 realistic contacts)
  const contact1 = await EmergencyContact.create({
    userId: demoUser._id,
    name: 'Sunita Sharma (Mother)',
    phone: '+91 98765 00001',
    relationship: 'Mother',
    email: 'sunita.sharma@example.com',
    isPrimary: true,
    notifyPreference: 'all',
    isVerified: true,
  });

  const contact2 = await EmergencyContact.create({
    userId: demoUser._id,
    name: 'Rohan Sharma (Brother)',
    phone: '+91 98765 00002',
    relationship: 'Brother',
    email: 'rohan.sharma@example.com',
    isPrimary: false,
    notifyPreference: 'sms',
    isVerified: true,
  });

  const contact3 = await EmergencyContact.create({
    userId: demoUser._id,
    name: 'Priya Verma (Best Friend)',
    phone: '+91 98765 00003',
    relationship: 'Friend',
    email: 'priya.verma@example.com',
    isPrimary: false,
    notifyPreference: 'call',
    isVerified: true,
  });

  // 5. Past Emergency Session (Resolved)
  const pastSession = await EmergencySession.create({
    userId: demoUser._id,
    status: 'resolved',
    triggerType: 'one_tap_sos',
    triggerSource: 'manual',
    initialLocation: {
      lat: 28.6139,
      lng: 77.2090,
      accuracy: 8,
      address: 'Connaught Place, Central Delhi',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    lastLocation: {
      lat: 28.6145,
      lng: 77.2098,
      accuracy: 6,
      address: 'Barakhamba Road Metro, New Delhi',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
    },
    startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000),
    notes: 'Demo emergency session test resolved safely after verifying family arrival.',
  });

  // 6. Location History for past session
  await LocationHistory.create({
    userId: demoUser._id,
    emergencySessionId: pastSession._id,
    coordinates: { lat: 28.6139, lng: 77.2090 },
    accuracy: 8,
    speed: 0,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  });

  await LocationHistory.create({
    userId: demoUser._id,
    emergencySessionId: pastSession._id,
    coordinates: { lat: 28.6145, lng: 77.2098 },
    accuracy: 6,
    speed: 1.2,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
  });

  // 7. Completed Past Cab Journey
  const journeyStart = { lat: 28.5355, lng: 77.3910, address: 'Cyber City, Gurugram' };
  const journeyDest = { lat: 28.6139, lng: 77.2090, address: 'Connaught Place, New Delhi' };
  await Journey.create({
    userId: demoUser._id,
    startPoint: journeyStart,
    destination: journeyDest,
    plannedRoute: [
      journeyStart,
      { lat: 28.5500, lng: 77.3500 },
      { lat: 28.5800, lng: 77.2800 },
      { lat: 28.6000, lng: 77.2400 },
      journeyDest,
    ],
    expectedDurationMinutes: 45,
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
    estimatedArrivalTime: new Date(Date.now() - 23 * 60 * 60 * 1000 - 15 * 60 * 1000),
    actualEndTime: new Date(Date.now() - 23 * 60 * 60 * 1000 - 10 * 60 * 1000),
    status: 'completed',
    cabDetails: {
      cabProvider: 'Uber Premier',
      vehicleNumber: 'DL-01-CZ-8821',
      driverName: 'Vikram Singh',
      driverPhone: '+91 98100 11223',
    },
    trustedContactIds: [contact1._id, contact2._id],
    safetyChecks: [
      {
        checkTime: new Date(Date.now() - 23 * 60 * 60 * 1000 - 30 * 60 * 1000),
        status: 'safe',
        responseTime: new Date(Date.now() - 23 * 60 * 60 * 1000 - 29 * 60 * 1000),
      },
    ],
  });

  // 8. Nearby Verified Volunteers
  await Volunteer.create([
    {
      name: 'Dr. Ananya Roy (MD)',
      phone: '+91 99887 11223',
      email: 'ananya.roy@example.com',
      address: 'Kailash Colony, South Delhi',
      coordinates: { lat: 28.5520, lng: 77.2410 },
      isAvailable: true,
      isVerified: true,
      verificationBadge: 'Verified Medical Responder',
      skills: ['Emergency Medicine', 'CPR Certified', 'First Responder'],
      rating: 4.95,
      emergenciesAssistedCount: 14,
    },
    {
      name: 'Karan Mehra (Civil Defense)',
      phone: '+91 99887 33445',
      email: 'karan.mehra@example.com',
      address: 'Lajpat Nagar 4, New Delhi',
      coordinates: { lat: 28.5680, lng: 77.2430 },
      isAvailable: true,
      isVerified: true,
      verificationBadge: 'Disaster & Civil Safety Volunteer',
      skills: ['Search & Rescue', 'Self Defense Instructor'],
      rating: 4.88,
      emergenciesAssistedCount: 8,
    },
    {
      name: 'Sneha Kapur (Community Lead)',
      phone: '+91 99887 55667',
      email: 'sneha.kapur@example.com',
      address: 'Hauz Khas, New Delhi',
      coordinates: { lat: 28.5494, lng: 77.2001 },
      isAvailable: true,
      isVerified: true,
      verificationBadge: 'Women Safety Marshal',
      skills: ['Local Escort', 'Crisis De-escalation', 'First Aid'],
      rating: 4.92,
      emergenciesAssistedCount: 19,
    },
  ]);

  // 9. Initial Notifications History
  await Notification.create([
    {
      userId: demoUser._id,
      emergencySessionId: pastSession._id,
      channel: 'push',
      recipient: 'Aahana Sharma (Self & Emergency Contacts)',
      title: '🚨 [URGENT] SecuraX Alert: SOS Activation for Aahana Sharma',
      message: 'EMERGENCY ALERT: One-Tap SOS triggered at Connaught Place, Central Delhi. Live link shared.',
      status: 'delivered',
      sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      userId: demoUser._id,
      emergencySessionId: pastSession._id,
      channel: 'sms',
      recipient: 'Sunita Sharma (+91 98765 00001)',
      title: 'SecuraX SMS: SOS Activation',
      message: 'EMERGENCY ALERT: Aahana Sharma has triggered an SOS. Location: Connaught Place, New Delhi.',
      status: 'delivered',
      sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      userId: demoUser._id,
      emergencySessionId: pastSession._id,
      channel: 'email',
      recipient: 'Sunita Sharma <sunita.sharma@example.com>',
      title: '🚨 [URGENT] SecuraX Alert: SOS Activation for Aahana Sharma',
      message: 'Your emergency contact Aahana Sharma has triggered an SOS. Live tracking is active.',
      status: 'delivered',
      sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  ]);

  console.log('[SecuraX Seed] Demonstration database seeded successfully.');
};
