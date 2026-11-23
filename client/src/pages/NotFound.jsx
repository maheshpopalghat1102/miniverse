
import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function NotFound() {
  const location = useLocation();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 p-6 text-white">
      <section className="w-full max-w-lg text-center">
        <div className="text-8xl font-black text-violet-500">404</div>
        <div className="mt-5 text-5xl">🪐</div>
        <h1 className="mt-5 text-2xl font-bold">Lost in the MiniVerse?</h1>
        <p className="mt-3 leading-6 text-gray-400">
          We couldn't find the page you're looking for. It may have moved or
          the address may be incorrect.
        </p>

        <p className="mt-4 break-all rounded-lg bg-gray-900 px-4 py-3 text-xs text-gray-500">
          Requested path: {location.pathname}
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/" className="rounded-xl bg-violet-600 px-6 py-3 font-semibold hover:bg-violet-500">
            Go home
          </Link>
          <Link to="/games" className="rounded-xl border border-white/10 px-6 py-3 font-semibold hover:bg-white/10">
            Explore games
          </Link>
        </div>
      </section>
    </main>
  );
}
