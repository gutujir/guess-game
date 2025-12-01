import express from "express";

import {
  createSession,
  joinSession,
  startSession,
  submitGuess,
  getSession,
  leaveSession,
  getAllSessions,
} from "../controllers/game.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

// Protected routes
router.post("/create", verifyToken, createSession);
router.post("/join", verifyToken, joinSession);
router.post("/start", verifyToken, startSession);
router.post("/guess", verifyToken, submitGuess);
router.post("/leave", verifyToken, leaveSession);
router.get("/:code", verifyToken, getSession);

// Public route for lobby
router.get("/", getAllSessions);

export default router;
