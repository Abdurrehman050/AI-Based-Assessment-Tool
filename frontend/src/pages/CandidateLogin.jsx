import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CandidateLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/candidates/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include", // important for cookies
        }
      );

      let data;
      try {
        data = await response.json(); // read body once
      } catch (err) {
        const text = await response.text();
        console.error("Server returned non-JSON:", text);
        alert("Server error: invalid response");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        if (response.status === 404) alert("Candidate not found");
        else if (response.status === 401) alert("Invalid password");
        else alert(data.message || "Login failed");
        setLoading(false);
        return;
      }

      alert(`Welcome ${data.candidate.username}! Login successful.`);
      setEmail("");
      setPassword("");
      setLoading(false);
      navigate("/candidate/dashboard"); // adjust to your candidate dashboard route
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-500">
          Candidate Login
        </h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-3 font-medium rounded-md text-white transition ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
              }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-500 text-center">
          Don't have an account?{" "}
          <a
            href="/candidate/register"
            className="text-blue-500 font-medium underline"
          >
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
