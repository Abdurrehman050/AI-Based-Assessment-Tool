import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSubmissionById, gradeSubmissionAI } from "../../services/api";

export default function SubmissionDetails() {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false); // ✅ AI grading in progress
  const [error, setError] = useState("");

  // Fetch submission
  const fetchSubmission = async () => {
    try {
      const res = await getSubmissionById(submissionId);
      setSubmission(res.data.submission);
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
      setSubmission(res.data.submission); // update with graded data
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
        <div>
          <h2 className="text-xl font-semibold mb-4">Short Answers</h2>
          {shortAnswers.map((a, i) => {
            const q = exam.questions.shortQuestions.find(
              (q) => String(q._id) === String(a.questionId),
            );
            return (
              <div key={i} className="bg-white p-4 rounded-lg shadow mb-3">
                <p className="font-medium">
                  {i + 1}. {q?.question || "Question not found"}
                </p>
                <p className="mt-1 whitespace-pre-line">
                  <b>Answer:</b> {a.answerText || "No answer"}
                </p>
                <p className="mt-1">
                  <b>Correct Answer:</b> {q?.answer || "Not provided"}
                </p>
                <p className="mt-1">
                  <b>Score:</b> {a.humanScore ?? a.aiScore ?? 0}/2{" "}
                  {(a.humanScore ?? a.aiScore ?? 0) > 0 ? "✅" : "❌"}
                </p>
                {a.humanFeedback && (
                  <p className="mt-1 text-gray-600">
                    <b>Human Feedback:</b> {a.humanFeedback}
                  </p>
                )}
                {!a.humanFeedback && a.aiFeedback && (
                  <p className="mt-1 text-gray-600">
                    <b>AI Feedback:</b> {a.aiFeedback}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
      {/* AI Grade button, only if not yet AI graded */}
      {!submission.checkedByAI && (
        <button
          onClick={handleGradeAI}
          disabled={grading}
          className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/80 disabled:opacity-50"
        >
          {grading ? "Grading..." : "Grade by AI"}
        </button>
      )}
    </div>
  );
}
