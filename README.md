<div align="center">

# 🔒 Anonymous Chat App  
### Real-Time Privacy-First Messaging Platform

<img src="https://img.shields.io/badge/React-Vite-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge" />
<img src="https://img.shields.io/badge/MongoDB-Atlas-4EA94B?style=for-the-badge" />
<img src="https://img.shields.io/badge/Socket.io-Realtime-black?style=for-the-badge" />
<img src="https://img.shields.io/badge/Auth-Google%20OAuth-red?style=for-the-badge" />
<img src="https://img.shields.io/badge/License-MIT-brightgreen?style=for-the-badge" />

A full-stack **anonymous real-time chat application** with global chat,  
private messaging, threaded replies, media sharing, and moderation tools —  
built using modern scalable architecture and deployable on free-tier services.

</div>

---

## ✨ Features

- 🔐 Google OAuth only (no email/password storage)  
- 🎲 Auto-generated anonymous usernames (`anon_XXXXXX`)  
- 🌍 Global public chat (real-time)  
- 💬 1-to-1 private messaging  
- 🧵 Threaded replies (multi-level conversations)  
- 🖼️ Media support  
  - Images  
  - Short videos (≤10s)  
  - Files (≤500MB*)  
- 🌐 Message translation toggle (LibreTranslate)  
- 👤 Anonymous profile (avatar + bio)  
- 🛡️ Moderation system  
  - Rate limiting  
  - Profanity filter  
  - Report & block users  
- ⏳ Auto-delete old messages (TTL)  
- 🌙 Modern dark UI (Discord/WhatsApp inspired)  

\*Depends on free-tier storage limits.

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|------------|
Frontend | React + Vite + Tailwind CSS  
Backend | Node.js + Express.js  
Database | MongoDB Atlas  
Realtime | Socket.io  
Auth | Google OAuth  
Storage | Cloudinary  
Deployment | Vercel + Render  

---

## 🧠 Architecture

Client (React) ⇄ REST API + WebSockets ⇄ Server (Express + Socket.io) ⇄ MongoDB  
Media uploads handled via **Cloudinary signed URLs**.

Key backend responsibilities:

- JWT session handling  
- OAuth verification  
- Socket room management (global, DM, threads)  
- Message persistence + TTL cleanup  
- Moderation middleware  

---

## 🚀 Getting Started

### 1️⃣ Clone the repo

```bash
git clone https://github.com/your-username/anonymous-chat-app.git
cd anonymous-chat-app
```

### 2️⃣ Backend setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 3️⃣ Frontend setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

---

## 🔑 Environment Variables

**Backend (.env)**

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env.local)**

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 🎯 Learning Goals

- Real-time chat architecture  
- OAuth-only authentication  
- Anonymous identity mapping  
- Threaded message schema design  
- Moderation pipelines  
- Free-tier full-stack deployment  

---

## ⚠️ Disclaimer

This project is for **educational purposes**.  
Production use requires stronger abuse detection,  
WebSocket scaling, and advanced storage strategies.

---

## 🛡️ License

MIT — free to use and modify.

---

<div align="center">

Built with ❤️ by Nirmalya

</div>
