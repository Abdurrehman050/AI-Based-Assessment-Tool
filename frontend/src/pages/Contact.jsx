import React, { useEffect } from "react";
import { Mail, MessageCircle, Info } from "lucide-react";

export default function Contact() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Get in Touch
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            AI Assessment Tool is designed to simplify and automate online
            examinations using intelligent evaluation techniques.
          </p>
        </div>

        {/* Info Section */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-accent mt-1" />
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">
                Why contact us?
              </h3>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>• Exam setup and usage guidance</li>
                <li>• Technical support and bug reporting</li>
                <li>• Feedback and feature suggestions</li>
                <li>• Academic or project-related queries</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Buttons */}
        <div className="space-y-4">
          {/* WhatsApp */}
          <a
            href="https://wa.me/923080356036"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full px-6 py-4
                        bg-accent text-white rounded-xl font-semibold
                        hover:bg-green-700 transition"
          >
            <MessageCircle className="w-5 h-5" />
            Chat on WhatsApp
          </a>

          {/* Email */}
          <a
            href="mailto:rajpootmona098@gmail.com"
            className="flex items-center justify-center gap-3 w-full px-6 py-4
                        bg-primary text-white rounded-xl font-semibold
                        hover:bg-primary/80 transition"
          >
            <Mail className="w-5 h-5" />
            Send Email
          </a>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-gray-400 mt-8">
          Available during working hours. Responses may take up to 24 hours.
        </p>
      </div>
    </div>
  );
}
