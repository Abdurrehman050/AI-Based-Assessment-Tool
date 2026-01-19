import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { createExam } from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function CreateExam() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [createdExamId, setCreatedExamId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    level: "easy",
    questionType: "MCQ",
    duration: 60,
    numMcqs: 5,
    numShorts: 2,
    prompt: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  if (!user || user.role !== "teacher") {
    return (
      <div className="p-6 text-center text-red-500">
        You must be logged in as a teacher to access this page.
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await createExam(formData);

      const examId = res.data.exam._id;
      setCreatedExamId(examId);

      // show popup instead of redirect
      setShowModal(true);

      setFormData({
        title: "",
        level: "easy",
        questionType: "MCQ",
        duration: 60,
        numMcqs: 5,
        numShorts: 2,
        prompt: "",
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create exam.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-primary">Create New Exam</h1>

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block font-medium mb-1">Exam Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Level */}
        <div>
          <label className="block font-medium mb-1">Difficulty Level</label>
          <select
            name="level"
            value={formData.level}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        {/* Exam Duration */}
        <div>
          <label className="block font-medium mb-1">
            Exam Duration (minutes)
          </label>
          <input
            type="number"
            name="duration"
            min="10"
            value={formData.duration}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Question Type */}
        <div>
          <label className="block font-medium mb-1">Question Type</label>
          <select
            name="questionType"
            value={formData.questionType}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="MCQ">MCQ</option>
            <option value="Short Answer">Short Answer</option>
            <option value="Mixed">Mixed</option>
          </select>
        </div>

        {/* Number of MCQs */}
        <div>
          <label className="block font-medium mb-1">Number of MCQs</label>
          <input
            type="number"
            name="numMcqs"
            min="0"
            value={formData.numMcqs}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Number of Short Questions */}
        <div>
          <label className="block font-medium mb-1">
            Number of Short Questions
          </label>
          <input
            type="number"
            name="numShorts"
            min="0"
            value={formData.numShorts}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Prompt / Focus Area */}
        <div>
          <label className="block font-medium mb-1">Focus Area / Prompt</label>
          <textarea
            name="prompt"
            value={formData.prompt}
            onChange={handleChange}
            required
            rows={3}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-accent"
          ></textarea>
        </div>

        {/* Success Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 text-center">
              <h2 className="text-2xl font-bold text-primary mb-3">
                Exam Created Successfully 🎉
              </h2>

              <p className="text-gray-600 mb-6">
                Your exam has been generated. Please review and approve it
                before publishing.
              </p>

              <button
                onClick={() => {
                  setShowModal(false);
                  navigate(`/teacher/exams/${createdExamId}/preview`);
                }}
                className="px-6 py-3 bg-accent text-white rounded-lg font-medium hover:brightness-90 transition"
              >
                OK, Preview Exam
              </button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-accent text-white rounded-lg font-medium hover:brightness-90 transition"
        >
          {loading ? "Creating Exam..." : "Create Exam"}
        </button>
      </form>
    </div>
  );
}
