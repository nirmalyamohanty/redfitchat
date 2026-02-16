import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL || `http://localhost:${process.env.PORT || 5000}/api/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      done(null, {
        id: profile.id,
        emails: profile.emails,
        photos: profile.photos
      });
    }
  )
  );
}
