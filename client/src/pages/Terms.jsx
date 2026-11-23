
import React from "react";

const sections = [
  {
    title: "1. Acceptance of terms",
    content: "By accessing MiniVerse, you agree to follow these Terms and any additional rules displayed for specific games or features. If you do not agree, do not use the service.",
  },
  {
    title: "2. Accounts",
    content: "You are responsible for protecting your login credentials and activity under your account. Provide accurate registration information and notify the platform if you believe your account has been compromised.",
  },
  {
    title: "3. Fair gameplay",
    content: "Do not cheat, exploit bugs, manipulate scores, automate gameplay unfairly, interfere with multiplayer sessions, or attempt to gain unauthorized access to another user's account or room.",
  },
  {
    title: "4. User conduct",
    content: "Do not harass, threaten, impersonate, spam, or share unlawful or abusive content. Respect other players and follow game-specific safety rules.",
  },
  {
    title: "5. Rooms and invitations",
    content: "Room hosts and players must follow room rules. Do not share private room credentials without permission or attempt to bypass room access restrictions.",
  },
  {
    title: "6. Adult-only content",
    content: "Features designated for adults may only be used by eligible users after the required age checks. Users must follow all applicable laws and consent requirements.",
  },
  {
    title: "7. Intellectual property",
    content: "The MiniVerse name, branding, interface, and original platform materials may be protected by intellectual property laws. Do not copy or redistribute protected materials without authorization.",
  },
  {
    title: "8. Suspension and termination",
    content: "Access may be restricted or accounts suspended for violations, security risks, abuse, or legal requirements, subject to applicable law and any required notice or appeal process.",
  },
  {
    title: "9. Service availability",
    content: "The platform may change, pause, or discontinue features. Online games may experience interruptions, maintenance, or loss of connectivity.",
  },
  {
    title: "10. Changes to terms",
    content: "Updated terms should be published with a new effective date. Continued use after changes take effect may constitute acceptance where permitted by applicable law.",
  },
];

export default function Terms() {
  return (
    <main className="min-h-screen bg-gray-950 px-4 py-10 text-white sm:px-8">
      <article className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold text-violet-300">MINIVERSE LEGAL</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Terms of Service</h1>
        <p className="mt-3 text-sm text-gray-500">Template for review · Effective date: [Insert date]</p>

        <div className="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm leading-6 text-amber-200">
          Publication note: This is a starter template, not legal advice. Have it reviewed for your business, jurisdiction, age restrictions, and actual service features before launch.
        </div>

        <p className="mt-7 leading-7 text-gray-300">
          These Terms govern your access to and use of MiniVerse, including its games, player accounts, rooms, and social features.
        </p>

        <div className="mt-8 space-y-7">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-bold">{section.title}</h2>
              <p className="mt-2 leading-7 text-gray-400">{section.content}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
