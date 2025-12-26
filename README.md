# Chatr

A full-stack real-time messaging application built to explore correct backend design, authentication boundaries, and real-time communication using modern web technologies.

This repository prioritises **correctness, testability, and clear separation of concerns** over feature breadth.

---

## Overview

Chatr is a one-to-one chat application with real-time messaging, user authentication, and image sharing. It is designed as a learning and demonstration project focused on:

- API correctness and error handling
- Authentication and authorisation boundaries
- Real-time communication with Socket.IO
- Test-driven backend development
- Clean frontend state management

A live deployment is available at: https://chatr.baberr.com

---

## Tech Stack

### Frontend

- React
- React Router
- Tailwind CSS
- Zustand (state management)
- Socket.IO client

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- Socket.IO
- JWT authentication (HTTP-only cookies)
- Cloudinary (image uploads)

### Testing

- Jest
- SuperTest
- mongodb-memory-server (isolated integration tests)

### Deployment

- Hetzner VPS
- Nginx reverse proxy
- Frontend served statically via Express

---

## Core Features

### Authentication & Users

- Email-based registration and login
- JWT authentication stored in HTTP-only cookies
- Protected routes with explicit `401` / `403` handling
- Profile updates and account deletion

### Messaging

- One-to-one real-time messaging
- Message persistence in MongoDB
- Deterministic message ordering
- Message deletion with authorisation checks
- Image messages via Cloudinary

### Real-Time Behaviour

- Socket.IO for instant delivery
- Room-based chat organisation
- Online / offline presence tracking
- Typing indicators

---

## Architecture & Design Decisions

### Separation of Concerns

- REST API is the source of truth for persistence
- Socket.IO is used only for delivery and presence
- Authentication is enforced consistently at route and socket boundaries
- Frontend state is isolated in Zustand stores rather than components

### Authentication Model

- JWT tokens are stored in HTTP-only cookies to reduce XSS exposure
- Tokens are validated on every protected request
- Socket connections rely on authenticated HTTP sessions

### Message Invariants

- Messages always belong to a chat
- Only participants of a chat may read or write messages
- Only the message author may delete a message
- Messages are returned in a consistent, chronological order

### Testing Strategy

- Integration-level tests validate behaviour, not implementation
- Each test suite runs against an in-memory MongoDB instance
- External services (Cloudinary) are mocked to isolate side effects
- Error conditions are explicitly tested

---

## API Endpoints (Summary)

| Endpoint                | Method       | Description               |
| ----------------------- | ------------ | ------------------------- |
| `/api/v1/auth/register` | POST         | Register a new user       |
| `/api/v1/auth/login`    | POST         | Log in                    |
| `/api/v1/auth/logout`   | POST         | Log out                   |
| `/api/v1/users`         | GET          | List users                |
| `/api/v1/users/:id`     | PUT / DELETE | Update or delete user     |
| `/api/v1/chats`         | GET / POST   | List or create chats      |
| `/api/v1/chats/:id`     | GET          | Fetch messages for a chat |
| `/api/v1/messages`      | POST         | Send a message            |
| `/api/v1/messages/:id`  | DELETE       | Delete a message          |

---

## Project Structure

```text
backend/
  src/
    controllers/
    services/
      domain/
      infrastructure/
    models/
    routes/
    middleware/
    realtime/
    utils/
  __tests__/

frontend/
  src/
    pages/
    components/
    store/
    lib/

```

---

## Running Locally

### Requirements

- Node.js ≥ 18
- MongoDB (local or Atlas)

### Setup

```bash
git clone https://github.com/baberlabs/chatr.git
cd chatr
npm run build
```

Create `backend/.env`:

```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
PORT=5001
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5001/api/v1
```

Start the application:

```bash
npm start
```

Development mode:

```bash
npm run dev
```

---

## Testing

```bash
cd backend
npm test
```

Tests run against an isolated in-memory database and do not require external services.

---

## Known Limitations

- No group chat support
- No message pagination
- No retry or back-pressure handling on socket reconnect
- Limited logging and observability

These omissions are deliberate to keep the project focused and understandable.

---

## Future Work

- Group chats
- Read receipts
- Message pagination
- Improved indexing strategy
- Structured logging
- Rate limiting

---

## License

[MIT License](LICENSE)

---

This project is intended as a **technical portfolio artifact**, not a production messaging platform.
