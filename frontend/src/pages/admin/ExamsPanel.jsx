import { useEffect, useState } from "react";
import api from "../../services/api";
import { FiTrash2 } from "react-icons/fi";

export default function ExamsPanel() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const loadExams = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/admin/exams");
      setExams(res.data.exams);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to fetch exams.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/v1/admin/exams/${id}`);
      alert("Exam deleted successfully!");
      loadExams();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete exam.");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  if (loading) return <p className="text-center py-10 text-gray-500">Loading exams...</p>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">All Exams</h2>

      {exams.length === 0 ? (
        <p className="text-gray-500">No exams found.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((e) => (
            <div
              key={e._id}
              className="bg-white shadow-md rounded-xl p-6 flex flex-col justify-between hover:shadow-xl transition relative"
            >
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{e.title}</h3>
                <p className="text-sm text-gray-500 mb-1">By: {e.createdBy?.username}</p>
                <p className="text-sm text-gray-500 mb-1">Email: {e.createdBy?.email}</p>
                <p className="text-sm text-gray-500 mb-1">Level: {e.level}</p>
                <p className="text-sm text-gray-500 mb-1">
                  MCQs: {e.numMcqs || 0}, Shorts: {e.numShorts || 0}
                </p>
                <p className="text-sm text-gray-500 mb-1">Status: {e.status || "draft"}</p>
                <p className="text-sm text-gray-500 mb-1">
                  Created: {new Date(e.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => handleDelete(e._id)}
                  disabled={deletingId === e._id}
                  className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-50"
                >
                  <FiTrash2 /> {deletingId === e._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
