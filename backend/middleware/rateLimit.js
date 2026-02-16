import rateLimit from 'express-rate-limit';

export const messageLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { message: 'Too many messages, please slow down' }
});

export const uploadLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: { message: 'Upload limit exceeded. Try again later.' }
});

export const authLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many auth attempts' }
});
