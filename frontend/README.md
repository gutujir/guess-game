# Guess Game - Frontend

React + Vite frontend application for the Guess Game multiplayer platform.

## 🏗️ Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── api/            # API client functions
│   ├── pages/          # Page components
│   │   ├── auth/       # Authentication pages
│   │   ├── dashboard/  # Dashboard page
│   │   └── game/       # Game-related components
│   ├── redux/          # Redux store configuration
│   │   └── slices/     # Redux slices
│   ├── routes/         # Route configuration
│   ├── App.jsx         # Main app component
│   ├── index.css       # Global styles
│   └── main.jsx        # Application entry point
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js v16+
- Backend server running

### Installation

```bash
# Install dependencies
npm install

# Create environment file
touch .env
```

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE=http://localhost:4000/api
```

For production, update with your production API URL:

```env
VITE_API_BASE=https://your-api-domain.com/api
```

### Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 🎨 Features & Pages

### Authentication

- **Login** (`/login`) - User authentication
- **Register** (`/register`) - New user registration

### Game Pages

- **Dashboard** (`/dashboard`) - User profile and stats
- **Lobby** (`/lobby`) - View and join active sessions
- **Create Session** (`/create`) - Create new game session
- **Join Session** (`/join`) - Join existing session by code
- **Game Session** (`/game/:code`) - Active game interface

### Core Features

- **Real-time Updates**: Live game state via WebSockets
- **Session Management**: Create, join, and leave sessions
- **Live Chat**: In-game messaging
- **Player List**: Real-time player tracking
- **Score Display**: Live score updates
- **Countdown Timer**: Visual 60-second timer
- **Attempt Tracking**: Shows remaining attempts
- **Responsive Design**: Mobile-friendly interface

## 🛠️ Tech Stack

### Core

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing

### State Management

- **Redux Toolkit** - Global state management
- **React Redux** - React bindings for Redux

### Styling

- **Tailwind CSS 4** - Utility-first CSS framework
- **Custom CSS** - Global styles and animations

### HTTP & Real-time

- **Axios** - HTTP client
- **Socket.IO Client** - WebSocket communication

### Development

- **ESLint** - Code linting
- **Vite Plugin React** - Fast Refresh support

## 📁 Key Components

### Pages

- `Home.jsx` - Landing page
- `Dashboard.jsx` - User dashboard
- `Login.jsx` - Login form
- `Register.jsx` - Registration form
- `SessionList.jsx` - Active sessions lobby
- `CreateSessionForm.jsx` - Session creation
- `JoinSessionForm.jsx` - Join session by code
- `GameSession.jsx` - Main game interface

### Game Components

- `PlayerList.jsx` - Display players and scores
- `MessageList.jsx` - Chat message display
- `GuessForm.jsx` - Guess submission form

## 🎮 Game Flow

1. **User Authentication**

   - Register or login to access the game
   - JWT token stored in cookies

2. **Session Creation/Joining**

   - Create a new session with unique code
   - Or join existing session using code

3. **Game Master Controls**

   - Session creator is first game master
   - GM sets question and answer
   - GM starts the round

4. **Player Gameplay**

   - 60-second timer starts
   - Players have 3 attempts to guess
   - First correct guess wins

5. **Winner Rotation**

   - Winner becomes next game master
   - Game transitions to "ended" state
   - New GM can start next round

6. **Chat & Interaction**
   - Live chat during gameplay
   - Real-time player updates
   - Score tracking across rounds

## 🔌 API Integration

### Authentication API

```javascript
// Example login
const response = await axios.post(
  `${API_BASE}/auth/login`,
  { email, password },
  { withCredentials: true }
);
```

### Game API

```javascript
// Create session
await axios.post(
  `${API_BASE}/games/create`,
  { code },
  { withCredentials: true }
);

// Submit guess
await axios.post(
  `${API_BASE}/games/guess`,
  { code, guess },
  { withCredentials: true }
);
```

### WebSocket

```javascript
// Connect to socket
const socket = io(API_BASE.replace("/api", ""), {
  transports: ["websocket"],
});

// Join session
socket.emit("joinSession", code);

// Listen for updates
socket.on("sessionUpdated", (session) => {
  // Handle session update
});
```

## 🎨 Styling

### Tailwind Configuration

Tailwind CSS 4 with custom configuration for:

- Color scheme (dark theme)
- Custom animations
- Glassmorphism effects
- Responsive breakpoints

### Custom Classes

- `.glass-card` - Glassmorphic card effect
- `.btn-primary` - Primary button style
- `.btn-secondary` - Secondary button style
- `.input-field` - Form input styling

## 📦 Scripts

```json
{
  "dev": "vite", // Start dev server
  "build": "vite build", // Build for production
  "preview": "vite preview", // Preview production build
  "lint": "eslint ." // Run linter
}
```

## 🧩 Redux Store Structure

```javascript
{
  auth: {
    user: Object,        // Current user data
    isAuthenticated: Boolean
  }
}
```

## 🚀 Deployment

### Vercel

```bash
npm run build
# Deploy dist/ folder
```

### Netlify

```bash
npm run build
# Deploy dist/ folder
# Add _redirects file for SPA routing
```

### Environment Variables in Production

Ensure `VITE_API_BASE` points to your production API

## 🐛 Common Issues

### CORS Errors

- Ensure backend CORS is configured correctly
- Check API_BASE URL in .env

### WebSocket Connection Failed

- Verify Socket.IO server is running
- Check WebSocket URL (remove /api suffix)
- Ensure firewall/proxy allows WebSockets

### Build Errors

- Clear node_modules and reinstall
- Check for TypeScript/ESLint errors
- Verify all dependencies are installed

### Authentication Issues

- Clear browser cookies
- Check if backend JWT is configured
- Verify withCredentials: true in API calls

## 🔧 Development Tips

- Use React DevTools for component debugging
- Use Redux DevTools for state debugging
- Check Network tab for API calls
- Monitor WebSocket events in browser console

## 📝 Code Style

- Use functional components with hooks
- Follow ESLint rules
- Use meaningful variable names
- Keep components focused and reusable

## 📄 License

ISC
