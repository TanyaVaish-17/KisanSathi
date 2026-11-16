import React, { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import StarRating from "../../components/StarRating";
import { useLanguage } from "../../context/LanguageContext";
import api from "../../services/api";

const emptyData = { summary: { count: 0, average: 0, distribution: {} }, feedback: [] };

export default function AdminFeedback() {
  const { isHindi } = useLanguage();
  const [centers, setCenters] = useState([]);
  const [center, setCenter] = useState("");
  const [rating, setRating] = useState("");
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/centers")
      .then((res) => setCenters(res.data.centers || []))
      .catch(() => setCenters([]));
  }, []);

  const load = useCallback(() => {
    api
      .get("/feedback", {
        params: { center: center || undefined, rating: rating || undefined, limit: 100 },
      })
      .then((res) => {
        setData(res.data);
        setError("");
      })
      .catch((err) =>
        setError(
          err.response?.data?.message ||
            (isHindi ? "फीडबैक लोड नहीं हो सका" : "Could not load feedback")
        )
      )
      .finally(() => setLoading(false));
  }, [center, rating, isHindi]);

  useEffect(() => {
    load();
  }, [load]);

  const { summary, feedback } = data;

  const selectClass =
    "rounded-btn border border-line-soft bg-white px-3 py-2 text-sm text-forest-950 focus:outline-none focus:ring-2 focus:ring-forest-950";

  return (
    <AdminLayout
      title={isHindi ? "किसान फीडबैक" : "Farmer Feedback"}
      subtitle={
        isHindi
          ? "पूरी हुई यात्राओं पर किसानों की रेटिंग और टिप्पणियाँ।"
          : "Ratings and comments from farmers after completed visits."
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-card border border-line-strong bg-white p-5">
          <p className="font-mono text-xs uppercase tracking-wider text-slate-muted">
            {isHindi ? "औसत रेटिंग" : "Average rating"}
          </p>
          <p className="mt-2 text-4xl font-bold text-forest-950">
            {summary.count ? summary.average.toFixed(1) : "—"}
          </p>
          <div className="mt-2">
            <StarRating value={Math.round(summary.average)} size="sm" />
          </div>
        </div>

        <div className="rounded-card border border-line-strong bg-white p-5">
          <p className="font-mono text-xs uppercase tracking-wider text-slate-muted">
            {isHindi ? "कुल समीक्षाएँ" : "Total reviews"}
          </p>
          <p className="mt-2 text-4xl font-bold text-forest-950">{summary.count}</p>
        </div>

        <div className="rounded-card border border-line-strong bg-white p-5">
          <p className="font-mono text-xs uppercase tracking-wider text-slate-muted">
            {isHindi ? "रेटिंग वितरण" : "Rating breakdown"}
          </p>
          <div className="mt-3 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = summary.distribution[star] || 0;
              const percent = summary.count ? Math.round((count / summary.count) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-3 font-mono text-slate-muted">{star}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
                    <div className="h-full bg-warn" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="w-6 text-right font-mono text-slate-muted">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <select
          aria-label={isHindi ? "केंद्र चुनें" : "Filter by center"}
          value={center}
          onChange={(event) => {
            setLoading(true);
            setCenter(event.target.value);
          }}
          className={selectClass}
        >
          <option value="">{isHindi ? "सभी केंद्र" : "All centers"}</option>
          {centers.map((item) => (
            <option key={item._id} value={item._id}>
              {item.name}
            </option>
          ))}
        </select>

        <select
          aria-label={isHindi ? "रेटिंग चुनें" : "Filter by rating"}
          value={rating}
          onChange={(event) => {
            setLoading(true);
            setRating(event.target.value);
          }}
          className={selectClass}
        >
          <option value="">{isHindi ? "सभी रेटिंग" : "All ratings"}</option>
          {[5, 4, 3, 2, 1].map((star) => (
            <option key={star} value={star}>
              {star} {isHindi ? "स्टार" : star === 1 ? "star" : "stars"}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p role="alert" className="mt-6 rounded-btn bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="mt-6 space-y-4">
        {loading && (
          <p className="text-sm text-slate-muted">{isHindi ? "लोड हो रहा है..." : "Loading..."}</p>
        )}

        {!loading && !error && feedback.length === 0 && (
          <p className="rounded-card border border-line-strong bg-white p-8 text-center text-sm text-slate-muted">
            {isHindi ? "अभी कोई फीडबैक नहीं है।" : "No feedback yet."}
          </p>
        )}

        {!loading &&
          feedback.map((item) => (
            <div
              key={item._id}
              className="flex flex-col gap-3 rounded-card border border-line-strong bg-white p-5 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <StarRating value={item.rating} size="sm" />
                  <span className="font-mono text-xs text-slate-muted">#{item.token?.tokenCode}</span>
                </div>
                <p className="mt-2 text-sm text-forest-950">
                  {item.comment || (isHindi ? "कोई टिप्पणी नहीं" : "No comment")}
                </p>
                <p className="mt-2 text-xs text-slate-muted">
                  {item.farmer?.name}
                  {item.farmer?.village ? ` · ${item.farmer.village}` : ""} · {item.center?.name} ·{" "}
                  {(isHindi && item.service?.nameHi ? item.service.nameHi : item.service?.name) || ""}
                </p>
              </div>
              <span className="shrink-0 font-mono text-xs text-slate-muted">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
      </div>
    </AdminLayout>
  );
}