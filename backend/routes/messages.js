import express from 'express';
import Message from '../models/Message.js';
import mongoose from 'mongoose';
import Chat from '../models/Chat.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { messageLimit } from '../middleware/rateLimit.js';
import { filterText } from '../middleware/profanityFilter.js';

const router = express.Router();
const GLOBAL_CHAT_ID = 'global';

router.get('/global', protect, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const before = req.query.before;
    const q = { chatType: 'global', chatId: GLOBAL_CHAT_ID };
    if (before) q.createdAt = { $lt: new Date(before) };
    const messages = await Message.find(q)
      .populate('senderId', 'username profilePic')
      .populate('replyToMessageId', 'text senderId')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.json(messages.reverse());
  } catch (err) {
    res.json([]);
  }
});

router.get('/personal/:chatId', protect, async (req, res) => {
  const chat = await Chat.findById(req.params.chatId).lean();
  if (!chat) return res.status(404).json({ message: 'Chat not found' });
  if (!chat.participants.some(p => p.toString() === req.user._id.toString())) {
    return res.status(403).json({ message: 'Not in this chat' });
  }
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);
  const before = req.query.before;
  const q = { chatType: 'personal', chatId: req.params.chatId };
  if (before) q.createdAt = { $lt: new Date(before) };
  const messages = await Message.find(q)
    .populate('senderId', 'username profilePic')
    .populate('replyToMessageId', 'text senderId')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  res.json(messages.reverse());
});

router.post('/global', protect, messageLimit, async (req, res) => {
  console.log('POST /global request body:', req.body);
  console.log('User:', req.user._id, req.user.username, 'isGuest:', req.user.isGuest);

  try {
    const { text, mediaUrl, mediaType, replyTo } = req.body;
    const cleanText = filterText(text || '');

    // Construct reply context
    const replyContext = replyTo ? {
      originalId: replyTo._id,
      originalText: replyTo.text,
      originalSender: replyTo.username
    } : null;

    if (req.user.isGuest) {
      console.log('Processing guest message...');
      const msg = {
        _id: 'guest_' + Date.now() + '_' + Math.random().toString(36).slice(2),
        chatType: 'global',
        chatId: GLOBAL_CHAT_ID,
        senderId: { _id: req.user._id, username: req.user.username, profilePic: req.user.profilePic || '' },
        text: cleanText,
        mediaUrl: mediaUrl || '',
        mediaType: mediaType || '',
        replyToMessageId: null, // Guests don't use DB refs
        replyContext,
        createdAt: new Date()
      };
      const socketIo = req.app.get('io');
      if (socketIo) socketIo.to('global').emit('global:message', msg);
      return res.status(201).json(msg);
    }

    // Validate replyToMessageId if available (for backward compatibility / rich linking)
    let validReplyId = null;
    if (replyTo && replyTo._id && mongoose.Types.ObjectId.isValid(replyTo._id)) {
      validReplyId = replyTo._id;
    }

    console.log('Creating database message...');
    const msg = await Message.create({
      chatType: 'global',
      chatId: GLOBAL_CHAT_ID,
      senderId: req.user._id,
      text: cleanText,
      mediaUrl: mediaUrl || '',
      mediaType: mediaType || '',
      replyToMessageId: validReplyId,
      replyContext
    });

    console.log('Message created, populating...');
    await msg.populate(['senderId', 'replyToMessageId']);

    const socketIo = req.app.get('io');
    if (socketIo) socketIo.to('global').emit('global:message', msg);

    console.log('Message emitted via socket');
    res.status(201).json(msg);
  } catch (err) {
    console.error('Error in POST /global:', err);
    res.status(500).json({ message: 'Failed to send message', error: err.message });
  }
});

router.post('/personal/:chatId', protect, messageLimit, async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);
  if (!chat) return res.status(404).json({ message: 'Chat not found' });
  const isParticipant = chat.participants.some(p => p.toString() === req.user._id.toString());
  if (!isParticipant) return res.status(403).json({ message: 'Not in this chat' });
  const other = chat.participants.find(p => p.toString() !== req.user._id.toString());
  const blocked = await User.findOne({ _id: req.user._id, blockedUsers: other });
  if (blocked) return res.status(403).json({ message: 'Cannot message blocked user' });
  const { text, mediaUrl, mediaType, replyToMessageId } = req.body;
  // Validate replyToMessageId
  let validReplyId = null;
  if (replyToMessageId && mongoose.Types.ObjectId.isValid(replyToMessageId)) {
    validReplyId = replyToMessageId;
  }

  const msg = await Message.create({
    chatType: 'personal',
    chatId: req.params.chatId,
    senderId: req.user._id,
    text: filterText(text || ''),
    mediaUrl: mediaUrl || '',
    mediaType: mediaType || '',
    replyToMessageId: validReplyId
  });
  chat.lastMessage = msg._id;
  chat.updatedAt = new Date();
  await chat.save();
  await msg.populate(['senderId', 'replyToMessageId']);
  res.status(201).json(msg);
});

router.post('/report/:messageId', protect, async (req, res) => {
  const Report = (await import('../models/Report.js')).default;
  await Report.create({
    messageId: req.params.messageId,
    reporterId: req.user._id,
    reason: req.body.reason || ''
  });
  res.json({ message: 'Report submitted' });
});

export default router;
