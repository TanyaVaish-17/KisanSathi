import React from "react";

export default function Chip({ children, variant = "default", className = "" }) {
  const bg =
    variant === "highlight"
      ? "bg-lime-brand text-forest-950"
      : variant === "dark"
      ? "bg-forest-950 text-lime-300"
      : variant === "orange"
      ? "bg-warn/20 text-forest-950"
      : "bg-mint-200 text-forest-950";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-semibold uppercase tracking-[0.04em] ${bg} ${className}`}
    >
      {children}
    </span>
  );
}
