import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  // Prioritize Header over Cookie to allow "Guest Mode" to override "Logged In Cookie"
  let token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;
  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.isGuest) {
      req.user = {
        _id: decoded.userId,
        username: decoded.username || 'anon_guest',
        profilePic: decoded.profilePic || '',
        bio: decoded.bio || '',
        isGuest: true
      };
      return next();
    }
    if (mongoose.Types.ObjectId.isValid(decoded.userId)) {
      const user = await User.findById(decoded.userId).select('-googleId');
      if (user) {
        req.user = user;
        return next();
      }
    }
    return res.status(401).json({ message: 'User not found' });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
