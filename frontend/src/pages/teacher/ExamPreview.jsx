import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { Copy } from "lucide-react"; // Lucide copy icon

export default function ExamPreview() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approvedMessage, setApprovedMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "teacher") {
      navigate("/teacher/login");
      return;
    }

    const fetchExam = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/v1/teachers/exams/${examId}/preview`);
        setExam(res.data.exam);
        if (res.data.exam.status === "published") {
          setApprovedMessage(
            "This exam has already been approved and published.",
          );
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to fetch exam.");
        // navigate("/teacher/dashboard"); // optional: stay on page to show error
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [examId, user, navigate]);
  const handleCopyKey = () => {
    if (exam?.examKey) {
      navigator.clipboard.writeText(exam.examKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 sec
    }
  };

  const handleApprove = async () => {
    try {
      await api.patch(`/api/v1/teachers/exams/${examId}/approve`);
      setApprovedMessage("✅ Exam approved and published successfully!");
      setExam((prev) => ({ ...prev, status: "published" }));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to approve exam.");
    }
  };

  if (loading) return <p className="p-10 text-center">Loading...</p>;
  if (error) return <p className="p-10 text-center text-red-500">{error}</p>;
  if (!exam) return <p className="p-10 text-center">Exam not found.</p>;

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">{exam.title}</h1>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-600 hover:underline"
        >
          ← Back
        </button>
      </div>

      {/* Exam Key with Copy */}
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-2xl font-bold">
          Exam Key: <span className="text-accent">{exam.examKey}</span>
        </h2>
        <button
          onClick={handleCopyKey}
          className="p-2 rounded hover:bg-gray-100 transition"
        >
          <Copy size={20} />
        </button>
        {copied && (
          <span className="text-primary font-medium ml-2 animate-fade-up">
            Copied!
          </span>
        )}
      </div>

      {approvedMessage && (
        <p className="mb-4 text-green-600 font-medium">{approvedMessage}</p>
      )}

      {exam.questions?.mcqs?.map((q, i) => (
        <div key={i} className="mb-6 p-6 bg-white shadow rounded">
          <h3 className="font-semibold mb-2">
            {i + 1}. {q.question}
          </h3>
          {q.options?.map((op, idx) => (
            <p key={idx} className="ml-4">
              • {op}
            </p>
          ))}
          <p className="mt-3 text-green-600 font-medium">
            ✅ Answer: {q.answer}
          </p>
        </div>
      ))}

      {exam.questions?.shortQuestions?.map((q, i) => (
        <div key={`s-${i}`} className="mb-6 p-6 bg-white shadow rounded">
          <h3 className="font-semibold mb-2">
            {exam.questions.mcqs?.length + i + 1}. {q.question}
          </h3>
          <p className="mt-3 text-green-600 font-medium">
            ✅ Answer: {q.answer}
          </p>
        </div>
      ))}

      {exam.status !== "published" && (
        <button
          onClick={handleApprove}
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Approve & Publish
        </button>
      )}
    </div>
  );
}
