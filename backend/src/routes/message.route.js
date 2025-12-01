import express from "express";

import { sendMessage, getMessages } from "../controllers/message.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

// Send a message (chat or guess) - protected
router.post("/send_message", verifyToken, sendMessage);

// Get all messages for a session (public)
router.get("/:sessionId", getMessages);

export default router;
