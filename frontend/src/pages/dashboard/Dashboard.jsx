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
            import.meta.env.VITE_API_BASE || "http://localhost:4000/api"
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
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
        Player Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Profile Card */}
        <div className="glass-card p-6 md:col-span-1 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-4xl font-bold text-white mb-4 shadow-lg ring-4 ring-white/10">
            {user?.username?.[0]?.toUpperCase() || "U"}
          </div>
          <h2 className="text-xl font-bold text-white mb-1">
            {user?.username}
          </h2>
          <p className="text-slate-400 text-sm mb-4">{user?.email}</p>

          <div className="w-full border-t border-slate-700/50 pt-4 mt-2">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Full Name</span>
              <span className="text-slate-200">
                {user?.first_name} {user?.last_name}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Member Since</span>
              <span className="text-slate-200">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-6 flex flex-col items-center justify-center hover:bg-slate-800/70 transition-colors">
            <div className="text-4xl font-bold text-violet-400 mb-2">
              {stats?.gamesPlayed ?? 0}
            </div>
            <div className="text-slate-400 text-sm uppercase tracking-wider font-semibold">
              Games Played
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col items-center justify-center hover:bg-slate-800/70 transition-colors">
            <div className="text-4xl font-bold text-emerald-400 mb-2">
              {stats?.gamesWon ?? 0}
            </div>
            <div className="text-slate-400 text-sm uppercase tracking-wider font-semibold">
              Games Won
            </div>
          </div>

          <div className="glass-card p-6 flex flex-col items-center justify-center hover:bg-slate-800/70 transition-colors">
            <div className="text-4xl font-bold text-amber-400 mb-2">
              {stats?.totalGuesses ?? 0}
            </div>
            <div className="text-slate-400 text-sm uppercase tracking-wider font-semibold">
              Total Guesses
            </div>
          </div>

          {/* Recent Activity or CTA */}
          <div className="glass-card p-6 sm:col-span-3 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
            <div>
              <h3 className="text-lg font-bold text-white">Ready to play?</h3>
              <p className="text-slate-400 text-sm">
                Join a session or create your own game.
              </p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={() => navigate("/lobby")}
                className="btn-primary flex-1 sm:flex-none text-center text-sm py-2"
              >
                Find Game
              </button>
              <button
                onClick={() => navigate("/game/create")}
                className="btn-secondary flex-1 sm:flex-none text-center text-sm py-2"
              >
                Create New
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
