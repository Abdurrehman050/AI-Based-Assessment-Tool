import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Project Info */}
          <div>
            <h3 className="text-xl font-bold text-primary">
              AI Assessment Tool
            </h3>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              An intelligent examination platform that automates assessment,
              enhances academic integrity, and delivers real-time evaluation
              using AI-powered technologies.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-gray-600 dark:text-gray-400 hover:text-accent transition"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-600 dark:text-gray-400 hover:text-accent transition"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/candidate/login"
                  className="text-gray-600 dark:text-gray-400 hover:text-accent transition"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-600 dark:text-gray-400 hover:text-accent transition"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic / Legal */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Academic
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-600 dark:text-gray-400">
                Final Year Project (FYP)
              </li>
              <li className="text-gray-600 dark:text-gray-400">
                Department of Computer Science
              </li>
              <li className="text-gray-600 dark:text-gray-400">
                © {new Date().getFullYear()} All Rights Reserved
              </li>
            </ul>
          </div>
        </div>
        {/* Bottom Bar
        <div className="mt-10 pt-6 border-t dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400">
          Designed & Developed by{" "}
          <span className="font-medium text-primary">Your Name</span>
        </div> */}
      </div>
    </footer>
  );
}
