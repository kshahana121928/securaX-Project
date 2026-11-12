import mongoose, { Document, Schema } from 'mongoose';

export interface ISafetyCheckIn extends Document {
  userId: mongoose.Types.ObjectId;
  durationMinutes: number;
  startTime: Date;
  expiresAt: Date;
  status: 'active' | 'safe' | 'expired' | 'escalated';
  responseTime?: Date;
  note?: string;
  emergencySessionId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SafetyCheckInSchema = new Schema<ISafetyCheckIn>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    durationMinutes: { type: Number, required: true },
    startTime: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ['active', 'safe', 'expired', 'escalated'],
      default: 'active',
      index: true,
    },
    responseTime: { type: Date },
    note: { type: String, default: 'General safety check-in' },
    emergencySessionId: { type: Schema.Types.ObjectId, ref: 'EmergencySession' },
  },
  { timestamps: true }
);

export const SafetyCheckIn = mongoose.model<ISafetyCheckIn>('SafetyCheckIn', SafetyCheckInSchema);
