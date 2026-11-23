
import { useState } from "react";
import api from "../services/api";

const initialForm = {
  name: "",
  email: "",
  subject: "General inquiry",
  message: "",
};

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    if (form.message.trim().length < 10) {
      setError("Your message must contain at least 10 characters.");
      return;
    }

    setLoading(true);
    try {
      const result = await api.post("/contact", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        subject: form.subject,
        message: form.message.trim(),
      });
      setSuccess(result.message || "Your message was received.");
      setForm(initialForm);
    } catch (requestError) {
      setError(requestError.message || "Unable to send your message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 p-4 text-white sm:p-8">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-5">
        <section className="lg:col-span-2">
          <p className="text-sm font-semibold text-violet-300">WE'RE HERE TO HELP</p>
          <h1 className="mt-2 text-3xl font-bold">Contact us</h1>
          <p className="mt-4 leading-7 text-gray-400">
            Have a question, suggestion, or issue with MiniVerse? Send a message
            using the form.
          </p>

          <div className="mt-8 space-y-4">
            <div className="rounded-xl border border-white/10 bg-gray-900 p-4">
              <span className="text-2xl">💬</span>
              <h2 className="mt-2 font-semibold">General support</h2>
              <p className="mt-1 text-sm text-gray-400">For account, game, and technical questions.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-gray-900 p-4">
              <span className="text-2xl">🛡️</span>
              <h2 className="mt-2 font-semibold">Safety and reports</h2>
              <p className="mt-1 text-sm text-gray-400">For player conduct or platform safety concerns.</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-gray-900 p-6 sm:p-8 lg:col-span-3">
          <h2 className="text-xl font-bold">Send a message</h2>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">Name *</label>
              <input id="name" name="name" value={form.name} onChange={update} maxLength={80} required className="w-full rounded-xl border border-white/10 bg-gray-800 p-3 text-white outline-none focus:border-violet-500" placeholder="Your name" />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">Email *</label>
              <input id="email" name="email" type="email" value={form.email} onChange={update} maxLength={254} required className="w-full rounded-xl border border-white/10 bg-gray-800 p-3 text-white outline-none focus:border-violet-500" placeholder="you@example.com" />
            </div>

            <div>
              <label htmlFor="subject" className="mb-2 block text-sm font-medium">Subject</label>
              <select id="subject" name="subject" value={form.subject} onChange={update} className="w-full rounded-xl border border-white/10 bg-gray-800 p-3 text-white">
                <option>General inquiry</option>
                <option>Account support</option>
                <option>Technical issue</option>
                <option>Report a problem</option>
                <option>Suggestion or feedback</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="mb-2 block text-sm font-medium">Message *</label>
              <textarea id="message" name="message" value={form.message} onChange={update} rows={5} maxLength={3000} required className="w-full resize-y rounded-xl border border-white/10 bg-gray-800 p-3 text-white outline-none focus:border-violet-500" placeholder="How can we help?" />
              <p className="mt-1 text-right text-xs text-gray-500">{form.message.length}/3000</p>
            </div>

            {error && <p role="alert" className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}
            {success && <p role="status" className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">{success}</p>}

            <button type="submit" disabled={loading} className="w-full rounded-xl bg-violet-600 p-3 font-semibold hover:bg-violet-500 disabled:opacity-50">
              {loading ? "Sending..." : "Send message"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
