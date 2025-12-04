import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutThunk } from "../features/auth/authThunks";

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await dispatch(logoutThunk());
    navigate("/");
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Get first letter of user's first name
  const profileLetter =
    user && user.first_name
      ? user.first_name[0].toUpperCase()
      : user && user.username
      ? user.username[0].toUpperCase()
      : "U";

  return (
    <nav className="sticky top-0 z-50 glass mb-8">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 tracking-tight hover:opacity-80 transition-opacity"
        >
          Guessing Game
        </Link>

        <div className="flex gap-6 items-center">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === "/dashboard"
                    ? "text-violet-400"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/lobby"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === "/lobby"
                    ? "text-violet-400"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Lobby
              </Link>

              <div className="relative" ref={dropdownRef}>
                <button
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center font-bold text-white shadow-lg hover:shadow-violet-500/50 transition-all transform hover:scale-105 focus:outline-none ring-2 ring-white/20"
                  onClick={() => setDropdownOpen((open) => !open)}
                  aria-label="Profile"
                  type="button"
                >
                  {profileLetter}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 overflow-hidden">
                    <div className="px-4 py-2 border-b border-slate-700 mb-1">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold text-white truncate">
                        {user?.username}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700/50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex gap-4">
              <Link
                to="/login"
                className="text-slate-300 hover:text-white font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-all border border-white/10"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
