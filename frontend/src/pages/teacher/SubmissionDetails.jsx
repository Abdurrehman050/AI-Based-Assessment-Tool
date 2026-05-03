import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getSubmissionById,
  gradeSubmissionAI,
  gradeSubmissionManual,
} from "../../services/api";

export default function SubmissionDetails() {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false); // ✅ AI grading in progress
  const [saving, setSaving] = useState(false); // ✅ Manual grading in progress
  const [error, setError] = useState("");

  // Local state for manual grades
  const [manualGrades, setManualGrades] = useState({});

  // Fetch submission
  const fetchSubmission = async () => {
    try {
      const res = await getSubmissionById(submissionId);
      const sub = res.data.submission;
      setSubmission(sub);

      // Initialize manual grades from existing data
      const initialGrades = {};
      sub.shortAnswers.forEach((a) => {
        initialGrades[a.questionId] = {
          score: a.humanScore ?? a.aiScore ?? 0,
          feedback: a.humanFeedback ?? a.aiFeedback ?? "",
        };
      });
      setManualGrades(initialGrades);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load submission");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmission();
  }, [submissionId]);

  // Handle manual grade change
  const handleManualChange = (qId, field, value) => {
    setManualGrades((prev) => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        [field]: value,
      },
    }));
  };

  // Handle Manual save
  const handleSaveManual = async () => {
    try {
      setSaving(true);
      // Format data for backend: { shortAnswers: [{ questionId, score, feedback }] }
      const data = {
        shortAnswers: Object.entries(manualGrades).map(([qId, val]) => ({
          questionId: qId,
          score: Number(val.score),
          feedback: val.feedback,
        })),
      };

      const res = await gradeSubmissionManual(submissionId, data);
      setSubmission(res.data.submission);
      alert("Manual grading saved!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save manual grades");
    } finally {
      setSaving(false);
    }
  };

  // Handle AI grading
  const handleGradeAI = async () => {
    if (
      !window.confirm(
        "Are you sure you want to grade this submission using AI?",
      )
    )
      return;

    try {
      setGrading(true);
      const res = await gradeSubmissionAI(submissionId);
      const sub = res.data.submission;
      setSubmission(sub); 
      
      // ✅ Sync manual grades state with AI results
      const updatedGrades = {};
      sub.shortAnswers.forEach(a => {
        updatedGrades[a.questionId] = {
          score: a.humanScore ?? a.aiScore ?? 0,
          feedback: a.humanFeedback ?? a.aiFeedback ?? ""
        };
      });
      setManualGrades(updatedGrades);

      alert("AI grading completed!");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "AI grading failed");
    } finally {
      setGrading(false);
    }
  };

  if (loading)
    return <p className="p-6 text-center text-gray-500">Loading...</p>;
  if (error) return <p className="p-6 text-center text-red-600">{error}</p>;
  if (!submission) return null;

  const {
    candidate,
    exam,
    mcqAnswers = [],
    shortAnswers = [],
    warningLogs = [],
    totalViolations = 0,
    autoSubmitted = false,
  } = submission;

  // Compute MCQ scores
  const mcqScore = mcqAnswers.reduce((acc, a) => {
    const q = exam.questions.mcqs.find(
      (q) => String(q._id) === String(a.questionId),
    );
    return acc + (q && q.answer === a.selectedOption ? 1 : 0);
  }, 0);

  // Compute short scores (AI or human)
  const shortScore = shortAnswers.reduce(
    (acc, a) => acc + (a.humanScore ?? a.aiScore ?? 0),
    0,
  );

  const totalScore = mcqScore + shortScore;
  // Compute total marks
  const totalMarks =
    (exam.questions.mcqs?.length || 0) * 1 +
    (exam.questions.shortQuestions?.length || 0) * 2;

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Submission Details</h1>
        <br />

        <div className="flex gap-2">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-600 hover:underline"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Candidate Info */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <p className="text-xl text-primary">
          <b>Exam Name:</b> {exam.title}
        </p>
        <br />
        <p>
          <b>Name:</b> {candidate.username}
        </p>
        <p>
          <b>Email:</b> {candidate.email}
        </p>
        <p>
          <b>Submitted At:</b> {new Date(submission.createdAt).toLocaleString()}
        </p>
        <p>
          <b>Auto Submitted:</b> {autoSubmitted ? "Yes" : "No"}
        </p>
        <p>
          <b>Violations:</b> {totalViolations}
        </p>

        {/* ✅ Obtained marks / Total marks */}
        <p>
          <b>Marks:</b> {totalScore} /{" "}
          {(exam.questions.mcqs?.length || 0) +
            (exam.questions.shortQuestions?.length || 0) * 2}
        </p>

        {/* ✅ Percentage */}
        <p>
          <b>Percentage:</b>{" "}
          {totalMarks > 0 ? ((totalScore / totalMarks) * 100).toFixed(2) : 0}%
        </p>
      </div>

      {warningLogs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Security Logs</h2>
          {warningLogs.map((log, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow mb-3">
              <p>
                <b>Event:</b> {log.event || "violation"}
              </p>
              <p>
                <b>Message:</b> {log.message}
              </p>
              <p>
                <b>Time:</b>{" "}
                {log.occurredAt
                  ? new Date(log.occurredAt).toLocaleString()
                  : "-"}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* MCQ Answers */}
      {mcqAnswers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">MCQ Answers</h2>
          {mcqAnswers.map((a, i) => {
            const q = exam.questions.mcqs.find(
              (q) => String(q._id) === String(a.questionId),
            );
            const correct = q?.answer === a.selectedOption;
            return (
              <div key={i} className="bg-white p-4 rounded-lg shadow mb-3">
                <p className="font-medium">
                  {i + 1}. {q?.question || "Question not found"}
                </p>
                <p className="mt-1">
                  <b>Selected:</b> {a.selectedOption} {correct ? "✅" : "❌"}
                </p>
                <p className="mt-1">
                  <b>Correct Answer:</b> {q?.answer}
                </p>
                {correct && <p className="text-sm text-green-600">+1 point</p>}
                {!correct && <p className="text-sm text-red-600">0 points</p>}
              </div>
            );
          })}
        </div>
      )}

      {/* Short Answers */}
      {shortAnswers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Short Answers</h2>
          {shortAnswers.map((a, i) => {
            const q = exam.questions.shortQuestions.find(
              (q) => String(q._id) === String(a.questionId),
            );
            const mGrade = manualGrades[a.questionId] || {
              score: 0,
              feedback: "",
            };

            return (
              <div
                key={i}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-4 hover:shadow-md transition"
              >
                <p className="font-semibold text-lg text-gray-800">
                  {i + 1}. {q?.question || "Question not found"}
                </p>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Student's Answer
                    </p>
                    <p className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-line border border-gray-200">
                      {a.answerText || "No answer provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Model Answer
                    </p>
                    <p className="mt-1 p-3 bg-blue-50 rounded-lg text-blue-800 whitespace-pre-line border border-blue-100">
                      {q?.answer || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="w-full md:w-32">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                      Score (0-2)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="2"
                      step="0.5"
                      value={mGrade.score}
                      onChange={(e) =>
                        handleManualChange(
                          a.questionId,
                          "score",
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition outline-none"
                    />
                  </div>

                  <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                      Feedback
                    </label>
                    <input
                      type="text"
                      placeholder="Add specific feedback for this answer..."
                      value={mGrade.feedback}
                      onChange={(e) =>
                        handleManualChange(
                          a.questionId,
                          "feedback",
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    {(submission.checkedByAI || a.humanScore !== null) && (
                      <span
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${
                          (a.humanScore ?? a.aiScore ?? 0) > 0
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {(a.humanScore ?? a.aiScore ?? 0) > 0
                          ? "✅ Graded"
                          : "❌ Graded"}
                      </span>
                    )}
                  </div>
                </div>

                {/* AI info if available and not manually overridden yet in DB */}
                {!a.humanScore && a.aiScore !== undefined && (
                  <div className="mt-3 text-sm flex gap-4 text-gray-500 italic">
                    <p>AI Score: {a.aiScore}/2</p>
                    <p>AI Feedback: {a.aiFeedback || "None"}</p>
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex justify-end mt-4">
            <button
              onClick={handleSaveManual}
              disabled={saving}
              className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 transition disabled:opacity-50"
            >
              {saving ? "Saving Grades..." : "Save Manual Grades ✓"}
            </button>
          </div>
        </div>
      )}

      {/* AI Grade button, only if not yet AI graded */}
      {!submission.checkedByAI && (
        <div className="mt-10 p-6 bg-accent/5 border border-accent/20 rounded-2xl text-center">
          <button
            onClick={handleGradeAI}
            disabled={grading}
            className="px-8 py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 shadow-lg shadow-accent/20 transition disabled:opacity-50"
          >
            {grading ? "Grading..." : "Grade with AI"}
          </button>
        </div>
      )}
    </div>
  );
}
