
import React, { useState } from "react";
import Button from "../common/Button";

function RoomCode({
  code,
  onShare,
  className = "",
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={`rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4 ${className}`}>
      <p className="text-center text-xs font-semibold uppercase tracking-wider text-violet-300">
        Room Code
      </p>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
        <span className="break-all font-mono text-2xl font-black tracking-[0.2em] text-white sm:text-3xl">
          {code || "------"}
        </span>

        <Button
          size="sm"
          variant="outline"
          onClick={handleCopy}
          disabled={!code}
        >
          {copied ? "✓ Copied" : "Copy"}
        </Button>
      </div>

      <div className="mt-4 flex justify-center">
        <Button
          size="sm"
          variant="secondary"
          onClick={onShare}
          disabled={!code || !onShare}
        >
          ↗ Share Invite
        </Button>
      </div>

      <p className="mt-3 text-center text-xs text-slate-400">
        Share this code with friends to invite them.
      </p>
    </div>
  );
}

export default RoomCode;
