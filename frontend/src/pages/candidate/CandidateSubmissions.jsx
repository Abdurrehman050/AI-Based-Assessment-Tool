import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCandidateSubmissions } from "../../services/api";

export default function CandidateSubmissions() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await getCandidateSubmissions();
        setSubmissions(res.data.submissions || []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load submissions");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  if (loading)
    return <p className="p-6 text-center text-gray-500">Loading...</p>;

  if (error) return <p className="p-6 text-center text-red-600">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-primary mb-6">
        My Exam Submissions
      </h1>

      {submissions.length === 0 ? (
        <p className="text-gray-500">You have not attempted any exams yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {submissions.map((sub) => {
            const {
              exam,
              checkedByAI,
              createdAt,
              mcqAnswers = [],
              shortAnswers = [],
            } = sub;

            let obtainedMarks = 0;
            let totalMarks = 0;
            let percentage = 0;

            if (checkedByAI && exam?.questions) {
              const mcqs = exam?.questions?.mcqs || [];
              const shorts = exam?.questions?.shortQuestions || [];
              totalMarks = mcqs.length * 1 + shorts.length * 2;

              const mcqScore = mcqAnswers.reduce((acc, a) => {
                const q = mcqs.find(
                  (q) => String(q._id) === String(a.questionId),
                );
                return acc + (q && q.answer === a.selectedOption ? 1 : 0);
              }, 0);

              const shortScore = shortAnswers.reduce(
                (acc, a) => acc + (a.humanScore ?? a.aiScore ?? 0),
                0,
              );

              obtainedMarks = mcqScore + shortScore;
              percentage = ((obtainedMarks / totalMarks) * 100).toFixed(2);
            }

            return (
              <div
                key={sub._id}
                className="bg-white p-5 rounded-xl shadow flex flex-col"
              >
                <div className="flex justify-between items-start">
                  <h2 className="text-lg font-semibold">{exam?.title}</h2>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      checkedByAI
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {checkedByAI ? "Graded" : "Pending"}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mt-2">
                  Submitted on {new Date(createdAt).toLocaleString()}
                </p>

                {checkedByAI ? (
                  <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Marks</p>
                      <p className="font-semibold">
                        {obtainedMarks}/{totalMarks}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Percentage</p>
                      <p className="font-semibold">{percentage}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Result</p>
                      <p
                        className={`font-semibold ${percentage >= 33 ? "text-green-600" : "text-red-600"}`}
                      >
                        {percentage >= 33 ? "Pass ✅" : "Fail ❌"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-yellow-600">
                    ⏳ Results not published yet
                  </p>
                )}

                <button
                  onClick={() => navigate(`/candidate/submission/${sub._id}`)}
                  className="mt-5 px-4 py-2 rounded-full bg-accent text-white text-sm font-medium hover:bg-accent/80 transition self-start"
                >
                  View Submission →
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
