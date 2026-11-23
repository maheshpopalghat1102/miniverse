
import React from "react";

const sections = [
  {
    title: "1. Information we collect",
    content: "MiniVerse may collect account information such as username and email address, profile information you choose to provide, game statistics, friendships, room activity, and support messages. The exact information collected must match the features you enable.",
  },
  {
    title: "2. How we use information",
    content: "Information may be used to operate accounts, provide multiplayer games, maintain game history and leaderboards, manage friendships, protect platform security, and respond to support requests.",
  },
  {
    title: "3. Information sharing",
    content: "Profile details and activity may be visible to other users depending on your privacy settings. Information may also be processed by service providers needed to host and operate MiniVerse. We do not claim that data is never shared; actual practices must be documented accurately.",
  },
  {
    title: "4. Data security",
    content: "MiniVerse should use appropriate safeguards such as secure password hashing, encrypted network connections, access controls, and protected session management. No online service can guarantee absolute security.",
  },
  {
    title: "5. Data retention",
    content: "Account and game information should be retained only for legitimate operational, security, and legal purposes. Temporary room and session data may have separate expiry rules.",
  },
  {
    title: "6. Your choices and rights",
    content: "Depending on applicable law, you may be able to access, correct, or request deletion of your personal information. Account settings should provide privacy controls and a way to contact the platform about data requests.",
  },
  {
    title: "7. Children and age restrictions",
    content: "MiniVerse must apply age-appropriate safeguards. Any adult-only game category must be restricted using an appropriate age-verification process, not merely a self-declared checkbox.",
  },
  {
    title: "8. Policy updates",
    content: "This policy may be updated when platform features or legal requirements change. The published version should display its effective date and explain material changes.",
  },
];

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gray-950 px-4 py-10 text-white sm:px-8">
      <article className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold text-violet-300">MINIVERSE LEGAL</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Privacy Policy</h1>
        <p className="mt-3 text-sm text-gray-500">Template for review · Effective date: [Insert date]</p>

        <div className="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm leading-6 text-amber-200">
          Publication note: This is a starter template, not legal advice. Replace it with a policy that accurately describes your actual data practices and have it reviewed for applicable privacy laws before launch.
        </div>

        <p className="mt-7 leading-7 text-gray-300">
          This Privacy Policy explains how MiniVerse ("we", "our", or "the platform") handles information when you use our games and related services.
        </p>

        <div className="mt-8 space-y-7">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-bold">{section.title}</h2>
              <p className="mt-2 leading-7 text-gray-400">{section.content}</p>
            </section>
          ))}
        </div>

        <section className="mt-10 rounded-xl border border-white/10 bg-gray-900 p-5">
          <h2 className="font-bold">Privacy questions</h2>
          <p className="mt-2 text-sm text-gray-400">For privacy-related requests, contact the platform using its published support address.</p>
        </section>
      </article>
    </main>
  );
}
