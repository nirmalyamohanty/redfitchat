import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { generateUsername } from '../utils/generateUsername.js';
import { authLimit } from '../middleware/rateLimit.js';

const router = express.Router();

router.get(
  '/google',
  authLimit,
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    try {
      const profile = req.user;
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        try {
          let username = profile.displayName ? profile.displayName.replace(/\s+/g, '').toLowerCase().slice(0, 10) : generateUsername();
          // Simple check to see if we should append numbers if it's not the random anon one
          if (username !== 'anon_') {
            const exists = await User.findOne({ username });
            if (exists) username += Math.floor(Math.random() * 10000);
          }

          user = await User.create({
            googleId: profile.id,
            username,
            profilePic: profile.photos?.[0]?.value || '',
            bio: ''
          });
        } catch (err) {
          if (err.code === 11000) {
            // If duplicate key error (likely username or googleId clash), try finding again or retry
            user = await User.findOne({ googleId: profile.id });
            if (!user) {
              // If it was a username clash, try again with a random username
              const fallbackName = generateUsername();
              user = await User.create({
                googleId: profile.id,
                username: fallbackName,
                profilePic: profile.photos?.[0]?.value || '',
                bio: ''
              });
            }
          } else {
            throw err;
          }
        }
      }
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      res.redirect(`${frontendUrl}/?token=${token}`);
    } catch (err) {
      console.error(err);
      res.redirect(`${process.env.CORS_ORIGIN || 'http://localhost:5173'}/login?error=auth`);
    }
  }
);

router.post('/google/token', authLimit, async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: 'No credential provided' });
    const ticket = await import('../utils/verifyGoogleToken.js').then(m => m.verifyGoogleToken(credential));
    const payload = ticket;
    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
      let username = generateUsername();
      while (await User.findOne({ username })) username = generateUsername();
      user = await User.create({
        googleId: payload.sub,
        username,
        profilePic: payload.picture || '',
        bio: ''
      });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username: user.username, profilePic: user.profilePic, bio: user.bio } });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Invalid credential' });
  }
});

router.post('/guest', authLimit, async (req, res) => {
  try {
    const guestId = 'guest_' + crypto.randomUUID();
    let username = generateUsername();

    // Ensure uniqueness
    let retries = 5;
    while (retries > 0) {
      const exists = await User.findOne({ username });
      if (!exists) break;
      username = generateUsername();
      retries--;
    }

    // Create guest user - simplified model
    // We create a user document even for guests to allow them to have a persistent session/profile for the duration
    // But we might not need to save them if we want truly ephemeral guests
    // However, the current architecture seems to rely on a user document existing for chat mapping

    // Clear any existing auth cookie to prevent conflict with the new guest token
    res.clearCookie('token');

    try {
      const user = await User.create({
        googleId: guestId,
        username: username,
        profilePic: `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
        bio: 'Just passing through...',
        isGuest: true
      });

      const token = jwt.sign(
        { userId: user._id, isGuest: true },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          username: user.username,
          profilePic: user.profilePic,
          bio: user.bio,
          isGuest: true
        }
      });
    } catch (createErr) {
      console.error('Guest creation error:', createErr);
      // Fallback to purely JWT-based guest if DB creation fails (e.g. constraints)
      // This allows chat to work even if DB is finicky, though persistence will be limited
      const token = jwt.sign(
        { userId: guestId, username, isGuest: true },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      res.json({ token, user: { id: guestId, username, profilePic: '', bio: '', isGuest: true } });
    }
  } catch (err) {
    console.error('Guest route error:', err);
    res.status(500).json({ message: 'Guest sign-in failed. Please try again.' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

export default router;
