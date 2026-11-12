import mongoose, { Document, Schema } from 'mongoose';

export interface IUserSettings extends Document {
  userId: mongoose.Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

const UserSettingsSchema = new Schema<IUserSettings>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    voiceTriggerKeyword: { type: String, default: 'help securax' },
    isVoiceSOSActive: { type: Boolean, default: false },
    shakeSensitivity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    isShakeSOSEnabled: { type: Boolean, default: true },
    shakeCooldownSeconds: { type: Number, default: 5 },
    safetyCheckGracePeriodSeconds: { type: Number, default: 60 },
    routeDeviationThresholdMeters: { type: Number, default: 300 },
    simulatedExternalServices: { type: Boolean, default: true },
    offlineSyncEnabled: { type: Boolean, default: true },
    theme: { type: String, enum: ['system', 'light', 'dark'], default: 'light' },
  },
  { timestamps: true }
);

export const UserSettings = mongoose.model<IUserSettings>('UserSettings', UserSettingsSchema);
