import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import api from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import useLiveUpdates from "../hooks/useLiveUpdates";
import NotificationItem from "./NotificationItem";

export default function NotificationBell() {
  const { isHindi } = useLanguage();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const boxRef = useRef(null);

  const load = useCallback(() => {
    api
      .get("/notifications", { params: { limit: 8 } })
      .then((res) => {
        setItems(res.data.notifications);
        setUnread(res.data.unreadCount);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useLiveUpdates({ events: ["notification:new"], onEvent: load });

  useEffect(() => {
    if (!open) return undefined;

    const closeOutside = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const markRead = async (id) => {
    try {
      const res = await api.patch(`/notifications/${id}/read`);
      setItems((list) => list.map((item) => (item._id === id ? res.data.notification : item)));
      setUnread(res.data.unreadCount);
    } catch {
      load();
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
    } finally {
      load();
    }
  };

  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button"
        onClick={() => {
          if (!open) load();
          setOpen(!open);
        }}
        aria-label={isHindi ? "सूचनाएँ" : "Notifications"}
        aria-expanded={open}
        className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-btn border border-line-soft text-forest-950 hover:bg-surface"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 font-mono text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[22rem] max-w-[90vw] overflow-hidden rounded-card border border-line-strong bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-line-divider px-4 py-3">
            <span className="text-sm font-bold text-forest-950">
              {isHindi ? "सूचनाएँ" : "Notifications"}
            </span>
            <button
              type="button"
              onClick={markAllRead}
              disabled={unread === 0}
              className="flex cursor-pointer items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-forest-800 hover:underline disabled:cursor-default disabled:opacity-40"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              {isHindi ? "सभी पढ़ा हुआ" : "Mark all read"}
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && (
              <p className="px-4 py-6 text-center text-sm text-slate-muted">
                {isHindi ? "लोड हो रहा है..." : "Loading..."}
              </p>
            )}
            {!loading && items.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-slate-muted">
                {isHindi ? "अभी कोई सूचना नहीं है।" : "No notifications yet."}
              </p>
            )}
            {items.map((item) => (
              <NotificationItem
                key={item._id}
                notification={item}
                isHindi={isHindi}
                onRead={markRead}
              />
            ))}
          </div>

          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-line-divider px-4 py-3 text-center font-mono text-[11px] font-semibold uppercase tracking-wider text-forest-950 hover:bg-surface"
          >
            {isHindi ? "सभी देखें" : "View all"}
          </Link>
        </div>
      )}
    </div>
  );
}