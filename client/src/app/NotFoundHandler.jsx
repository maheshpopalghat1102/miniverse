
import { Link, useLocation } from "react-router-dom";

function NotFoundHandler() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-white">

      <div className="w-full max-w-lg text-center">

        {/* Illustration */}

        <div className="mb-6 text-7xl">
          🚀
        </div>

        {/* Error Code */}

        <h1 className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-8xl font-black text-transparent">
          404
        </h1>

        {/* Message */}

        <h2 className="mt-5 text-2xl font-bold">
          Page Not Found
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
          Looks like this page has disappeared into another
          universe. The page may have been moved, deleted,
          or the URL may be incorrect.
        </p>

        {/* Requested URL */}

        <div className="mt-6 break-all rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-400">
          Requested URL: {location.pathname}
        </div>

        {/* Navigation */}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

          <Link
            to="/"
            className="rounded-lg bg-violet-600 px-6 py-3 text-sm font-semibold transition hover:bg-violet-500"
          >
            Go Home
          </Link>

          <Link
            to="/games"
            className="rounded-lg border border-white/10 px-6 py-3 text-sm font-semibold transition hover:bg-white/10"
          >
            Explore Games
          </Link>

        </div>

        <p className="mt-10 text-xs text-slate-500">
          MiniVerse — Play. Connect. Compete.
        </p>

      </div>
    </div>
  );
}

export default NotFoundHandler;
