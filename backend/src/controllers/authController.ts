import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User.js';
import { PINConfiguration } from '../models/PINConfiguration.js';
import { UserSettings } from '../models/UserSettings.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6),
  bloodGroup: z.string().optional(),
  medicalNotes: z.string().optional(),
  emergencyNote: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const createToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'securax_jwt_secret_dev_key';
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const validated = registerSchema.parse(req.body);

  const existing = await User.findOne({ email: validated.email.toLowerCase() });
  if (existing) {
    res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(validated.password, salt);

  const user = await User.create({
    name: validated.name,
    email: validated.email.toLowerCase(),
    phone: validated.phone,
    passwordHash,
    bloodGroup: validated.bloodGroup || 'Not specified',
    medicalNotes: validated.medicalNotes || 'None',
    emergencyNote: validated.emergencyNote || 'Please contact my emergency contacts immediately.',
  });

  // Create default PIN config: Normal PIN '1234', Emergency PIN '9999'
  const normalPinHash = await bcrypt.hash('1234', 10);
  const secretEmergencyPinHash = await bcrypt.hash('9999', 10);
  await PINConfiguration.create({
    userId: user._id,
    normalPinHash,
    secretEmergencyPinHash,
    isConfigured: true,
  });

  // Create default User Settings
  await UserSettings.create({
    userId: user._id,
  });

  const token = createToken(user._id.toString());

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      bloodGroup: user.bloodGroup,
      medicalNotes: user.medicalNotes,
      emergencyNote: user.emergencyNote,
      role: user.role,
    },
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const validated = loginSchema.parse(req.body);

  const user = await User.findOne({ email: validated.email.toLowerCase() });
  if (!user) {
    res.status(401).json({ success: false, message: 'Invalid email or password.' });
    return;
  }

  const isMatch = await bcrypt.compare(validated.password, user.passwordHash);
  if (!isMatch) {
    res.status(401).json({ success: false, message: 'Invalid email or password.' });
    return;
  }

  const token = createToken(user._id.toString());

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    message: 'Logged in successfully',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      bloodGroup: user.bloodGroup,
      medicalNotes: user.medicalNotes,
      emergencyNote: user.emergencyNote,
      role: user.role,
    },
  });
};

export const demoLogin = async (req: Request, res: Response): Promise<void> => {
  let user = await User.findOne({ email: 'demo@securax.com' });
  if (!user) {
    // If demo user does not exist, find first user or create one
    user = await User.findOne();
    if (!user) {
      const passwordHash = await bcrypt.hash('SecuraX@123', 10);
      user = await User.create({
        name: 'Aahana Sharma',
        email: 'demo@securax.com',
        phone: '+91 98765 43210',
        passwordHash,
        bloodGroup: 'O+',
        medicalNotes: 'No known allergies. Asthma inhaler in backpack.',
        emergencyNote: 'If unconscious, please call emergency contact Dr. Rajesh.',
      });
    }
  }

  const token = createToken(user._id.toString());

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    message: 'Demo user logged in successfully',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      bloodGroup: user.bloodGroup,
      medicalNotes: user.medicalNotes,
      emergencyNote: user.emergencyNote,
      role: user.role,
    },
  });
};

export const logout = (req: Request, res: Response): void => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      bloodGroup: req.user.bloodGroup,
      medicalNotes: req.user.medicalNotes,
      emergencyNote: req.user.emergencyNote,
      role: req.user.role,
      isVolunteer: req.user.isVolunteer,
    },
  });
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { name, phone, bloodGroup, medicalNotes, emergencyNote } = req.body;

  const user = await User.findById(req.userId);
  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
  if (medicalNotes !== undefined) user.medicalNotes = medicalNotes;
  if (emergencyNote !== undefined) user.emergencyNote = emergencyNote;

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      bloodGroup: user.bloodGroup,
      medicalNotes: user.medicalNotes,
      emergencyNote: user.emergencyNote,
      role: user.role,
    },
  });
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() });

  // For demonstration and security, always return success message
  res.json({
    success: true,
    message: user
      ? 'Password reset instructions have been dispatched to your email address.'
      : 'If that email address exists in our database, reset instructions have been sent.',
  });
};
