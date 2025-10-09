# MyChatGPT

A full-stack ChatGPT clone built with MERN stack and real-time AI responses.

## Features

- 🤖 Real-time AI chat powered by Google Gemini
- 💬 Automatic chat creation (just start typing)
- 📝 Smart chat titles from first message
- 🔄 Live chat history with rename/delete
- 🎨 Modern dark UI like ChatGPT
- ⚡ Socket.io for instant responses

## Tech Stack

**Frontend:** React, Redux Toolkit, Tailwind CSS, Socket.io  
**Backend:** Node.js, Express, MongoDB, Socket.io  
**AI:** Google Gemini API

## Quick Setup

### Backend
```bash
cd Backend
npm install
# Create .env file with:
# MONGODB_URI=your_mongodb_uri
# GEMINI_API_KEY=your_gemini_key
# JWT_SECRET=your_secret
npm run dev
```

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

Visit `http://localhost:5173`

## How It Works

1. Start typing → Chat auto-creates
2. Message sent → AI responds in real-time
3. Chats saved with smart titles
4. Rename/delete chats anytime

## API Endpoints

- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login
- `GET /api/chats` - Get all chats
- `POST /api/chats` - Create chat
- `GET /api/chats/:id/messages` - Get messages