
import { useState } from "react";
import { Link } from "react-router-dom";
import authService from "../../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess(false);

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      await authService.forgotPassword(normalizedEmail);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Unable to process your request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4 py-10 text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-7 sm:p-9">
        <Link to="/login" className="text-sm text-violet-300 hover:underline">← Back to login</Link>

        <div className="mt-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-3xl">
          🔐
        </div>

        <h1 className="mt-6 text-2xl font-bold">Forgot your password?</h1>
        <p className="mt-3 text-sm leading-6 text-gray-400">
          Enter the email address associated with your account. If an account
          matches, we'll send instructions to reset your password.
        </p>

        {success ? (
          <div className="mt-7 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5">
            <span className="text-2xl">📩</span>
            <h2 className="mt-3 font-semibold text-emerald-300">Check your email</h2>
            <p className="mt-2 text-sm leading-6 text-gray-300">
              If an account matches that address, password reset instructions
              will be sent. Check your inbox and spam folder.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                maxLength={254}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-gray-800 p-3 text-white outline-none focus:border-violet-500"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-300">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="w-full rounded-xl bg-violet-600 p-3 font-semibold hover:bg-violet-500 disabled:opacity-50">
              {loading ? "Sending..." : "Send reset instructions"}
            </button>
          </form>
        )}

        <p className="mt-7 text-center text-sm text-gray-400">
          Remember your password?{" "}
          <Link to="/login" className="font-semibold text-violet-300 hover:underline">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
