export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  bloodGroup?: string;
  medicalNotes?: string;
  emergencyNote?: string;
  role: 'user' | 'volunteer' | 'admin';
  isVolunteer?: boolean;
}

export interface EmergencyContact {
  _id: string;
  name: string;
  phone: string;
  relationship: string;
  email?: string;
  isPrimary: boolean;
  notifyPreference: 'all' | 'sms' | 'call' | 'email';
  isVerified: boolean;
  createdAt: string;
}

export interface LocationPoint {
  lat: number;
  lng: number;
  accuracy?: number;
  address?: string;
  timestamp?: string;
}

export interface EmergencySession {
  _id: string;
  userId: string;
  status: 'active' | 'resolved' | 'cancelled';
  triggerType: 'one_tap_sos' | 'silent_pin' | 'voice_sos' | 'shake_sos' | 'timer_expired' | 'cab_deviation';
  triggerSource: 'manual' | 'automatic' | 'disguise';
  shareToken: string;
  initialLocation?: LocationPoint;
  lastLocation?: LocationPoint;
  startedAt: string;
  resolvedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  audioRecordingsCount: number;
  notes?: string;
}

export interface Journey {
  _id: string;
  userId: string;
  startPoint: LocationPoint;
  destination: LocationPoint;
  plannedRoute: Array<{ lat: number; lng: number }>;
  expectedDurationMinutes: number;
  startTime: string;
  estimatedArrivalTime: string;
  actualEndTime?: string;
  status: 'active' | 'completed' | 'deviation_alert' | 'overdue' | 'emergency';
  cabDetails: {
    cabProvider: string;
    vehicleNumber: string;
    driverName: string;
    driverPhone?: string;
  };
  trustedContactIds: any[];
  safetyCheckFrequencyMinutes: number;
  safetyChecks: Array<{
    checkTime: string;
    status: 'prompted' | 'safe' | 'help_requested' | 'unresponsive';
    responseTime?: string;
  }>;
  lastKnownLocation?: {
    lat: number;
    lng: number;
    timestamp: string;
  };
}

export interface SafetyCheckIn {
  _id: string;
  userId: string;
  durationMinutes: number;
  startTime: string;
  expiresAt: string;
  status: 'active' | 'safe' | 'expired' | 'escalated';
  responseTime?: string;
  note?: string;
  emergencySessionId?: string;
}

export interface EvidenceFile {
  _id: string;
  userId: string;
  emergencySessionId?: any;
  fileType: 'audio' | 'location_snapshot' | 'incident_report';
  fileName: string;
  originalName: string;
  filePath: string;
  mimeType: string;
  sizeBytes: number;
  durationSeconds?: number;
  recordedAt: string;
  notes?: string;
}

export interface NotificationItem {
  _id: string;
  userId: string;
  channel: 'push' | 'email' | 'sms';
  recipient: string;
  title: string;
  message: string;
  status: 'delivered' | 'simulated' | 'failed';
  metadata?: any;
  sentAt: string;
}

export interface VolunteerItem {
  id: string;
  name: string;
  rating: number;
  skills: string[];
  verificationBadge: string;
  distanceKm: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  emergenciesAssistedCount: number;
}

export interface UserSettings {
  voiceTriggerKeyword: string;
  isVoiceSOSActive: boolean;
  shakeSensitivity: 'low' | 'medium' | 'high';
  isShakeSOSEnabled: boolean;
  shakeCooldownSeconds: number;
  safetyCheckGracePeriodSeconds: number;
  routeDeviationThresholdMeters: number;
  simulatedExternalServices: boolean;
  offlineSyncEnabled: boolean;
  theme: 'system' | 'light' | 'dark';
}
