import { Router } from 'express';
import {
  uploadEvidence,
  getEvidenceList,
  deleteEvidence,
} from '../controllers/evidenceController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { uploadAudio } from '../middleware/uploadMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/upload', uploadAudio.single('audio'), uploadEvidence);
router.get('/', getEvidenceList);
router.delete('/:id', deleteEvidence);

export default router;
