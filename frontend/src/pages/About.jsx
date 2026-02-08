import React, { useEffect } from "react";

export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0); // scroll to top
  }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-primary text-white py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          About AI-Based Assessment Tool
        </h1>
        <p className="max-w-3xl mx-auto text-lg text-white/90">
          A smart, secure, and automated examination platform designed to
          transform traditional assessments using Artificial Intelligence.
        </p>
      </section>

      {/* About Content */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-3xl font-bold text-primary mb-4">
              Project Overview
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The <strong>AI-Based Assessment Tool</strong> is developed to
              simplify, secure, and modernize the examination process for
              educational institutions. The system enables teachers to create
              intelligent exams using AI, while students can attempt exams in a
              controlled and time-bound environment.
            </p>
            <p className="text-gray-700 leading-relaxed">
              This platform eliminates manual paper-based exams, reduces human
              errors, and ensures fair evaluation by integrating AI-powered
              automation with a robust backend system.
            </p>
          </div>

          {/* Right Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-semibold text-primary mb-4">
              Key Objectives
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li>✔ Automate exam creation using AI</li>
              <li>✔ Ensure secure and time-bound assessments</li>
              <li>✔ Reduce manual checking workload</li>
              <li>✔ Improve exam transparency and fairness</li>
              <li>✔ Provide detailed performance insights</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-primary mb-12">
            Core Features
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              {
                title: "AI Exam Generation",
                desc: "Automatically generates MCQs and short questions based on selected difficulty and topic.",
              },
              {
                title: "Role-Based Access",
                desc: "Separate dashboards for Admin, Teachers, and Students with secure authentication.",
              },
              {
                title: "Timed Exams",
                desc: "Each exam includes a configurable duration with automatic submission.",
              },
              {
                title: "Secure Exam Access",
                desc: "Students join exams using a unique exam key to prevent unauthorized access.",
              },
              {
                title: "Result & Reports",
                desc: "Instant result generation with detailed performance analysis.",
              },
              {
                title: "Scalable Architecture",
                desc: "Built using modern web technologies ensuring scalability and reliability.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 border rounded-xl hover:shadow-md transition"
              >
                <h3 className="text-xl font-semibold text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-primary mb-6">
            Technology Stack
          </h2>
          <p className="text-gray-700 mb-8">
            The system is developed using modern and reliable technologies to
            ensure performance, security, and scalability.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {[
              "React.js",
              "Node.js",
              "Express.js",
              "MongoDB",
              "JWT Authentication",
              "Tailwind CSS",
              "AI APIs (Gemini)",
            ].map((tech, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-white border rounded-full text-sm font-medium text-gray-700"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
