import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSubmissionById } from "../../services/api";

export default function CandidateSubmissionDetails() {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const res = await getSubmissionById(submissionId);
        setSubmission(res.data.submission);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load submission");
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [submissionId]);

  if (loading) return <p className="p-6 text-center">Loading...</p>;
  if (error) return <p className="p-6 text-center text-red-600">{error}</p>;
  if (!submission) return null;

  const {
    exam,
    candidate,
    mcqAnswers = [],
    shortAnswers = [],
    checkedByAI,
  } = submission;

  /* =========================
     MARKS CALCULATION
  ========================== */

  const totalMcqs = exam.questions.mcqs.length;
  const totalShorts = exam.questions.shortQuestions.length;

  const totalMarks = totalMcqs * 1 + totalShorts * 2;

  const mcqScore = checkedByAI
    ? mcqAnswers.reduce((acc, a) => {
        const q = exam.questions.mcqs.find(
          (q) => String(q._id) === String(a.questionId),
        );
        return acc + (q && q.answer === a.selectedOption ? 1 : 0);
      }, 0)
    : 0;

  const shortScore = checkedByAI
    ? shortAnswers.reduce((acc, a) => acc + (a.humanScore ?? a.aiScore ?? 0), 0)
    : 0;

  const obtainedMarks = mcqScore + shortScore;

  const percentage = checkedByAI
    ? ((obtainedMarks / totalMarks) * 100).toFixed(2)
    : 0;

  const passed = percentage >= 33;

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Your Submission</h1>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-600 hover:underline"
        >
          ← Back
        </button>
      </div>

      {/* Candidate & Exam Info */}
      <div className="bg-white p-5 rounded-lg shadow mb-6">
        <div className="flex items-center justify-between">
          <p className="text-xl font-semibold">Exam Name: {exam.title}</p>

          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              checkedByAI
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {checkedByAI ? "Graded" : "Pending"}
          </span>
        </div>

        <p className="mt-2">
          <b>Candidate:</b> {candidate?.username}
        </p>
        <p className="mt-1">
          <b>Email:</b> {candidate?.email}
        </p>

        {!checkedByAI ? (
          <p className="mt-3 text-yellow-600 font-medium">
            ⏳ Your exam has been submitted successfully. Results are not
            published yet.
          </p>
        ) : (
          <p className="mt-3 text-green-600 font-medium">
            ✅ Your exam has been graded.
          </p>
        )}
      </div>

      {/* RESULT SUMMARY */}
      {checkedByAI && (
        <div className="bg-white p-5 rounded-lg shadow mb-6 ">
          <h2 className="text-xl font-semibold mb-4">Result Summary</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Obtained Marks</p>
              <p className="text-2xl font-bold text-primary">{obtainedMarks}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Total Marks</p>
              <p className="text-2xl font-bold">{totalMarks}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Percentage</p>
              <p className="text-2xl font-bold">{percentage}%</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Result</p>
              <p
                className={`text-2xl font-bold ${
                  passed ? "text-green-600" : "text-red-600"
                }`}
              >
                {passed ? "Pass ✅" : "Fail ❌"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MCQs */}
      {mcqAnswers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">MCQ Answers</h2>

          {mcqAnswers.map((a, i) => {
            const q = exam.questions.mcqs.find(
              (q) => String(q._id) === String(a.questionId),
            );

            return (
              <div key={i} className="bg-white p-4 rounded-lg shadow mb-3">
                <p className="font-medium">
                  {i + 1}. {q?.question}
                </p>

                <p className="mt-1">
                  <b>Your Answer:</b> {a.selectedOption}
                </p>

                {checkedByAI && (
                  <>
                    <p className="mt-1">
                      <b>Correct Answer:</b> {q?.answer}
                    </p>

                    <p className="text-sm">
                      {q?.answer === a.selectedOption
                        ? "✅ Correct"
                        : "❌ Incorrect"}
                    </p>

                    {a.aiFeedback && (
                      <p className="mt-1 text-gray-600">
                        <b>AI Feedback:</b> {a.aiFeedback}
                      </p>
                    )}
                  </>
                )}
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
                  {i + 1}. {q?.question}
                </p>

                <p className="mt-1 whitespace-pre-line">
                  <b>Your Answer:</b> {a.answerText || "No answer"}
                </p>

                {checkedByAI && (
                  <>
                    {a.aiAnswer && (
                      <p className="mt-2 text-blue-700 whitespace-pre-line">
                        <b>AI Suggested Answer:</b> {a.aiAnswer}
                      </p>
                    )}

                    <p className="mt-1">
                      <b>Score:</b> {a.humanScore ?? a.aiScore ?? 0}/2
                    </p>

                    <p className="text-sm">
                      {(a.humanScore ?? a.aiScore ?? 0) > 0
                        ? "✅ Correct"
                        : "❌ Incorrect"}
                    </p>

                    {a.humanFeedback && (
                      <p className="mt-1 text-gray-600">
                        <b>Feedback:</b> {a.humanFeedback}
                      </p>
                    )}

                    {!a.humanFeedback && a.aiFeedback && (
                      <p className="mt-1 text-gray-600">
                        <b>AI Feedback:</b> {a.aiFeedback}
                      </p>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
