# MyChatgpt 🚀

## 🌟 Experience ChatGPT-Like AI Interface

MyChatgpt is a **feature-rich, full-stack AI-powered chat application** that replicates **~90% of ChatGPT's core functionality**! Built from scratch with modern technologies, this project delivers a professional-grade conversational AI experience with real-time messaging, persistent chat history, and an intuitive user interface that rivals OpenAI's ChatGPT.

Whether you're looking to understand how AI chat applications work or deploy your own ChatGPT clone, this project provides a production-ready foundation with authentication, vector database integration, and seamless AI interactions.

**Key Highlights:**
- ✨ ChatGPT-like conversational interface
- 🔐 Secure user authentication & authorization
- 💬 Real-time messaging with Socket.io
- 🧠 Context-aware AI responses using vector embeddings
- 📱 Fully responsive design (mobile & desktop)
- 🎨 Modern UI with dark/light theme support
- 📝 Persistent conversation history
- ⚡ Built with cutting-edge tech stack

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Socket Events](#socket-events)
- [Frontend Overview](#frontend-overview)
- [Backend Overview](#backend-overview)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### 🎯 Core Features (ChatGPT-Like Experience)
- **🤖 AI-Powered Conversations** — Interact with an intelligent AI assistant just like ChatGPT
- **💬 Real-Time Messaging** — Instant message delivery using Socket.io
- **📚 Conversation History** — All your chats are saved and easily accessible
- **🔍 Context-Aware Responses** — Vector database integration ensures the AI understands conversation context
- **⚡ Streaming Responses** — Get AI responses in real-time as they're generated

### 🔐 Authentication & Security
- **User Registration & Login** — Secure JWT-based authentication
- **Protected Routes** — Middleware-based authorization
- **Session Management** — Persistent user sessions

### 🎨 User Interface
- **Modern, Responsive Design** — Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Theme** — Toggle between themes for comfortable viewing
- **ChatGPT-Inspired Layout** — Familiar sidebar, chat area, and message composer
- **Smooth Animations** — Polished UI/UX experience

### 🚀 Advanced Features
- **Multi-Chat Support** — Create and manage multiple conversations
- **Message History** — Browse through previous conversations
- **Real-Time Updates** — Live notifications and message syncing
- **Optimized Performance** — Fast loading and smooth interactions

---

## Tech Stack

### Frontend
- **⚛️ React** — Modern UI library for building interactive interfaces
- **⚡ Vite** — Lightning-fast build tool and dev server
- **🎨 CSS3** — Custom styling for a polished look
- **🔄 Redux Toolkit** — State management for chat data
- **🔌 Socket.io Client** — Real-time bidirectional communication

### Backend
- **🟢 Node.js** — JavaScript runtime for server-side logic
- **🚂 Express.js** — Fast, minimalist web framework
- **🔌 Socket.io** — WebSocket implementation for real-time features
- **🔐 JWT** — Secure authentication and authorization
- **🛡️ Middleware** — Custom authentication and error handling

### Database & AI
- **🍃 MongoDB** — NoSQL database for user data and chat history
- **🤖 OpenAI API** — GPT-powered AI responses
- **🧠 Vector Database** — Semantic search and context preservation
- **📊 Mongoose** — Elegant MongoDB object modeling

---

## Project Structure

```
backend/
  package.json
  server.js
  src/
    app.js
    controllers/
      auth.controller.js
      chat.controller.js
    db/
      db.js
    middlewares/
      auth.middleware.js
    models/
      chat.model.js
      message.model.js
      user.model.js
    routes/
      auth.routes.js
      chat.routes.js
    services/
      ai.service.js
      vector.service.js
    sockets/
      socket.server.js
Frontend/
  package.json
  vite.config.js
  src/
    App.jsx
    AppRoutes.jsx
    main.jsx
    components/
      ThemeToggle.jsx
      chat/
        aiClient.js
        ChatComposer.jsx
        ChatLayout.jsx
        ChatMessages.jsx
        ChatMobileBar.jsx
        ChatSidebar.jsx
    pages/
      Home.jsx
      Login.jsx
      Register.jsx
    store/
      chatSlice.js
      store.js
    styles/
      theme.css
```

---

## Setup & Installation

### Prerequisites
- Node.js & npm
- MongoDB (local or cloud)

### Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   OPENAI_API_KEY=your_openai_api_key
   PORT=5000
   ```
4. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the Frontend folder:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```

---

## Usage

### Getting Started
1. **Register** — Create a new account with your credentials
2. **Login** — Access your personalized chat dashboard
3. **Start Chatting** — Begin conversations with the AI assistant
4. **Manage Conversations** — Create new chats, view history, and organize your messages
5. **Customize Experience** — Toggle between light and dark themes

### ChatGPT-Like Features in Action
- Ask questions and get intelligent responses
- Continue conversations with full context awareness
- Access your chat history anytime
- Enjoy real-time message streaming
- Experience a familiar and intuitive interface

---

## API Endpoints

### Auth
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and receive JWT

### Chat
- `GET /api/chat` — Get chat history
- `POST /api/chat` — Send a message to AI

---

## Socket Events
- `connect` — Establish socket connection
- `message` — Receive/send chat messages in real-time
- `disconnect` — Handle user disconnect

---

## Frontend Overview

### Architecture
The frontend is built with **React + Vite** for blazing-fast development and optimal performance.

### Key Components
- **ChatLayout** — Main container mimicking ChatGPT's layout
- **ChatSidebar** — Navigation and conversation list
- **ChatMessages** — Message display with AI and user messages
- **ChatComposer** — Input area for sending messages
- **ChatMobileBar** — Responsive navigation for mobile devices
- **ThemeToggle** — Switch between light and dark modes

### State Management
- **Redux Toolkit** — Centralized state management
- **chatSlice.js** — Manages chat state, messages, and conversations
- **store.js** — Redux store configuration

### Styling
- **Custom CSS** — ChatGPT-inspired design
- **Responsive Layout** — Mobile-first approach
- **Theme System** — Dynamic light/dark mode switching

---

## Backend Overview

### Architecture
Built with **Node.js + Express** following MVC pattern for scalability and maintainability.

### Core Components
- **Controllers** — Business logic for authentication and chat operations
  - `auth.controller.js` — User registration, login
  - `chat.controller.js` — Chat management and AI interactions
  
- **Models** — MongoDB schemas using Mongoose
  - `user.model.js` — User authentication data
  - `chat.model.js` — Conversation metadata
  - `message.model.js` — Individual messages

- **Middlewares** — Request processing
  - `auth.middleware.js` — JWT verification and route protection

- **Services** — External integrations
  - `ai.service.js` — OpenAI API integration for GPT responses
  - `vector.service.js` — Vector embeddings for context-aware conversations

- **Sockets** — Real-time features
  - `socket.server.js` — Socket.io server for live messaging

### Routes
- **auth.routes.js** — Authentication endpoints
- **chat.routes.js** — Chat and message endpoints

### Database
- **MongoDB** — Stores users, chats, and messages
- **Mongoose** — ODM for schema validation and queries

---

## Environment Variables
- **Backend:**
  - `MONGODB_URI`: MongoDB connection string
  - `JWT_SECRET`: Secret for JWT signing
  - `OPENAI_API_KEY`: API key for AI integration
  - `PORT`: Server port

---

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## License
This project is licensed under the MIT License.

---

## 🎯 Why MyChatgpt?

### Perfect for Learning
- **Understand AI Integration** — See how OpenAI API powers conversational AI
- **Full-Stack Development** — Learn modern web development practices
- **Real-Time Systems** — Master Socket.io and WebSocket communication
- **Authentication Flow** — Implement secure JWT-based auth

### Production-Ready
- **Scalable Architecture** — Modular code structure
- **Best Practices** — Follow industry standards
- **Well-Documented** — Easy to understand and extend
- **ChatGPT Clone** — ~90% feature parity with ChatGPT interface

---

## 🤝 Contact & Support

- **Issues** — Open an issue for bug reports or feature requests
- **Contributions** — Pull requests are welcome!
- **Maintainer** — [@ijatinydv](https://github.com/ijatinydv)

---

## ⭐ Show Your Support

If you find this project helpful, please give it a ⭐ on GitHub!

---

**Built with ❤️ by [ijatinydv](https://github.com/ijatinydv)**
