import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function TeacherReports() {
  const [examReports, setExamReports] = useState([]);
  const [submissionReports, setSubmissionReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [examsRes, submissionsRes] = await Promise.all([
          api.get("/api/v1/teachers/reports/exams"),
          api.get("/api/v1/teachers/reports/submissions"),
        ]);
        setExamReports(examsRes.data.data || []);
        setSubmissionReports(submissionsRes.data.submissions || []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading)
    return <p className="p-6 text-center text-gray-500">Loading reports...</p>;

  if (error) return <p className="p-6 text-center text-red-600">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-700 mb-8">Reports</h1>

      {/* Exam Reports Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Exam Reports
        </h2>
        {examReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {examReports.map((exam) => (
              <div
                key={exam._id}
                className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {exam.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Exam Key: {exam.examKey}
                  </p>
                  <p className="text-sm mt-2">
                    Candidates Attempted:{" "}
                    <span className="font-medium">{exam.attemptedCount}</span>
                  </p>
                  <p className="text-sm mt-1">
                    Average Score:{" "}
                    <span className="font-medium">
                      {exam.averageScore ?? 0} / {exam.totalMarks}
                    </span>
                  </p>
                  <p className="text-sm mt-1">
                    Status:{" "}
                    <span
                      className={`font-semibold px-2 py-1 rounded-full text-xs ${
                        exam.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {exam.isActive ? "Active" : "Inactive"}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() =>
                    navigate(`/teacher/exams/${exam._id}/submissions`)
                  }
                  className="mt-4 px-4 py-2 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition self-start"
                >
                  View Submissions →
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center mt-4">No exams found.</p>
        )}
      </section>

      {/* Submission Reports Section */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Submission Reports
        </h2>
        {submissionReports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-2xl shadow-md">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="py-3 px-6 text-sm font-medium text-gray-700">
                    Candidate
                  </th>
                  <th className="py-3 px-6 text-sm font-medium text-gray-700">
                    Exam
                  </th>
                  <th className="py-3 px-6 text-sm font-medium text-gray-700">
                    Score
                  </th>
                  <th className="py-3 px-6 text-sm font-medium text-gray-700">
                    Status
                  </th>
                  <th className="py-3 px-6 text-sm font-medium text-gray-700">
                    Submitted On
                  </th>
                  <th className="py-3 px-6 text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {submissionReports.map((sub) => (
                  <tr key={sub._id} className="border-b">
                    <td className="py-3 px-6 text-sm text-gray-700">
                      {sub.candidate?.username || "-"}
                    </td>
                    <td className="py-3 px-6 text-sm text-gray-700">
                      {sub.exam?.title || "-"}
                    </td>
                    <td className="py-3 px-6 text-sm text-gray-700">
                      {sub.score ?? 0}
                    </td>
                    <td className="py-3 px-6 text-sm">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          sub.checkedByAI || sub.isGraded
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {sub.checkedByAI || sub.isGraded ? "Graded" : "Pending"}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-sm text-gray-500">
                      {new Date(sub.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-6 text-sm">
                      <button
                        onClick={() =>
                          (window.location.href = `/teacher/submissions/${sub._id}`)
                        }
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 transition"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center mt-4">
            No submissions found.
          </p>
        )}
      </section>
    </div>
  );
}
