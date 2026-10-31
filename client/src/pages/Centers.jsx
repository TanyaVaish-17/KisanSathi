import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import SiteHeader from "../components/SiteHeader";
import { centerTypeLabel, formatDays, formatTime, isOpenNow } from "../utils/format";

export default function Centers() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("");

  useEffect(() => {
    api
      .get("/centers")
      .then((res) => setCenters(res.data.centers))
      .catch((err) => setError(err.response?.data?.message || "Could not load centers"))
      .finally(() => setLoading(false));
  }, []);

  const districts = useMemo(
    () => [...new Set(centers.map((c) => c.district))].sort(),
    [centers]
  );

  const visible = centers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.trim().toLowerCase()) &&
      (!district || c.district === district)
  );

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-bold">Service centers</h1>
        <p className="mt-1 text-slate-500">Find a mandi or procurement center near you</p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            placeholder="Search by center name"
            aria-label="Search by center name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 sm:max-w-sm"
          />
          <select
            aria-label="Filter by district"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All districts</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {loading && <p className="mt-8 text-slate-500">Loading centers...</p>}

        {error && (
          <p role="alert" className="mt-8 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {!loading && !error && visible.length === 0 && (
          <p className="mt-8 rounded-lg bg-white p-6 text-center text-slate-500 border border-slate-200">
            No centers match your search.
          </p>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((center) => {
            const open = isOpenNow(center);
            return (
              <article
                key={center._id}
                className="flex flex-col rounded-2xl border border-green-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-semibold">{center.name}</h2>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      open ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {open ? "Open now" : "Closed"}
                  </span>
                </div>

                <p className="mt-1 text-sm text-green-700">{centerTypeLabel(center.type)}</p>
                <p className="mt-3 text-sm text-slate-600">{center.address}</p>
                <p className="text-sm text-slate-600">{center.district}</p>
                <p className="mt-3 text-sm text-slate-600">
                  {formatTime(center.openTime)} – {formatTime(center.closeTime)} ·{" "}
                  {formatDays(center.workingDays)}
                </p>

                <Link
                  to={`/centers/${center._id}`}
                  className="mt-5 rounded-lg border border-green-600 px-4 py-2 text-center font-semibold text-green-700 hover:bg-green-50"
                >
                  View details
                </Link>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}