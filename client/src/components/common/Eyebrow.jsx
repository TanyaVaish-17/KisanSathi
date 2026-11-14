import React from "react";

export default function Eyebrow({ children, className = "" }) {
  return (
    <p
      className={`font-mono text-xs sm:text-sm font-semibold uppercase tracking-[.2em] text-forest-950 ${className}`}
    >
      {children}
    </p>
  );
}
