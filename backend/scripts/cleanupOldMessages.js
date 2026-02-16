import 'dotenv/config';
import mongoose from 'mongoose';
import Message from '../models/Message.js';

const DAYS = parseInt(process.env.MESSAGE_RETENTION_DAYS) || 7;

async function cleanup() {
  await mongoose.connect(process.env.MONGODB_URI);
  const cutoff = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000);
  const result = await Message.deleteMany({ createdAt: { $lt: cutoff } });
  console.log(`Deleted ${result.deletedCount} messages older than ${DAYS} days`);
  process.exit(0);
}

cleanup().catch((err) => {
  console.error(err);
  process.exit(1);
});
