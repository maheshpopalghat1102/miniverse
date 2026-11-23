
import React, { useState } from "react";

export default function Tabs({
  tabs = [],
  activeTab,
  defaultTab,
  onChange,
  variant = "underline",
  className = "",
}) {
  const [internalTab, setInternalTab] = useState(
    defaultTab || tabs[0]?.value || ""
  );

  const isControlled = activeTab !== undefined;
  const selectedTab = isControlled ? activeTab : internalTab;

  const selectTab = (value) => {
    if (!isControlled) setInternalTab(value);
    onChange?.(value);
  };

  const variants = {
    underline: {
      active: "border-violet-500 text-violet-300",
      inactive: "border-transparent text-gray-400 hover:text-white",
    },
    pills: {
      active: "bg-violet-600 text-white",
      inactive: "text-gray-400 hover:bg-white/10 hover:text-white",
    },
    boxed: {
      active: "border-violet-500 bg-violet-500/10 text-violet-300",
      inactive: "border-white/10 text-gray-400 hover:text-white",
    },
  };

  const styles = variants[variant] || variants.underline;

  return (
    <div className={className}>
      <div
        className={`flex flex-wrap gap-2 ${
          variant === "underline" ? "border-b border-white/10" : ""
        }`}
        role="tablist"
        aria-label="Content sections"
      >
        {tabs.map((tab) => {
          const isActive = selectedTab === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              onClick={() => selectTab(tab.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                variant === "underline"
                  ? `rounded-none border-b-2 ${isActive ? "border-violet-500" : "border-transparent"}`
                  : variant === "boxed"
                    ? "border"
                    : ""
              } ${isActive ? styles.active : styles.inactive}`}
            >
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 text-xs opacity-70">{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
