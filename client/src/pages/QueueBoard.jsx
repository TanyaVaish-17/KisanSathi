import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import Eyebrow from "../components/common/Eyebrow";
import Chip from "../components/common/Chip";
import CounterStatusPill from "../components/common/CounterStatusPill";
import { useLanguage } from "../context/LanguageContext";
import api from "../services/api";
import { RotateCw, Building2, Clock, Users, ArrowLeft } from "lucide-react";

export default function QueueBoard() {
  const { id } = useParams();
  const { isHindi } = useLanguage();

  const [center, setCenter] = useState(null);
  const [counters, setCounters] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBoard = () => {
    setLoading(true);
    Promise.all([
      api.get(`/centers/${id}`),
      api.get(`/counters?center=${id}`).catch(() => ({ data: { counters: [] } })),
    ])
      .then(([centerRes, countersRes]) => {
        if (centerRes.data.success) {
          setCenter(centerRes.data.center);
          setCounters(countersRes.data.counters || []);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBoard();
    const interval = setInterval(fetchBoard, 15000);
    return () => clearInterval(interval);
  }, [id]);

  return (
    <PublicLayout>
      <div className="border-b border-line-strong bg-surface px-6 py-10 sm:px-12 lg:px-20">
        <div className="mx-auto max-w-page">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-3">
                <Eyebrow>{isHindi ? "लाइव कतार बोर्ड" : "LIVE MANDI QUEUE BOARD"}</Eyebrow>
                <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-forest-600">
                  <span className="h-2 w-2 rounded-full bg-forest-500 animate-pulse" />
                  LIVE
                </span>
              </div>
              <h1 className="mt-2 text-3xl font-bold text-forest-950 sm:text-4xl">
                {center?.name || "Mandi Service Center"}
              </h1>
              <p className="mt-1 text-sm text-slate-text">
                {center?.address}, {center?.district}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to={`/centers/${id}`}
                className="flex items-center gap-1.5 rounded-btn border border-line-soft bg-white px-3.5 py-2 text-xs font-semibold text-forest-950 hover:bg-surface"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>{isHindi ? "केंद्र पृष्ठ" : "Center Overview"}</span>
              </Link>
              <button
                type="button"
                onClick={fetchBoard}
                className="flex items-center gap-1.5 rounded-btn bg-forest-950 px-3.5 py-2 text-xs font-semibold text-lime-300 hover:bg-forest-800"
              >
                <RotateCw className="h-3.5 w-3.5" />
                <span>{isHindi ? "ताज़ा करें" : "Refresh"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-page px-6 py-12 sm:px-12 lg:px-20">
        {loading && !center ? (
          <div className="h-64 animate-pulse rounded-card border border-line-strong bg-white" />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {counters.map((c, idx) => (
              <div
                key={c._id}
                className="rounded-card border-2 border-forest-950 bg-white p-6 shadow-none"
              >
                <div className="flex items-center justify-between border-b border-line-soft pb-4">
                  <div>
                    <span className="font-mono text-xs font-semibold uppercase text-slate-muted">
                      COUNTER
                    </span>
                    <h3 className="text-xl font-bold text-forest-950">{c.name}</h3>
                  </div>
                  <CounterStatusPill status={c.status} showDelayNotice={false} />
                </div>

                <div className="my-6 text-center">
                  <span className="font-mono text-xs uppercase tracking-wider text-slate-muted">
                    NOW SERVING
                  </span>
                  <div className="mt-2 text-4xl font-black text-forest-950">
                    {c.status === "active"
                      ? (c.currentToken ? `#${c.currentToken.tokenCode}` : "Idle")
                      : "—"}
                  </div>
                </div>

                <div className="rounded-btn border border-line-soft bg-surface p-3 text-xs flex justify-between">
                  <span className="text-slate-muted">Service:</span>
                  <span className="font-semibold text-forest-950">{c.service?.name || "General"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
