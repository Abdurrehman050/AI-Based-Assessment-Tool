// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import CandidateRegister from "./pages/CandidateRegister";
import TeacherRegister from "./pages/TeacherRegister";
import CandidateLogin from "./pages/CandidateLogin";
import TeacherLogin from "./pages/TeacherLogin";
import CandidateDashboard from "./pages/candidate/CandidateDashboard";
import { AuthProvider } from "./context/AuthContext";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import CreateExam from "./pages/teacher/CreateExam";
import ManageExams from "./pages/teacher/ManageExams";
import ExamSubmissions from "./pages/teacher/ExamSubmissions";
import ExamPreview from "./pages/teacher/ExamPreview";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import EnterExam from "./pages/candidate/EnterExam";
import Instructions from "./pages/candidate/Instructions";
import Footer from "./components/Footer";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ExamPortal from "./pages/candidate/ExamPortal";
import SubmissionDetails from "./pages/teacher/SubmissionDetails";
import CandidateSubmissionDetails from "./pages/candidate/CandidateSubmissionDetails";
import CandidateSubmissions from "./pages/candidate/CandidateSubmissions";
import TeacherReports from "./pages/teacher/TeacherReports";

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-soft text-primary flex flex-col">
        <Navbar />
        <main className="pt-24 flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/candidate/register" element={<CandidateRegister />} />
            <Route path="/teacher/register" element={<TeacherRegister />} />
            <Route path="/candidate/login" element={<CandidateLogin />} />
            <Route path="/teacher/login" element={<TeacherLogin />} />
            <Route
              path="/candidate/dashboard"
              element={<CandidateDashboard />}
            />
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/create-exam" element={<CreateExam />} />
            <Route path="/teacher/exams" element={<ManageExams />} />
            <Route
              path="/teacher/exams/:examId/submissions"
              element={<ExamSubmissions />}
            />
            <Route
              path="/teacher/exams/:examId/preview"
              element={<ExamPreview />}
            />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/candidate/enter-exam" element={<EnterExam />} />
            <Route path="/candidate/exams" element={<EnterExam />} />

            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            <Route
              path="/candidate/exam/:examId/instructions"
              element={<Instructions />}
            />
            <Route
              path="/candidate/exam/:examId/start"
              element={<ExamPortal />}
            />
            <Route
              path="/teacher/submissions/:submissionId"
              element={<SubmissionDetails />}
            />
            <Route
              path="/candidate/submission/:submissionId"
              element={<CandidateSubmissionDetails />}
            />
            <Route
              path="/candidate/submissions"
              element={<CandidateSubmissions />}
            />
            <Route
              path="/candidate/submissions"
              element={<CandidateSubmissions />}
            />
            <Route path="/teacher/reports" element={<TeacherReports />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
