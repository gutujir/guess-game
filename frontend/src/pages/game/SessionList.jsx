import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

const SessionList = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/games`);
        setSessions(res.data);
      } catch (err) {
        setError("Failed to load sessions");
      }
      setLoading(false);
    };
    fetchSessions();
  }, []);

  const handleJoin = async (code) => {
    setError("");
    if (!user || !user._id) {
      setError("You must be logged in to join a session.");
      return;
    }
    // Find the session object
    const session = sessions.find((s) => s.code === code);
    // If user is already a player, just navigate
    if (
      session &&
      session.players &&
      session.players.some((p) => (p._id || p) === user._id)
    ) {
      navigate(`/game/${code}`);
      return;
    }
    try {
      await axios.post(
        `${API_BASE}/games/join`,
        { userId: user._id, code },
        { withCredentials: true }
      );
      navigate(`/game/${code}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join session");
    }
  };

  const handleViewDetails = (code) => {
    navigate(`/game/${code}?view=details`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
            Game Lobby
          </h1>
          <p className="text-slate-400 mt-1">
            Browse active sessions or start your own
          </p>
        </div>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => navigate("/game/create")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Create Session
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl text-center">
          {error}
        </div>
      ) : sessions.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            No Active Sessions
          </h3>
          <p className="text-slate-400 mb-6">
            Be the first to create a game and invite your friends!
          </p>
          <button
            className="btn-secondary"
            onClick={() => navigate("/game/create")}
          >
            Start New Game
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => {
            const gm =
              session.players && session.players.length > 0
                ? session.players[0].username || session.players[0]
                : "-";
            const key = session._id || session.code;

            let statusColor = "bg-slate-700 text-slate-300";
            let statusText = session.status;
            let statusDot = "bg-slate-400";

            if (
              session.status === "in-progress" ||
              session.status === "started"
            ) {
              statusColor =
                "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
              statusText = "In Progress";
              statusDot = "bg-emerald-400 animate-pulse";
            } else if (session.status === "waiting") {
              statusColor =
                "bg-amber-500/20 text-amber-300 border border-amber-500/30";
              statusText = "Waiting";
              statusDot = "bg-amber-400 animate-pulse";
            } else if (session.status === "ended") {
              statusColor =
                "bg-red-500/20 text-red-300 border border-red-500/30";
              statusText = "Ended";
              statusDot = "bg-red-400";
            }

            return (
              <div
                key={key}
                className="glass-card p-6 hover:border-violet-500/50 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-24 w-24 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="bg-slate-800/80 px-3 py-1 rounded-lg font-mono text-violet-300 font-bold border border-slate-700">
                    {session.code}
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 ${statusColor}`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${statusDot}`}
                    ></span>
                    {statusText}
                  </div>
                </div>

                <div className="space-y-3 mb-6 relative z-10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Game Master</span>
                    <span className="text-white font-medium">{gm}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Players</span>
                    <span className="text-white font-medium flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-slate-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      {session.players?.length || 0}
                    </span>
                  </div>
                </div>

                <div className="relative z-10">
                  {session.status === "ended" ? (
                    <button
                      className="w-full btn-secondary py-2 text-sm"
                      onClick={() => handleViewDetails(session.code)}
                    >
                      View Details
                    </button>
                  ) : (
                    <button
                      className="w-full btn-primary py-2 text-sm shadow-lg shadow-violet-900/20"
                      onClick={() => handleJoin(session.code)}
                    >
                      Join Game
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SessionList;
