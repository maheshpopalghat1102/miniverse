
import React, { useState } from "react";
import { Link } from "react-router-dom";
import SearchBar from "../components/ui/SearchBar";

const faqs = [
  {
    question: "How do I create a game room?",
    answer: "Open Multiplayer, select Create Room, choose a game and room settings, then create the room. Once the room API is connected, the server will provide your room code.",
    category: "Rooms",
  },
  {
    question: "How do I join a private room?",
    answer: "Open Join Room, enter the room code and provide the password if the room requires one.",
    category: "Rooms",
  },
  {
    question: "How can I add friends?",
    answer: "Use the Friends page to find players and send friend requests. You can accept or decline incoming requests.",
    category: "Social",
  },
  {
    question: "How do I change my profile?",
    answer: "Open your Profile page and select Edit Profile to update your display name, username, bio, country, and language.",
    category: "Account",
  },
  {
    question: "How do I change the app theme?",
    answer: "Open Settings and select one of the available MiniVerse themes.",
    category: "Settings",
  },
  {
    question: "What should I do if a player behaves badly?",
    answer: "Use the reporting feature when available. Include accurate details so moderators can review the report.",
    category: "Safety",
  },
];

export default function Help() {
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState(0);

  const filteredFaqs = faqs.filter((faq) =>
    `${faq.question} ${faq.answer} ${faq.category}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-950 p-4 text-white sm:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <span className="text-5xl">💡</span>
          <h1 className="mt-4 text-3xl font-bold">How can we help?</h1>
          <p className="mt-2 text-gray-400">Find answers to common MiniVerse questions.</p>
        </div>

        <div className="mx-auto mt-7 max-w-2xl">
          <SearchBar value={search} onChange={setSearch} placeholder="Search help articles..." />
        </div>

        <section className="mt-9 space-y-3">
          {filteredFaqs.length ? filteredFaqs.map((faq, index) => (
            <article key={faq.question} className="overflow-hidden rounded-xl border border-white/10 bg-gray-900">
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                aria-expanded={openIndex === index}
                className="flex w-full items-center justify-between gap-4 p-5 text-left"
              >
                <span>
                  <span className="mb-1 block text-xs text-violet-300">{faq.category}</span>
                  <span className="font-semibold">{faq.question}</span>
                </span>
                <span className="text-xl text-gray-400">{openIndex === index ? "−" : "+"}</span>
              </button>
              {openIndex === index && (
                <div className="border-t border-white/5 px-5 py-4 text-sm leading-6 text-gray-400">
                  {faq.answer}
                </div>
              )}
            </article>
          )) : (
            <p className="rounded-xl border border-white/10 bg-gray-900 p-8 text-center text-gray-400">
              No help articles matched your search.
            </p>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6 text-center">
          <h2 className="text-lg font-bold">Still need help?</h2>
          <p className="mt-2 text-sm text-gray-400">Send us a message and describe your issue.</p>
          <Link to="/contact" className="mt-4 inline-block rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold hover:bg-violet-500">
            Contact support
          </Link>
        </section>
      </div>
    </main>
  );
}
