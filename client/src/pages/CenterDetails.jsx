import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import Eyebrow from "../components/common/Eyebrow";
import Chip from "../components/common/Chip";
import CounterStatusPill from "../components/common/CounterStatusPill";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
  MapPin,
  Clock,
  Calendar,
  ExternalLink,
  Ticket,
  RotateCw,
  AlertCircle,
  Building2,
  ChevronLeft,
  CheckCircle,
  Sparkles,
} from "lucide-react";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_NAMES_HI = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];

export default function CenterDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t, isHindi } = useLanguage();

  const [center, setCenter] = useState(null);
  const [services, setServices] = useState([]);
  const [counters, setCounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingNotice, setBookingNotice] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      api.get(`/centers/${id}`),
      api.get(`/counters?center=${id}`).catch(() => ({ data: { counters: [] } })),
    ])
      .then(([centerRes, countersRes]) => {
        if (centerRes.data.success) {
          setCenter(centerRes.data.center);
          setServices(centerRes.data.services || []);
          setCounters(countersRes.data.counters || []);
        } else {
          setError(centerRes.data.message || "Center not found");
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || "Failed to load center details");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const formatDays = (workingDays) => {
    if (!workingDays || !Array.isArray(workingDays) || workingDays.length === 0) {
      return isHindi ? "सोमवार से शनिवार" : "Monday to Saturday";
    }
    const days = isHindi ? DAY_NAMES_HI : DAY_NAMES;
    return workingDays.map((d) => days[d] || d).join(", ");
  };

  const getMapLink = () => {
    if (center?.latitude && center?.longitude) {
      return `https://www.google.com/maps?q=${center.latitude},${center.longitude}`;
    }
    const query = encodeURIComponent(`${center?.name || ""} ${center?.district || ""} ${center?.address || ""}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-page px-6 py-16 sm:px-12 lg:px-20">
          <div className="h-64 animate-pulse rounded-card border border-line-strong bg-surface" />
        </div>
      </PublicLayout>
    );
  }

  if (error || !center) {
    return (
      <PublicLayout>
        <div className="mx-auto max-w-2xl px-6 py-20 text-center">
          <div className="rounded-card border border-line-strong bg-white p-12">
            <AlertCircle className="mx-auto h-12 w-12 text-danger" />
            <h1 className="mt-4 text-2xl font-bold text-forest-950">
              {isHindi ? "केंद्र नहीं मिला" : "Center Not Found"}
            </h1>
            <p className="mt-2 text-sm text-slate-text">
              {error || (isHindi ? "यह केंद्र सक्रिय नहीं है या हटाया जा चुका है।" : "This center may be inactive or does not exist.")}
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Link
                to="/centers"
                className="flex items-center gap-2 rounded-btn bg-forest-950 px-5 py-2.5 text-sm font-medium text-lime-300"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>{isHindi ? "सभी केंद्र देखें" : "Back to Centers"}</span>
              </Link>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* Top Header Card */}
      <div className="border-b border-line-strong bg-surface px-6 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto max-w-page">
          <div className="mb-4">
            <Link
              to="/centers"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-muted hover:text-forest-950"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>{isHindi ? "केंद्र सूची पर वापस" : "Back to Centers"}</span>
            </Link>
          </div>

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <Eyebrow>{t("centerDetail.eyebrow")}</Eyebrow>
                <Chip variant="default">{center.type?.replace("_", " ")}</Chip>
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-forest-600">
                  <span className="h-2 w-2 rounded-full bg-forest-500" />
                  ACTIVE
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-bold leading-[120%] text-forest-950 sm:text-4xl lg:text-5xl">
                {center.name}
              </h1>
              <p className="mt-3 flex items-center gap-2 text-base text-slate-text">
                <MapPin className="h-4 w-4 shrink-0 text-slate-muted" />
                <span>
                  {center.address}, {center.district}, {center.state || "Uttar Pradesh"}
                </span>
              </p>
            </div>

            {/* Book Token CTA Card */}
            <div className="flex flex-col items-stretch sm:items-end gap-3">
              {user ? (
                <Link
                  to={`/book?center=${center._id}`}
                  className="flex h-12 items-center justify-center gap-2 rounded-btn bg-forest-950 px-8 text-base font-medium text-lime-300 transition-colors hover:bg-forest-800 cursor-pointer"
                >
                  <Ticket className="h-5 w-5" />
                  <span>{t("centerDetail.bookToken")}</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="flex h-12 items-center justify-center gap-2 rounded-btn bg-forest-950 px-8 text-base font-medium text-lime-300 transition-colors hover:bg-forest-800"
                >
                  <Ticket className="h-5 w-5" />
                  <span>{isHindi ? "टोकन के लिए लॉग इन करें" : "Log in to Book Token"}</span>
                </Link>
              )}
              <a
                href={getMapLink()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-btn border border-line-soft bg-white px-4 py-2 text-xs font-semibold text-forest-950 hover:bg-surface"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>{t("centerDetail.viewOnMap")}</span>
              </a>
            </div>
          </div>

          {/* Booking Notice Banner */}
          {bookingNotice && (
            <div className="mt-6 flex items-center justify-between rounded-card border border-lime-brand bg-mint-100 p-4 text-forest-950">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-forest-800 shrink-0" />
                <p className="text-sm font-medium">
                  {isHindi
                    ? "ऑनलाइन स्लॉट बुकिंग का नया मॉड्यूल सक्रिय हो रहा है। आप नीचे दिए गए सक्रिय काउंटर पर टोकन ले सकते हैं।"
                    : "Direct web token booking is enabled via the active counters below. Please head to your farmer portal to track your turn."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBookingNotice(false)}
                className="text-xs font-bold text-forest-950 underline ml-4 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Schedule Info Bar */}
          <div className="mt-8 grid grid-cols-1 gap-4 border-t border-line-strong pt-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-forest-800" />
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-slate-muted">
                  {t("centerDetail.openHours")}
                </p>
                <p className="text-sm font-semibold text-forest-950">
                  {center.openTime || "09:00"} – {center.closeTime || "17:00"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-forest-800" />
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-slate-muted">
                  {t("centerDetail.workingDays")}
                </p>
                <p className="text-sm font-semibold text-forest-950">
                  {formatDays(center.workingDays)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-forest-800" />
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-slate-muted">
                  {isHindi ? "सक्रिय काउंटर" : "Active Counters"}
                </p>
                <p className="text-sm font-semibold text-forest-950">
                  {counters.filter((c) => c.status === "active").length} of {counters.length} Online
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Details Body: Services & Counters */}
      <div className="mx-auto max-w-page px-6 py-12 sm:px-12 lg:px-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Services Column */}
          <div className="lg:col-span-7">
            <div className="border-b border-line-strong pb-4">
              <h2 className="text-2xl font-bold text-forest-950">
                {t("centerDetail.servicesTitle")}
              </h2>
              <p className="mt-1 text-sm text-slate-text">
                {isHindi
                  ? "इस केंद्र पर प्रदान की जाने वाली आधिकारिक सरकारी सेवाएं।"
                  : "Services offered at this center and standard processing times."}
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {services.length > 0 ? (
                services.map((service) => (
                  <div
                    key={service._id}
                    className="rounded-card border border-line-strong bg-white p-5 transition-shadow hover:border-forest-950"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-forest-950">
                          {isHindi && service.nameHi ? service.nameHi : service.name}
                        </h3>
                        {isHindi && service.nameHi && (
                          <p className="text-xs font-mono text-slate-muted">{service.name}</p>
                        )}
                        {service.description && (
                          <p className="mt-2 text-sm leading-[150%] text-slate-text">
                            {service.description}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="inline-block rounded-btn bg-surface px-3 py-1 font-mono text-xs font-semibold text-forest-950">
                          ~{service.estimatedDuration} {t("centerDetail.mins")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-card border border-line-soft bg-surface p-8 text-center text-sm text-slate-muted">
                  {t("centerDetail.noServices")}
                </div>
              )}
            </div>
          </div>

          {/* Counters Column */}
          <div className="lg:col-span-5">
            <div className="border-b border-line-strong pb-4">
              <h2 className="text-2xl font-bold text-forest-950">
                {t("centerDetail.countersTitle")}
              </h2>
              <p className="mt-1 text-sm text-slate-text">
                {isHindi
                  ? "वर्तमान में सक्रिय खिड़कियां एवं सेवा स्थिति।"
                  : "Live operational status of physical service windows."}
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {counters.length > 0 ? (
                counters.map((counter) => (
                  <div
                    key={counter._id}
                    className="flex items-center justify-between rounded-card border border-line-strong bg-white p-4"
                  >
                    <div>
                      <h4 className="font-bold text-forest-950">{counter.name}</h4>
                      <p className="mt-1 text-xs text-slate-muted">
                        {counter.service?.name || "General Queue"}
                      </p>
                    </div>
                    <CounterStatusPill status={counter.status} />
                  </div>
                ))
              ) : (
                <div className="rounded-card border border-line-soft bg-surface p-8 text-center text-sm text-slate-muted">
                  {t("centerDetail.noCounters")}
                </div>
              )}
            </div>

            {/* Fair Queue Policy Box */}
            <div className="mt-8 rounded-card border border-line-soft bg-surface-2 p-5 text-xs text-slate-text">
              <h5 className="font-bold text-forest-950">
                {isHindi ? "कतार संबंधी नियम" : "Queue & Token Policy"}
              </h5>
              <ul className="mt-2 space-y-1.5 list-disc list-inside">
                <li>
                  {isHindi
                    ? "प्रत्येक टोकन केवल उसी दिन के लिए मान्य है।"
                    : "Tokens are valid only for the designated center on the issue date."}
                </li>
                <li>
                  {isHindi
                    ? "नंबर पुकारे जाने पर ५ मिनट में काउंटर पर उपस्थित हों।"
                    : "Please arrive at the counter within 5 minutes of your token being announced."}
                </li>
                <li>
                  {isHindi
                    ? "बिना स्मार्टफोन वाले किसान वॉक-इन डेस्क पर टोकन ले सकते हैं।"
                    : "Farmers without internet access can register directly at the physical walk-in window."}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
