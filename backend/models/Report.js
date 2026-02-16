import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', required: true },
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Report', reportSchema);
