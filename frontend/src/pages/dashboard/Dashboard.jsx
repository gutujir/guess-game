import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:4000/api"
          }/dashboard`,
          { withCredentials: true }
        );
        setUser(res.data.user);
        setStats(res.data.stats);
      } catch (err) {
        setUser({ username: "Unknown", email: "-" });
        setStats(null);
      }
      setLoading(false);
    };
    fetchDashboard();
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-8 text-center">
        <span className="text-gray-500">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-green-700 text-center">
        Dashboard
      </h1>
      <div className="bg-white rounded-lg shadow p-6 mb-8 flex flex-col items-center w-full">
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-4xl font-bold text-green-700 mb-2">
          {user?.username?.[0]?.toUpperCase() ||
            user?.email?.[0]?.toUpperCase() ||
            "U"}
        </div>
        <div className="text-lg font-semibold mb-1">
          {user?.username || "Unknown User"}
        </div>
        <div className="text-gray-500 mb-2">{user?.email}</div>
        <div className="grid grid-cols-2 gap-2 w-full max-w-md mb-4 mt-2">
          <div className="text-sm text-gray-600 font-medium">Full Name:</div>
          <div className="text-sm text-gray-900">
            {user?.first_name || "-"} {user?.last_name || ""}
          </div>
          <div className="text-sm text-gray-600 font-medium">Username:</div>
          <div className="text-sm text-gray-900">{user?.username || "-"}</div>
          <div className="text-sm text-gray-600 font-medium">User ID:</div>
          <div className="text-sm text-gray-900 break-all">
            {user?._id || user?.id || "-"}
          </div>
          <div className="text-sm text-gray-600 font-medium">Email:</div>
          <div className="text-sm text-gray-900">{user?.email || "-"}</div>
        </div>
        <div className="flex gap-4 mt-2">
          <div className="text-center">
            <div className="text-xl font-bold text-green-700">
              {stats?.gamesPlayed ?? 0}
            </div>
            <div className="text-gray-500 text-sm">Games Played</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-700">
              {stats?.gamesWon ?? 0}
            </div>
            <div className="text-gray-500 text-sm">Games Won</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-700">
              {stats?.totalGuesses ?? 0}
            </div>
            <div className="text-gray-500 text-sm">Total Guesses</div>
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <button
          onClick={() => navigate("/lobby")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold shadow"
        >
          Go to Game Lobby
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
