import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import {
  getExamSubmissions,
  gradeSubmissionAI,
} from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
export default function ExamSubmissions() {
  const { user } = useContext(AuthContext);
  const { examId } = useParams();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [examInfo, setExamInfo] = useState(null);
  const [stats, setStats] = useState({
    attemptedCount: 0,
    gradedCount: 0,
    averageScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [gradingId, setGradingId] = useState(null);
  const [error, setError] = useState("");

  if (!user || user.role !== "teacher") {
    return (
      <div className="p-6 text-center text-red-500">
        You must be logged in as a teacher to view this page.
      </div>
    );
  }

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await getExamSubmissions(examId);
      setSubmissions(res.data.submissions || []);
      setExamInfo(res.data.exam || null);
      setStats(
        res.data.stats || {
          attemptedCount: 0,
          gradedCount: 0,
          averageScore: 0,
        },
      );
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch submissions.");
    } finally {
      setLoading(false);
    }
  };

  const handleGradeAI = async (submissionId) => {
    setGradingId(submissionId);
    try {
      await gradeSubmissionAI(submissionId);
      alert("Submission graded by AI!");
      fetchSubmissions();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to grade submission.");
    } finally {
      setGradingId(null);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [examId]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-primary">Exam Submissions</h1>

      {examInfo && (
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{examInfo.title}</h2>
              <p className="text-sm text-gray-600 mt-1">
                Key: {examInfo.examKey} | Level: {examInfo.level} | Duration:{" "}
                {examInfo.duration} min
              </p>
              <p className="text-sm text-gray-600">
                Questions: {examInfo.numMcqs} MCQs, {examInfo.numShorts} Short | Total Marks:{" "}
                {examInfo.totalMarks}
              </p>
            </div>
            <div className="text-sm text-gray-700">
              <p>
                Status:{" "}
                <span className="font-medium">
                  {examInfo.isActive ? "Active" : "Inactive"} ({examInfo.status})
                </span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <div className="rounded-md bg-primary/5 border border-primary/20 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Total Attempted
              </p>
              <p className="text-2xl font-bold text-gray-800">{stats.attemptedCount}</p>
            </div>
            <div className="rounded-md bg-primary/5 border border-primary/20 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Total Graded</p>
              <p className="text-2xl font-bold text-gray-800">{stats.gradedCount}</p>
            </div>
            <div className="rounded-md bg-primary/5 border border-primary/20 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Average Score (Overall)
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {(stats.averageScore || 0).toFixed(2)} / {examInfo.totalMarks}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">{error}</div>
      )}

      {loading ? (
        <div className="text-center text-gray-500">Loading submissions...</div>
      ) : submissions.length === 0 ? (
        <div className="text-center text-gray-500">No submissions found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border border-gray-200 rounded-lg">
            <thead className="bg-primary/10 text-left">
              <tr>
                <th className="px-4 py-2">Candidate</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Score</th>
                <th className="px-4 py-2">Graded</th>
                <th className="px-4 py-2">AI Checked</th>
                <th className="px-4 py-2">Violations</th>
                <th className="px-4 py-2">Submitted At</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr
                  key={s._id}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-4 py-2">{s.candidate?.username}</td>
                  <td className="px-4 py-2">{s.candidate?.email}</td>
                  <td className="px-4 py-2">{s.score ?? 0}</td>
                  <td className="px-4 py-2">{s.isGraded ? "Yes" : "No"}</td>
                  <td className="px-4 py-2">{s.checkedByAI ? "Yes" : "No"}</td>
                  <td className="px-4 py-2">{s.totalViolations ?? 0}</td>
                  <td className="px-4 py-2">
                    {new Date(s.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleGradeAI(s._id)}
                      disabled={gradingId === s._id || s.isGraded}
                      className="px-3 py-1 bg-accent text-white rounded hover:brightness-90 transition"
                    >
                      {gradingId === s._id
                        ? "Grading..."
                        : s.isGraded
                          ? "Graded"
                          : "AI Grade"}
                    </button>
                    <button
                      onClick={() => navigate(`/teacher/submissions/${s._id}`)}
                      className="px-3 py-1 bg-primary text-white rounded"
                    >
                      View
                    </button>
                    {/* Optional: manual grading modal */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
