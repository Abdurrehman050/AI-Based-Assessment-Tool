import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import LandingPage from "./pages/LandingPage";
import CandidateRegister from "./pages/CandidateRegister";
import TeacherRegister from "./pages/TeacherRegister";
import CandidateLogin from "./pages/CandidateLogin";
import TeacherLogin from "./pages/TeacherLogin";

export default function App() {
  return (
    <div className="min-h-screen bg-soft text-primary flex flex-col">
      <Navbar />

      <main className="container mx-auto px-6 py-10 flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/candidate/register" element={<CandidateRegister />} />
          <Route path="/teacher/register" element={<TeacherRegister />} />
          <Route path="/candidate/login" element={<CandidateLogin />} />
          <Route path="/teacher/login" element={<TeacherLogin />} />
        </Routes>
      </main>

      <footer className="bg-white mt-10">
        <div className="container mx-auto px-6 py-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} AI Assessment Tool — Project (BSc CS)
        </div>
      </footer>
    </div>
  );
}
