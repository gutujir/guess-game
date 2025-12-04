# Guess Game - Multiplayer Real-Time Guessing Game

A real-time multiplayer guessing game where players compete to guess the answer to questions posed by a game master. Built with React, Node.js, Express, MongoDB, and Socket.IO.

## 🎮 Features

- **Real-time Multiplayer**: Live game sessions with WebSocket support
- **Game Master Rotation**: Automatic game master rotation based on winners
- **Session Management**: Create and join game sessions with unique codes
- **Live Chat**: In-game chat functionality for player communication
- **Score Tracking**: Persistent score tracking across multiple rounds
- **Attempt Limits**: Each player gets 3 attempts per round
- **Timer**: 60-second countdown for each round
- **User Authentication**: Secure JWT-based authentication
- **Responsive Design**: Modern UI with Tailwind CSS

## 📁 Project Structure

```
guess-game/
├── backend/          # Node.js/Express API server
├── frontend/         # React + Vite application
├── package.json      # Root package dependencies
└── README.md         # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd guess-game
   ```

2. **Install root dependencies**

   ```bash
   npm install
   ```

3. **Setup Backend**

   ```bash
   cd backend
   npm install
   cp .env.example .env  # Create .env and configure your settings
   ```

4. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Variables

#### Backend (.env)

```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

#### Frontend (.env)

```env
VITE_API_BASE=http://localhost:4000/api
```

### Running the Application

#### Development Mode

1. **Start Backend** (from backend directory)

   ```bash
   npm run dev
   ```

2. **Start Frontend** (from frontend directory)

   ```bash
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000

## 🎯 How to Play

1. **Register/Login**: Create an account or login
2. **Create or Join Session**:
   - Create a new game session with a unique code
   - Or join an existing session using a code
3. **Game Master**: The session creator becomes the first game master
4. **Start Round**: Game master sets a question and answer
5. **Guess**: Players have 60 seconds and 3 attempts to guess correctly
6. **Winner**: First correct guess wins the round and becomes next game master
7. **New Round**: New game master starts the next round

## 🛠️ Tech Stack

### Frontend

- React 19
- Vite
- Redux Toolkit (State Management)
- React Router (Routing)
- Tailwind CSS (Styling)
- Socket.IO Client (Real-time Communication)
- Axios (HTTP Client)

### Backend

- Node.js
- Express.js
- MongoDB + Mongoose
- Socket.IO (WebSockets)
- JWT (Authentication)
- Joi (Validation)
- bcryptjs (Password Hashing)

## 📚 API Documentation

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/check` - Check authentication status

### Game Sessions

- `POST /api/games/create` - Create new game session
- `POST /api/games/join` - Join existing session
- `POST /api/games/start` - Start game round (game master only)
- `POST /api/games/guess` - Submit a guess
- `POST /api/games/leave` - Leave session
- `GET /api/games/:code` - Get session details
- `GET /api/games` - Get all active sessions

### Messages

- `POST /api/messages/send_message` - Send chat message
- `GET /api/messages/:sessionId` - Get session messages

## 🔧 Development

### Backend Development

See [backend/README.md](./backend/README.md) for detailed backend documentation.

### Frontend Development

See [frontend/README.md](./frontend/README.md) for detailed frontend documentation.

## 📝 License

This project is licensed under the ISC License.

## 👥 Contributors

- Gutu Jirata Imana

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please contact [gutujirex@gmail.com]
