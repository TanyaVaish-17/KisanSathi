import React from "react";

export default function CounterStatusPill({ status, showDelayNotice = true }) {
  let dotColor = "bg-forest-500";
  let label = "Active";

  if (status === "paused") {
    dotColor = "bg-warn";
    label = showDelayNotice ? "Paused · Delays possible" : "Paused";
  } else if (status === "inactive") {
    dotColor = "bg-slate-muted";
    label = "Inactive";
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-white px-2.5 py-1 text-xs font-medium text-forest-950 shadow-none">
      <span className={`h-2 w-2 rounded-full ${dotColor}`} />
      <span>{label}</span>
    </span>
  );
}
