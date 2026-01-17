import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";

export default function ExamPreview() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approvedMessage, setApprovedMessage] = useState("");

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
          setApprovedMessage("This exam has already been approved and published.");
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
      <h1 className="text-3xl font-bold mb-6">{exam.title}</h1>

      {approvedMessage && (
        <p className="mb-4 text-green-600 font-medium">{approvedMessage}</p>
      )}

      {exam.questions?.mcqs?.map((q, i) => (
        <div key={i} className="mb-6 p-6 bg-white shadow rounded">
          <h3 className="font-semibold mb-2">
            {i + 1}. {q.question}
          </h3>
          {q.options?.map((op, idx) => (
            <p key={idx} className="ml-4">• {op}</p>
          ))}
          <p className="mt-3 text-green-600 font-medium">✅ Answer: {q.answer}</p>
        </div>
      ))}

      {exam.questions?.shortQuestions?.map((q, i) => (
        <div key={`s-${i}`} className="mb-6 p-6 bg-white shadow rounded">
          <h3 className="font-semibold mb-2">
            {exam.questions.mcqs?.length + i + 1}. {q.question}
          </h3>
          <p className="mt-3 text-green-600 font-medium">✅ Answer: {q.answer}</p>
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
