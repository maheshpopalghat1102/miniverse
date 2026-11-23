
import React, { useEffect, useRef, useState } from "react";
import Avatar from "../common/Avatar";

function GameChat({
  messages = [],
  currentUserId,
  onSend,
  disabled = false,
  title = "Game Chat",
}) {
  const [message, setMessage] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages.length]);

  function handleSubmit(event) {
    event.preventDefault();

    const content = message.trim();

    if (!content || disabled || !onSend) return;

    onSend(content);
    setMessage("");
  }

  function formatTime(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <section className="flex h-[420px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
      <header className="border-b border-white/10 px-4 py-3">
        <h3 className="font-semibold text-white">
          💬 {title}
        </h3>
      </header>

      <div
        className="flex-1 space-y-4 overflow-y-auto p-4"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-500">
            No messages yet. Start the conversation!
          </p>
        )}

        {messages.map((item, index) => {
          const senderId = item.sender?._id || item.sender?.id || item.senderId;
          const isMine = senderId === currentUserId;
          const senderName =
            item.sender?.username ||
            item.senderName ||
            "Player";

          return (
            <div
              key={item._id || item.id || index}
              className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : ""}`}
            >
              {!isMine && (
                <Avatar
                  src={item.sender?.avatar}
                  name={senderName}
                  size="xs"
                />
              )}

              <div className={`max-w-[80%] ${isMine ? "text-right" : ""}`}>
                {!isMine && (
                  <p className="mb-1 text-[10px] text-slate-500">
                    {senderName}
                  </p>
                )}

                <div
                  className={[
                    "break-words rounded-2xl px-3 py-2 text-sm",
                    isMine
                      ? "rounded-br-sm bg-violet-600 text-white"
                      : "rounded-bl-sm bg-slate-800 text-slate-200",
                  ].join(" ")}
                >
                  {item.content || item.message}
                </div>

                <p className="mt-1 text-[10px] text-slate-500">
                  {formatTime(item.createdAt || item.timestamp)}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex gap-2 border-t border-white/10 p-3"
      >
        <input
          type="text"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={disabled ? "Chat unavailable" : "Type a message..."}
          maxLength={500}
          disabled={disabled}
          aria-label="Chat message"
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-500 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </section>
  );
}

export default GameChat;
