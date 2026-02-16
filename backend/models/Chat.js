import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

chatSchema.index({ participants: 1 }, { unique: true });
chatSchema.index({ updatedAt: -1 });

export default mongoose.model('Chat', chatSchema);
