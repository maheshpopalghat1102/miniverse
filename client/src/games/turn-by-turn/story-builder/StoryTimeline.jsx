
import React, { useEffect, useRef } from "react";

function StoryTimeline({ entries = [] }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [entries.length]);

  if (!entries.length) {
    return (
      <div className="sb-timeline-empty">
        <span>📝</span>
        <p>Your story will appear here as players contribute.</p>
      </div>
    );
  }

  return (
    <section className="sb-timeline">
      <h3>Story Timeline</h3>

      <div className="sb-timeline-list">
        {entries.map((entry, index) => (
          <article
            className={[
              "sb-story-entry",
              entry.isOpening ? "sb-opening-entry" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            key={entry.entryId || `${entry.playerId}-${index}`}
          >
            <div className="sb-entry-marker">
              {entry.isOpening ? "📖" : index}
            </div>

            <div className="sb-entry-content">
              <div className="sb-entry-author">
                <strong>{entry.playerName}</strong>
                {entry.isOpening && <span>Opening</span>}
              </div>

              <p>{entry.content}</p>
            </div>
          </article>
        ))}

        <div ref={bottomRef} />
      </div>
    </section>
  );
}

export default StoryTimeline;
