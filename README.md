# Chatr

**A real-time chat application built with the MERN stack**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

A full-stack messaging application featuring real-time communication, user authentication, and image sharing. Built as a learning project to demonstrate modern web development practices using React, Express, Socket.IO, and MongoDB.

[Live Demo](https://chatr.baberr.com) • [Features](#features) • [Quick Start](#quick-start)

---

## Tech Stack

**Frontend**: React 19, Tailwind CSS, React Router, Zustand, Socket.IO client  
**Backend**: Express, MongoDB with Mongoose, Socket.IO, JWT authentication  
**Testing**: Jest and SuperTest with in-memory MongoDB  
**Deployment**: Deployed to Hetzner VPS with frontend served statically from Express (with Nginx)

## Features

### Core Functionality

- User registration and login with email validation
- JWT-based authentication using HTTP-only cookies
- Real-time one-on-one messaging
- Image upload and sharing via Cloudinary
- Online user presence indicators
- Typing indicators with live preview

### User Management

- Profile management (name, email, profile picture)
- User discovery to start new conversations
- Account deletion functionality

### Real-Time Features

- Socket.IO for instant message delivery
- Room-based chat organization
- Online/offline status tracking
- Live typing indicators

## Quick Start

**Requirements**: Node.js ≥ 18

### Setup

1. **Clone and install**

   ```bash
   git clone https://github.com/baberlabs/chatr.git
   cd chatr
   npm run build
   ```

2. **Environment setup**

   Create `backend/.env`:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   PORT=5001
   ```

   Create `frontend/.env`:

   ```env
   VITE_API_URL=http://localhost:5001/api/v1
   ```

3. **Start the application**
   ```bash
   npm start
   ```
   Visit `http://localhost:5001`

### Development Mode

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:5001`

### Testing

```bash
cd backend
npm test
```

## API Endpoints

| Endpoint                | Method      | Description             |
| ----------------------- | ----------- | ----------------------- |
| `/api/v1/auth/register` | POST        | User registration       |
| `/api/v1/auth/login`    | POST        | User login              |
| `/api/v1/auth/logout`   | POST        | User logout             |
| `/api/v1/users`         | GET         | Get all users           |
| `/api/v1/users/:id`     | PUT, DELETE | Update/delete user      |
| `/api/v1/chats`         | GET, POST   | List chats, create chat |
| `/api/v1/chats/:id`     | GET         | Get chat messages       |
| `/api/v1/messages`      | POST        | Send message            |
| `/api/v1/messages/:id`  | DELETE      | Delete message          |

## Project Structure

```
chatr/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth middleware
│   │   └── utils/          # Socket.IO setup
│   ├── __tests__/          # Test files
│   └── server.js           # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand stores
│   │   └── lib/           # API utilities
│   └── dist/              # Build output
└── package.json           # Dependencies and scripts
```

## Key Dependencies

**Backend**: Express, Mongoose, Socket.IO, jsonwebtoken, bcryptjs, Cloudinary  
**Frontend**: React, Tailwind CSS, React Router, Zustand, Axios, Socket.IO Client  
**Testing**: Jest, SuperTest, mongodb-memory-server

## Learning Highlights

This project helped me learn and practice:

- Building RESTful APIs with Express and MongoDB
- Implementing real-time features with Socket.IO
- User authentication with JWT tokens
- Frontend state management with Zustand
- Writing integration tests for API endpoints
- Deploying full-stack applications
- Working with cloud services (Cloudinary, MongoDB Atlas)

## Areas for Improvement

- Add input validation middleware for better error handling
- Implement proper error boundaries in React components
- Add database indexing for better query performance
- Create more comprehensive test coverage
- Add pagination for message history
- Implement proper logging for debugging

## Future Features

- Group chat functionality
- Message read receipts
- File sharing beyond images
- Message search functionality
- Email notifications
- Mobile app version

## License

MIT License - see LICENSE file for details.

---

**A learning project demonstrating full-stack web development skills**
