
import React, { useState } from "react";

export default function Tooltip({
  content,
  children,
  position = "top",
  delay = 200,
  className = "",
}) {
  const [visible, setVisible] = useState(false);
  const [timer, setTimer] = useState(null);

  const positions = {
    top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
    bottom: "left-1/2 top-full mt-2 -translate-x-1/2",
    left: "right-full top-1/2 mr-2 -translate-y-1/2",
    right: "left-full top-1/2 ml-2 -translate-y-1/2",
  };

  const showTooltip = () => {
    const timeout = setTimeout(() => setVisible(true), delay);
    setTimer(timeout);
  };

  const hideTooltip = () => {
    if (timer) clearTimeout(timer);
    setTimer(null);
    setVisible(false);
  };

  return (
    <span
      className={`relative inline-flex ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}

      {visible && content && (
        <span
          role="tooltip"
          className={`pointer-events-none absolute z-50 w-max max-w-56 rounded-lg border border-white/10 bg-gray-950 px-3 py-2 text-xs text-white shadow-xl ${
            positions[position] || positions.top
          }`}
        >
          {content}
        </span>
      )}
    </span>
  );
}
