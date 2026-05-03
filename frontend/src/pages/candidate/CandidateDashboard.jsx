import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";

export default function CandidateDashboard() {
  const { user, setUser, loading: authLoading } = useContext(AuthContext);
  const [attemptedExams, setAttemptedExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch candidate profile from backend
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/candidates/profile");
      setUser({ role: "candidate", info: res.data.user });
      setAttemptedExams(res.data.user.attemptedExams || []);
    } catch (err) {
      console.error(err);
      navigate("/candidate/login");
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and whenever page is navigated to
  useEffect(() => {
    fetchProfile();

    // Optional: auto-refresh every 30 seconds
    const interval = setInterval(fetchProfile, 30000);
    return () => clearInterval(interval);
  }, []);

  if (authLoading || loading) {
    return (
      <p className="text-center mt-20 text-lg text-gray-500">Loading...</p>
    );
  }

  if (!user) return null;

  // Compute statistics
  const totalExams = attemptedExams.length;
  const averageScore =
    totalExams > 0
      ? (
          attemptedExams.reduce((acc, sub) => acc + (sub.score || 0), 0) /
          totalExams
        ).toFixed(2)
      : 0;
  const lastExam = attemptedExams?.[0]?.exam?.title || "N/A";

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 md:px-12">
      {/* Profile Card */}
      <div className="bg-white shadow-md rounded-2xl p-8 mb-6 flex flex-col md:flex-row items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-accent">
            {user.info.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {user.info.username}
            </h1>
            <p className="text-gray-500 mt-1">Email: {user.info.email}</p>
            <p className="text-gray-500 mt-1">
              Institution: {user.info.institution || "N/A"}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/candidate/enter-exam")}
          className="px-6 py-3 rounded-full bg-accent text-white font-semibold hover:bg-accent/80 transition shadow-lg"
        >
          Enter Exam Key
        </button>
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center hover:shadow-xl transition">
          <h3 className="text-xl font-semibold text-gray-700">Total Exams</h3>
          <p className="text-3xl font-bold text-accent mt-2">{totalExams}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center hover:shadow-xl transition">
          <h3 className="text-xl font-semibold text-gray-700">Average Score</h3>
          <p className="text-3xl font-bold text-accent mt-2">{averageScore}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center hover:shadow-xl transition">
          <h3 className="text-xl font-semibold text-gray-700">Last Exam</h3>
          <p className="text-3xl font-bold text-accent mt-2">{lastExam}</p>
        </div>
      </div>

      {/* Exams Section */}
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">
        Attempted Exams
      </h2>
      {attemptedExams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attemptedExams.map((sub) => (
            <div
              key={sub._id}
              className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition cursor-pointer flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {sub.exam?.title || "Untitled Exam"}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Exam Key: {sub.exam?.examKey || "-"}
                </p>
                {sub.score !== undefined && (
                  <p className="text-sm text-green-600 mt-2 font-medium">
                    Score: {sub.score}
                  </p>
                )}
              </div>
              <button
                onClick={() => navigate(`/candidate/submission/${sub._id}`)}
                className="mt-5 px-10 py-2 rounded-full bg-accent text-white font-medium hover:bg-accent/80 transition self-start"
              >
                View
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center mt-6">
          You have not attempted any exams yet.
        </p>
      )}
    </div>
  );
}
