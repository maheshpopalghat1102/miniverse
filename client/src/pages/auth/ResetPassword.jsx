
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import authService from "../../services/authService";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validatePassword = () => {
    if (!token) return "Password reset token is missing.";
    if (password.length < 8) return "Password must contain at least 8 characters.";
    if (!/[A-Z]/.test(password)) return "Add at least one uppercase letter.";
    if (!/[a-z]/.test(password)) return "Add at least one lowercase letter.";
    if (!/[0-9]/.test(password)) return "Add at least one number.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const validationError = validatePassword();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, password);
      navigate("/verify-success", { replace: true, state: { type: "password" } });
    } catch (err) {
      setError(err.message || "Unable to reset your password.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 p-4 text-white">
        <section className="w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-8 text-center">
          <span className="text-4xl">⚠️</span>
          <h1 className="mt-4 text-xl font-bold">Invalid reset link</h1>
          <p className="mt-2 text-sm text-gray-400">
            The reset token is missing. Request a new password reset link.
          </p>
          <Link to="/forgot-password" className="mt-6 inline-block rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold hover:bg-violet-500">
            Request new link
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4 py-10 text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-7 sm:p-9">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-3xl">
          🔑
        </div>

        <h1 className="mt-6 text-2xl font-bold">Create a new password</h1>
        <p className="mt-2 text-sm text-gray-400">
          Choose a strong password that you haven't used before.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium">New password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                required
                className="w-full rounded-xl border border-white/10 bg-gray-800 p-3 pr-16 text-white outline-none focus:border-violet-500"
                placeholder="Enter new password"
              />
              <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white">
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium">Confirm new password</label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                required
                className="w-full rounded-xl border border-white/10 bg-gray-800 p-3 pr-16 text-white outline-none focus:border-violet-500"
                placeholder="Confirm new password"
              />
              <button type="button" onClick={() => setShowConfirmPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white">
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="rounded-xl bg-gray-800/70 p-4">
            <p className="text-xs font-semibold text-gray-300">Password requirements</p>
            <ul className="mt-2 space-y-1 text-xs text-gray-400">
              <li className={password.length >= 8 ? "text-emerald-400" : ""}>• At least 8 characters</li>
              <li className={/[A-Z]/.test(password) ? "text-emerald-400" : ""}>• One uppercase letter</li>
              <li className={/[a-z]/.test(password) ? "text-emerald-400" : ""}>• One lowercase letter</li>
              <li className={/[0-9]/.test(password) ? "text-emerald-400" : ""}>• One number</li>
            </ul>
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-300">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="w-full rounded-xl bg-violet-600 p-3 font-semibold hover:bg-violet-500 disabled:opacity-50">
            {loading ? "Updating password..." : "Reset password"}
          </button>
        </form>

        <Link to="/login" className="mt-6 block text-center text-sm text-gray-400 hover:text-white">
          Back to sign in
        </Link>
      </section>
    </main>
  );
}
