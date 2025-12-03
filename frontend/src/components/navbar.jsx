import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const registerRef = useRef();
  const loginRef = useRef();

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (registerRef.current && !registerRef.current.contains(event.target)) {
        setRegisterOpen(false);
      }
      if (loginRef.current && !loginRef.current.contains(event.target)) {
        setLoginOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu and dropdowns on link click
  const handleLinkClick = () => {
    setMobileOpen(false);
    setRegisterOpen(false);
    setLoginOpen(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" onClick={handleLinkClick} className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white font-bold text-lg">
            AI
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-primary">AI Assessment Tool</h1>
            <span className="text-xs text-gray-500">FYP — BSc Computer Science</span>
          </div>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-4">
          {/* Register Dropdown */}
          <div className="relative" ref={registerRef}>
            <button
              onClick={() => setRegisterOpen(!registerOpen)}
              className="px-5 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition"
            >
              Register
            </button>
            {registerOpen && (
              <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg overflow-hidden">
                <Link
                  to="/candidate/register"
                  onClick={handleLinkClick}
                  className="block px-4 py-2 text-primary hover:bg-soft transition"
                >
                  Candidate
                </Link>
                <Link
                  to="/teacher/register"
                  onClick={handleLinkClick}
                  className="block px-4 py-2 text-primary hover:bg-soft transition"
                >
                  Teacher
                </Link>
              </div>
            )}
          </div>

          {/* Login Dropdown */}
          <div className="relative" ref={loginRef}>
            <button
              onClick={() => setLoginOpen(!loginOpen)}
              className="px-5 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition"
            >
              Login
            </button>
            {loginOpen && (
              <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg overflow-hidden">
                <Link
                  to="/candidate/login"
                  onClick={handleLinkClick}
                  className="block px-4 py-2 text-primary hover:bg-soft transition"
                >
                  Candidate
                </Link>
                <Link
                  to="/teacher/login"
                  onClick={handleLinkClick}
                  className="block px-4 py-2 text-primary hover:bg-soft transition"
                >
                  Teacher
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-primary focus:outline-none"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <nav className="md:hidden bg-white shadow-md">
          <div className="flex flex-col gap-1 px-4 py-2">
            {/* Register */}
            <div className="relative" ref={registerRef}>
              <button
                onClick={() => setRegisterOpen(!registerOpen)}
                className="w-full text-left px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition"
              >
                Register
              </button>
              {registerOpen && (
                <div className="flex flex-col mt-1 bg-white rounded-lg overflow-hidden shadow-sm">
                  <Link
                    to="/candidate/register"
                    onClick={handleLinkClick}
                    className="px-4 py-2 text-primary hover:bg-soft transition"
                  >
                    Candidate
                  </Link>
                  <Link
                    to="/teacher/register"
                    onClick={handleLinkClick}
                    className="px-4 py-2 text-primary hover:bg-soft transition"
                  >
                    Teacher
                  </Link>
                </div>
              )}
            </div>

            {/* Login */}
            <div className="relative" ref={loginRef}>
              <button
                onClick={() => setLoginOpen(!loginOpen)}
                className="w-full text-left px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition"
              >
                Login
              </button>
              {loginOpen && (
                <div className="flex flex-col mt-1 bg-white rounded-lg overflow-hidden shadow-sm">
                  <Link
                    to="/candidate/login"
                    onClick={handleLinkClick}
                    className="px-4 py-2 text-primary hover:bg-soft transition"
                  >
                    Candidate
                  </Link>
                  <Link
                    to="/teacher/login"
                    onClick={handleLinkClick}
                    className="px-4 py-2 text-primary hover:bg-soft transition"
                  >
                    Teacher
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
