import React, { useCallback, useEffect, useState } from "react";
import { CheckCheck } from "lucide-react";
import PublicLayout from "../layouts/PublicLayout";
import Chip from "../components/common/Chip";
import NotificationItem from "../components/NotificationItem";
import { useLanguage } from "../context/LanguageContext";
import useLiveUpdates from "../hooks/useLiveUpdates";
import api from "../services/api";

export default function Notifications() {
  const { isHindi } = useLanguage();
  const [filter, setFilter] = useState("all");
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api
      .get("/notifications", {
        params: { limit: 100, unread: filter === "unread" ? "true" : undefined },
      })
      .then((res) => {
        setItems(res.data.notifications);
        setUnread(res.data.unreadCount);
        setError("");
      })
      .catch((err) =>
        setError(err.response?.data?.message || (isHindi ? "सूचनाएँ लोड नहीं हो सकीं" : "Could not load notifications"))
      )
      .finally(() => setLoading(false));
  }, [filter, isHindi]);

  useEffect(() => {
    load();
  }, [load]);

  useLiveUpdates({ events: ["notification:new"], onEvent: load });

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
    } finally {
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

  const changeFilter = (next) => {
    if (next === filter) return;
    setLoading(true);
    setFilter(next);
  };

  const tabClass = (name) =>
    `cursor-pointer rounded-btn border px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider ${
      filter === name
        ? "border-forest-950 bg-forest-950 text-lime-300"
        : "border-line-soft bg-white text-forest-950 hover:bg-surface"
    }`;

  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-forest-950">
              {isHindi ? "सूचनाएँ" : "Notifications"}
            </h1>
            {unread > 0 && (
              <Chip variant="highlight">
                {unread} {isHindi ? "नई" : "new"}
              </Chip>
            )}
          </div>

          <button
            type="button"
            onClick={markAllRead}
            disabled={unread === 0}
            className="flex cursor-pointer items-center gap-1.5 rounded-btn border border-line-soft px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-forest-950 hover:bg-surface disabled:cursor-default disabled:opacity-40"
          >
            <CheckCheck className="h-4 w-4" />
            {isHindi ? "सभी पढ़ा हुआ" : "Mark all read"}
          </button>
        </div>

        <div className="mt-6 flex gap-2">
          <button type="button" onClick={() => changeFilter("all")} className={tabClass("all")}>
            {isHindi ? "सभी" : "All"}
          </button>
          <button type="button" onClick={() => changeFilter("unread")} className={tabClass("unread")}>
            {isHindi ? "अपठित" : "Unread"}
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-6 rounded-btn bg-danger-soft px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="mt-6 overflow-hidden rounded-card border border-line-strong bg-white">
          {loading && (
            <p className="px-4 py-10 text-center text-sm text-slate-muted">
              {isHindi ? "लोड हो रहा है..." : "Loading..."}
            </p>
          )}
          {!loading && !error && items.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-slate-muted">
              {filter === "unread"
                ? isHindi
                  ? "कोई अपठित सूचना नहीं है।"
                  : "No unread notifications."
                : isHindi
                  ? "अभी कोई सूचना नहीं है।"
                  : "No notifications yet."}
            </p>
          )}
          {!loading &&
            items.map((item) => (
              <NotificationItem
                key={item._id}
                notification={item}
                isHindi={isHindi}
                onRead={markRead}
              />
            ))}
        </div>
      </div>
    </PublicLayout>
  );
}