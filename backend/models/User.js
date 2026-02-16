import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  profilePic: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: '',
    maxlength: 200
  },
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  translationDefault: {
    type: Boolean,
    default: false
  },
  dailyUploadCount: { type: Number, default: 0 },
  lastUploadReset: { type: Date, default: Date.now },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('User', userSchema);
