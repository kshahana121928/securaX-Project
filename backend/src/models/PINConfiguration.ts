import mongoose, { Document, Schema } from 'mongoose';

export interface IPINConfiguration extends Document {
  userId: mongoose.Types.ObjectId;
  normalPinHash: string;
  secretEmergencyPinHash: string;
  fakeScreenGreeting: string;
  failedAttempts: number;
  lockoutUntil?: Date;
  isConfigured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PINConfigurationSchema = new Schema<IPINConfiguration>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    normalPinHash: { type: String, required: true },
    secretEmergencyPinHash: { type: String, required: true },
    fakeScreenGreeting: { type: String, default: 'Session unlocked successfully.' },
    failedAttempts: { type: Number, default: 0 },
    lockoutUntil: { type: Date },
    isConfigured: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const PINConfiguration = mongoose.model<IPINConfiguration>('PINConfiguration', PINConfigurationSchema);
