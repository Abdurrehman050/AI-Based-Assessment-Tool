import { Routes, Route, Link } from "react-router-dom";
import LandingPage from "./pages/LandingPage"; // import your landing page
import CandidateRegister from "./pages/CandidateRegister";
import TeacherRegister from "./pages/TeacherRegister";

export default function App() {
  return (
    <div className="min-h-screen bg-soft text-primary">
      {/* HEADER */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-accent flex items-center justify-center text-white font-bold">AI</div>
            <div>
              <h1 className="text-lg font-semibold">AI Assessment Tool</h1>
              <p className="text-xs text-gray-500">FYP — BSc Computer Science</p>
            </div>
          </div>
          <nav className="flex gap-3">
            <Link className="text-sm px-3 py-2 rounded hover:bg-gray-100" to="/candidate/register">Candidate</Link>
            <Link className="text-sm px-3 py-2 rounded hover:bg-gray-100" to="/teacher/register">Teacher</Link>
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-6 py-10">
        <Routes>
          {/* Landing page at root */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/candidate/register" element={<CandidateRegister />} />
          <Route path="/teacher/register" element={<TeacherRegister />} />
        </Routes>
      </main>

      {/* FOOTER */}
      <footer className="bg-white mt-10">
        <div className="container mx-auto px-6 py-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} AI Assessment Tool — Project (BSc CS)
        </div>
      </footer>
    </div>
  );
}
