import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Message from '../models/Message.js';
import Chat from '../models/Chat.js';
import User from '../models/User.js';
import { filterText } from '../middleware/profanityFilter.js';

const onlineUsers = new Map();

async function getUserFromToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.isGuest) {
      return { _id: decoded.userId, username: decoded.username || 'anon_guest', isGuest: true };
    }
    if (mongoose.Types.ObjectId.isValid(decoded.userId)) {
      const user = await User.findById(decoded.userId).select('_id username');
      return user ? { ...user.toObject(), isGuest: false } : null;
    }
    return null;
  } catch {
    return null;
  }
}

export function setupSocket(io) {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    const user = await getUserFromToken(token);
    if (!user) return next(new Error('Auth required'));
    socket.userId = user._id.toString();
    socket.username = user.username;
    socket.isGuest = user.isGuest || false;
    next();
  });

  io.on('connection', (socket) => {
    onlineUsers.set(socket.userId, { username: socket.username, lastSeen: Date.now() });
    io.emit('user:online', { userId: socket.userId, username: socket.username });

    socket.on('disconnect', () => {
      onlineUsers.delete(socket.userId);
      io.emit('user:offline', { userId: socket.userId });
    });

    socket.on('global:join', () => {
      socket.join('global');
    });

    socket.on('global:typing', () => {
      socket.to('global').emit('global:typing', { userId: socket.userId, username: socket.username });
    });

    socket.on('global:message', async (payload, ack) => {
      try {
        const { text, mediaUrl, mediaType, replyTo } = payload;

        // Construct reply context
        const replyContext = replyTo ? {
          originalId: replyTo._id,
          originalText: replyTo.text,
          originalSender: replyTo.username
        } : null;

        if (socket.isGuest) {
          const msg = {
            _id: 'guest_' + Date.now() + '_' + Math.random().toString(36).slice(2),
            chatType: 'global',
            chatId: 'global',
            senderId: { _id: socket.userId, username: socket.username },
            text: filterText(text || ''),
            mediaUrl: mediaUrl || '',
            mediaType: mediaType || '',
            replyToMessageId: null,
            replyContext,
            createdAt: new Date()
          };
          io.to('global').emit('global:message', msg);
          ack?.({ ok: true, message: msg });
          return;
        }

        let validReplyId = null;
        if (replyTo && replyTo._id && mongoose.Types.ObjectId.isValid(replyTo._id)) {
          validReplyId = replyTo._id;
        }

        const msg = await Message.create({
          chatType: 'global',
          chatId: 'global',
          senderId: socket.userId,
          text: filterText(text || ''),
          mediaUrl: mediaUrl || '',
          mediaType: mediaType || '',
          replyToMessageId: validReplyId,
          replyContext
        });
        await msg.populate(['senderId', 'replyToMessageId']);
        io.to('global').emit('global:message', msg);
        ack?.({ ok: true, message: msg });
      } catch (err) {
        ack?.({ ok: false, error: err.message });
      }
    });

    socket.on('personal:join', (chatId) => {
      socket.join(`personal:${chatId}`);
    });

    socket.on('personal:typing', (chatId) => {
      socket.to(`personal:${chatId}`).emit('personal:typing', { userId: socket.userId, chatId });
    });

    socket.on('personal:message', async (payload, ack) => {
      try {
        const { chatId, text, mediaUrl, mediaType, replyTo } = payload;
        const chat = await Chat.findById(chatId);
        if (!chat) return ack?.({ ok: false, error: 'Chat not found' });
        const isParticipant = chat.participants.some(p => p.toString() === socket.userId);
        if (!isParticipant) return ack?.({ ok: false, error: 'Not in chat' });

        // Construct reply context
        const replyContext = replyTo ? {
          originalId: replyTo._id,
          originalText: replyTo.text,
          originalSender: replyTo.username
        } : null;

        // Validate replyToMessageId if available
        let validReplyId = null;
        if (replyTo && replyTo._id && mongoose.Types.ObjectId.isValid(replyTo._id)) {
          validReplyId = replyTo._id;
        }

        const msg = await Message.create({
          chatType: 'personal',
          chatId,
          senderId: socket.userId,
          text: filterText(text || ''),
          mediaUrl: mediaUrl || '',
          mediaType: mediaType || '',
          replyToMessageId: validReplyId,
          replyContext
        });
        chat.lastMessage = msg._id;
        chat.updatedAt = new Date();
        await chat.save();
        await msg.populate(['senderId', 'replyToMessageId']);
        io.to(`personal:${chatId}`).emit('personal:message', msg);
        ack?.({ ok: true, message: msg });
      } catch (err) {
        ack?.({ ok: false, error: err.message });
      }
    });
  });

  return io;
}
