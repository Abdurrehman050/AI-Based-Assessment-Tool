import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TeacherLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/teachers/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include", // for cookies
        }
      );

      let data;
      try {
        data = await response.json();
      } catch (err) {
        console.error("Server returned non-JSON:", await response.text());
        alert("Server error: invalid response");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        alert(data.message || "Login failed");
        setLoading(false);
        return;
      }

      alert(`Welcome ${data.teacher.username}! Login successful.`);
      setEmail("");
      setPassword("");
      setLoading(false);
      navigate("/teacher/dashboard"); // adjust to your dashboard route
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-6 text-primary">
          Teacher Login
        </h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-3 font-medium rounded-md text-white transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:brightness-90"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-500 text-center">
          Don't have an account?{" "}
          <a
            href="/teacher/register"
            className="text-primary font-medium underline"
          >
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
