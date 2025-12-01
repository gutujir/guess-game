import userModel from "../models/user.model.js";
import GameSession from "../models/GameSession.model.js";

// Get dashboard info for a user (profile + stats)
export const getDashboardInfo = async (req, res) => {
  try {
    const userId = req.userId || req.params.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }
    // Get user profile
    const user = await userModel
      .findById(userId)
      .select("-password -refreshToken");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Get all sessions where user participated
    const sessions = await GameSession.find({ players: userId });
    const gamesPlayed = sessions.length;
    const gamesWon = sessions.filter(
      (s) => s.winner && s.winner.toString() === userId
    ).length;
    const totalGuesses = sessions.reduce((acc, s) => {
      const att = s.attempts?.find((a) => a.userId.toString() === userId) || {
        attemptsLeft: 0,
      };
      return acc + (3 - (att.attemptsLeft || 0));
    }, 0);
    res.json({
      user,
      stats: {
        gamesPlayed,
        gamesWon,
        totalGuesses,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
