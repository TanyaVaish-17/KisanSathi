import React from "react";
import {
  BellRing,
  Ticket,
  CircleCheck,
  SkipForward,
  UserX,
  CircleX,
  Clock,
  TriangleAlert,
} from "lucide-react";
import { timeAgo } from "../utils/timeAgo";

const ICONS = {
  token_created: Ticket,
  token_called: BellRing,
  token_completed: CircleCheck,
  token_skipped: SkipForward,
  token_no_show: UserX,
  token_cancelled: CircleX,
  queue_progress: Clock,
  delay: TriangleAlert,
};

const TITLES_HI = {
  token_created: "टोकन बुक हुआ",
  token_called: "आपकी बारी है",
  token_completed: "सेवा पूरी हुई",
  token_skipped: "टोकन छोड़ा गया",
  token_no_show: "अनुपस्थित दर्ज",
  token_cancelled: "टोकन रद्द हुआ",
  queue_progress: "कतार अपडेट",
  delay: "देरी की सूचना",
};

export default function NotificationItem({ notification, isHindi, onRead }) {
  const Icon = ICONS[notification.type] || BellRing;
  const warning = notification.type === "delay";
  const title = isHindi ? TITLES_HI[notification.type] || notification.title : notification.title;
  const message = isHindi && notification.messageHi ? notification.messageHi : notification.message;

  return (
    <button
      type="button"
      onClick={() => {
        if (!notification.isRead) onRead(notification._id);
      }}
      className={`flex w-full cursor-pointer gap-3 border-b border-line-divider px-4 py-3 text-left transition-colors hover:bg-surface ${
        notification.isRead ? "bg-white" : "bg-mint-100/40"
      }`}
    >
      <span
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-btn ${
          warning ? "bg-warn/15 text-warn" : "bg-forest-950 text-lime-300"
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold text-forest-950">{title}</span>
          {!notification.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-forest-500" />}
        </span>
        <span className="mt-0.5 block text-sm text-slate-text">{message}</span>
        <span className="mt-1 block font-mono text-[10px] uppercase tracking-wider text-slate-muted">
          {timeAgo(notification.createdAt, isHindi)}
        </span>
      </span>
    </button>
  );
}