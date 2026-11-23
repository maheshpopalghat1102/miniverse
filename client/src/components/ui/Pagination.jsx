
import React from "react";

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  siblingCount = 1,
  className = "",
}) {
  const total = Math.max(1, Number(totalPages) || 1);
  const current = Math.min(total, Math.max(1, Number(currentPage) || 1));

  const getPages = () => {
    const pages = [];
    const start = Math.max(1, current - siblingCount);
    const end = Math.min(total, current + siblingCount);

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    if (end < total) {
      if (end < total - 1) pages.push("...");
      pages.push(total);
    }

    return pages;
  };

  const buttonStyle =
    "min-w-9 rounded-lg border px-3 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav
      aria-label="Pagination"
      className={`flex flex-wrap items-center justify-center gap-2 ${className}`}
    >
      <button
        type="button"
        disabled={current === 1}
        onClick={() => onPageChange?.(current - 1)}
        className={`${buttonStyle} border-white/10 text-gray-300 hover:bg-white/10`}
      >
        Previous
      </button>

      {getPages().map((page, index) =>
        page === "..." ? (
          <span key={`ellipsis-${index}`} className="px-1 text-gray-500">
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            aria-current={current === page ? "page" : undefined}
            onClick={() => onPageChange?.(page)}
            className={`${buttonStyle} ${
              current === page
                ? "border-violet-500 bg-violet-600 text-white"
                : "border-white/10 text-gray-300 hover:bg-white/10"
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        disabled={current === total}
        onClick={() => onPageChange?.(current + 1)}
        className={`${buttonStyle} border-white/10 text-gray-300 hover:bg-white/10`}
      >
        Next
      </button>
    </nav>
  );
}
