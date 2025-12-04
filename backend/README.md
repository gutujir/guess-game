# Guess Game - Backend API

Node.js/Express backend server for the Guess Game multiplayer application with real-time WebSocket support.

## 🏗️ Architecture

```
backend/
├── src/
│   ├── controllers/      # Route controllers
│   ├── middlewares/      # Custom middleware
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── validation/       # Joi validation schemas
│   └── index.js          # Application entry point
├── .env                  # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js v16+
- MongoDB (local or Atlas)

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/guess-game
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/guess-game

# JWT Secret (use a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Session Configuration
SESSION_DURATION_MS=60000  # 60 seconds
```

### Run Development Server

```bash
npm run dev
```

The server will start on `http://localhost:4000`

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint    | Description       | Auth Required |
| ------ | ----------- | ----------------- | ------------- |
| POST   | `/register` | Register new user | No            |
| POST   | `/login`    | Login user        | No            |
| POST   | `/logout`   | Logout user       | Yes           |
| GET    | `/check`    | Check auth status | Yes           |

### Game Routes (`/api/games`)

| Method | Endpoint  | Description         | Auth Required |
| ------ | --------- | ------------------- | ------------- |
| POST   | `/create` | Create game session | Yes           |
| POST   | `/join`   | Join game session   | Yes           |
| POST   | `/start`  | Start game round    | Yes (GM only) |
| POST   | `/guess`  | Submit guess        | Yes           |
| POST   | `/leave`  | Leave session       | Yes           |
| GET    | `/:code`  | Get session details | Yes           |
| GET    | `/`       | Get all sessions    | No            |

### Message Routes (`/api/messages`)

| Method | Endpoint        | Description          | Auth Required |
| ------ | --------------- | -------------------- | ------------- |
| POST   | `/send_message` | Send chat message    | Yes           |
| GET    | `/:sessionId`   | Get session messages | Yes           |

## 🔌 WebSocket Events

### Client → Server

- `joinSession` - Join a game session room
- `leaveSession` - Leave a game session room

### Server → Client

- `sessionUpdated` - Session state changed
- `sessionDeleted` - Session was deleted
- `sessionTimeout` - Game round timed out
- `newMessage` - New chat message received

## 💾 Database Models

### User Model

```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  first_name: String,
  last_name: String,
  createdAt: Date
}
```

### GameSession Model

```javascript
{
  code: String (unique),
  gameMaster: ObjectId (ref: User),
  players: [ObjectId (ref: User)],
  status: String (waiting|in-progress|ended),
  question: String,
  answer: String,
  winner: ObjectId (ref: User),
  attempts: [{ userId, attemptsLeft }],
  scores: [{ userId, score }],
  startTime: Date,
  endTime: Date
}
```

### Message Model

```javascript
{
  sessionId: ObjectId (ref: GameSession),
  senderId: ObjectId (ref: User),
  content: String,
  type: String (chat|system),
  createdAt: Date
}
```

## 🔐 Authentication

- Uses JWT (JSON Web Tokens) for authentication
- Tokens stored in HTTP-only cookies
- Password hashing with bcryptjs
- Token verification middleware for protected routes

## ✅ Validation

Input validation using Joi:

- No validation on game session creation
- No validation on question/answer submission
- Validation only on authentication endpoints

## 🛠️ Key Features

- **Real-time Updates**: Socket.IO for live game state synchronization
- **Automatic Game Master Rotation**: Winner becomes next GM
- **Session Timeout**: 60-second rounds with automatic cleanup
- **Score Persistence**: Cumulative scoring across rounds
- **Attempt Tracking**: 3 attempts per player per round

## 📦 Dependencies

### Production

- `express` - Web framework
- `mongoose` - MongoDB ODM
- `socket.io` - WebSocket library
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `joi` - Validation library
- `cors` - CORS middleware
- `cookie-parser` - Cookie parsing
- `dotenv` - Environment variables

### Development

- `nodemon` - Auto-restart on file changes

## 🧪 Testing

```bash
# Run tests (if implemented)
npm test
```

## 🚀 Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Use a production MongoDB instance
3. Set strong JWT_SECRET
4. Configure CORS for your frontend domain
5. Use a process manager like PM2

```bash
# Using PM2
npm install -g pm2
pm2 start src/index.js --name guess-game-api
```

## 📝 Notes

- Session timeout is 60 seconds per round
- Minimum 3 players required to start a game
- Game masters cannot submit guesses
- Winner scoring: +10 points per win

## 🐛 Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Verify network access for Atlas

### Socket.IO Connection Issues

- Check CORS configuration
- Ensure frontend URL is allowed
- Verify WebSocket transport is enabled

### JWT Token Issues

- Clear browser cookies
- Check JWT_SECRET is set
- Verify token expiration settings

## 📄 License

ISC
