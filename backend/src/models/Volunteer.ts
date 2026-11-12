import mongoose, { Document, Schema } from 'mongoose';

export interface IVolunteer extends Document {
  userId?: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  isAvailable: boolean;
  isVerified: boolean;
  verificationBadge: string;
  skills: string[];
  rating: number;
  emergenciesAssistedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const VolunteerSchema = new Schema<IVolunteer>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, default: '' },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    isAvailable: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: true },
    verificationBadge: { type: String, default: 'Community Safety Responder' },
    skills: [{ type: String }],
    rating: { type: Number, default: 4.9 },
    emergenciesAssistedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Volunteer = mongoose.model<IVolunteer>('Volunteer', VolunteerSchema);
