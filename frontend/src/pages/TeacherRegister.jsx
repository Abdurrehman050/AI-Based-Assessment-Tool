import React, { useState } from "react";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { registerTeacher } from "../services/api";

export default function TeacherRegister() {
  const [form, setForm] = useState({ username: "", email: "", password: "", subject: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: null }));
  }

  function validate() {
    const e = {};
    if (!form.username.trim()) e.username = "Username is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Password must be 6+ characters";
    if (!form.subject.trim()) e.subject = "Subject is required";
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    setMessage(null);
    const eObj = validate();
    if (Object.keys(eObj).length) {
      setErrors(eObj);
      return;
    }
    setLoading(true);
    try {
      const payload = {
        username: form.username,
        email: form.email,
        password: form.password,
        subject: form.subject
      };
      const res = await registerTeacher(payload);
      setMessage({ type: "success", text: res.data?.message || "Teacher created successfully" });
      setForm({ username: "", email: "", password: "", subject: "" });
    } catch (err) {
      const text = err?.response?.data?.message || err.message || "Registration failed";
      setMessage({ type: "error", text });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-semibold mb-2">Teacher Registration</h2>
      <p className="text-sm text-gray-500 mb-6">Teachers create exams and grade submissions. Provide a subject (e.g., Physics, Math).</p>

      {message && (
        <div className={`p-3 rounded mb-4 ${message.type === "success" ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <InputField label="Username" id="username" name="username" value={form.username} onChange={handleChange} placeholder="prof_jane" required error={errors.username} />
        <InputField label="Email" id="email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required error={errors.email} />
        <InputField label="Password" id="password" type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required error={errors.password} />
        <InputField label="Subject" id="subject" name="subject" value={form.subject} onChange={handleChange} placeholder="E.g. Computer Science" required error={errors.subject} />

        <div className="flex items-center justify-between mt-6">
          <Button disabled={loading} type="submit">{loading ? "Creating..." : "Create Teacher"}</Button>
          <small className="text-xs text-gray-500">After registering, teacher can login and create exams.</small>
        </div>
      </form>
    </div>
  );
}
