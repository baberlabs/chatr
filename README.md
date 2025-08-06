# Chatr

**A production-ready real-time chat application built with the MERN stack**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen.svg)](#testing)

Chatr demonstrates modern full-stack development practices through a complete messaging platform featuring real-time communication, secure authentication, and comprehensive testing. Built as a single deployable service with Express serving React in production.

[Live Demo](https://chatr.baberr.com) • Features • Quick Start

---

## Architecture Overview

**Frontend**: React 19, Tailwind CSS v4, React Router v7, Zustand for state management, Axios, Socket.IO client  
**Backend**: Express v5, Mongoose (MongoDB), Socket.IO, JWT authentication (via HTTP-only cookies), Cloudinary for image handling  
**Testing**: Jest and SuperTest with MongoMemoryServer for full backend coverage  
**Deployment**: Single monorepo deployed to Render, with the frontend served statically from the backend

## Features

### Authentication

- Email-based registration and login with comprehensive validation
- Secure session management using HTTP-only cookies
- JWT token validation via protected routes
- Logout and session clearing with proper cleanup

### User Management

- Profile updates: full name, email, password, profile image
- Cloudinary-based image uploads with base64 encoding
- Account deletion with ownership verification
- Email uniqueness validation and format checking
- User discovery (browse all users except self)

### Chat System

- One-on-one conversations using unique `chatId`
- Dynamic chat discovery and reuse (idempotent creation)
- Participant verification for all chat operations
- Real-time chat room management via Socket.IO
- Chat list sorted by most recent activity

### Messaging

- Text messages (up to 1000 characters) and image support
- Base64 image uploads with Cloudinary integration
- Message persistence in MongoDB with proper indexing
- Authorization checks for message creation and deletion
- Real-time typing indicators with ghost message preview
- Message deletion with instant UI updates

### Real-Time Communication

- WebSocket handshake and room management via Socket.IO
- Room-based communication per chat for efficient messaging
- Online user tracking and presence indicators
- Automatic message broadcast and chat list refresh
- Typing indicator system with length-based preview
- Graceful offline user handling

### Testing

- Extensive Jest + SuperTest suite covering all API routes
- Cloudinary service mocked to avoid external API calls during testing
- In-memory MongoDB for isolated, deterministic testing
- Edge case testing and comprehensive response validation
- 200+ integration tests with 100% backend route coverage

## Quick Start

**Requirements**: Node.js ≥ 18 and npm ≥ 9

### Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/baberlabs/chatr.git
   cd chatr
   ```

2. **Create environment configuration**

   Create `backend/.env`:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   PORT=5001
   LOCAL_FRONTEND_URL=http://localhost:5173
   ```

   Create `frontend/.env`:

   ```env
   VITE_API_URL=http://localhost:5001/api/v1
   ```

3. **Install dependencies and build**

   ```bash
   # Install all dependencies and build frontend
   npm run build
   ```

4. **Start the application**
   ```bash
   # Production mode (serves built frontend from backend)
   npm start
   ```
   Access at `http://localhost:5001`

**For development with hot reload:**

```bash
# Serve frontend and backend concurrently
npm run dev

# Or

# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Access frontend at `http://localhost:5173`

### Testing

Run the comprehensive test suite:

```bash
cd backend
npm test
```

Features 200+ integration tests covering:

- Authentication flows and JWT token handling
- User management operations and edge cases
- Chat creation, participant verification, and messaging
- Input validation and comprehensive error handling
- Cloudinary integration (mocked for isolation)
- Real-time Socket.IO event handling

### Deployment

**Render Configuration:**

- Build Command: `npm run build`
- Start Command: `npm start`
- Root Directory: `/` (project root)

**Environment Variables**: Configure on Render dashboard using the same keys from `backend/.env`

The application builds the React frontend via Vite and places it in `frontend/dist`. In production, the Express backend serves these static files from the root route, creating a unified single-service deployment.

## Project Structure

```
chatr/
├── backend/
│   ├── src/
│   │   ├── controllers/          # Request handlers with helper functions
│   │   │   └── helpers/          # Validation and business logic
│   │   ├── models/              # MongoDB schemas (User, Chat, Message)
│   │   ├── routes/              # API endpoint definitions
│   │   ├── middleware/          # Authentication and validation
│   │   ├── utils/               # Socket.IO setup and utilities
│   │   ├── app.js              # Express app configuration
│   │   └── db.js               # Database connection
│   ├── __tests__/              # Comprehensive test suites
│   ├── server.js               # Server entry point
│   └── .env                    # Environment configuration
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Route-based page components
│   │   ├── store/             # Zustand state management
│   │   ├── lib/               # API utilities and configurations
│   │   ├── App.jsx            # Main application component
│   │   └── main.jsx           # Application entry point
│   ├── public/                # Static assets
│   ├── index.html             # HTML template
│   └── dist/                  # Build output (created by Vite)
├── package.json               # Root package with build scripts
└── README.md
```

## API Overview

| Endpoint                   | Method           | Description                         |
| -------------------------- | ---------------- | ----------------------------------- |
| `/api/v1/auth/register`    | POST             | User registration with validation   |
| `/api/v1/auth/login`       | POST             | User login with JWT creation        |
| `/api/v1/auth/logout`      | POST             | Session cleanup and cookie clearing |
| `/api/v1/auth/status`      | GET              | Authentication status check         |
| `/api/v1/users`            | GET              | Get all users (excluding self)      |
| `/api/v1/users/:id`        | GET, PUT, DELETE | User profile operations             |
| `/api/v1/chats`            | GET, POST        | Chat list and creation              |
| `/api/v1/chats/:id`        | GET              | Specific chat with messages         |
| `/api/v1/messages/:chatId` | GET              | Chat message history                |
| `/api/v1/messages`         | POST             | Send text or image message          |
| `/api/v1/messages/:id`     | DELETE           | Delete own message                  |

## Package Information

### Backend Dependencies

- **Express v5** - Web application framework
- **Mongoose v8** - MongoDB object modeling
- **Socket.IO v4** - Real-time bidirectional communication
- **jsonwebtoken** - JWT token creation and verification
- **bcryptjs** - Password hashing and validation
- **Cloudinary** - Cloud-based image storage
- **Jest** & **SuperTest** - Testing framework and HTTP assertions
- **mongodb-memory-server** - In-memory MongoDB for testing

### Frontend Dependencies

- **React 19** - UI library with latest features
- **Tailwind CSS v4** - Utility-first CSS framework
- **React Router v7** - Client-side routing
- **Zustand** - Lightweight state management
- **Axios** - HTTP client for API requests
- **Socket.IO Client** - Real-time communication
- **Lucide React** - Modern icon library
- **Vite** - Fast build tool and development server

## Development Highlights

- **Clean Architecture**: Modular MVC structure with separated concerns
- **Security First**: JWT in HTTP-only cookies, input validation, authorization middleware
- **Real-time Core**: WebSocket rooms for chat-specific messaging and online presence
- **Test-Driven**: Isolated tests with mocked external services and in-memory database
- **Production Ready**: Environment-based configuration, static file serving, error handling
- **Modern Stack**: Latest versions of React, Express, and supporting technologies

## Future Enhancements

- Group chat creation and management
- Message seen and delivered status tracking
- Infinite scroll pagination for message history
- Email verification workflow implementation
- Enhanced WebSocket reconnection resilience
- Advanced mobile-responsive design patterns
- Other performance optimisations

## License

This project is licensed under the MIT License.

---

**Built to demonstrate production-ready full-stack development with modern web technologies**

_For questions, improvements, or collaboration proposals, visit [github.com/baberlabs/chatr](https://github.com/baberlabs/chatr)_
