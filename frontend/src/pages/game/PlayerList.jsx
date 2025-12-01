import React from "react";

const PlayerList = ({
  players,
  gameMasterId,
  winnerId,
  attempts,
  sessionStatus,
}) => {
  const getPlayerAttempts = (playerId) => {
    if (!attempts || !Array.isArray(attempts)) return null;
    const playerIdStr = playerId?._id || playerId;
    const attempt = attempts.find(
      (a) => (a.userId?._id || a.userId) === playerIdStr
    );
    return attempt?.attemptsLeft ?? null;
  };

  return (
    <ul className="space-y-2">
      {players.map((player) => {
        const playerId = player._id || player;
        const attemptsLeft = getPlayerAttempts(playerId);
        const isGameMaster = playerId === gameMasterId;
        const isWinner = playerId === winnerId;

        return (
          <li
            key={playerId}
            className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2 shadow"
          >
            <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center font-bold text-green-700">
              {player.username ? player.username[0].toUpperCase() : "U"}
            </div>
            <div className="flex-1">
              <span className="font-semibold text-gray-800">
                {player.username || player}
              </span>
              {isGameMaster && (
                <span className="ml-2 text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded">
                  GM
                </span>
              )}
              {isWinner && (
                <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded">
                  Winner
                </span>
              )}
              {sessionStatus === "in-progress" &&
                !isGameMaster &&
                attemptsLeft !== null && (
                  <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded">
                    {attemptsLeft} attempts
                  </span>
                )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default PlayerList;
