import GameSession from "../models/GameSession.model.js";

const SESSION_DURATION_MS = 60 * 1000;

const sessionTimeouts = {};
let io = null;

export const setSocketIO = (instance) => {
  io = instance;
};

export const getSocketIO = () => io;

const POPULATE_FIELDS = [
  { path: "players", select: "first_name last_name username" },
  { path: "gameMaster", select: "first_name last_name username" },
  { path: "winner", select: "first_name last_name username" },
  { path: "scores.userId", select: "first_name last_name username" },
];

const toIdString = (value) => {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (value._id) return value._id.toString();
  if (value.id) return value.id.toString();
  return value.toString();
};

const isSameId = (a, b) => {
  const first = toIdString(a);
  const second = toIdString(b);
  if (!first || !second) return false;
  return first === second;
};

const populateSession = async (sessionDocOrCode) => {
  if (!sessionDocOrCode) return null;
  if (typeof sessionDocOrCode === "string") {
    return GameSession.findOne({ code: sessionDocOrCode }).populate(
      POPULATE_FIELDS
    );
  }
  return sessionDocOrCode.populate(POPULATE_FIELDS);
};

const sanitizeSessionForUser = (sessionDoc, userId) => {
  if (!sessionDoc) return null;
  const session =
    typeof sessionDoc.toObject === "function"
      ? sessionDoc.toObject({ virtuals: true })
      : sessionDoc;
  const gmId = toIdString(session.gameMaster);
  if (
    session.status === "in-progress" &&
    (!userId || gmId !== toIdString(userId))
  ) {
    delete session.answer;
  }
  return session;
};

const sanitizeForBroadcast = (sessionDoc) =>
  sanitizeSessionForUser(sessionDoc, null);

const emitSessionUpdate = async (sessionDocOrCode) => {
  if (!io) return;
  let populated = sessionDocOrCode;
  if (!populated || typeof populated === "string") {
    populated = await populateSession(sessionDocOrCode);
  } else if (typeof populated.populate === "function") {
    populated = await populated.populate(POPULATE_FIELDS);
  }
  if (!populated) {
    const code =
      typeof sessionDocOrCode === "string"
        ? sessionDocOrCode
        : sessionDocOrCode?.code;
    if (code) {
      io.to(code).emit("sessionDeleted");
    }
    return;
  }
  io.to(populated.code).emit("sessionUpdated", sanitizeForBroadcast(populated));
};

const clearSessionTimer = (code) => {
  if (sessionTimeouts[code]) {
    clearTimeout(sessionTimeouts[code]);
    delete sessionTimeouts[code];
  }
};

const scheduleSessionTimeout = (session) => {
  clearSessionTimer(session.code);
  sessionTimeouts[session.code] = setTimeout(
    () => handleSessionTimeout(session.code),
    SESSION_DURATION_MS
  );
};

const pickNextGameMaster = (session, winnerId) => {
  if (!session.players || session.players.length === 0) {
    return session.gameMaster;
  }

  const players = session.players;
  const currentGmId = toIdString(session.gameMaster);
  const winnerStr = toIdString(winnerId);

  if (
    winnerStr &&
    winnerStr !== currentGmId &&
    players.some((p) => toIdString(p) === winnerStr)
  ) {
    return players.find((p) => toIdString(p) === winnerStr);
  }

  if (players.length === 1) {
    return players[0];
  }

  let startIndex = players.findIndex((p) => toIdString(p) === currentGmId);
  if (startIndex === -1) startIndex = 0;

  for (let offset = 1; offset <= players.length; offset += 1) {
    const next = players[(startIndex + offset) % players.length];
    if (toIdString(next) !== currentGmId) {
      return next;
    }
  }

  return session.gameMaster;
};

const finalizeSession = async (session, winnerId = null) => {
  session.status = "ended";
  session.winner = winnerId;
  session.endTime = new Date();
  session.attempts = [];

  const nextGameMaster = pickNextGameMaster(session, winnerId);
  if (nextGameMaster) {
    session.gameMaster = nextGameMaster;
  }

  // Keep status as "ended" to show results
  // Question and answer remain visible until next round starts
  // Status will be reset to "waiting" when next game master starts a new round

  await session.save();
  clearSessionTimer(session.code);
  return populateSession(session);
};

