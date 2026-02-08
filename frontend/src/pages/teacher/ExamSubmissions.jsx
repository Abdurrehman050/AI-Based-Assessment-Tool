import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import {
  getExamSubmissions,
  gradeSubmissionAI,
  gradeSubmissionManual,
} from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
export default function ExamSubmissions() {
  const { user } = useContext(AuthContext);
  const { examId } = useParams();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
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
      setSubmissions(res.data.submissions);
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
