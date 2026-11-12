import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  avatar?: string;
  role: 'user' | 'volunteer' | 'admin';
  bloodGroup?: string;
  medicalNotes?: string;
  emergencyNote?: string;
  isVolunteer: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['user', 'volunteer', 'admin'], default: 'user' },
    bloodGroup: { type: String, default: 'Not specified' },
    medicalNotes: { type: String, default: 'None' },
    emergencyNote: { type: String, default: 'In case of emergency, please notify my primary contact immediately.' },
    isVolunteer: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
