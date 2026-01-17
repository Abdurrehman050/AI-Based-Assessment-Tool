import { useEffect, useState } from "react";
import api from "../../services/api";

export default function UsersPanel() {
  const [users, setUsers] = useState({ teachers: [], candidates: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load users from backend
  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/v1/admin/users");
      console.log("Users response:", res.data); // ✅ Debug: check data shape

      // Make sure the backend returns { teachers: [], candidates: [] }
      setUsers({
        teachers: res.data.teachers || [],
        candidates: res.data.candidates || [],
      });
    } catch (err) {
      console.error("Failed to load users:", err);
      setError(err.response?.data?.message || "Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  // Delete a user
  const deleteUser = async (role, id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/api/v1/admin/users/${role}/${id}`);
      alert("User deleted successfully!");
      loadUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert(err.response?.data?.message || "Failed to delete user.");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const renderList = (list, role) => {
    if (!list || list.length === 0) return <p className="text-gray-500">No users found.</p>;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((u) => (
          <div
            key={u._id}
            className="p-4 bg-white shadow rounded flex flex-col justify-between"
          >
            <div>
              <p className="font-semibold text-gray-800">{u.username}</p>
              <p className="text-sm text-gray-500">{u.email}</p>
              <p className="text-sm text-gray-400 capitalize">{role}</p>
            </div>
            <button
              onClick={() => deleteUser(role, u._id)}
              className="mt-4 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    );
  };

  if (loading) return <p className="text-center py-10">Loading users...</p>;
  if (error) return <p className="text-center py-10 text-red-500">{error}</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Teachers</h2>
      {renderList(users.teachers, "teacher")}

      <h2 className="text-xl font-bold mt-10 mb-4">Candidates</h2>
      {renderList(users.candidates, "candidate")}
    </div>
  );
}
