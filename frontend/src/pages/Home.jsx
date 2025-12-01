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
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-amber-100 to-green-100">
      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-lg w-full flex flex-col items-center">
        <h1 className="text-4xl font-extrabold text-green-700 mb-4 text-center tracking-tight">
          Welcome to the Guessing Game!
        </h1>
        <p className="text-lg text-gray-700 mb-6 text-center">
          Challenge your friends in a live guessing game. Create or join
          sessions, chat, and compete for the top score. Fun, fast, and social!
        </p>
        <div className="flex flex-col gap-4 w-full">
          {isAuthenticated ? (
            <>
              <Link
                to="/lobby"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg text-center transition"
              >
                Explore Games
              </Link>
              <Link
                to="/game/create"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-lg text-center transition"
              >
                Create Game Session
              </Link>
              <Link
                to="/game/join"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg text-center transition"
              >
                Join Game Session
              </Link>
              <button
                onClick={handleLogout}
                className="w-full bg-gray-400 hover:bg-gray-500 text-white font-semibold py-3 rounded-lg text-center transition"
                disabled={loading}
              >
                {loading ? "Logging out..." : "Logout"}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg text-center transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-lg text-center transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
        <div className="mt-8 text-gray-400 text-xs text-center">
          &copy; {new Date().getFullYear()} Guessing Game. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Home;
