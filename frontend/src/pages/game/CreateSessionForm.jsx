import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

const CreateSessionForm = () => {
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
      const res = await axios.post(
        `${API_BASE}/games/create`,
        { userId: user._id, code },
        { withCredentials: true }
      );
      navigate(`/game/${res.data.code}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create session");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-green-50 to-amber-50 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-extrabold text-green-700 mb-6 text-center tracking-tight">
          Create New Game Session
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="font-semibold text-gray-700">Session Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter a unique code (e.g. ABC123)"
            className="border rounded px-3 py-2 text-lg"
            required
            maxLength={12}
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold text-lg shadow transition"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Session"}
          </button>
        </form>
        {error && <div className="text-red-500 mt-4 text-center">{error}</div>}
        {success && (
          <div className="text-green-600 mt-4 text-center">{success}</div>
        )}
        <button
          className="mt-6 text-amber-600 underline text-center w-full"
          onClick={() => navigate("/lobby")}
        >
          Back to Lobby
        </button>
      </div>
    </div>
  );
};

export default CreateSessionForm;
