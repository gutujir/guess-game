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
    <nav className="bg-white shadow flex items-center px-6 py-3 mb-4">
      <div className="flex-1">
        <Link
          to="/"
          className="text-2xl font-extrabold text-green-700 tracking-tight"
        >
          Guessing Game
        </Link>
      </div>
      <div className="flex gap-4 items-center relative">
        {isAuthenticated ? (
          <>
            <Link
              to="/dashboard"
              className="text-gray-700 font-semibold hover:underline"
            >
              Dashboard
            </Link>
            <Link
              to="/lobby"
              className="text-green-700 font-semibold hover:underline"
            >
              ExploreGames
            </Link>
            <div className="relative" ref={dropdownRef}>
              <button
                className="ml-2 w-10 h-10 rounded-full bg-green-200 flex items-center justify-center font-bold text-green-700 text-lg shadow hover:bg-green-300 focus:outline-none"
                onClick={() => setDropdownOpen((open) => !open)}
                aria-label="Profile"
                type="button"
              >
                {profileLetter}
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-green-700 font-semibold hover:underline"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-amber-700 font-semibold hover:underline"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
