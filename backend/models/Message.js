import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chatType: {
    type: String,
    enum: ['global', 'personal'],
    required: true
  },
  chatId: {
    type: String,
    required: true,
    index: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    default: ''
  },
  mediaUrl: {
    type: String,
    default: ''
  },
  mediaType: {
    type: String,
    enum: ['image', 'video', 'file', ''],
    default: ''
  },
  replyToMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  replyContext: {
    originalId: String,
    originalText: String,
    originalSender: String
  }
});

messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ replyToMessageId: 1 });

export default mongoose.model('Message', messageSchema);
