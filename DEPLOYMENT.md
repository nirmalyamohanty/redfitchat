# 🚀 Free-Tier Deployment Guide

Deploy the Anonymous Chat App for ₹0/month.

---

## Overview

| Component | Platform | Free Tier |
|-----------|----------|-----------|
| Frontend | Vercel | 100GB bandwidth, unlimited sites |
| Backend | Render | 750 hrs/month free |
| Database | MongoDB Atlas | 512MB M0 cluster |
| Storage | Cloudinary | 25 credits/month |
| Translation | LibreTranslate (self-host) or Google Translate | Usage limits apply |

---

## 1. MongoDB Atlas

1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free M0 cluster
3. Database Access → Add user (username + password)
4. Network Access → Add IP: `0.0.0.0/0` (allow from anywhere for Render)
5. Copy connection string: `mongodb+srv://user:pass@cluster.mongodb.net/tosn?retryWrites=true&w=majority`

---

## 2. Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Authorized JavaScript origins:
   - `http://localhost:5173` (dev)
   - `https://your-app.vercel.app` (prod)
4. Authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (dev)
   - `https://your-api.onrender.com/api/auth/google/callback` (prod)
5. Copy Client ID and Client Secret

---

## 3. Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Dashboard → copy: Cloud name, API Key, API Secret
3. Free tier: 25 credits/month (images/videos)

---

## 4. Backend — Render

1. Push code to GitHub
2. [Render](https://render.com) → New Web Service
3. Connect repo, select `backend` folder (or set root + build command)
4. Build command: `npm install`
5. Start command: `npm start` (or `node server.js`)
6. Environment variables:
   ```
   PORT=10000
   MONGODB_URI=...
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   JWT_SECRET=<generate-random-32-char-string>
   CORS_ORIGIN=https://your-app.vercel.app
   NODE_ENV=production
   ```
7. Deploy → Copy service URL (e.g. `https://tosn-api.onrender.com`)

---

## 5. Frontend — Vercel

1. [Vercel](https://vercel.com) → Import Git repo
2. Root directory: `frontend`
3. Framework: Vite
4. Build command: `npm run build`
5. Output directory: `dist`
6. Environment variables:
   ```
   VITE_API_URL=https://tosn-api.onrender.com
   VITE_GOOGLE_CLIENT_ID=...
   ```
7. Deploy

---

## 6. Update OAuth Redirect URIs

After deploying:
- Add `https://your-app.vercel.app` to Google OAuth authorized origins
- Add `https://tosn-api.onrender.com/api/auth/google/callback` to redirect URIs

---

## 7. Free-Tier Optimization Tips

- **Render**: Service sleeps after 15 min inactivity (cold start ~30s). Consider Railway free tier or keep-alive ping.
- **MongoDB Atlas**: 512MB is enough for ~100K messages. Enable auto-delete for old messages.
- **Cloudinary**: Compress images, limit video length (10s), cap file size.
- **Vercel**: Edge functions can proxy API if needed; usually direct CORS is fine.

---

## 8. Optional: LibreTranslate (Self-Hosted)

For free translation without API limits:
- Deploy LibreTranslate on Railway/Render (Docker)
- Or use [LibreTranslate public API](https://libretranslate.com/) (rate limited)
