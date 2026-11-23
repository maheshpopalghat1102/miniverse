
import React, { useEffect } from "react";

const sizes = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-6xl",
};

function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnBackdrop = true,
  showCloseButton = true,
}) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          closeOnBackdrop &&
          event.target === event.currentTarget
        ) {
          onClose?.();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={`w-full ${sizes[size] || sizes.md} max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl`}
      >
        {(title || showCloseButton) && (
          <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-bold text-white"
              >
                {title}
              </h2>
            )}

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            )}
          </header>
        )}

        <div className="max-h-[65vh] overflow-y-auto p-5 text-slate-200">
          {children}
        </div>

        {footer && (
          <footer className="border-t border-white/10 px-5 py-4">
            {footer}
          </footer>
        )}
      </section>
    </div>
  );
}

export default Modal;
