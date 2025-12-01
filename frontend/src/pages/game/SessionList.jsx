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
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-green-50 to-amber-50 py-10">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-extrabold text-green-700 mb-6 text-center tracking-tight">
          Game Lobby
        </h1>
        <p className="text-gray-600 mb-8 text-center">
          Browse available game sessions or create your own. Join a session to
          start playing and chatting in real time!
        </p>
        {loading ? (
          <div className="text-center text-lg">Loading sessions...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : sessions.length === 0 ? (
          <div className="text-center text-gray-400">
            No sessions available. Be the first to create one!
          </div>
        ) : (
          <table className="w-full table-auto border-collapse mb-6">
            <thead>
              <tr className="bg-green-100">
                <th className="p-3 text-left font-semibold">Code</th>
                <th className="p-3 text-left font-semibold">Game Master</th>
                <th className="p-3 text-left font-semibold">Players</th>
                <th className="p-3 text-left font-semibold">Status</th>
                <th className="p-3 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => {
                // Game master is always the first player in the array
                const gm =
                  session.players && session.players.length > 0
                    ? session.players[0].username || session.players[0]
                    : "-";
                // Use session._id if available, else fallback to session.code
                const key = session._id || session.code;
                // Status badge color and text
                let statusColor = "bg-gray-400 text-white";
                let statusText = session.status;
                if (
                  session.status === "in-progress" ||
                  session.status === "started"
                ) {
                  statusColor = "bg-green-500 text-white";
                  statusText = "In Progress";
                } else if (session.status === "waiting") {
                  statusColor = "bg-yellow-400 text-gray-900";
                  statusText = "Waiting";
                } else if (session.status === "ended") {
                  statusColor = "bg-red-500 text-white";
                  statusText = "Ended";
                }
                return (
                  <tr key={key} className="border-b hover:bg-green-50">
                    <td className="p-3 font-mono text-green-700">
                      {session.code}
                    </td>
                    <td className="p-3 text-green-900 font-semibold">{gm}</td>
                    <td className="p-3">{session.players?.length || 0}</td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-3 py-1 rounded-full font-semibold text-sm capitalize ${statusColor}`}
                      >
                        {statusText}
                      </span>
                    </td>
                    <td className="p-3">
                      {session.status === "ended" ? (
                        <button
                          className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold transition"
                          onClick={() => handleViewDetails(session.code)}
                        >
                          View Details
                        </button>
                      ) : (
                        <button
                          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                          onClick={() => handleJoin(session.code)}
                        >
                          Join
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <div className="flex justify-center gap-4 mt-6">
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold text-lg shadow transition"
            onClick={() => navigate("/game/create")}
          >
            + Create New Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionList;
