import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect } from '../middleware/auth.js';
import { uploadLimit } from '../middleware/rateLimit.js';
import User from '../models/User.js';

const router = express.Router();
const MAX_FILE = (parseInt(process.env.MAX_FILE_SIZE_MB) || 100) * 1024 * 1024;
const DAILY_LIMIT = parseInt(process.env.DAILY_UPLOAD_LIMIT) || 20;

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Local Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: MAX_FILE }
});

async function checkDailyLimit(userId) {
  const user = await User.findById(userId);
  const now = new Date();
  const lastReset = user?.lastUploadReset || now;
  const dayMs = 24 * 60 * 60 * 1000;

  if (now - lastReset > dayMs) {
    await User.findByIdAndUpdate(userId, { dailyUploadCount: 0, lastUploadReset: now });
    return true;
  }
  if ((user?.dailyUploadCount || 0) >= DAILY_LIMIT) return false;
  return true;
}

router.post('/', protect, uploadLimit, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const canUpload = await checkDailyLimit(req.user._id);
    if (!canUpload) {
      // Delete the file if limit reached (multer saves it before we check)
      fs.unlinkSync(req.file.path);
      return res.status(429).json({ message: 'Daily upload limit reached' });
    }

    const type = req.body.type || 'file';

    // Construct public URL
    // req.protocol + '://' + req.get('host') + '/uploads/' + req.file.filename
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

    await User.findByIdAndUpdate(req.user._id, { $inc: { dailyUploadCount: 1 } });

    res.json({ url: fileUrl, type });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

export default router;
