import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UsersPanel from "./UserPanel";
import ExamsPanel from "./ExamsPanel";
import api from "../../services/api"; // for optional logout API

export default function AdminDashboard() {
  const [tab, setTab] = useState("users");
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Optional: call backend to clear cookies if needed
      await api.post("/api/v1/admin/logout"); // backend endpoint should clear cookie

      // Clear any localStorage/sessionStorage if you stored the token there
      localStorage.removeItem("adminToken");

      // Redirect to login page
      navigate("/admin/login");
    } catch (err) {
      console.error(err);
      alert("Failed to logout. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-6 flex flex-col">
        <h1 className="text-2xl font-bold text-gray-800 mb-10">
          Admin Panel
        </h1>

        <nav className="flex flex-col gap-3 flex-1">
          <button
            onClick={() => setTab("users")}
            className={`px-4 py-3 rounded-lg text-left font-medium transition ${
              tab === "users"
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            👤 Users Management
          </button>

          <button
            onClick={() => setTab("exams")}
            className={`px-4 py-3 rounded-lg text-left font-medium transition ${
              tab === "exams"
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            📝 Exams Management
          </button>
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-6 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>

        <div className="mt-auto pt-10 text-sm text-gray-400">
          AI Assessment System — Admin
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 bg-gray-100">
        <div className="bg-white shadow rounded-xl p-6 mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800 capitalize">
            {tab === "users" ? "Users Management" : "Exams Management"}
          </h2>

          <div className="text-sm text-gray-500">
            Logged in as <span className="font-medium text-gray-700">Administrator</span>
          </div>
        </div>

        <div className="bg-white shadow rounded-xl p-8">
          {tab === "users" && <UsersPanel />}
          {tab === "exams" && <ExamsPanel />}
        </div>
      </main>
    </div>
  );
}
