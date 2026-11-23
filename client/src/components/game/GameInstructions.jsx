
import React, { useState } from "react";

function GameInstructions({
  title = "How to Play",
  instructions = [],
  objective,
  controls = [],
  defaultOpen = true,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between px-4 py-4 text-left"
      >
        <span className="font-semibold text-white">
          📖 {title}
        </span>

        <span className="text-slate-400">
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {isOpen && (
        <div className="space-y-4 border-t border-white/10 p-4">
          {objective && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-violet-300">
                Objective
              </h4>
              <p className="text-sm leading-6 text-slate-400">
                {objective}
              </p>
            </div>
          )}

          {instructions.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-white">
                Rules
              </h4>

              <ol className="space-y-2">
                {instructions.map((instruction, index) => (
                  <li
                    key={index}
                    className="flex gap-3 text-sm leading-6 text-slate-400"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-xs font-bold text-violet-300">
                      {index + 1}
                    </span>

                    <span>{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {controls.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold text-white">
                Controls
              </h4>

              <div className="flex flex-wrap gap-2">
                {controls.map((control, index) => (
                  <span
                    key={index}
                    className="rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300"
                  >
                    {control}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default GameInstructions;
