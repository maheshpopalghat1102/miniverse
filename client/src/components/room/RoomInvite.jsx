
import React, { useState } from "react";
import Button from "../common/Button";
import Input from "../common/Input";

function RoomInvite({
  roomCode,
  roomName = "MiniVerse Game Room",
  className = "",
}) {
  const [copied, setCopied] = useState(false);

  const inviteUrl = roomCode
    ? `${window.location.origin}/rooms/${encodeURIComponent(roomCode)}`
    : "";

  const inviteMessage = `Join my MiniVerse game room "${roomName}"!\nRoom Code: ${roomCode}\nJoin here: ${inviteUrl}`;

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function handleShare() {
    if (!roomCode) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: roomName,
          text: `Join my MiniVerse game room. Room code: ${roomCode}`,
          url: inviteUrl,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          await copyText(inviteMessage);
        }
      }
    } else {
      await copyText(inviteMessage);
    }
  }

  return (
    <section className={`space-y-4 rounded-2xl border border-white/10 bg-slate-900 p-5 ${className}`}>
      <div>
        <h3 className="font-bold text-white">
          ✉️ Invite Friends
        </h3>

        <p className="mt-1 text-xs text-slate-400">
          Share your room link or code with friends.
        </p>
      </div>

      <Input
        label="Invitation Link"
        name="inviteUrl"
        value={inviteUrl}
        readOnly
        rightElement={
          <button
            type="button"
            onClick={() => copyText(inviteUrl)}
            className="text-xs font-semibold text-violet-300 hover:text-white"
          >
            Copy
          </button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={handleShare}
          fullWidth
          disabled={!roomCode}
        >
          ↗ Share Invitation
        </Button>

        <Button
          variant="outline"
          onClick={() => copyText(inviteMessage)}
          fullWidth
          disabled={!roomCode}
        >
          {copied ? "✓ Copied" : "Copy Message"}
        </Button>
      </div>

      <p className="text-center text-xs text-slate-500">
        Only share this invitation with people you want in your room.
      </p>
    </section>
  );
}

export default RoomInvite;
