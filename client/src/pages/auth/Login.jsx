
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (event) => {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const email = form.email.trim().toLowerCase();

    if (!email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      await login({
        email,
        password: form.password,
        rememberMe: form.rememberMe,
      });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Unable to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const redirectTo = location.state?.from?.pathname || "/dashboard";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4 py-10 text-white">
      <div className="w-full max-w-md">
        <div className="mb-7 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-black">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600">M</span>
            Mini<span className="text-violet-400">Verse</span>
          </Link>
          <h1 className="mt-7 text-3xl font-bold">Welcome back!</h1>
          <p className="mt-2 text-sm text-gray-400">Sign in and continue your gaming journey.</p>
        </div>

        <section className="rounded-2xl border border-white/10 bg-gray-900 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
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
                className="w-full rounded-xl border border-white/10 bg-gray-800 p-3 text-white outline-none placeholder:text-gray-500 focus:border-violet-500"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <Link to="/forgot-password" className="text-xs text-violet-300 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={update}
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-white/10 bg-gray-800 p-3 pr-16 text-white outline-none focus:border-violet-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm text-gray-400">
              <input
                type="checkbox"
                name="rememberMe"
                checked={form.rememberMe}
                onChange={update}
                className="h-4 w-4 accent-violet-500"
              />
              Remember me
            </label>

            {error && (
              <p role="alert" className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-gray-500">NEW TO MINIVERSE?</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <Link to="/register" className="block w-full rounded-xl border border-white/10 px-5 py-3 text-center text-sm font-semibold hover:bg-white/5">
            Create an account
          </Link>
        </section>

        <p className="mt-6 text-center text-xs text-gray-500">
          By continuing, you agree to our{" "}
          <Link to="/terms" className="text-violet-300 hover:underline">Terms</Link>
          {" "}and{" "}
          <Link to="/privacy-policy" className="text-violet-300 hover:underline">Privacy Policy</Link>.
        </p>
      </div>
    </main>
  );
}
