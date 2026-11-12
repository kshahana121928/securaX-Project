import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  emergencySessionId?: mongoose.Types.ObjectId;
  channel: 'push' | 'email' | 'sms';
  recipient: string;
  title: string;
  message: string;
  status: 'delivered' | 'simulated' | 'failed';
  metadata?: Record<string, any>;
  sentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    emergencySessionId: { type: Schema.Types.ObjectId, ref: 'EmergencySession', index: true },
    channel: {
      type: String,
      enum: ['push', 'email', 'sms'],
      required: true,
    },
    recipient: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['delivered', 'simulated', 'failed'],
      default: 'delivered',
    },
    metadata: { type: Schema.Types.Mixed, default: {} },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
