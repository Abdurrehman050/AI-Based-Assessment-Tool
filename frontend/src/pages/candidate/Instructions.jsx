import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function Instructions() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await api.get(`/api/v1/candidates/exams/${examId}`);
        setExam(res.data.exam);
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || "Failed to load exam instructions");
        navigate("/candidate/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId, navigate]);

  if (loading) return <p className="text-center mt-20 text-gray-500">Loading instructions...</p>;
  if (!exam) return <p className="text-center mt-20 text-red-500">Exam not found.</p>;

  // Example instructions
  const instructions = [
    `You have ${exam.duration || 60} minutes to complete this exam.`,
    "Once started, the timer cannot be paused.",
    "Do not refresh the page or navigate away during the exam.",
    "MCQs will be auto-graded, short answers will be graded manually.",
    "Read each question carefully before answering.",
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{exam.title}</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-6">Instructions</h2>

        <ul className="list-disc list-inside space-y-2 mb-6">
          {instructions.map((inst, idx) => (
            <li key={idx} className="text-gray-600">{inst}</li>
          ))}
        </ul>

        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate("/candidate/dashboard")}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
          >
            Cancel
          </button>

          <button
            onClick={() => navigate(`/candidate/exam/${exam._id}`)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Start Exam
          </button>
        </div>
      </div>
    </div>
  );
}
