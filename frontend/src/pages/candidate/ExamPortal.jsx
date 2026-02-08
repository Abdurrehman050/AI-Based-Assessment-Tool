import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import useExamSecurity from "./useExamSecurity";

export default function ExamPortal() {
  const { examId } = useParams();
  const navigate = useNavigate();

  // State
  const [exam, setExam] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState("");
  const [violations, setViolations] = useState(0);

  // Refs
  const timerRef = useRef(null);
  const autoSubmittedRef = useRef(false);

  /* ================= LOAD EXAM ================= */
  useEffect(() => {
    const loadExam = async () => {
      try {
        const res = await api.get(`/api/v1/candidates/exam/${examId}`);
        const examData = res.data.exam;
        setExam(examData);
        setTimeLeft(examData.duration * 60); // in seconds
      } catch (err) {
        console.error(err);
        setWarning("Failed to load exam.");
      } finally {
        setLoading(false);
      }
    };
    loadExam();
  }, [examId]);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (loading || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          submitExam(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loading, timeLeft]);

  /* ================= SECURITY ================= */
  const handleViolation = () => {
    if (autoSubmittedRef.current) return;

    setViolations((v) => {
      const newV = v + 1;
      if (newV === 3) {
        submitExam(true);
      } else {
        setWarning(
          `Warning ${newV}/3: You cannot switch tabs or leave the exam page.`,
        );
      }
      return newV;
    });
  };

  useExamSecurity(handleViolation);

  /* ================= ANSWERS ================= */
  const handleChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  /* ================= SUBMIT ================= */
  const submitExam = async (auto = false) => {
    if (autoSubmittedRef.current) return; // prevent double submit
    autoSubmittedRef.current = true;

    try {
      const mcqAnswers = [];
      const shortAnswers = [];

      exam.questions.mcqs.forEach((q) => {
        if (answers[q._id]) {
          mcqAnswers.push({
            questionId: q._id,
            selectedOption: answers[q._id],
          });
        }
      });

      exam.questions.shortQuestions.forEach((q) => {
        if (answers[q._id]) {
          shortAnswers.push({ questionId: q._id, answerText: answers[q._id] });
        }
      });

      await api.post("/api/v1/candidates/submit-exam", {
        examId,
        mcqAnswers,
        shortAnswers,
        autoSubmitted: auto,
        violations,
      });

      setWarning(
        auto
          ? "You have exceeded the allowed violations. Exam submitted automatically. Redirecting to dashboard..."
          : "Exam submitted successfully. Redirecting to dashboard...",
      );

      setTimeout(() => {
        navigate("/candidate/dashboard");
      }, 4000);
    } catch (err) {
      console.error(err);
      setWarning("Submission failed. Please contact support.");
    }
  };

  /* ================= NAVIGATION ================= */
  const totalQuestions =
    exam?.questions?.mcqs?.length + exam?.questions?.shortQuestions?.length ||
    0;

  const currentQuestion = () => {
    const allQuestions = [
      ...(exam?.questions?.mcqs || []),
      ...(exam?.questions?.shortQuestions || []),
    ];
    return allQuestions[currentQ];
  };

  /* ================= UI ================= */
  if (loading) return <p className="p-6 text-center">Loading exam…</p>;
  if (!exam)
    return <p className="p-6 text-center text-red-600">Exam not found.</p>;

  const question = currentQuestion();
  const isMCQ = currentQ < (exam.questions.mcqs?.length || 0);

  return (
    <div className="min-h-screen  p-6 flex flex-col items-center">
      {/* Timer & Warning */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">{exam.title}</h1>
        <div className="text-red-600 font-semibold text-lg">
          {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
          {String(timeLeft % 60).padStart(2, "0")}
        </div>
      </div>
      {warning && (
        <div className="bg-yellow-100 text-yellow-800 p-3 rounded mb-4 text-center w-full max-w-4xl">
          {warning}
        </div>
      )}

      {/* Question Card */}
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-4xl mb-4">
        <p className="font-medium mb-4">
          {currentQ + 1}. {question?.question || "Question not found"}
        </p>

        {isMCQ ? (
          <div className="flex flex-col space-y-2">
            {question.options.map((opt, i) => (
              <label key={i} className="flex items-center">
                <input
                  type="radio"
                  name={question._id}
                  checked={answers[question._id] === opt}
                  onChange={() => handleChange(question._id, opt)}
                />
                <span className="ml-2">{opt}</span>
              </label>
            ))}
          </div>
        ) : (
          <textarea
            rows={5}
            className="w-full border rounded p-2"
            value={answers[question._id] || ""}
            onChange={(e) => handleChange(question._id, e.target.value)}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 mb-4">
        <button
          disabled={currentQ === 0}
          onClick={() => setCurrentQ((q) => q - 1)}
          className="px-4 py-2 bg-primary rounded hover:bg-primary/80 disabled:opacity-50"
        >
          Previous
        </button>
        {currentQ < totalQuestions - 1 ? (
          <button
            onClick={() => setCurrentQ((q) => q + 1)}
            className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/80"
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => submitExam(false)}
            className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/80"
          >
            Submit Exam
          </button>
        )}
      </div>
    </div>
  );
}
