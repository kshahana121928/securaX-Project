import mongoose, { Document, Schema } from 'mongoose';

export interface ISafetyCheck {
  checkTime: Date;
  status: 'prompted' | 'safe' | 'help_requested' | 'unresponsive';
  responseTime?: Date;
}

export interface IJourneyPoint {
  lat: number;
  lng: number;
  address?: string;
}

export interface IJourney extends Document {
  userId: mongoose.Types.ObjectId;
  startPoint: IJourneyPoint;
  destination: IJourneyPoint;
  plannedRoute: Array<{ lat: number; lng: number }>;
  expectedDurationMinutes: number;
  startTime: Date;
  estimatedArrivalTime: Date;
  actualEndTime?: Date;
  status: 'active' | 'completed' | 'deviation_alert' | 'overdue' | 'emergency';
  cabDetails: {
    cabProvider: string;
    vehicleNumber: string;
    driverName: string;
    driverPhone?: string;
  };
  trustedContactIds: mongoose.Types.ObjectId[];
  safetyCheckFrequencyMinutes: number;
  safetyChecks: ISafetyCheck[];
  lastKnownLocation?: {
    lat: number;
    lng: number;
    timestamp: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const JourneySchema = new Schema<IJourney>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    startPoint: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, default: '' },
    },
    destination: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, default: '' },
    },
    plannedRoute: [
      {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        _id: false,
      },
    ],
    expectedDurationMinutes: { type: Number, required: true, default: 30 },
    startTime: { type: Date, default: Date.now },
    estimatedArrivalTime: { type: Date, required: true },
    actualEndTime: { type: Date },
    status: {
      type: String,
      enum: ['active', 'completed', 'deviation_alert', 'overdue', 'emergency'],
      default: 'active',
      index: true,
    },
    cabDetails: {
      cabProvider: { type: String, default: 'Ride' },
      vehicleNumber: { type: String, default: '' },
      driverName: { type: String, default: '' },
      driverPhone: { type: String, default: '' },
    },
    trustedContactIds: [{ type: Schema.Types.ObjectId, ref: 'EmergencyContact' }],
    safetyCheckFrequencyMinutes: { type: Number, default: 15 },
    safetyChecks: [
      {
        checkTime: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ['prompted', 'safe', 'help_requested', 'unresponsive'],
          default: 'prompted',
        },
        responseTime: { type: Date },
      },
    ],
    lastKnownLocation: {
      lat: Number,
      lng: Number,
      timestamp: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

export const Journey = mongoose.model<IJourney>('Journey', JourneySchema);
