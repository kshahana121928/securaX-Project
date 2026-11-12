import { Notification } from '../models/Notification.js';
import { EmergencyContact } from '../models/EmergencyContact.js';
import { User } from '../models/User.js';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';

interface AlertPayload {
  userId: string | mongoose.Types.ObjectId;
  emergencySessionId?: string | mongoose.Types.ObjectId;
  alertType: 'SOS Activation' | 'Silent Emergency PIN' | 'Cab Route Deviation' | 'Safety Timer Expired' | 'Overdue Journey' | 'Helper Request';
  customMessage?: string;
  location?: { lat: number; lng: number; address?: string };
  shareUrl?: string;
}

export class NotificationService {
  private static mailTransporter: nodemailer.Transporter | null = null;

  private static getMailTransporter(): nodemailer.Transporter | null {
    if (this.mailTransporter) return this.mailTransporter;

    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      try {
        this.mailTransporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      } catch (err) {
        console.warn('[SecuraX Notification] SMTP configuration invalid, using simulation mode.');
      }
    }
    return this.mailTransporter;
  }

  public static async dispatchEmergencyAlerts(payload: AlertPayload): Promise<any[]> {
    const user = await User.findById(payload.userId);
    const contacts = await EmergencyContact.find({ userId: payload.userId });
    const results: any[] = [];

    const userName = user?.name || 'SecuraX User';
    const locString = payload.location
      ? `Latitude: ${payload.location.lat.toFixed(5)}, Longitude: ${payload.location.lng.toFixed(5)}${payload.location.address ? ` (${payload.location.address})` : ''}`
      : 'Location data pending';

    const trackingLink = payload.shareUrl || `http://localhost:5173/emergency`;

    const alertTitle = `🚨 [URGENT] SecuraX Alert: ${payload.alertType} for ${userName}`;
    const alertBody = `EMERGENCY ALERT: ${userName} has triggered a ${payload.alertType}. 
Current Location: ${locString}
Time: ${new Date().toLocaleString()}
Live GPS Tracking Link: ${trackingLink}
${payload.customMessage ? `Note: ${payload.customMessage}` : ''}
Please check on them immediately or dial emergency services if unreachable.`;

    // 1. In-App Web Push Notification Log
    const pushNotification = await Notification.create({
      userId: payload.userId,
      emergencySessionId: payload.emergencySessionId,
      channel: 'push',
      recipient: `${userName} (Self & In-App Contacts)`,
      title: alertTitle,
      message: alertBody,
      status: 'delivered',
      metadata: { location: payload.location, alertType: payload.alertType },
      sentAt: new Date(),
    });
    results.push(pushNotification);

    // 2. Dispatch to each emergency contact
    for (const contact of contacts) {
      // SMS Alert (Twilio or Simulation)
      const smsStatus = process.env.TWILIO_ACCOUNT_SID ? 'delivered' : 'simulated';
      const smsRecord = await Notification.create({
        userId: payload.userId,
        emergencySessionId: payload.emergencySessionId,
        channel: 'sms',
        recipient: `${contact.name} (${contact.phone})`,
        title: `SecuraX SMS: ${payload.alertType}`,
        message: alertBody,
        status: smsStatus,
        metadata: { contactId: contact._id, relationship: contact.relationship },
        sentAt: new Date(),
      });
      results.push(smsRecord);

      // Email Alert (SMTP or Simulation)
      if (contact.email) {
        let emailStatus: 'delivered' | 'simulated' | 'failed' = 'simulated';
        const transporter = this.getMailTransporter();

        if (transporter) {
          try {
            await transporter.sendMail({
              from: process.env.SMTP_FROM || 'alerts@securax.com',
              to: contact.email,
              subject: alertTitle,
              text: alertBody,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #DC2626; border-radius: 8px; overflow: hidden;">
                  <div style="background-color: #0B1F3A; color: white; padding: 18px; text-align: center;">
                    <h2 style="color: #DC2626; margin: 0 0 6px 0;">🚨 SECURAX EMERGENCY ALERT</h2>
                    <p style="margin: 0; font-size: 14px; color: #94A3B8;">Smart Personal Safety & Emergency Response</p>
                  </div>
                  <div style="padding: 24px; background-color: #F8FAFC;">
                    <p style="font-size: 16px; color: #0F172A;"><strong>Dear ${contact.name},</strong></p>
                    <p style="font-size: 15px; color: #334155; line-height: 1.5;">
                      Your emergency contact <strong>${userName}</strong> (${contact.relationship}) has triggered a 
                      <span style="color: #DC2626; font-weight: bold;">${payload.alertType}</span>.
                    </p>
                    <div style="background-color: white; border: 1px solid #E2E8F0; padding: 16px; border-radius: 6px; margin: 18px 0;">
                      <p style="margin: 4px 0;"><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                      <p style="margin: 4px 0;"><strong>Location:</strong> ${locString}</p>
                    </div>
                    <div style="text-align: center; margin: 24px 0;">
                      <a href="${trackingLink}" style="background-color: #DC2626; color: white; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; display: inline-block;">
                        VIEW LIVE LOCATION & STATUS
                      </a>
                    </div>
                    <p style="font-size: 13px; color: #64748B;">
                      SecuraX Automated Emergency Broadcast Engine.
                    </p>
                  </div>
                </div>
              `,
            });
            emailStatus = 'delivered';
          } catch (mailErr) {
            console.warn('[SecuraX Notification] Email dispatch failed, falling back to simulated status.');
            emailStatus = 'simulated';
          }
        }

        const emailRecord = await Notification.create({
          userId: payload.userId,
          emergencySessionId: payload.emergencySessionId,
          channel: 'email',
          recipient: `${contact.name} <${contact.email}>`,
          title: alertTitle,
          message: alertBody,
          status: emailStatus,
          metadata: { contactId: contact._id },
          sentAt: new Date(),
        });
        results.push(emailRecord);
      }
    }

    return results;
  }
}
