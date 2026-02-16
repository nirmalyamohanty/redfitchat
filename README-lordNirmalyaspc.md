# 🔒 Anonymous Chat App

Full-stack anonymous real-time chat application with global chat, private messaging, threaded replies, and media support.

## 🧱 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas (free tier) |
| Auth | Google OAuth only |
| Real-time | Socket.io |
| Storage | Cloudinary (images/videos/files) |
| Deployment | Vercel (frontend) + Render (backend) |

## 📁 Project Structure

```
tosn/
├── backend/          # Node.js + Express API
│   ├── models/       # MongoDB schemasp
│   ├── routes/       # API routes
│   ├── middleware/   # Auth, rate limit, etc.
│   ├── utils/        # Helpers
│   └── socket/       # Socket.io handlers
├── frontend/         # React app
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── context/
│   └── ...
├── ROADMAP.md        # Week-by-week milestones
└── DEPLOYMENT.md     # Deployment steps
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Google Cloud Console (OAuth credentials)
- Cloudinary account (optional, for media)

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with VITE_API_URL
npm run dev
```

### 3. Environment Variables

**Backend (.env):**
```
PORT=5000
MONGODB_URI=mongodb+srv://...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
JWT_SECRET=your-random-secret
CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env.local):**
```
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## 📦 Key Features

- ✅ Google OAuth (random `anon_XXXXXX` usernames)
- ✅ Global chat (real-time)
- ✅ Personal 1-to-1 chat
- ✅ Threaded replies (2+ levels)
- ✅ Media: text, images, videos (≤10s), files (≤500MB)
- ✅ Translation toggle (LibreTranslate)
- ✅ Profile pic + bio
- ✅ Rate limiting, profanity filter, report, block
- ✅ Auto-delete old messages (configurable)
- ✅ Dark theme, Discord/WhatsApp-like UI

## 📖 Documentation

- [ROADMAP.md](./ROADMAP.md) — Week-by-week development milestones
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Free-tier deployment guide

## 🛡️ License

MIT
