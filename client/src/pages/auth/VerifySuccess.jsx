
import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function VerifySuccess() {
  const location = useLocation();

  const type = location.state?.type || "email";
  const isPasswordReset = type === "password";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4 py-10 text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-8 text-center sm:p-10">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10">
          <span className="text-5xl">✓</span>
        </div>

        <span className="mt-6 inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          SUCCESS
        </span>

        <h1 className="mt-5 text-2xl font-bold">
          {isPasswordReset ? "Password updated!" : "Email verified!"}
        </h1>

        <p className="mt-3 leading-6 text-gray-400">
          {isPasswordReset
            ? "Your password has been changed successfully. You can now sign in using your new password."
            : "Your email address has been verified. Your account is ready for the next step."}
        </p>

        <Link
          to="/login"
          replace
          className="mt-8 block w-full rounded-xl bg-violet-600 px-5 py-3 font-semibold hover:bg-violet-500"
        >
          Continue to login
        </Link>

        <Link to="/" className="mt-5 inline-block text-sm text-gray-400 hover:text-white">
          Back to home
        </Link>
      </section>
    </main>
  );
}
