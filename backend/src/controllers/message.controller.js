import Message from "../models/message.model.js";
import GameSession from "../models/GameSession.model.js";
import { getSocketIO } from "./game.controller.js";

const formatMessagePayload = (message) => {
  if (!message) return message;
  const payload = message.toObject ? message.toObject() : message;
  if (payload.userId) {
    const user = payload.userId;
    payload.userId = {
      ...user,
      fullName: user.first_name && user.last_name
        ? `${user.first_name} ${user.last_name}`
        : user.fullName,
    };
  }
  return payload;
};

export const sendMessage = async (req, res) => {
  try {
    const authenticatedUserId = req.userId;
    const { sessionId, userId: bodyUserId, content, type = "chat" } = req.body;
    const userId = authenticatedUserId || bodyUserId;

    if (!sessionId || !content?.trim()) {
      return res
        .status(400)
        .json({ message: "Session and content are required" });
    }

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const session = await GameSession.findById(sessionId).select("code");
    if (!session) {
      return res.status(404).json({ message: "Game session not found" });
    }

    const message = await Message.create({
      sessionId,
      userId,
      content: content.trim(),
      type,
    });

    const populatedMessage = await Message.findById(message._id).populate({
      path: "userId",
      select: "first_name last_name username email",
    });

    const io = getSocketIO();
    const payload = formatMessagePayload(populatedMessage);
    if (io) {
      io.to(session.code).emit("newMessage", payload);
    }

    res.status(201).json({ message: "Message sent", data: payload });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const messages = await Message.find({ sessionId })
      .sort({ createdAt: 1 })
      .populate({
        path: "userId",
        select: "first_name last_name username email",
      });

    res.status(200).json(messages.map(formatMessagePayload));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
