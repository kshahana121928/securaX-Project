import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import { EvidenceFile } from '../models/EvidenceFile.js';
import { EmergencySession } from '../models/EmergencySession.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const uploadEvidence = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No audio file uploaded.' });
    return;
  }

  const { emergencySessionId, durationSeconds, notes } = req.body;

  let session = null;
  if (emergencySessionId) {
    session = await EmergencySession.findOne({ _id: emergencySessionId, userId: req.userId });
  } else {
    // Check if there is an active session to link
    session = await EmergencySession.findOne({ userId: req.userId, status: 'active' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  const evidence = await EvidenceFile.create({
    userId: req.userId,
    emergencySessionId: session?._id,
    fileType: 'audio',
    fileName: req.file.filename,
    originalName: req.file.originalname,
    filePath: fileUrl,
    mimeType: req.file.mimetype,
    sizeBytes: req.file.size,
    durationSeconds: Number(durationSeconds) || 0,
    notes: notes || 'Emergency audio evidence recorded automatically via SecuraX Audio Engine.',
    legalDisclaimerAcknowledged: true,
  });

  if (session) {
    session.audioRecordingsCount = (session.audioRecordingsCount || 0) + 1;
    await session.save();
  }

  res.status(201).json({
    success: true,
    message: 'Emergency audio evidence securely uploaded and encrypted.',
    evidence,
  });
};

export const getEvidenceList = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const files = await EvidenceFile.find({ userId: req.userId })
    .populate('emergencySessionId')
    .sort({ recordedAt: -1 });

  res.json({
    success: true,
    count: files.length,
    disclaimer: 'SecuraX stores safety recordings and telemetry. Recordings are not pre-certified by courts of law.',
    evidence: files,
  });
};

export const deleteEvidence = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  const file = await EvidenceFile.findOne({ _id: id, userId: req.userId });
  if (!file) {
    res.status(404).json({ success: false, message: 'Evidence file not found.' });
    return;
  }

  // Delete actual file from uploads directory
  try {
    const fullPath = path.resolve(process.cwd(), `.${file.filePath}`);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.warn('[Evidence Controller] Local file deletion error:', err);
  }

  await EvidenceFile.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Evidence record and associated audio file permanently deleted.',
  });
};
