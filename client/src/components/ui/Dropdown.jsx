
import React, { useEffect, useRef, useState } from "react";

export default function Dropdown({
  trigger,
  children,
  align = "right",
  width = "w-56",
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <div
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute top-full z-50 mt-2 ${width} ${
            align === "left" ? "left-0" : "right-0"
          } rounded-xl border border-white/10 bg-gray-900 p-2 shadow-2xl`}
          role="menu"
        >
          {typeof children === "function"
            ? children(() => setIsOpen(false))
            : React.Children.map(children, (child) =>
                React.isValidElement(child)
                  ? React.cloneElement(child, {
                      onClick: (event) => {
                        child.props.onClick?.(event);
                        setIsOpen(false);
                      },
                    })
                  : child
              )}
        </div>
      )}
    </div>
  );
}
