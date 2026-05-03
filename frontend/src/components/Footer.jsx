import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary text-white border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Project Info */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-black font-display tracking-tight group-hover:text-accent transition-colors">
                AI <span className="text-accent">ASSESSMENT</span>
              </span>
            </Link>
            <p className="text-white/60 leading-relaxed text-sm max-w-xs">
              Revolutionizing academic evaluations through secure, AI-driven
              automation and semantic analysis.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold font-display">Platform</h4>
            <ul className="space-y-4">
              <li>
                <Link
                  to="/"
                  className="text-white/60 hover:text-accent transition text-sm flex items-center gap-2"
                >
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-white/60 hover:text-accent transition text-sm flex items-center gap-2"
                >
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/candidate/login"
                  className="text-white/60 hover:text-accent transition text-sm flex items-center gap-2"
                >
                  <span>Candidate Portal</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/teacher/login"
                  className="text-white/60 hover:text-accent transition text-sm flex items-center gap-2"
                >
                  <span>Teacher Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold font-display">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-white/60 text-sm">
                <Mail size={18} className="text-accent shrink-0" />
                <span>support@aiassessment.com</span>
              </li>
              <li className="flex items-start gap-3 text-white/60 text-sm">
                <Phone size={18} className="text-accent shrink-0" />
                <span>+92 (316) 746-6943</span>
              </li>
              <li className="flex items-start gap-3 text-white/60 text-sm">
                <MapPin size={18} className="text-accent shrink-0" />
                <span>The University of Faisalabad</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} AI Assessment Tool. All Rights
            Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
