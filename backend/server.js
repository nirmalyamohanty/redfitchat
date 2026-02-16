import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Robustly load .env - try default, then explicit path
dotenv.config();
if (!process.env.MONGODB_URI) {
  console.log('Retrying .env loading from explicit path...');
  dotenv.config({ path: join(__dirname, '.env') });
}
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import messageRoutes from './routes/messages.js';
import chatRoutes from './routes/chats.js';
import uploadRoutes from './routes/upload.js';
import aiRoutes from './routes/ai.js';
import translateRoutes from './routes/translate.js';
import { setupSocket } from './socket/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const httpServer = createServer(app);

const corsOrigins = (origin, callback) => {
  const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : [];
  const isLocalhost = origin && (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1'));

  if (!origin || isLocalhost || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    console.log('Blocked CORS origin:', origin);
    callback(new Error('Not allowed by CORS'));
  }
};
const io = new Server(httpServer, {
  cors: {
    origin: corsOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});
app.set('io', io);

connectDB();

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/translate', translateRoutes);
app.use('/api/ai', aiRoutes);

// Serve static files from public/uploads
app.use('/uploads', express.static(join(__dirname, 'public/uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use(errorHandler);

setupSocket(io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
