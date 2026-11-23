
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (event) => {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validate = () => {
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username)) {
      return "Username must be 3–20 characters using letters, numbers, or underscores.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return "Please enter a valid email address.";
    }

    if (form.password.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    if (!/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      return "Use at least one uppercase letter, one lowercase letter, and one number.";
    }

    if (form.password !== form.confirmPassword) {
      return "Passwords do not match.";
    }

    if (!form.acceptTerms) {
      return "Please accept the Terms of Service and Privacy Policy.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      navigate(`/verify-email${result.emailVerificationSent ? "" : "?delivery=unavailable"}`, {
        replace: true,
        state: { email: form.email.trim(), emailVerificationSent: result.emailVerificationSent },
      });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const passwordChecks = [
    ["At least 8 characters", form.password.length >= 8],
    ["One uppercase letter", /[A-Z]/.test(form.password)],
    ["One lowercase letter", /[a-z]/.test(form.password)],
    ["One number", /[0-9]/.test(form.password)],
  ];

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4 py-10 text-white">
      <div className="w-full max-w-lg">
        <div className="mb-7 text-center">
          <Link to="/" className="text-2xl font-black">
            Mini<span className="text-violet-400">Verse</span>
          </Link>
          <h1 className="mt-6 text-3xl font-bold">Create your account</h1>
          <p className="mt-2 text-sm text-gray-400">Join the MiniVerse gaming community.</p>
        </div>

        <section className="rounded-2xl border border-white/10 bg-gray-900 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-medium">Username</label>
              <input
                id="username"
                name="username"
                value={form.username}
                onChange={update}
                autoComplete="username"
                required
                minLength={3}
                maxLength={20}
                placeholder="Choose a username"
                className="w-full rounded-xl border border-white/10 bg-gray-800 p-3 text-white outline-none focus:border-violet-500"
              />
              <p className="mt-1 text-xs text-gray-500">3–20 letters, numbers, or underscores.</p>
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={update}
                autoComplete="email"
                required
                maxLength={254}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-gray-800 p-3 text-white outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={update}
                  autoComplete="new-password"
                  required
                  className="w-full rounded-xl border border-white/10 bg-gray-800 p-3 pr-16 text-white outline-none focus:border-violet-500"
                  placeholder="Create a strong password"
                />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white">
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {form.password && (
                <ul className="mt-3 grid grid-cols-2 gap-2">
                  {passwordChecks.map(([label, passed]) => (
                    <li key={label} className={`text-xs ${passed ? "text-emerald-400" : "text-gray-500"}`}>
                      {passed ? "✓" : "○"} {label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium">Confirm password</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={update}
                  autoComplete="new-password"
                  required
                  className="w-full rounded-xl border border-white/10 bg-gray-800 p-3 pr-16 text-white outline-none focus:border-violet-500"
                  placeholder="Enter password again"
                />
                <button type="button" onClick={() => setShowConfirmPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white">
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 text-sm leading-6 text-gray-400">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={form.acceptTerms}
                onChange={update}
                className="mt-1 h-4 w-4 shrink-0 accent-violet-500"
              />
              <span>
                I agree to the <Link to="/terms" className="text-violet-300 hover:underline">Terms of Service</Link> and <Link to="/privacy-policy" className="text-violet-300 hover:underline">Privacy Policy</Link>.
              </span>
            </label>

            {error && (
              <p role="alert" className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="w-full rounded-xl bg-violet-600 p-3 font-semibold hover:bg-violet-500 disabled:opacity-50">
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-violet-300 hover:underline">Sign in</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
