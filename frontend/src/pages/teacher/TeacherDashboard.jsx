import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";

// API call for preview
const previewExam = (examId) =>
  api.get(`/api/v1/teachers/exams/${examId}/preview`);

export default function TeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState([]);
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/teacher/login");
      return;
    }

    const fetchExams = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/v1/teachers/reports/exams");
        setExams(res.data.data || []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to fetch exams.");
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [authLoading, user, navigate]);

  const handlePreview = (exam) => {
    if (!exam._id) {
      console.error("Exam _id is missing", exam);
      return;
    }
    navigate(`/teacher/exams/${exam._id}/preview`);
  };

  if (authLoading || loading)
    return (
      <p className="text-center mt-20 text-lg text-gray-500">Loading...</p>
    );
  if (!user) return null;

  // Compute dashboard stats
  const totalExams = exams.length;
  const totalSubmissions = exams.reduce(
    (acc, e) => acc + (e.stats?.submissionCount || 0),
    0,
  );
  const gradedSubmissions = exams.reduce(
    (acc, e) => acc + (e.stats?.gradedCount || 0),
    0,
  );
  const avgScore =
    totalSubmissions > 0
      ? (
          exams.reduce(
            (acc, e) =>
              acc + (e.stats?.avgScore || 0) * (e.stats?.submissionCount || 0),
            0,
          ) / totalSubmissions
        ).toFixed(2)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6 md:px-12">
      {/* Profile Card */}
      <div className="bg-white shadow-md rounded-2xl p-8 mb-6 flex flex-col md:flex-row items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-2xl font-bold text-accent">
            {user.info.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {user.info.username}
            </h1>
            <p className="text-gray-500 mt-1">Email: {user.info.email}</p>
            <p className="text-gray-500 mt-1">
              Subject: {user.info.subject || "N/A"}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/teacher/exams")}
          className="px-6 py-3 rounded-full bg-accent text-white font-semibold hover:bg-accent/80 transition shadow-lg"
        >
          Manage Exams
        </button>
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">{error}</div>
      )}

      {/* Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center hover:shadow-xl transition">
          <h3 className="text-xl font-semibold text-gray-700">Total Exams</h3>
          <p className="text-3xl font-bold text-accent mt-2">{totalExams}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center hover:shadow-xl transition">
          <h3 className="text-xl font-semibold text-gray-700">
            Total Submissions
          </h3>
          <p className="text-3xl font-bold text-accent mt-2">
            {totalSubmissions}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center hover:shadow-xl transition">
          <h3 className="text-xl font-semibold text-gray-700">Average Score</h3>
          <p className="text-3xl font-bold text-accent mt-2">{avgScore}</p>
        </div>
      </div>

      {/* Exams Section */}
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">Your Exams</h2>
      {exams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams
            .filter((item) => item.exam && item.exam._id)
            .map(({ exam, stats }) => (
              <div
                key={exam._id}
                className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {exam.title}
                  </h3>
                  <p className="text-md text-gray-500 mt-1">
                    Exam Key: {exam.examKey}
                  </p>
                  <p className="text-md text-gray-500 mt-1">
                    Status: {exam.status}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Submissions: {stats?.submissionCount || 0} | Graded:{" "}
                    {stats?.gradedCount || 0}
                  </p>
                  <p className="text-sm text-green-600 mt-2">
                    Avg Score: {stats?.avgScore?.toFixed(2) || 0}
                  </p>
                </div>
                <div className="mt-4 flex gap-2 flex-wrap">
                  {/* Preview Exam */}
                  <button
                    onClick={() =>
                      navigate(`/teacher/exams/${exam._id}/preview`)
                    }
                    className="px-4 py-2 rounded-full bg-accent text-white font-medium hover:bg-primary transition flex-1"
                  >
                    Preview
                  </button>
                  {/* View Submissions */}
                  <button
                    onClick={() =>
                      navigate(`/teacher/exams/${exam._id}/submissions`)
                    }
                    className="px-4 py-2 rounded-full bg-primary text-white font-medium hover:bg-accent transition flex-1"
                  >
                    View Submissions
                  </button>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center mt-6">
          You have not created any exams yet.
        </p>
      )}
    </div>
  );
}
