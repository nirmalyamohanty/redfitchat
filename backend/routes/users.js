import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

router.get('/search', protect, async (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase();
  if (q.length < 2) return res.json([]);
  const users = await User.find({
    username: { $regex: q, $options: 'i' },
    _id: { $ne: req.user._id }
  })
    .select('username profilePic')
    .limit(10)
    .lean();
  res.json(users);
});

router.get('/:id', protect, async (req, res) => {
  const user = await User.findById(req.params.id).select('username profilePic bio').lean();
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

router.patch('/me', protect, async (req, res) => {
  // Allow guests to update profile for demo purposes
  // if (req.user.isGuest || req.user._id.toString().startsWith('guest_')) {
  //   return res.status(403).json({ message: 'Guests cannot update profile' });
  // }
  const { bio, translationDefault } = req.body;
  const updates = {};
  if (typeof bio === 'string') updates.bio = bio.slice(0, 200);
  if (typeof translationDefault === 'boolean') updates.translationDefault = translationDefault;
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-googleId');
  res.json(user);
});

// Configure Multer for Local Storage (Avatars)
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const localUpload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/me/avatar', protect, localUpload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file provided' });
  try {
    // Construct local URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/avatars/${req.file.filename}`;

    await User.findByIdAndUpdate(req.user._id, { profilePic: fileUrl });
    res.json({ profilePic: fileUrl });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ message: 'Upload failed. Check server logs.' });
  }
});

router.post('/block/:userId', protect, async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { blockedUsers: req.params.userId } },
    { new: true }
  ).select('-googleId');
  res.json(user);
});

router.post('/unblock/:userId', protect, async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $pull: { blockedUsers: req.params.userId } });
  res.json({ message: 'Unblocked' });
});

export default router;
