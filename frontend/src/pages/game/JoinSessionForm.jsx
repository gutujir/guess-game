import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

const JoinSessionForm = () => {
  const { user } = useSelector((state) => state.auth);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await axios.post(
        `${API_BASE}/games/join`,
        { userId: user._id, code },
        { withCredentials: true }
      );
      setSuccess("Joined session!");
      setTimeout(() => navigate(`/game/${code}`), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join session");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4">
      <div className="glass-card p-8 w-full max-w-md relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -ml-10 -mt-10"></div>

        <h1 className="text-2xl font-bold mb-2 text-center text-white">
          Join Game Session
        </h1>
        <p className="text-slate-400 text-center mb-8">
          Enter a code to join an existing game
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-300">
              Session Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter session code (e.g. ABC123)"
              className="input-field"
              required
              maxLength={12}
            />
          </div>

          <button
            type="submit"
            className="btn-primary w-full mt-2"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Joining...
              </span>
            ) : (
              "Join Session"
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 bg-emerald-500/10 border border-emerald-500/50 text-emerald-200 px-4 py-2 rounded-lg text-sm text-center">
            {success}
          </div>
        )}

        <button
          className="mt-6 text-slate-400 hover:text-white text-sm transition-colors w-full flex items-center justify-center gap-2"
          onClick={() => navigate("/lobby")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Lobby
        </button>
      </div>
    </div>
  );
};

export default JoinSessionForm;
