import mongoose, { Document, Schema } from 'mongoose';

export interface ILocationHistory extends Document {
  userId: mongoose.Types.ObjectId;
  emergencySessionId?: mongoose.Types.ObjectId;
  journeyId?: mongoose.Types.ObjectId;
  coordinates: {
    lat: number;
    lng: number;
  };
  accuracy?: number;
  speed?: number;
  heading?: number;
  altitude?: number;
  timestamp: Date;
}

const LocationHistorySchema = new Schema<ILocationHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    emergencySessionId: { type: Schema.Types.ObjectId, ref: 'EmergencySession', index: true },
    journeyId: { type: Schema.Types.ObjectId, ref: 'Journey', index: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    accuracy: { type: Number, default: 5 },
    speed: { type: Number, default: 0 },
    heading: { type: Number, default: 0 },
    altitude: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

export const LocationHistory = mongoose.model<ILocationHistory>('LocationHistory', LocationHistorySchema);
