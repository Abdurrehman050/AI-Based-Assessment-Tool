import React, { useEffect, useState, useContext } from "react";
import { getExamReports, gradeExamAI, deleteExam } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { FiTrash2 } from "react-icons/fi";

export default function ManageExams() {
  const { user } = useContext(AuthContext);

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradingId, setGradingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  if (!user || user.role !== "teacher") {
    return (
      <div className="p-6 text-center text-red-500">
        You must be logged in as a teacher to access this page.
      </div>
    );
  }

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await getExamReports();
      setExams(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch exams.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickGrade = async (examId) => {
    setGradingId(examId);
    try {
      await gradeExamAI(examId);
      alert("All ungraded submissions have been graded by AI!");
      fetchExams();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to grade exam.");
    } finally {
      setGradingId(null);
    }
  };

  const handleDelete = async (examId) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;

    setDeletingId(examId);
    try {
      await deleteExam(examId);
      alert("Exam deleted successfully!");
      fetchExams();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete exam.");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8 text-primary">Manage Exams</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded shadow">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-500">Loading exams...</div>
      ) : exams.length === 0 ? (
        <div className="text-center text-gray-500">No exams found.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map(({ exam, stats }) => (
            <div
              key={exam._id}
              className="relative bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition"
            >
              {/* 🗑️ Delete icon */}
              <button
                onClick={() => handleDelete(exam._id)}
                disabled={deletingId === exam._id}
                className="absolute top-3 right-3 text-red-500 hover:text-red-700 disabled:opacity-50"
                title="Delete Exam"
              >
                <FiTrash2 size={20} />
              </button>

              <div className="mb-4">
                <h2 className="text-xl font-semibold text-primary mb-1">
                  {exam.title}
                </h2>
                <p className="text-sm font-mono text-gray-600">
                  Key: {exam.examKey}
                </p>
                <p className="text-sm text-gray-600">Difficulty: {exam.level}</p>
                <p className="text-sm text-gray-600">
                  MCQs: {exam.numMcqs || 0}, Shorts: {exam.numShorts || 0}
                </p>
                <p className="text-sm text-gray-600">
                  Submissions: {stats.submissionCount}, Graded: {stats.gradedCount}
                </p>
                <p className="text-sm text-gray-600">
                  Avg Score: {stats.avgScore?.toFixed(2) || 0}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleQuickGrade(exam._id)}
                  disabled={gradingId === exam._id}
                  className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:brightness-90 disabled:opacity-60"
                >
                  {gradingId === exam._id ? "Grading..." : "Quick Grade"}
                </button>

                <a
                  href={`/teacher/exams/${exam._id}/submissions`}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:brightness-90 text-center"
                >
                  View Submissions
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
