
import React from "react";
import { Link, Outlet } from "react-router-dom";

function AuthLayout({ children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-white">

      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-600/20 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-fuchsia-600/20 blur-[100px]" />

      <div className="relative z-10 w-full max-w-md">

        {/* Logo */}
        <Link
          to="/"
          className="mb-8 flex items-center justify-center gap-3"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-2xl shadow-lg shadow-violet-600/20">
            🎮
          </span>

          <span className="text-2xl font-black tracking-tight">
            Mini<span className="text-violet-400">Verse</span>
          </span>
        </Link>

        {/* Authentication content */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          {children ?? <Outlet />}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Play. Connect. Compete.
          </p>

          <div className="mt-3 flex justify-center gap-4 text-xs text-slate-500">
            <Link
              to="/privacy-policy"
              className="hover:text-violet-400"
            >
              Privacy
            </Link>

            <Link
              to="/terms"
              className="hover:text-violet-400"
            >
              Terms
            </Link>

            <Link
              to="/"
              className="hover:text-violet-400"
            >
              Home
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AuthLayout;
