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
import { validateRequest } from "../middlewares/validate.js";
import {
  createSessionSchema,
  joinSessionSchema,
  startSessionSchema,
  submitGuessSchema,
  leaveSessionSchema,
} from "../validation/game.validation.js";

const router = express.Router();

// Protected routes with validation
router.post("/create", verifyToken, createSession);
router.post("/join", verifyToken, joinSession);
router.post("/start", verifyToken, startSession);
router.post(
  "/guess",
  verifyToken,
  validateRequest(submitGuessSchema),
  submitGuess
);
router.post(
  "/leave",
  verifyToken,
  validateRequest(leaveSessionSchema),
  leaveSession
);
router.get("/:code", verifyToken, getSession);

// Public route for lobby
router.get("/", getAllSessions);

export default router;
