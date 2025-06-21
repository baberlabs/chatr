# 💬 Chatr: Real-Time Chat App

A robust, real-time chat application built with React, Tailwind CSS v4, Node.js, Express v5, MongoDB, Cloudinary, and Socket.IO, fully deployed with Render.

## 🚀 Features

- **Real-Time Messaging:** Instant messages and real-time online user tracking.
- **Secure Authentication:** JWT-based authentication using secure, HTTP-only cookies.
- **Image Uploads:** Send and receive images via Cloudinary.
- **Responsive UI:** Clean, intuitive, and responsive user interface using Tailwind CSS.
- **Scalable Design:** Modular and maintainable backend and frontend structure.

## 🛠 Technology Stack

### Frontend

- React 19 (via Vite)
- Tailwind CSS v4
- React Router v7
- Zustand (state management)
- Axios
- Socket.IO Client

### Backend

- Node.js & Express v5
- MongoDB (with Mongoose)
- JWT (JSON Web Token)
- Cloudinary (image hosting)
- Socket.IO (real-time communication)

### Testing

- Jest & Supertest
- MongoDB Memory Server (in-memory testing)

## 📂 Project Structure

```sh
chatr/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── app.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── package.json
├── LICENSE
└── README.md
```

## Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/baberlabs/chat-app.git
cd chat-app
```

### 2. Configure Environment Variables

Create a `.env` file inside `backend/`:

```env
PORT=5001
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
LOCAL_FRONTEND_URL=http://localhost:5173
```

### 3. Install Dependencies

Run the following command from root directory:

```bash
npm run build
```

## Running Locally

#### Backend (Express server):

```bash
cd backend
npm run dev
```

#### Frontend (React/Vite dev server):

```bash
cd frontend
npm run dev
```

Open the application at:

```browser
http://localhost:5173
```

## Deployment on Render

The application is fully tested and deployed on Render. To deploy your own instance:

- Create a new Render project and connect your GitHub repository.
- Set up environment variables as listed above.
- Use the following deployment commands:

```bash
npm run build
npm start
```

## Running Tests

From the backend directory:

```bash
cd backend
npm test
```

This command runs comprehensive tests using Jest and Supertest.

## License
Distributed under the ISC License. See [LICENSE](https://github.com/baberlabs/chat-app/blob/main/LICENSE) for details.

## Author

Baber Khan, a full-stack software developer, based in Birmingham, UK.

- [GitHub](https://github.com/baberlabs)
- [LinkedIn](https://linkedin.com/in/baberr)
- [Portfolio](https://baberr.com)
