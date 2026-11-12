import { Response } from 'express';
import { z } from 'zod';
import { EmergencyContact } from '../models/EmergencyContact.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { NotificationService } from '../services/notificationService.js';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  relationship: z.string().min(2, 'Relationship is required (e.g., Parent, Spouse, Friend)'),
  email: z.string().email().optional().or(z.literal('')),
  notifyPreference: z.enum(['all', 'sms', 'call', 'email']).default('all'),
  isPrimary: z.boolean().default(false),
});

export const getContacts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const contacts = await EmergencyContact.find({ userId: req.userId }).sort({ isPrimary: -1, createdAt: -1 });
  res.json({ success: true, count: contacts.length, contacts });
};

export const createContact = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const validated = contactSchema.parse(req.body);

  const count = await EmergencyContact.countDocuments({ userId: req.userId });
  if (count >= 10) {
    res.status(400).json({ success: false, message: 'You have reached the maximum allowed emergency contacts (10).' });
    return;
  }

  // If this is set as primary or first contact, unset other primaries
  if (validated.isPrimary || count === 0) {
    await EmergencyContact.updateMany({ userId: req.userId }, { isPrimary: false });
  }

  const contact = await EmergencyContact.create({
    userId: req.userId,
    name: validated.name,
    phone: validated.phone,
    relationship: validated.relationship,
    email: validated.email || '',
    notifyPreference: validated.notifyPreference,
    isPrimary: validated.isPrimary || count === 0,
    isVerified: true,
  });

  res.status(201).json({ success: true, message: 'Emergency contact added', contact });
};

export const updateContact = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const validated = contactSchema.partial().parse(req.body);

  if (validated.isPrimary) {
    await EmergencyContact.updateMany({ userId: req.userId }, { isPrimary: false });
  }

  const contact = await EmergencyContact.findOneAndUpdate(
    { _id: id, userId: req.userId },
    { $set: validated },
    { new: true }
  );

  if (!contact) {
    res.status(404).json({ success: false, message: 'Contact not found' });
    return;
  }

  res.json({ success: true, message: 'Contact updated successfully', contact });
};

export const deleteContact = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const contact = await EmergencyContact.findOneAndDelete({ _id: id, userId: req.userId });

  if (!contact) {
    res.status(404).json({ success: false, message: 'Contact not found' });
    return;
  }

  // If deleted contact was primary, assign first remaining as primary
  if (contact.isPrimary) {
    const nextPrimary = await EmergencyContact.findOne({ userId: req.userId });
    if (nextPrimary) {
      nextPrimary.isPrimary = true;
      await nextPrimary.save();
    }
  }

  res.json({ success: true, message: 'Contact deleted successfully' });
};

export const testContactAlert = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const contact = await EmergencyContact.findOne({ _id: id, userId: req.userId });

  if (!contact) {
    res.status(404).json({ success: false, message: 'Contact not found' });
    return;
  }

  // Dispatch test notification
  await NotificationService.dispatchEmergencyAlerts({
    userId: req.userId!,
    alertType: 'SOS Activation',
    customMessage: `[TEST ALERT] This is a verification test notification from SecuraX for contact ${contact.name}. No emergency action is required.`,
  });

  res.json({
    success: true,
    message: `Test alert dispatched to ${contact.name} via ${contact.notifyPreference} preference.`,
  });
};
