import { io } from "socket.io-client";

// Use the backend URL from env or fallback to localhost:4000
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket"],
});

export default socket;
