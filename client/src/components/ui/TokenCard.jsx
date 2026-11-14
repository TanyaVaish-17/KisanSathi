import React from "react";
import { ListOrdered, Users, Clock, Megaphone } from "lucide-react";
import "./token-card.css";

const DEFAULT_LABELS = {
  token: "Token",
  yourToken: "your token",
  position: "Position",
  ahead: "Ahead",
  wait: "Est. wait",
  nowServing: "Now serving",
  now: "Now",
  min: "min",
  people: "people",
  cancel: "Cancel",
  details: "Details",
  status: {
    waiting: "Waiting",
    serving: "Your turn",
    delayed: "Delayed",
    completed: "Done",
    cancelled: "Cancelled",
    skipped: "Skipped",
    no_show: "Missed",
  },
  stamp: {
    waiting: "Waiting",
    serving: "Serving",
    delayed: "Delayed",
    completed: "Done",
    cancelled: "Cancelled",
    skipped: "Skipped",
    no_show: "Missed",
  },
};

const DOTS = [
  [10, 10], [30, 10], [50, 10], [70, 10],
  [20, 20], [40, 20], [60, 20],
  [10, 30], [30, 30], [50, 30], [70, 30],
];

export default function TokenCard({
  tokenCode,
  status = "waiting",
  delayed = false,
  centerName = "Dasna Krishi Mandi",
  serviceName = "Crop Registration",
  counterName = "Counter 1",
  position = null,
  aheadCount = 0,
  estimatedWaitMinutes = 0,
  nowServing = null,
  arrivalMessage,
  lang = "en",
  labels,
  onCancel,
  onDetails,
}) {
  const l = { ...DEFAULT_LABELS, ...labels };
  const active = status === "waiting" || status === "serving";
  const visual = delayed && status === "waiting" ? "delayed" : status;

  const positionText = !active ? "-" : status === "serving" ? l.now : `#${position ?? "-"}`;
  const aheadText = active ? `${aheadCount} ${l.people}` : "-";
  const waitText = !active ? "-" : status === "serving" ? l.now : `~${estimatedWaitMinutes} ${l.min}`;

  const stats = [
    { Icon: ListOrdered, label: l.position, value: positionText },
    { Icon: Users, label: l.ahead, value: aheadText },
    { Icon: Clock, label: l.wait, value: waitText },
    { Icon: Megaphone, label: l.nowServing, value: nowServing ?? "-" },
  ];

  return (
    <article
      className="token-card"
      data-status={visual}
      lang={lang}
      aria-label={`${l.token} ${tokenCode}, ${l.status[visual] || visual}`}
    >
      <div className="token-card__grid" aria-hidden="true" />
      <div className="token-card__dots" aria-hidden="true" />

      <svg className="token-card__bold-pattern" viewBox="0 0 100 100" aria-hidden="true">
        <path
          strokeDasharray="15 10"
          strokeWidth="10"
          stroke="currentColor"
          fill="none"
          d="M0,0 L100,0 L100,100 L0,100 Z"
        />
      </svg>

      <header className="token-card__title">
        <span className="token-card__title-text">{centerName}</span>
        <span className="token-card__tag">{l.status[visual] || visual}</span>
      </header>

      <div className="token-card__body">
        <p className="token-card__desc">
          {serviceName} · {counterName}
        </p>

        <div className="token-card__stats" aria-live="polite">
          {stats.map(({ Icon, label, value }) => (
            <div className="token-card__stat" key={label}>
              <div className="token-card__stat-icon" aria-hidden="true">
                <Icon size={14} strokeWidth={2.5} />
              </div>
              <span className="token-card__stat-text">
                <span className="token-card__stat-label">{label}</span>
                <strong className="token-card__stat-value">{value}</strong>
              </span>
            </div>
          ))}
        </div>

        {arrivalMessage && active && <p className="token-card__arrival">{arrivalMessage}</p>}

        <div className="token-card__actions">
          <div className="token-card__code">
            <span className="token-card__code-prefix">#</span>
            {tokenCode}
            <span className="token-card__code-label">{l.yourToken}</span>
          </div>

          {status === "waiting" && onCancel ? (
            <button type="button" className="token-card__button" onClick={onCancel}>
              {l.cancel}
            </button>
          ) : onDetails ? (
            <button type="button" className="token-card__button" onClick={onDetails}>
              {l.details}
            </button>
          ) : null}
        </div>
      </div>

      <svg className="token-card__dots-pattern" viewBox="0 0 80 40" aria-hidden="true">
        {DOTS.map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} fill="currentColor" r="3" cx={cx} cy={cy} />
        ))}
      </svg>

      <div className="token-card__accent-shape" aria-hidden="true" />
      <div className="token-card__corner" aria-hidden="true" />
      <div className="token-card__stamp" aria-hidden="true">
        <span className="token-card__stamp-text">{l.stamp[visual] || visual}</span>
      </div>
    </article>
  );
}
