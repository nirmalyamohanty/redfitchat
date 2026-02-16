import express from 'express';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import mongoose from 'mongoose'; // Fixed: Import mongoose

const router = express.Router();

router.get('/', protect, async (req, res) => {
  const chats = await Chat.find({ participants: req.user._id })
    .populate('participants', 'username profilePic')
    .populate('lastMessage')
    .sort({ updatedAt: -1 })
    .lean();
  const out = chats.map(c => {
    const otherUser = c.participants.find(p => p && p._id.toString() !== req.user._id.toString());
    return {
      ...c,
      otherUser
    };
  });
  res.json(out);
});

router.post('/with/:userId', protect, async (req, res) => {
  const otherId = req.params.userId;
  console.log(`[CHAT] Request to start chat with ${otherId} by ${req.user.username}`);

  if (!mongoose.Types.ObjectId.isValid(otherId)) {
    console.error(`[CHAT] Invalid User ID: ${otherId}`);
    return res.status(400).json({ message: 'Invalid or missing User ID. Please try again.' });
  }

  if (otherId === req.user._id.toString()) return res.status(400).json({ message: 'Cannot chat with yourself' });

  const other = await User.findById(otherId);
  if (!other) {
    console.error(`[CHAT] User not found: ${otherId}`);
    return res.status(404).json({ message: 'User not found' });
  }

  const blocked = await User.findOne({ _id: req.user._id, blockedUsers: otherId });
  if (blocked) return res.status(403).json({ message: 'User is blocked' });

  let chat = await Chat.findOne({
    participants: { $all: [req.user._id, otherId] },
    // Removed chatType check to be more lenient, or we can add it if we strictly separate types
  }).populate('participants', 'username profilePic');

  if (!chat) {
    console.log(`[CHAT] Creating new chat between ${req.user.username} and ${other.username}`);
    chat = await Chat.create({
      participants: [req.user._id, otherId],
      chatType: 'personal'
    });
    await chat.populate('participants', 'username profilePic');
  } else {
    console.log(`[CHAT] Found existing chat: ${chat._id}`);
  }

  res.json(chat);
});

export default router;
