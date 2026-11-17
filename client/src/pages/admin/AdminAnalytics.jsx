import { useCallback, useEffect, useState } from "react";
import { RotateCw } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import AdminLayout from "../../layouts/AdminLayout";
import { useLanguage } from "../../context/LanguageContext";
import api from "../../services/api";
import { formatDay, formatHour, shiftDateKey, todayKey, visibleHours } from "../../utils/analytics";

const COLORS = {
  completed: "#0e8f10",
  noShow: "#fe7e3b",
  cancelled: "#b8c2b6",
  line: "#032304",
  grid: "#e3e7e2",
  bar: "#12be15",
};

const RANGES = [7, 14, 30];

const minutesLabel = (value) => (value === null || value === undefined ? "—" : `${value} min`);

function StatCard({ label, value, note }) {
  return (
    <div className="rounded-card border border-line-strong bg-white p-5">
      <p className="font-mono text-xs uppercase tracking-wider text-slate-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold text-forest-950">{value}</p>
      {note && <p className="mt-1 text-xs text-slate-muted">{note}</p>}
    </div>
  );
}

function ChartCard({ title, note, children }) {
  return (
    <div className="rounded-card border border-line-strong bg-white p-5">
      <h2 className="text-base font-bold text-forest-950">{title}</h2>
      {note && <p className="mt-1 text-xs text-slate-muted">{note}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function AdminAnalytics() {
  const { isHindi } = useLanguage();
  const [days, setDays] = useState(7);
  const [centers, setCenters] = useState([]);
  const [center, setCenter] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/centers")
      .then((res) => setCenters(res.data.centers || []))
      .catch(() => setCenters([]));
  }, []);

  const load = useCallback(() => {
    const to = todayKey();
    const from = shiftDateKey(to, -(days - 1));

    api
      .get("/analytics", { params: { from, to, center: center || undefined } })
      .then((res) => {
        setData(res.data);
        setError("");
      })
      .catch((err) =>
        setError(
          err.response?.data?.message ||
            (isHindi ? "विश्लेषण लोड नहीं हो सका" : "Could not load analytics")
        )
      )
      .finally(() => setLoading(false));
  }, [days, center, isHindi]);

  useEffect(() => {
    load();
  }, [load]);

  const t = (en, hi) => (isHindi ? hi : en);

  const pickerClass = (active) =>
    `cursor-pointer rounded-btn border px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider ${
      active
        ? "border-forest-950 bg-forest-950 text-lime-300"
        : "border-line-soft bg-white text-forest-950 hover:bg-surface"
    }`;

  const summary = data?.summary;
  const hasData = summary && summary.totalTokens > 0;

  const daily = data?.daily.map((row) => ({ ...row, label: formatDay(row.date) })) || [];
  const hours = data ? visibleHours(data.peakHours).map((row) => ({ ...row, label: formatHour(row.hour) })) : [];
  const counters =
    data?.counters.map((row) => ({ ...row, label: `${row.centerName} · ${row.name}` })) || [];

  return (
    <AdminLayout
      title={t("Analytics", "विश्लेषण")}
      subtitle={t(
        "Waiting times, busy hours and counter usage, calculated from real token records.",
        "प्रतीक्षा समय, व्यस्त घंटे और काउंटर उपयोग, असली टोकन रिकॉर्ड से निकाले गए।"
      )}
      action={
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            load();
          }}
          className="flex cursor-pointer items-center gap-2 rounded-btn border border-line-soft bg-white px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-forest-950 hover:bg-surface"
        >
          <RotateCw className="h-3.5 w-3.5" />
          {t("Refresh", "रिफ्रेश")}
        </button>
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        {RANGES.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setLoading(true);
              setDays(value);
            }}
            className={pickerClass(days === value)}
          >
            {value} {t("days", "दिन")}
          </button>
        ))}

        <select
          aria-label={t("Filter by center", "केंद्र चुनें")}
          value={center}
          onChange={(event) => {
            setLoading(true);
            setCenter(event.target.value);
          }}
          className="rounded-btn border border-line-soft bg-white px-3 py-2 text-sm text-forest-950 focus:outline-none focus:ring-2 focus:ring-forest-950"
        >
          <option value="">{t("All centers", "सभी केंद्र")}</option>
          {centers.map((item) => (
            <option key={item._id} value={item._id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p role="alert" className="mt-6 rounded-btn bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      {loading && !data && (
        <p className="mt-8 text-sm text-slate-muted">{t("Loading...", "लोड हो रहा है...")}</p>
      )}

      {data && (
        <div className={loading ? "opacity-60" : ""}>
          <p className="mt-6 text-xs text-slate-muted">
            {t("Farmers", "किसान")}: {data.overview.farmers} · {t("Operators", "ऑपरेटर")}:{" "}
            {data.overview.operators} · {t("Centers", "केंद्र")}: {data.overview.centers.active} ·{" "}
            {t("Counters running", "चालू काउंटर")}: {data.overview.counters.active}/
            {data.overview.counters.total} · {t("Waiting now", "अभी प्रतीक्षा में")}:{" "}
            {data.overview.liveQueue.waiting}
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label={t("Total tokens", "कुल टोकन")}
              value={summary.totalTokens}
              note={`${summary.online} ${t("online", "ऑनलाइन")} · ${summary.walkIns} ${t("walk-in", "वॉक-इन")}`}
            />
            <StatCard
              label={t("Completion rate", "पूर्णता दर")}
              value={`${summary.completionRate}%`}
              note={`${summary.byStatus.completed} ${t("completed visits", "पूरी हुई यात्राएँ")}`}
            />
            <StatCard
              label={t("Average wait", "औसत प्रतीक्षा")}
              value={minutesLabel(summary.avgWaitMinutes)}
              note={`${t("Longest", "सबसे लंबी")}: ${minutesLabel(summary.maxWaitMinutes)}`}
            />
            <StatCard
              label={t("Average service time", "औसत सेवा समय")}
              value={minutesLabel(summary.avgServiceMinutes)}
            />
            <StatCard
              label={t("No-show rate", "अनुपस्थिति दर")}
              value={`${summary.noShowRate}%`}
              note={`${summary.byStatus.no_show} ${t("no-shows", "अनुपस्थित")}`}
            />
            <StatCard
              label={t("Average rating", "औसत रेटिंग")}
              value={data.feedback.average === null ? "—" : `${data.feedback.average} / 5`}
              note={`${data.feedback.count} ${t("reviews", "समीक्षाएँ")}`}
            />
          </div>

          {!hasData && (
            <p className="mt-8 rounded-card border border-line-strong bg-white p-8 text-center text-sm text-slate-muted">
              {t(
                "No tokens in this period yet. Book some tokens, or run the demo history seed.",
                "इस अवधि में अभी कोई टोकन नहीं है। कुछ टोकन बुक करें, या डेमो हिस्ट्री सीड चलाएँ।"
              )}
            </p>
          )}

          {hasData && (
            <>
              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                <ChartCard title={t("Visits per day", "प्रतिदिन यात्राएँ")}>
                  <div role="img" aria-label={t("Visits per day", "प्रतिदिन यात्राएँ")}>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={daily}>
                        <CartesianGrid stroke={COLORS.grid} vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="completed" stackId="visits" fill={COLORS.completed} name={t("Completed", "पूरे हुए")} />
                        <Bar dataKey="noShow" stackId="visits" fill={COLORS.noShow} name={t("No-show", "अनुपस्थित")} />
                        <Bar dataKey="cancelled" stackId="visits" fill={COLORS.cancelled} name={t("Cancelled", "रद्द")} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                <ChartCard
                  title={t("Average waiting time", "औसत प्रतीक्षा समय")}
                  note={t("Minutes from joining the queue to being called.", "कतार में आने से बुलाए जाने तक के मिनट।")}
                >
                  <div role="img" aria-label={t("Average waiting time per day", "प्रतिदिन औसत प्रतीक्षा समय")}>
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={daily}>
                        <CartesianGrid stroke={COLORS.grid} vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} unit=" m" />
                        <Tooltip formatter={(value) => minutesLabel(value)} />
                        <Line
                          type="monotone"
                          dataKey="avgWaitMinutes"
                          stroke={COLORS.line}
                          strokeWidth={2}
                          connectNulls
                          name={t("Average wait", "औसत प्रतीक्षा")}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                <ChartCard
                  title={t("Peak hours", "व्यस्त घंटे")}
                  note={
                    data.peakHour
                      ? t(
                          `Busiest hour: ${formatHour(data.peakHour.hour)} with ${data.peakHour.count} tokens.`,
                          `सबसे व्यस्त घंटा: ${formatHour(data.peakHour.hour)}, ${data.peakHour.count} टोकन।`
                        )
                      : undefined
                  }
                >
                  <div role="img" aria-label={t("Tokens booked per hour", "प्रति घंटा बुक टोकन")}>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={hours}>
                        <CartesianGrid stroke={COLORS.grid} vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill={COLORS.bar} name={t("Tokens", "टोकन")} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                <ChartCard
                  title={t("Counter utilization", "काउंटर उपयोग")}
                  note={t(
                    "Time spent serving, as a share of opening hours on the days the counter was used.",
                    "जिन दिनों काउंटर चला, उनमें खुलने के समय का कितना हिस्सा सेवा में लगा।"
                  )}
                >
                  <div role="img" aria-label={t("Utilization per counter", "प्रति काउंटर उपयोग")}>
                    <ResponsiveContainer width="100%" height={Math.max(220, counters.length * 44)}>
                      <BarChart data={counters} layout="vertical" margin={{ left: 8 }}>
                        <CartesianGrid stroke={COLORS.grid} horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="label" width={170} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Bar dataKey="utilizationPercent" fill={COLORS.bar} name={t("Utilization", "उपयोग")} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                <div className="overflow-x-auto rounded-card border border-line-strong bg-white">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-surface font-mono text-xs uppercase tracking-wider text-slate-muted">
                      <tr>
                        <th className="px-4 py-3">{t("Center", "केंद्र")}</th>
                        <th className="px-4 py-3">{t("Tokens", "टोकन")}</th>
                        <th className="px-4 py-3">{t("Done", "पूरे")}</th>
                        <th className="px-4 py-3">{t("No-show", "अनुपस्थित")}</th>
                        <th className="px-4 py-3">{t("Avg wait", "औसत प्रतीक्षा")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.centers.map((row) => (
                        <tr key={row.id} className="border-t border-line-divider">
                          <td className="px-4 py-3 font-semibold text-forest-950">{row.name}</td>
                          <td className="px-4 py-3">{row.totalTokens}</td>
                          <td className="px-4 py-3">{row.completed}</td>
                          <td className="px-4 py-3">{row.noShow}</td>
                          <td className="px-4 py-3">{minutesLabel(row.avgWaitMinutes)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="overflow-x-auto rounded-card border border-line-strong bg-white">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-surface font-mono text-xs uppercase tracking-wider text-slate-muted">
                      <tr>
                        <th className="px-4 py-3">{t("Service", "सेवा")}</th>
                        <th className="px-4 py-3">{t("Center", "केंद्र")}</th>
                        <th className="px-4 py-3">{t("Tokens", "टोकन")}</th>
                        <th className="px-4 py-3">{t("Avg service", "औसत सेवा")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.services.map((row) => (
                        <tr key={row.id} className="border-t border-line-divider">
                          <td className="px-4 py-3 font-semibold text-forest-950">{row.name}</td>
                          <td className="px-4 py-3">{row.centerName}</td>
                          <td className="px-4 py-3">{row.totalTokens}</td>
                          <td className="px-4 py-3">{minutesLabel(row.avgServiceMinutes)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto rounded-card border border-line-strong bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface font-mono text-xs uppercase tracking-wider text-slate-muted">
                    <tr>
                      <th className="px-4 py-3">{t("Counter", "काउंटर")}</th>
                      <th className="px-4 py-3">{t("Service", "सेवा")}</th>
                      <th className="px-4 py-3">{t("Operator", "ऑपरेटर")}</th>
                      <th className="px-4 py-3">{t("Completed", "पूरे हुए")}</th>
                      <th className="px-4 py-3">{t("Busy / open (min)", "व्यस्त / खुला (मिनट)")}</th>
                      <th className="px-4 py-3">{t("Utilization", "उपयोग")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {counters.map((row) => (
                      <tr key={row.id} className="border-t border-line-divider">
                        <td className="px-4 py-3 font-semibold text-forest-950">{row.label}</td>
                        <td className="px-4 py-3">{row.serviceName}</td>
                        <td className="px-4 py-3">{row.operatorName || "—"}</td>
                        <td className="px-4 py-3">{row.completed}</td>
                        <td className="px-4 py-3">
                          {Math.round(row.busyMinutes)} / {row.availableMinutes}
                        </td>
                        <td className="px-4 py-3">{row.utilizationPercent}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </AdminLayout>
  );
}