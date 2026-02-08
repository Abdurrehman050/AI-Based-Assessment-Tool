import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function EnterExam() {
  const [examKey, setExamKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!examKey.trim()) return setError("Exam key is required");

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/api/v1/candidates/enter-exam", {
        examKey,
      });

      // backend returns examId
      navigate(`/candidate/exam/${res.data.examId}/instructions`);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired exam key");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-4">
          Enter Exam Key
        </h1>

        <p className="text-gray-500 text-center mb-6">
          Enter the exam key provided by your teacher
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={examKey}
            onChange={(e) => setExamKey(e.target.value)}
            placeholder="e.g. EXAM-"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-accent outline-none text-lg tracking-wider uppercase"
          />

          <button
            disabled={loading}
            className="w-full mt-6 bg-accent hover:bg-accent/80 text-white py-3 rounded-lg font-semibold transition"
          >
            {loading ? "Verifying..." : "Start Exam"}
          </button>
        </form>

        <button
          onClick={() => navigate("/candidate/dashboard")}
          className="w-full mt-4 text-sm text-gray-500 hover:underline"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
