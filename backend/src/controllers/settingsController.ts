import { Response } from 'express';
import { UserSettings } from '../models/UserSettings.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const getSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  let settings = await UserSettings.findOne({ userId: req.userId });

  if (!settings) {
    settings = await UserSettings.create({ userId: req.userId });
  }

  res.json({
    success: true,
    settings,
  });
};

export const updateSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const allowed = [
    'voiceTriggerKeyword',
    'isVoiceSOSActive',
    'shakeSensitivity',
    'isShakeSOSEnabled',
    'shakeCooldownSeconds',
    'safetyCheckGracePeriodSeconds',
    'routeDeviationThresholdMeters',
    'simulatedExternalServices',
    'offlineSyncEnabled',
    'theme',
  ];

  const updateData: any = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      updateData[key] = req.body[key];
    }
  }

  const settings = await UserSettings.findOneAndUpdate(
    { userId: req.userId },
    { $set: updateData },
    { new: true, upsert: true }
  );

  res.json({
    success: true,
    message: 'User safety settings updated.',
    settings,
  });
};
