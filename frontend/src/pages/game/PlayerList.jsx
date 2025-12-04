import React from "react";

const PlayerList = ({
  players,
  gameMasterId,
  winnerId,
  attempts,
  sessionStatus,
  scores = [],
}) => {
  const getPlayerAttempts = (playerId) => {
    if (!attempts || !Array.isArray(attempts)) return null;
    const playerIdStr = playerId?._id || playerId;
    const attempt = attempts.find(
      (a) => (a.userId?._id || a.userId) === playerIdStr
    );
    return attempt?.attemptsLeft ?? null;
  };

  const getPlayerScore = (playerId) => {
    if (!scores || !Array.isArray(scores)) return 0;
    const playerIdStr = playerId?._id || playerId;
    const scoreObj = scores.find(
      (s) => (s.userId?._id || s.userId) === playerIdStr
    );
    return scoreObj?.score ?? 0;
  };

  // Sort players: by score (descending), then winner, then game master
  const sortedPlayers = [...players].sort((a, b) => {
    const aId = a._id || a;
    const bId = b._id || b;
    const aScore = getPlayerScore(aId);
    const bScore = getPlayerScore(bId);

    // Sort by score first (highest to lowest)
    if (aScore !== bScore) {
      return bScore - aScore;
    }

    // Then winner
    if (aId === winnerId) return -1;
    if (bId === winnerId) return 1;

    // Then game master
    if (aId === gameMasterId) return -1;
    if (bId === gameMasterId) return 1;

    return 0;
  });

  return (
    <ul className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
      {sortedPlayers.map((player) => {
        const playerId = player._id || player;
        const attemptsLeft = getPlayerAttempts(playerId);
        const playerScore = getPlayerScore(playerId);
        const isGameMaster = playerId === gameMasterId;
        const isWinner = playerId === winnerId;

        return (
          <li
            key={playerId}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              isWinner
                ? "bg-emerald-500/20 border border-emerald-500/30"
                : "bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                isWinner
                  ? "bg-emerald-500"
                  : isGameMaster
                  ? "bg-amber-500"
                  : "bg-violet-500"
              }`}
            >
              {player.username ? player.username[0].toUpperCase() : "U"}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white truncate">
                  {player.username || player}
                </span>
                {isGameMaster && (
                  <span className="text-[10px] uppercase font-bold bg-amber-500 text-amber-900 px-1.5 py-0.5 rounded">
                    GM
                  </span>
                )}
                {isWinner && (
                  <span className="text-[10px] uppercase font-bold bg-emerald-500 text-emerald-900 px-1.5 py-0.5 rounded">
                    Winner
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 mt-1">
                {/* Score Display */}
                <div className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5 text-amber-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs font-bold text-amber-300">
                    {playerScore}
                  </span>
                </div>

                {/* Attempts Display */}
                {sessionStatus === "in-progress" &&
                  !isGameMaster &&
                  attemptsLeft !== null && (
                    <div className="flex items-center gap-1">
                      <div className="flex gap-0.5">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < attemptsLeft ? "bg-blue-400" : "bg-slate-600"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-slate-400 ml-1">
                        {attemptsLeft} left
                      </span>
                    </div>
                  )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default PlayerList;
