# Chatr: A Real-Time Full-Stack Chat Application

[![License](https://img.shields.io/github/license/baberlabs/chat-app)](./LICENSE)

**Chatr** is a modern full-stack web application that enables real-time messaging between users. The project integrates a robust backend built with Node.js, Express, and MongoDB, with a reactive frontend using React and Tailwind CSS. The system supports user authentication, secure session management, text and image messaging, and persistent socket connections for live updates.

This repository contains both the client and server implementations and is structured for single-service deployment. In production, the backend also serves the compiled frontend assets.

## Architecture Overview

- **Frontend**: React 19, Tailwind CSS v4, React Router v7, Zustand for state management, Axios, Socket.IO client.
- **Backend**: Express v5, Mongoose (MongoDB), Socket.IO, JWT authentication (via HTTP-only cookies), Cloudinary for image handling.
- **Testing**: Jest and SuperTest with MongoMemoryServer for full backend coverage.
- **Deployment**: Single monorepo deployed to Render, with the frontend served statically from the backend.

## Features

### Authentication

- Email-based registration and login
- Secure session management using HTTP-only cookies
- Token validation via protected routes
- Logout and session clearing

### User Management

- Profile update: full name, email, password, profile image
- Cloudinary-based image uploads (base64 encoded)
- Account deletion with ownership checks
- Email uniqueness and validation

### Chat System

- One-on-one conversations using `chatId`
- Dynamic chat discovery and reuse (idempotent creation)
- Participant verification for all operations
- Real-time chat room management via Socket.IO

### Messaging

- Text and image messages (base64 with Cloudinary support)
- Message persistence in MongoDB
- Authorization checks for message creation and deletion
- `seen` field support (currently stored, not yet toggled)

### Real-Time Communication

- WebSocket handshake via Socket.IO
- Room-based communication per chat
- Online user tracking
- Automatic message broadcast and chat list refresh

### Testing

- Extensive Jest + SuperTest suite for all routes
- Cloudinary uploader is mocked to avoid external API calls
- Uses in-memory MongoDB for isolated, deterministic testing
- Includes edge case testing and response validation

## Project Structure

```txt
chat-app/
├── backend/
│ ├── src/
│ │ ├── controllers/
│ │ ├── models/
│ │ ├── routes/
│ │ ├── middleware/
│ │ ├── utils/
│ │ └── app.js
│ ├── server.js
│ ├── tests/
│ └── .env
├── frontend/
│ ├── src/
│ ├── public/
│ ├── dist/ (build output)
│ └── index.html
├── package.json (root)
├── README.md
```

## Installation and Usage

**Requirements:** Node.js ≥ 18 and npm ≥ 9

### Development

1. Clone the repository:

   ```bash
   git clone https://github.com/baberlabs/chat-app.git
   cd chat-app
   ```

2. Create a `.env` file in `/backend` with the following keys:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   PORT=5001
   LOCAL_FRONTEND_URL=http://localhost:5173
   ```

3. Install dependencies and run both apps:

   ```bash
   # install deps + builds frontend
   npm run build

   # start backend (which serves frontend in production)
   npm start
   ```

4. For development only:
   ```bash
   cd backend && npm run dev
   cd frontend && npm run dev
   ```

### Testing

All backend tests are colocated in `/backend/__tests__` and can be executed with:

```bash
cd backend
npm test
```

This uses `mongodb-memory-server` and mocks Cloudinary for isolated integration testing.

### Deployment

This application is deployed as a single service on Render:

- The frontend is compiled via Vite and placed in `frontend/dist`.
- In production, the Express backend serves these static files.
- The server entry point is `/backend/server.js`.

Render configuration expects the root directory as the service base, with the following commands:

```bash
Build Command:   npm run build
Start Command:   npm start
```

Environment variables must be configured on the Render dashboard.

## Package Information

### Backend

- Express v5
- Mongoose v8
- Socket.IO v4
- Cloudinary SDK
- JWT (jsonwebtoken)
- bcryptjs
- Jest, SuperTest, nodemon

### Frontend

- React 19
- Tailwind CSS v4
- React Router v7
- Zustand
- Axios
- Lucide React
- Vite

### Future Enhancements

- Group chat creation and management
- Message seen and delivered tracking
- Infinite scroll or pagination in message history
- Email verification flow
- WebSocket reconnection resilience
- Mobile-first responsive design refinements

## License

This project is licensed under the [MIT License](./LICENSE).

## Acknowledgements

This application was built from scratch to demonstrate a production-level full-stack architecture with strong attention to scalability, clarity, and testability. It serves as a foundation for more advanced communication platforms and real-time interfaces.

For questions, improvements, or collaboration proposals, please visit [https://github.com/baberlabs/chat-app](https://github.com/baberlabs/chat-app).
