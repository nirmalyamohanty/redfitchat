# 📅 Week-by-Week Development Roadmap

2-person team milestones for building the Anonymous Chat App.

---

## Week 1: Foundation

### Person A — Backend Setup
- [ ] Initialize Express project with TypeScript/ESM
- [ ] MongoDB connection + models (User, Message, Chat)
- [ ] Google OAuth flow (Passport.js or manual)
- [ ] JWT session handling
- [ ] Basic REST routes: `/auth`, `/users/me`, `/users/:id`

### Person B — Frontend Setup
- [ ] Create React + Vite + Tailwind project
- [ ] Dark theme base styles
- [ ] Google Sign-In button + OAuth redirect flow
- [ ] Auth context (store user after login)
- [ ] Navbar component (Global Chat | Personal Chat | Settings)
- [ ] Protected routes

### Deliverable
- User can sign in with Google and see navbar
- Random username generated and displayed

---

## Week 2: Global Chat

### Person A — Backend
- [ ] Socket.io server setup
- [ ] Global chat room events: `join`, `message`, `typing`
- [ ] Message API: create, fetch (pagination)
- [ ] Rate limiting middleware (express-rate-limit)
- [ ] Basic profanity filter (bad-words or custom list)

### Person B — Frontend
- [ ] Socket.io client connection
- [ ] Global chat page with message list
- [ ] Message input + send
- [ ] Real-time message display
- [ ] Typing indicator component
- [ ] Message timestamp formatting

### Deliverable
- Users can send/receive text in global chat in real-time
- Spam protection active

---

## Week 3: Media & Threading

### Person A — Backend
- [ ] Cloudinary upload endpoint
- [ ] Image compression (sharp) before upload
- [ ] Video duration check (max 10s via ffmpeg or metadata)
- [ ] File size validation (configurable max)
- [ ] Threaded message support (`replyToMessageId` in schema)
- [ ] Fetch messages with nested replies

### Person B — Frontend
- [ ] Media upload UI (drag-drop, paste image)
- [ ] Image/video/file preview in messages
- [ ] Reply button → show thread view
- [ ] Nested reply UI (indented, 2 levels)
- [ ] Lazy loading for media

### Deliverable
- Users can send images, videos (≤10s), files
- Threaded replies work in global chat

---

## Week 4: Personal Chat & Translation

### Person A — Backend
- [ ] Personal chat API: create chat, list chats, get messages
- [ ] Socket.io: private room per chat
- [ ] Block user logic (store in User or Chat)
- [ ] LibreTranslate API integration (or Google Translate free tier)
- [ ] Translation endpoint: `POST /translate` with `{ text, targetLang }`

### Person B — Frontend
- [ ] Personal chat list page
- [ ] Click username → start/open chat
- [ ] Private chat view (same message UI as global)
- [ ] Translation toggle at top of global chat
- [ ] "Translate to English" / "Show original" UI
- [ ] Block user button in personal chat

### Deliverable
- 1-to-1 private chat works
- Translation toggle translates global messages

---

## Week 5: Profile, Settings & Safety

### Person A — Backend
- [ ] Profile picture upload (Cloudinary)
- [ ] Bio update endpoint
- [ ] Report message endpoint (store report, optional admin hook)
- [ ] Auto-delete cron: messages older than X days
- [ ] Per-user daily upload limit (free-tier optimization)

### Person B — Frontend
- [ ] Settings page: profile pic, bio, translation default
- [ ] Report message modal
- [ ] Online/offline status (Socket.io presence)
- [ ] Unread badge for personal chats
- [ ] Logout button

### Deliverable
- Full settings page
- Report + block working
- Old messages auto-deleted (configurable)

---

## Week 6: Polish & Deploy

### Person A — Backend
- [ ] CORS for production domain
- [ ] Environment config for Render
- [ ] MongoDB Atlas IP whitelist (0.0.0.0/0 for Render)
- [ ] Health check route
- [ ] Logging (morgan, simple file log)

### Person B — Frontend
- [ ] Responsive layout (mobile-friendly)
- [ ] Loading states, error boundaries
- [ ] Vercel config (rewrites if SPA)
- [ ] Production env vars

### Both
- [ ] End-to-end testing (manual)
- [ ] Deploy to Vercel + Render
- [ ] Update OAuth redirect URIs for production

### Deliverable
- App live on free hosting
- Documentation complete

---

## Future Upgrade Hooks (Post-Launch)

- Mobile app (React Native / Expo)
- End-to-end encryption (Signal Protocol)
- AI moderation (content flagging)
- Voice messages
