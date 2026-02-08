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
        const res = await api.get(
          `/api/v1/candidates/exam/${examId}/instructions`,
        );
        if (exam) {
          console.log("EXAM OBJECT 👉", exam);
        }
        setExam(res.data.exam);
      } catch (err) {
        console.error(err);
        alert(
          err.response?.data?.message || "Failed to load exam instructions",
        );
        navigate("/candidate/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId, navigate]);

  if (loading)
    return (
      <p className="text-center mt-20 text-gray-500">Loading instructions...</p>
    );
  if (!exam)
    return <p className="text-center mt-20 text-red-500">Exam not found.</p>;

  const mcqCount = exam.numMcqs;
  const shortCount = exam.numShorts;
  const totalMarks = mcqCount + shortCount * 2;

  // ✅ THEN use them
  const instructions = [
    `You have ${exam.duration || 60} minutes to complete this exam.`,
    `Total marks: ${totalMarks} (${mcqCount} MCQs × 1, ${shortCount} Short × 2).`,
    "Once started, the timer cannot be paused.",
    "Do not refresh the page or navigate away during the exam.",
    "MCQs are auto-graded, short answers will be graded manually.",
    "Maintain academic integrity. Any violation may result in disqualification.",
  ];

  return (
    <div className=" flex items-center justify-center ">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-3xl w-full  border-accent">
        {/* Exam Header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{exam.title}</h1>
        <p className="text-gray-500 mb-6">
          Duration: <b>{exam.duration || 60} minutes</b> | MCQs:{" "}
          <b>{mcqCount}</b> | Short Questions: <b>{shortCount}</b> | Total
          Marks: <b className="text-accent">{totalMarks}</b>
        </p>

        {/* Instructions */}
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Instructions
        </h2>
        <ul className="list-decimal list-inside space-y-2 mb-6 text-gray-600">
          {instructions.map((inst, idx) => (
            <li
              key={idx}
              className={
                inst.includes("violation") ? "text-red-600 font-semibold" : ""
              }
            >
              {inst}
            </li>
          ))}
        </ul>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => navigate("/candidate/dashboard")}
            className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-medium"
          >
            Cancel
          </button>

          <button
            onClick={() => navigate(`/candidate/exam/${examId}/start`)}
            className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition font-medium"
          >
            Start Exam
          </button>
        </div>
      </div>
    </div>
  );
}
