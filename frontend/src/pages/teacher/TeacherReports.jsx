import React, { useEffect, useMemo, useState } from "react";
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

  const stats = useMemo(() => {
    const totalExams = examReports.length;
    const activeExams = examReports.filter((exam) => exam.isActive).length;
    const totalAttempts = examReports.reduce(
      (acc, exam) => acc + (exam.attemptedCount || 0),
      0,
    );
    const totalGraded = examReports.reduce(
      (acc, exam) => acc + (exam.gradedCount || 0),
      0,
    );
    const pendingChecks = Math.max(totalAttempts - totalGraded, 0);
    const weightedAverage =
      totalAttempts > 0
        ? (
            examReports.reduce(
              (acc, exam) =>
                acc + (exam.averageScore || 0) * (exam.attemptedCount || 0),
              0,
            ) / totalAttempts
          ).toFixed(2)
        : "0.00";

    return {
      totalExams,
      activeExams,
      totalAttempts,
      totalGraded,
      pendingChecks,
      weightedAverage,
      totalSubmissions: submissionReports.length,
    };
  }, [examReports, submissionReports]);

  const getSubmissionStatus = (submission) => {
    if (submission.checkedByAI || submission.isGraded) return "Graded";
    return "Pending";
  };

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString();
  };

  if (loading)
    return (
      <p className="p-6 text-center text-gray-500">Loading reports...</p>
    );

  if (error) return <p className="p-6 text-center text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
          Teacher Reports
        </h1>
        <p className="text-gray-600 mb-8">
          Track exam performance, grading progress, and candidate submissions in
          one place.
        </p>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500">Total Exams</p>
            <p className="text-3xl font-bold text-primary mt-1">
              {stats.totalExams}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Active: {stats.activeExams}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500">Attempts Recorded</p>
            <p className="text-3xl font-bold text-primary mt-1">
              {stats.totalAttempts}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Reports fetched: {stats.totalSubmissions}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500">Graded Submissions</p>
            <p className="text-3xl font-bold text-primary mt-1">
              {stats.totalGraded}
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Pending: {stats.pendingChecks}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500">Average Score (Overall)</p>
            <p className="text-3xl font-bold text-primary mt-1">
              {stats.weightedAverage}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Weighted across attempted exams
            </p>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Exam Reports
            </h2>
            <span className="text-sm text-gray-500">
              {examReports.length} exams
            </span>
          </div>

          {examReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {examReports.map((exam) => {
                const attempted = exam.attemptedCount || 0;
                const graded = exam.gradedCount || 0;
                const gradedPercent =
                  attempted > 0 ? Math.round((graded / attempted) * 100) : 0;
                const difficulty = exam.level || exam.difficulty || "N/A";
                const durationValue =
                  exam.duration ?? exam.examDuration ?? null;

                return (
                  <div
                    key={exam._id}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {exam.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Key: {exam.examKey || "-"}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          exam.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {exam.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <p className="text-gray-600">
                        Attempts: <span className="font-medium">{attempted}</span>
                      </p>
                      <p className="text-gray-600">
                        Graded: <span className="font-medium">{graded}</span>
                      </p>
                      <p className="text-gray-600">
                        Avg Score:{" "}
                        <span className="font-medium">
                          {(exam.averageScore || 0).toFixed(2)} / {exam.totalMarks || 0}
                        </span>
                      </p>
                      <p className="text-gray-600">
                        Difficulty: <span className="font-medium">{difficulty}</span>
                      </p>
                      <p className="text-gray-600">
                        Duration:{" "}
                        <span className="font-medium">
                          {durationValue !== null ? `${durationValue} min` : "N/A"}
                        </span>
                      </p>
                      <p className="text-gray-600">
                        Questions:{" "}
                        <span className="font-medium">
                          {(exam.numMcqs || 0) + (exam.numShorts || 0)}
                        </span>
                      </p>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Grading progress</span>
                        <span>{gradedPercent}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-accent h-2 rounded-full"
                          style={{ width: `${gradedPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => navigate(`/teacher/exams/${exam._id}/preview`)}
                        className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/80 transition"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/teacher/exams/${exam._id}/submissions`)
                        }
                        className="px-4 py-2 rounded-full bg-accent text-white text-sm font-medium hover:brightness-90 transition"
                      >
                        View Submissions
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center mt-4">No exams found.</p>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Submission Reports
            </h2>
            <span className="text-sm text-gray-500">
              {submissionReports.length} records
            </span>
          </div>

          {submissionReports.length > 0 ? (
            <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-primary/10 text-left">
                    <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wide text-gray-700">
                      Candidate
                    </th>
                    <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wide text-gray-700">
                      Exam
                    </th>
                    <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wide text-gray-700">
                      Score
                    </th>
                    <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wide text-gray-700">
                      Status
                    </th>
                    <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wide text-gray-700">
                      AI Checked
                    </th>
                    <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wide text-gray-700">
                      Violations
                    </th>
                    <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wide text-gray-700">
                      Submitted On
                    </th>
                    <th className="py-3 px-5 text-xs font-semibold uppercase tracking-wide text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {submissionReports.map((sub) => {
                    const status = getSubmissionStatus(sub);
                    return (
                      <tr
                        key={sub._id}
                        className="border-t border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-5 text-sm text-gray-700">
                          <p className="font-medium">
                            {sub.candidate?.username || "-"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {sub.candidate?.email || "-"}
                          </p>
                        </td>
                        <td className="py-3 px-5 text-sm text-gray-700">
                          {sub.exam?.title || "-"}
                        </td>
                        <td className="py-3 px-5 text-sm text-gray-700">
                          {sub.score ?? 0}
                        </td>
                        <td className="py-3 px-5 text-sm">
                          <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                              status === "Graded"
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-sm text-gray-700">
                          {sub.checkedByAI ? "Yes" : "No"}
                        </td>
                        <td className="py-3 px-5 text-sm text-gray-700">
                          {sub.totalViolations ?? 0}
                        </td>
                        <td className="py-3 px-5 text-sm text-gray-500">
                          {formatDate(sub.createdAt)}
                        </td>
                        <td className="py-3 px-5 text-sm">
                          <button
                            onClick={() => navigate(`/teacher/submissions/${sub._id}`)}
                            className="px-3 py-1.5 bg-primary text-white text-xs rounded-full hover:bg-primary/80 transition"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
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
    </div>
  );
}
