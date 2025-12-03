import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import studentAI from "../assets/student-ai.jpg";


export default function LandingPage() {
  return (
    <div className="text-primary">

      {/* HERO SECTION */}
      <section className="bg-soft py-24">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              AI Based <span className="text-accent">Assessment Tool</span>
            </h1>
            <p className="mt-6 text-primary/80 text-lg">
              A modern platform where teachers create AI-enhanced exams and students
              attempt tests with instant evaluation. Fast, smart, and automated academic workflows.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/candidate/register"
                className="px-6 py-3 rounded-md bg-accent text-white font-medium hover:brightness-90 flex items-center gap-2 transition"
              >
                Get Started <ArrowRight size={18} />
              </Link>

              <Link
                to="/teacher/register"
                className="px-6 py-3 rounded-md bg-primary text-white font-medium hover:bg-opacity-90 transition"
              >
                For Teachers
              </Link>
            </div>
          </div>

          <div>
            <img
               src={studentAI}
              alt="AI Assessment Illustration"
              className="w-full max-w-lg mx-auto"
            />
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-primary">What is this Platform?</h2>
          <p className="mt-4 text-primary/80 max-w-2xl mx-auto text-lg">
            This platform helps educational institutes make exams smart and automated. 
            Teachers create exams, students attempt them, and AI handles evaluation instantly.
          </p>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-20 bg-soft">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-semibold text-center text-primary">Features</h2>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white p-8 rounded-xl shadow-md border hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3 text-primary">AI Evaluation</h3>
              <p className="text-primary/80">
                Our AI grades long answers, generates smart scoring, and saves time.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md border hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3 text-primary">Teacher Dashboard</h3>
              <p className="text-primary/80">
                Teachers can create exams, track stats, evaluate performance, and manage students easily.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md border hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3 text-primary">Student Portal</h3>
              <p className="text-primary/80">
                Students attempt exams with a clean interface and receive instant results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 bg-primary text-white text-center">
        <h2 className="text-3xl md:text-4xl font-semibold">Start Your Smart Exam Journey</h2>
        <p className="text-white/80 mt-4 max-w-lg mx-auto text-lg">
          Join thousands of students and teachers improving learning with AI.
        </p>

        <div className="mt-8">
          <Link
            to="/candidate/register"
            className="px-8 py-3 bg-accent text-white rounded-md font-medium hover:brightness-90 transition"
          >
            Register Now
          </Link>
        </div>
      </section>

    </div>
  );
}