const handleSessionTimeout = async (code) => {
  try {
    const session = await GameSession.findOne({ code });
    if (session && session.status === "in-progress") {
      const populated = await finalizeSession(session, null);
      await emitSessionUpdate(populated);
      if (io) {
        io.to(code).emit("sessionTimeout", {
          code,
          message: "Session timed out",
        });
      }
    }
  } catch (error) {
    console.error("Session timeout error:", error);
  } finally {
    clearSessionTimer(code);
  }
};

const ensureScoresEntry = (session, userId) => {
  if (!session.scores.some((score) => isSameId(score.userId, userId))) {
    session.scores.push({ userId, score: 0 });
  }
};

const ensureGameMasterOnLeave = (session, leavingUserId) => {
  if (!session.players.length) return;
  if (isSameId(session.gameMaster, leavingUserId)) {
    session.gameMaster = session.players[0];
  }
};

// 1. Create a new game session
export const createSession = async (req, res) => {
  try {
    const userId = req.userId;
    const { code } = req.body;
    if (!userId || !code?.trim()) {
      return res
        .status(400)
        .json({ message: "A session code is required to create a game" });
    }

    const normalizedCode = code.trim().toUpperCase();
    const exists = await GameSession.findOne({ code: normalizedCode });
    if (exists) {
      return res.status(409).json({ message: "Session code already exists" });
    }

    const session = await GameSession.create({
      code: normalizedCode,
      gameMaster: userId,
      players: [userId],
      scores: [{ userId, score: 0 }],
      status: "waiting",
    });

    const populated = await populateSession(session);
    res.status(201).json(sanitizeSessionForUser(populated, userId));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2. Join a game session
export const joinSession = async (req, res) => {
  try {
    const userId = req.userId;
    const { code } = req.body;
    if (!userId || !code?.trim()) {
      return res
        .status(400)
        .json({ message: "Session code is required to join" });
    }

    const normalizedCode = code.trim().toUpperCase();
    const session = await GameSession.findOne({ code: normalizedCode });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    if (session.status === "in-progress") {
      return res.status(400).json({ message: "Game already in progress" });
    }
    if (session.players.some((player) => isSameId(player, userId))) {
      return res.status(409).json({ message: "You have already joined" });
    }

    session.players.push(userId);
    ensureScoresEntry(session, userId);
    await session.save();

    const populated = await populateSession(session);
    await emitSessionUpdate(populated);
    res.status(201).json(sanitizeSessionForUser(populated, userId));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3. Start a game session (game master only)
export const startSession = async (req, res) => {
  try {
    const userId = req.userId;
    const { code, question, answer } = req.body;
    if (!code?.trim() || !question?.trim() || !answer?.trim()) {
      return res.status(400).json({
        message: "Code, question, and answer are required to start the game",
      });
    }

    const normalizedCode = code.trim().toUpperCase();
    const session = await GameSession.findOne({ code: normalizedCode });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (!isSameId(session.gameMaster, userId)) {
      return res
        .status(403)
        .json({ message: "Only the game master can start the session" });
    }

    if (session.players.length < 3) {
      return res
        .status(400)
        .json({ message: "At least 3 players are required to start" });
    }

    if (session.status === "in-progress") {
      return res.status(400).json({ message: "Game already in progress" });
    }

    // Allow starting a new round if status is "ended" or "waiting"
    // Reset previous round data
    if (session.status === "ended") {
      session.winner = null;
      session.startTime = null;
      session.endTime = null;
      session.attempts = [];
      session.question = null;
      session.answer = null;
    }

    session.players.forEach((playerId) => ensureScoresEntry(session, playerId));

    session.status = "in-progress";
    session.question = question.trim();
    session.answer = answer.trim();
    session.startTime = new Date();
    session.endTime = null;
    session.winner = null;
    session.attempts = session.players.map((uid) => ({
      userId: uid,
      attemptsLeft: 3,
    }));

    await session.save();
    scheduleSessionTimeout(session);

    const populated = await populateSession(session);
    await emitSessionUpdate(populated);

    res.status(200).json({
      message: "Game started",
      session: sanitizeSessionForUser(populated, userId),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 4. Submit a guess
export const submitGuess = async (req, res) => {
  try {
    const userId = req.userId;
    const { code, guess } = req.body;
    if (!code?.trim() || !guess?.trim()) {
      return res
        .status(400)
        .json({ message: "Session code and guess are required" });
    }

    const normalizedCode = code.trim().toUpperCase();
    const session = await GameSession.findOne({ code: normalizedCode });
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status !== "in-progress") {
      return res.status(400).json({ message: "Game is not in progress" });
    }

    if (session.winner) {
      return res.status(400).json({ message: "Game already has a winner" });
    }

    if (isSameId(session.gameMaster, userId)) {
      return res
        .status(400)
        .json({ message: "Game masters cannot submit guesses" });
    }

    const attempt = session.attempts.find((a) => isSameId(a.userId, userId));
    if (!attempt) {
      return res.status(400).json({ message: "You are not part of this game" });
    }
    if (attempt.attemptsLeft < 1) {
      return res.status(400).json({ message: "No attempts left" });
    }

    const normalizedGuess = guess.trim().toLowerCase();
    const normalizedAnswer = session.answer.trim().toLowerCase();
    if (normalizedGuess === normalizedAnswer) {
      const scoreObj = session.scores.find((s) => isSameId(s.userId, userId));
      if (scoreObj) {
        scoreObj.score += 10;
      } else {
        session.scores.push({ userId, score: 10 });
      }

      const populated = await finalizeSession(session, userId);
      await emitSessionUpdate(populated);

      return res.status(200).json({
        message: "Correct! You win!",
        winner: userId,
        session: sanitizeSessionForUser(populated, userId),
      });
    }

    attempt.attemptsLeft -= 1;
    await session.save();
    return res.status(200).json({
      message: "Wrong guess",
      attemptsLeft: attempt.attemptsLeft,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 5. Get session details (with player count and scores)
export const getSession = async (req, res) => {
  try {
    const { code } = req.params;
    const normalizedCode = code.trim().toUpperCase();
    const session = await populateSession(normalizedCode);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const sanitized = sanitizeSessionForUser(session, req.userId);
    res.status(200).json({
      session: sanitized,
      playerCount: sanitized.players?.length || 0,
      scores: sanitized.scores || [],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 6. Get all sessions (for lobby, with player count)
export const getAllSessions = async (req, res) => {
  try {
    const sessions = await GameSession.find()
      .select("code status players gameMaster")
      .populate("gameMaster", "first_name last_name username")
      .populate("players", "first_name last_name username");
    res.status(200).json(
      sessions.map((s) => ({
        code: s.code,
        status: s.status,
        playerCount: s.players.length,
        gameMaster: s.gameMaster
          ? {
              _id: s.gameMaster._id,
              fullName: `${s.gameMaster.first_name} ${s.gameMaster.last_name}`,
              username: s.gameMaster.username,
            }
          : null,
        players: s.players.map((p) => ({
          _id: p._id,
          fullName: `${p.first_name} ${p.last_name}`,
          username: p.username,
        })),
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 7. Leave a session (rotate game master, delete if empty)
export const leaveSession = async (req, res) => {
  try {
    const requesterId = req.userId;
    const { code, userId } = req.body;
    if (!code?.trim()) {
      return res.status(400).json({ message: "Session code is required" });
    }

    const normalizedCode = code.trim().toUpperCase();
    const session = await GameSession.findOne({ code: normalizedCode });
    if (!session) return res.status(404).json({ message: "Session not found" });

    const targetUserId = userId || requesterId;
    if (!isSameId(targetUserId, requesterId)) {
      return res
        .status(403)
        .json({ message: "You can only leave for yourself" });
    }

    if (!session.players.some((player) => isSameId(player, targetUserId))) {
      return res
        .status(400)
        .json({ message: "You are not part of this session" });
    }

    session.players = session.players.filter(
      (uid) => !isSameId(uid, targetUserId)
    );
    session.scores = session.scores.filter(
      (s) => !isSameId(s.userId, targetUserId)
    );
    session.attempts = session.attempts?.filter(
      (a) => !isSameId(a.userId, targetUserId)
    );

    ensureGameMasterOnLeave(session, targetUserId);

    if (session.players.length === 0) {
      clearSessionTimer(session.code);
      await session.deleteOne();
      if (io) {
        io.to(normalizedCode).emit("sessionDeleted");
      }
      return res.status(200).json({ message: "Session deleted" });
    }

    await session.save();
    const populated = await populateSession(session);
    await emitSessionUpdate(populated);

    res.status(200).json({
      message: "Left session",
      session: sanitizeSessionForUser(populated, requesterId),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
