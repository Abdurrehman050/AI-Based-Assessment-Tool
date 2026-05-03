import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { loginCandidate } from "../services/api";
import { Mail, Lock, User } from "lucide-react";

export default function CandidateLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { loginSuccess } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await loginCandidate({ email, password });
      await loginSuccess("candidate", res.data.token, res.data.candidate);
      navigate("/candidate/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" flex items-center justify-center px-4 ">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-accent text-white rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={26} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Candidate Login</h1>
          <p className="text-gray-500 text-sm mt-1">
            Begin your assessment journey
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Email</label>
            <div className="flex items-center border rounded-lg px-3 focus-within:ring-2 focus-within:ring-sky-500">
              <Mail className="text-gray-400 mr-2" size={18} />
              <input
                type="email"
                placeholder="candidate@example.com"
                className="w-full py-2 outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Password</label>
            <div className="flex items-center border rounded-lg px-3 focus-within:ring-2 focus-within:ring-sky-500">
              <Lock className="text-gray-400 mr-2" size={18} />
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full py-2 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-accent text-white rounded-lg font-semibold hover:bg-accent/80 transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-500 text-center">
          Don’t have an account?{" "}
          <a
            href="/candidate/register"
            className="text-sky-600 font-semibold hover:underline"
          >
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}
