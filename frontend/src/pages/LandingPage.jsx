import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Brain, BarChart3, ShieldCheck, Clock } from "lucide-react";
import studentAI from "../assets/student-ai.png";
import tuf from "../assets/intro-tuf.png";
import tufstudents from "../assets/tuf-students.png"

export default function LandingPage() {
  return (
    <div className="relative text-primary overflow-hidden">

      {/* BACKGROUND BLOBS */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-blob" />
      <div className="absolute top-40 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-blob" />

      {/* ================= HERO ================= */}
      <section className="relative bg-soft py-28">
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-14 items-center">

          <div className="space-y-6 animate-fade-up">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              AI Based <span className="text-accent">Assessment Tool</span>
            </h1>

            <p className="text-primary/80 text-lg md:text-xl max-w-xl">
              A next-generation examination platform where AI evaluates answers,
              reduces workload, and ensures fair academic assessments.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                to="/candidate/register"
                className="px-7 py-3 rounded-xl bg-accent text-white font-medium
                           hover:brightness-90 transition flex items-center gap-2"
              >
                Get Started <ArrowRight size={18} />
              </Link>

              <Link
                to="/teacher/register"
                className="px-7 py-3 rounded-xl bg-primary text-white font-medium
                           hover:bg-primary/90 transition"
              >
                For Teachers
              </Link>
            </div>
          </div>

          <div className="flex justify-center">
            <img
              src={tuf}
              alt="AI Assessment"
              className="w-full max-w-lg rounded-3xl
                         shadow-[0_30px_70px_rgba(0,0,0,0.2)]
                         animate-float"
            />
          </div>
        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 text-center space-y-6 animate-fade-up">
          <h2 className="text-3xl md:text-4xl font-semibold">
            Built for Modern Education
          </h2>
          <p className="text-primary/80 max-w-3xl mx-auto text-lg">
            This platform bridges the gap between traditional examinations and modern AI.
            It ensures faster evaluation, transparency, and scalable assessment for institutions.
          </p>
        </div>
      </section>

      {/* ================= SLIDER FEATURES ================= */}
      <section className="py-24 bg-soft overflow-hidden cursor-arrow">
        <h2 className="text-3xl md:text-4xl font-semibold text-center mb-14">
          Platform Highlights
        </h2>

        <div className="relative group">
          <div className="flex w-[200%] gap-8 animate-slide px-6 cursor-arrow ">

            {[
              {
                icon: <Brain className="text-accent" />,
                title: "AI Evaluation",
                desc: "Automated grading of MCQs and descriptive answers using AI."
              },
              {
                icon: <BarChart3 className="text-accent" />,
                title: "Analytics & Reports",
                desc: "Detailed performance analytics for teachers and institutions."
              },
              {
                icon: <ShieldCheck className="text-accent" />,
                title: "Secure Exams",
                desc: "Token-based access and controlled exam environments."
              },
              {
                icon: <Clock className="text-accent" />,
                title: "Instant Results",
                desc: "Students receive results immediately after submission."
              },
            ].concat(
              [
                {
                  icon: <Brain className="text-accent" />,
                  title: "AI Evaluation",
                  desc: "Automated grading of MCQs and descriptive answers using AI."
                },
                {
                  icon: <BarChart3 className="text-accent" />,
                  title: "Analytics & Reports",
                  desc: "Detailed performance analytics for teachers and institutions."
                },
                {
                  icon: <ShieldCheck className="text-accent" />,
                  title: "Secure Exams",
                  desc: "Token-based access and controlled exam environments."
                },
                {
                  icon: <Clock className="text-accent" />,
                  title: "Instant Results",
                  desc: "Students receive results immediately after submission."
                },
              ]
            ).map((item, i) => (

              <div
                key={i}
                className="w-80 bg-white p-8 rounded-2xl
                border border-gray-100
                transform transition-all duration-300
                hover:-translate-y-3
                shadow-[0_20px_60px_rgba(14,165,164,0.25)]
                hover:shadow-[0_40px_120px_rgba(14,165,164,0.45)]">
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-primary/80">{item.desc}</p>
              </div>

            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="relative overflow-hidden bg-primary text-white">
  {/* Background glow / gradient */}
  <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/10 to-black/40" />

  <div className="relative z-10 max-w-6xl mx-auto px-6 py-28 text-center animate-fade-up">
    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
      Start Your <span className="text-accent">Smart Exam</span> Journey
    </h2>

    <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-white/80 leading-relaxed">
      Join institutions, teachers, and students transforming assessments
      with secure, AI-powered automation.
    </p>

    <div className="mt-12 flex justify-center">
      <Link
        to="/candidate/register"
        className="group inline-flex items-center gap-2
                   px-10 py-4 rounded-2xl
                   bg-accent text-primary font-semibold text-lg
                   shadow-lg shadow-black/30
                   hover:shadow-xl hover:scale-105 hover:text-white
                   transition-all duration-300"
      >
          Get Started - It’s Free

        <span className="group-hover:translate-x-1 transition-transform">
          →
        </span>
      </Link>
    </div>
  </div>
</section>


    </div>
  );
}
