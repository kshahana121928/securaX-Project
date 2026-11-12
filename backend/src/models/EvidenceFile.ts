import mongoose, { Document, Schema } from 'mongoose';

export interface IEvidenceFile extends Document {
  userId: mongoose.Types.ObjectId;
  emergencySessionId?: mongoose.Types.ObjectId;
  fileType: 'audio' | 'location_snapshot' | 'incident_report';
  fileName: string;
  originalName: string;
  filePath: string;
  mimeType: string;
  sizeBytes: number;
  durationSeconds?: number;
  recordedAt: Date;
  legalDisclaimerAcknowledged: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EvidenceFileSchema = new Schema<IEvidenceFile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    emergencySessionId: { type: Schema.Types.ObjectId, ref: 'EmergencySession', index: true },
    fileType: {
      type: String,
      enum: ['audio', 'location_snapshot', 'incident_report'],
      default: 'audio',
    },
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    filePath: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    durationSeconds: { type: Number, default: 0 },
    recordedAt: { type: Date, default: Date.now },
    legalDisclaimerAcknowledged: { type: Boolean, default: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const EvidenceFile = mongoose.model<IEvidenceFile>('EvidenceFile', EvidenceFileSchema);
