import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import SiteHeader from "../components/SiteHeader";
import { centerTypeLabel, formatDays, formatTime, isOpenNow } from "../utils/format";

export default function CenterDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get(`/centers/${id}`), api.get("/counters", { params: { center: id } })])
      .then(([centerRes, counterRes]) =>
        setData({
          center: centerRes.data.center,
          services: centerRes.data.services,
          counters: counterRes.data.counters,
        })
      )
      .catch((err) => setError(err.response?.data?.message || "Could not load this center"))
      .finally(() => setLoading(false));
  }, [id]);

  const countersFor = (serviceId) =>
    data.counters.filter((c) => c.service?._id === serviceId);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <Link to="/centers" className="text-sm font-medium text-green-700 hover:underline">
          ← All centers
        </Link>

        {loading && <p className="mt-6 text-slate-500">Loading center...</p>}

        {error && (
          <p role="alert" className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {data && (
          <>
            <section className="mt-4 rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h1 className="text-2xl font-bold">{data.center.name}</h1>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    isOpenNow(data.center)
                      ? "bg-green-100 text-green-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {isOpenNow(data.center) ? "Open now" : "Closed"}
                </span>
              </div>

              <p className="mt-1 text-sm text-green-700">{centerTypeLabel(data.center.type)}</p>
              <p className="mt-4 text-slate-600">
                {data.center.address}, {data.center.district}, {data.center.state}
              </p>
              <p className="mt-2 text-slate-600">
                {formatTime(data.center.openTime)} – {formatTime(data.center.closeTime)} ·{" "}
                {formatDays(data.center.workingDays)}
              </p>
            </section>

            <h2 className="mt-8 text-xl font-semibold">Services</h2>

            {data.services.length === 0 ? (
              <p className="mt-3 rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-500">
                This center has no services yet.
              </p>
            ) : (
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {data.services.map((service) => {
                  const counters = countersFor(service._id);
                  const running = counters.filter((c) => c.status === "active").length;

                  return (
                    <article
                      key={service._id}
                      className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm"
                    >
                      <h3 className="font-semibold">{service.name}</h3>
                      {service.nameHi && <p className="text-sm text-slate-500">{service.nameHi}</p>}
                      {service.description && (
                        <p className="mt-2 text-sm text-slate-600">{service.description}</p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                          About {service.estimatedDuration} min per farmer
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 ${
                            running > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {running > 0
                            ? `${running} counter${running > 1 ? "s" : ""} running`
                            : "No counter running"}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}