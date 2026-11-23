import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function VerifyEmail() {
  const location = useLocation();
  const { verifyEmail } = useAuth();
  const email = location.state?.email || "";
  const token = new URLSearchParams(location.search).get("token");
  const requestStarted = useRef(false);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token || requestStarted.current) return;
    requestStarted.current = true;

    verifyEmail(token)
      .then((result) => setMessage(result.message || "Email verified successfully."))
      .catch((err) => setError(err.message || "Email verification failed. Please try again."))
      .finally(() => setLoading(false));
  }, [token, verifyEmail]);

  const emailDeliveryUnavailable = new URLSearchParams(location.search).get("delivery") === "unavailable" ||
    location.state?.emailVerificationSent === false;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4 py-10 text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-7 text-center sm:p-9">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-500/10 text-4xl" aria-hidden="true">
          {message ? "✓" : "✉"}
        </div>
        <h1 className="mt-6 text-2xl font-bold">{message ? "Email verified" : "Verify your email"}</h1>
        <p className="mt-3 text-sm leading-6 text-gray-400">
          {token
            ? loading ? "Verifying your email link…" : message ? "Your MiniVerse account is ready." : "We couldn't verify this link." 
            : emailDeliveryUnavailable
              ? "Your account was created, but we couldn't send the verification email. Please try again later."
              : "Your account was created. Check your inbox for the verification link."}
        </p>
        {email && <p className="mt-2 break-all text-sm font-medium text-violet-300">{email}</p>}
        {error && <p role="alert" className="mt-5 rounded-lg bg-rose-500/10 p-3 text-left text-sm text-rose-300">{error}</p>}
        {message && <p role="status" className="mt-5 rounded-lg bg-emerald-500/10 p-3 text-left text-sm text-emerald-300">{message}</p>}
        <Link to="/login" className="mt-7 inline-block rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold hover:bg-violet-500">
          Continue to sign in
        </Link>
      </section>
    </main>
  );
}
