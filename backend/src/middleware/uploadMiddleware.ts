import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, `evidence-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'audio/webm',
    'audio/ogg',
    'audio/wav',
    'audio/mp3',
    'audio/mpeg',
    'audio/m4a',
    'video/webm', // MediaRecorder often produces webm
  ];

  if (allowedMimes.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only audio recordings are permitted.'));
  }
};

export const uploadAudio = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max
  },
});
