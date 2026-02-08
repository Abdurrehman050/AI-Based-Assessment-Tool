import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../assets/logo 2.png";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [avatarMenu, setAvatarMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate(user?.role === "teacher" ? "/teacher/login" : "/candidate/login");
  };

  useEffect(() => {
    if (!user) {
      setIsOpen(false);
      setAvatarMenu(false);
    }
  }, [user]);

  return (
    <nav className="fixed w-full z-50 bg-soft/95 backdrop-blur-md shadow-md font-sans">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-90 transition"
        >
          <div className="h-10 w-10 flex items-center justify-center ">
            <img
              src={logo}
              alt="AI Assessment Logo"
              className="h-full w-full object-contain scale-150"
            />
          </div>

          <span className="ml-5 text-2xl md:text-3xl font-extrabold text-primary leading-none hover:text-accent">
            AI Assessment
          </span>
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-4 items-center">
          {!user && (
            <>
              <li>
                <Link
                  to="/candidate/login"
                  className="px-5 py-2 rounded-lg bg-accent text-white font-medium shadow hover:brightness-90 transition"
                >
                  Candidate Login
                </Link>
              </li>
              <li>
                <Link
                  to="/teacher/login"
                  className="px-5 py-2 rounded-lg bg-primary text-white font-medium shadow hover:bg-primary/90 transition"
                >
                  Teacher Login
                </Link>
              </li>
            </>
          )}

          {user?.role === "candidate" && (
            <>
              <li>
                <Link
                  to="/candidate/dashboard"
                  className="px-4 py-2 rounded-lg text-primary font-medium hover:bg-primary/10 transition"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/candidate/exams"
                  className="px-4 py-2 rounded-lg text-primary font-medium hover:bg-primary/10 transition"
                >
                  Enter Exam
                </Link>
              </li>
              <li>
                <Link
                  to="/candidate/submissions"
                  className="px-4 py-2 rounded-lg text-primary font-medium hover:bg-primary/10 transition"
                >
                  Submissions
                </Link>
              </li>
              {/* Avatar */}
              <li className="relative">
                <button
                  onClick={() => setAvatarMenu(!avatarMenu)}
                  className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold shadow hover:brightness-90 transition"
                >
                  {user.info.username.charAt(0).toUpperCase()}
                </button>
                {avatarMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-2 text-gray-700">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 hover:bg-red-500 hover:text-white transition rounded"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </li>
            </>
          )}

          {user?.role === "teacher" && (
            <>
              <li>
                <Link
                  to="/teacher/dashboard"
                  className="px-4 py-2 rounded-lg text-primary font-medium hover:bg-primary/10 transition"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  onClick={() => setIsOpen(false)}
                  to="/teacher/create-exam"
                  className="block px-3 py-2 rounded-lg text-primary font-medium hover:bg-primary/10 transition"
                >
                  Create Exams
                </Link>
              </li>
              <li>
                <Link
                  onClick={() => setIsOpen(false)}
                  to="/teacher/reports"
                  className="block px-3 py-2 rounded-lg text-primary font-medium hover:bg-primary/10 transition"
                >
                  Rports
                </Link>
              </li>
              {/* Avatar */}
              <li className="relative">
                <button
                  onClick={() => setAvatarMenu(!avatarMenu)}
                  className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-bold shadow hover:brightness-90 transition"
                >
                  {user.info.username.charAt(0).toUpperCase()}
                </button>
                {avatarMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-2 text-gray-700">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 hover:bg-red-500 hover:text-white transition rounded"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </li>
            </>
          )}
        </ul>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="focus:outline-none"
          >
            <svg
              className="w-7 h-7 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <ul className="md:hidden bg-soft/95 backdrop-blur-md px-6 py-4 space-y-3 shadow-lg animate-slide-down">
          {!user && (
            <>
              <li>
                <Link
                  to="/candidate/login"
                  className="block px-4 py-2 rounded-lg bg-accent text-white font-medium shadow hover:brightness-90 transition"
                >
                  Candidate Login
                </Link>
              </li>
              <li>
                <Link
                  to="/teacher/login"
                  className="block px-4 py-2 rounded-lg bg-primary text-white font-medium shadow hover:bg-primary/90 transition"
                >
                  Teacher Login
                </Link>
              </li>
            </>
          )}

          {user?.role === "candidate" && (
            <>
              <li>
                <Link
                  onClick={() => setIsOpen(false)}
                  to="/candidate/dashboard"
                  className="block px-3 py-2 rounded-lg text-primary font-medium hover:bg-primary/10 transition"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  onClick={() => setIsOpen(false)}
                  to="/candidate/exams"
                  className="block px-3 py-2 rounded-lg text-primary font-medium hover:bg-primary/10 transition"
                >
                  Exams
                </Link>
              </li>
              <li>
                <Link
                  onClick={() => setIsOpen(false)}
                  to="/candidate/submissions"
                  className="block px-3 py-2 rounded-lg text-primary font-medium hover:bg-primary/10 transition"
                >
                  Submissions
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="w-full text-center px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </li>
            </>
          )}

          {user?.role === "teacher" && (
            <>
              <li>
                <Link
                  onClick={() => setIsOpen(false)}
                  to="/teacher/dashboard"
                  className="block px-3 py-2 rounded-lg text-primary font-medium hover:bg-primary/10 transition"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  onClick={() => setIsOpen(false)}
                  to="/teacher/createexams"
                  className="block px-3 py-2 rounded-lg text-primary font-medium hover:bg-primary/10 transition"
                >
                  Create Exams
                </Link>
              </li>
              <li>
                <Link
                  onClick={() => setIsOpen(false)}
                  to="/teacher/viewsubissions"
                  className="block px-3 py-2 rounded-lg text-primary font-medium hover:bg-primary/10 transition"
                >
                  View Submissions
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="w-full text-center px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      )}
    </nav>
  );
}
