import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';

export interface ILocationPoint {
  lat: number;
  lng: number;
  accuracy?: number;
  address?: string;
  timestamp?: Date;
}

export interface IEmergencySession extends Document {
  userId: mongoose.Types.ObjectId;
  status: 'active' | 'resolved' | 'cancelled';
  triggerType: 'one_tap_sos' | 'silent_pin' | 'voice_sos' | 'shake_sos' | 'timer_expired' | 'cab_deviation';
  triggerSource: 'manual' | 'automatic' | 'disguise';
  shareToken: string;
  initialLocation?: ILocationPoint;
  lastLocation?: ILocationPoint;
  startedAt: Date;
  resolvedAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  audioRecordingsCount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LocationPointSchema = new Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    accuracy: { type: Number, default: 10 },
    address: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const EmergencySessionSchema = new Schema<IEmergencySession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['active', 'resolved', 'cancelled'],
      default: 'active',
      index: true,
    },
    triggerType: {
      type: String,
      enum: ['one_tap_sos', 'silent_pin', 'voice_sos', 'shake_sos', 'timer_expired', 'cab_deviation'],
      required: true,
    },
    triggerSource: {
      type: String,
      enum: ['manual', 'automatic', 'disguise'],
      default: 'manual',
    },
    shareToken: {
      type: String,
      default: () => crypto.randomBytes(16).toString('hex'),
      unique: true,
      index: true,
    },
    initialLocation: LocationPointSchema,
    lastLocation: LocationPointSchema,
    startedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date },
    cancelledAt: { type: Date },
    cancelReason: { type: String, default: '' },
    audioRecordingsCount: { type: Number, default: 0 },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const EmergencySession = mongoose.model<IEmergencySession>('EmergencySession', EmergencySessionSchema);
