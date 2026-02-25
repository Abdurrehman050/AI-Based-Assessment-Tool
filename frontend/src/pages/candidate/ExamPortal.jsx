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
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));

  const getQuestionKey = (questionOrId) => {
    if (!questionOrId) return "";
    if (typeof questionOrId === "string") return questionOrId;
    if (typeof questionOrId === "object" && questionOrId._id)
      return String(questionOrId._id);
    return String(questionOrId);
  };

  // Refs
  const timerRef = useRef(null);
  const autoSubmittedRef = useRef(false);
  const violationsRef = useRef(0);
  const warningLogsRef = useRef([]);

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

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

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

  useEffect(() => {
    const preventAction = (event, message) => {
      event.preventDefault();
      setWarning(message);
    };

    const handleCopy = (event) => preventAction(event, "Copy is disabled during the exam.");
    const handlePaste = (event) =>
      preventAction(event, "Paste is disabled during the exam.");
    const handleCut = (event) => preventAction(event, "Cut is disabled during the exam.");
    const handleContextMenu = (event) =>
      preventAction(event, "Right-click is disabled during the exam.");
    const handleKeydown = (event) => {
      const key = event.key?.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && ["c", "v", "x"].includes(key)) {
        preventAction(event, "Copy/Cut/Paste shortcuts are disabled during the exam.");
      }
    };

    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("cut", handleCut);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeydown);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, []);

  /* ================= SECURITY ================= */
  const handleViolation = (message) => {
    if (autoSubmittedRef.current) return;

    const log = {
      event: "violation",
      message: message || "Suspicious activity detected",
      occurredAt: new Date().toISOString(),
    };

    warningLogsRef.current = [...warningLogsRef.current, log];
    violationsRef.current += 1;
    const nextViolations = violationsRef.current;

    if (nextViolations >= 3) {
      submitExam(true);
      return;
    }

    setWarning(
      `Warning ${nextViolations}/3: You cannot switch tabs or leave the exam page.`,
    );
  };

  useExamSecurity(handleViolation);

  /* ================= ANSWERS ================= */
  const handleChange = (questionId, value) => {
    const key = getQuestionKey(questionId);
    if (!key) return;

    setAnswers((prev) => ({
      ...prev,
      [key]: value,
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
        const key = getQuestionKey(q);
        if (answers[key]) {
          mcqAnswers.push({
            questionId: q._id,
            selectedOption: answers[key],
          });
        }
      });

      exam.questions.shortQuestions.forEach((q) => {
        const key = getQuestionKey(q);
        if (answers[key]) {
          shortAnswers.push({ questionId: q._id, answerText: answers[key] });
        }
      });

      await api.post("/api/v1/candidates/submit-exam", {
        examId,
        mcqAnswers,
        shortAnswers,
        autoSubmitted: auto,
        violations: violationsRef.current,
        warningLogs: warningLogsRef.current,
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

  const enterFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setWarning("");
      }
    } catch (err) {
      console.error(err);
      setWarning("Fullscreen could not be enabled automatically. Please allow fullscreen.");
    }
  };

  useEffect(() => {
    if (loading || !exam) return;
    enterFullscreen();
  }, [loading, exam]);

  /* ================= NAVIGATION ================= */
  const totalQuestions =
    exam?.questions?.mcqs?.length + exam?.questions?.shortQuestions?.length ||
    0;
  const totalMcqs = exam?.questions?.mcqs?.length || 0;
  const totalShorts = exam?.questions?.shortQuestions?.length || 0;
  const totalMarks = totalMcqs * 1 + totalShorts * 2;

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
  const currentQuestionKey = getQuestionKey(question);
  const answeredCount = Object.values(answers).filter(
    (value) => String(value || "").trim() !== "",
  ).length;
  const remainingCount = Math.max(totalQuestions - answeredCount, 0);

  return (
    <div className="min-h-screen w-full overflow-x-hidden p-4 md:p-6 flex flex-col items-center bg-slate-100 box-border">
      {/* Timer & Warning */}
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-md p-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{exam.title}</h1>
            <p className="text-sm text-gray-600">
              Duration: {exam.duration} min | Questions: {totalQuestions} ({totalMcqs} MCQs,{" "}
              {totalShorts} Short) | Total Marks: {totalMarks}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-red-600 font-semibold text-xl">
              {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
              {String(timeLeft % 60).padStart(2, "0")}
            </div>
            {!isFullscreen && (
              <button
                onClick={enterFullscreen}
                className="px-3 py-2 bg-black text-white rounded hover:bg-black/80"
              >
                Enter Fullscreen
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-sm">
          <div className="bg-slate-50 rounded-lg p-3 border">
            <p className="font-semibold">Progress</p>
            <p>
              {answeredCount}/{totalQuestions} answered
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border">
            <p className="font-semibold">Remaining</p>
            <p>{remainingCount} questions left</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border">
            <p className="font-semibold">Exam Rules</p>
            <p>Tab switching, right-click, copy/paste are disabled.</p>
          </div>
        </div>
      </div>
      {warning && (
        <div className="bg-yellow-100 text-yellow-800 p-3 rounded mb-4 text-center w-full max-w-6xl">
          {warning}
        </div>
      )}

      {/* Question Card */}
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-6xl mb-4">
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
                  checked={answers[currentQuestionKey] === opt}
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
            value={answers[currentQuestionKey] || ""}
            onChange={(e) => handleChange(question._id, e.target.value)}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 mb-4">
        <button
          disabled={currentQ === 0}
          onClick={() => setCurrentQ((q) => q - 1)}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 disabled:opacity-50"
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
