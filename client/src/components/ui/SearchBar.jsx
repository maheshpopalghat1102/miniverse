

import React from "react";

export default function SearchBar({
  value = "",
  onChange,
  onSearch,
  placeholder = "Search...",
  disabled = false,
  className = "",
}) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch?.(value.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center gap-2 rounded-xl border border-white/10 bg-gray-900 px-3 py-2 focus-within:border-violet-500 ${className}`}
    >
      <span className="text-gray-500" aria-hidden="true">
        🔍
      </span>

      <input
        type="search"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="min-w-0 flex-1 bg-transparent py-1 text-sm text-white outline-none placeholder:text-gray-500 disabled:opacity-50"
        aria-label="Search"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange?.("")}
          disabled={disabled}
          aria-label="Clear search"
          className="px-1 text-gray-400 hover:text-white"
        >
          ×
        </button>
      )}

      {onSearch && (
        <button
          type="submit"
          disabled={disabled}
          className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-500 disabled:opacity-50"
        >
          Search
        </button>
      )}
    </form>
  );
}
