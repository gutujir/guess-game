import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutThunk } from "../features/auth/authThunks";

const Home = () => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate("/");
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-3xl -z-10"></div>

      <div className="glass-card p-10 max-w-2xl w-full flex flex-col items-center text-center relative z-10">
        <div className="mb-6 inline-block">
          <span className="py-1 px-3 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold uppercase tracking-wider">
            Live Multiplayer
          </span>
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            Master the Art of
          </span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
            Guessing
          </span>
        </h1>

        <p className="text-lg text-slate-300 mb-10 max-w-lg leading-relaxed">
          Challenge your friends in real-time. Create sessions, join games, and
          compete for the top score in a fast-paced, interactive environment.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          {isAuthenticated ? (
            <>
              <Link
                to="/lobby"
                className="btn-primary flex-1 text-center flex items-center justify-center gap-2"
              >
                <span>Explore Games</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <Link
                to="/game/create"
                className="btn-secondary flex-1 text-center"
              >
                Create Session
              </Link>
            </>
          ) : (
            <>
              <Link to="/register" className="btn-primary flex-1 text-center">
                Get Started
              </Link>
              <Link to="/login" className="btn-secondary flex-1 text-center">
                Login
              </Link>
            </>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-700/50 w-full flex justify-between text-slate-400 text-sm">
          <div className="flex flex-col items-center">
            <span className="font-bold text-white text-xl">Real-time</span>
            <span>Gameplay</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-white text-xl">Live</span>
            <span>Chat</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-white text-xl">Global</span>
            <span>Ranking</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
