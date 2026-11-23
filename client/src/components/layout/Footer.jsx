
import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="hidden border-t border-white/10 bg-slate-950 px-6 py-6 lg:block">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">

        {/* Branding */}
        <div>
          <Link to="/dashboard" className="text-lg font-black">
            Mini<span className="text-violet-400">Verse</span>
          </Link>

          <p className="mt-1 text-xs text-slate-500">
            Play. Connect. Compete.
          </p>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap justify-center gap-5 text-xs text-slate-400">
          <Link to="/about" className="hover:text-violet-400">
            About
          </Link>

          <Link to="/help" className="hover:text-violet-400">
            Help Center
          </Link>

          <Link to="/contact" className="hover:text-violet-400">
            Contact
          </Link>

          <Link to="/privacy-policy" className="hover:text-violet-400">
            Privacy
          </Link>

          <Link to="/terms" className="hover:text-violet-400">
            Terms
          </Link>
        </nav>

        {/* Copyright */}
        <p className="text-xs text-slate-500">
          © {currentYear} MiniVerse. All rights reserved.
        </p>

      </div>
    </footer>
  );
}

export default Footer;
