import mongoose, { Document, Schema } from 'mongoose';

export interface IEmergencyContact extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  relationship: string;
  email?: string;
  isPrimary: boolean;
  notifyPreference: 'all' | 'sms' | 'call' | 'email';
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmergencyContactSchema = new Schema<IEmergencyContact>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    relationship: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true, default: '' },
    isPrimary: { type: Boolean, default: false },
    notifyPreference: {
      type: String,
      enum: ['all', 'sms', 'call', 'email'],
      default: 'all',
    },
    isVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const EmergencyContact = mongoose.model<IEmergencyContact>('EmergencyContact', EmergencyContactSchema);
