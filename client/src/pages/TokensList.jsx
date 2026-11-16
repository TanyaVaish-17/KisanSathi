import React, { useEffect, useState } from "react";
import PublicLayout from "../layouts/PublicLayout";
import TokenCard from "../components/ui/TokenCard";
import Eyebrow from "../components/common/Eyebrow";
import Chip from "../components/common/Chip";
import { useLanguage } from "../context/LanguageContext";
import { Link } from "react-router-dom";
import api from "../services/api";
import { Ticket, Plus, RotateCw, ArrowRight } from "lucide-react";

export default function TokensList() {
  const { isHindi, lang } = useLanguage();

  const [activeToken, setActiveToken] = useState(null);
  const [pastTokens, setPastTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTokens = () => {
    setLoading(true);
    api
      .get("/tokens/mine")
      .then((res) => {
        if (res.data.success) {
          const { activeToken: active, queueInfo, arrivalAdvice, pastTokens: past } = res.data;
          if (active) {
            setActiveToken({
              id: active._id,
              tokenCode: active.tokenCode,
              status: active.status,
              delayed: queueInfo?.delayed || false,
              centerName: active.center?.name || "Mandi Center",
              serviceName:
                isHindi && active.service?.nameHi
                  ? active.service.nameHi
                  : active.service?.name || "Service",
              counterName: active.counter?.name || "Window",
              position: queueInfo?.position ?? 1,
              aheadCount: queueInfo?.aheadCount ?? 0,
              estimatedWaitMinutes:
                queueInfo?.estimatedWaitMinutes ?? active.estimatedWaitMinutes,
              nowServing: queueInfo?.nowServing || "—",
              arrivalMessage:
                arrivalAdvice?.message ||
                (isHindi
                  ? "कृपया समय पर केंद्र पहुँचें।"
                  : "Please reach the mandi center on time."),
            });
          } else {
            setActiveToken(null);
          }

          setPastTokens(
            (past || []).map((p) => ({
              id: p._id,
              tokenCode: p.tokenCode,
              status: p.status,
              delayed: false,
              centerName: p.center?.name || "Mandi Center",
              serviceName:
                isHindi && p.service?.nameHi
                  ? p.service.nameHi
                  : p.service?.name || "Service",
              counterName: p.counter?.name || "Window",
              position: null,
              aheadCount: 0,
              estimatedWaitMinutes: 0,
              nowServing: null,
              createdAt: p.createdAt,
            }))
          );
        }
      })
      .catch((err) => console.error("Failed to load tokens:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTokens();
    const interval = setInterval(fetchTokens, 10000);
    return () => clearInterval(interval);
  }, [isHindi]);

  const handleCancel = async (id) => {
    if (
      !window.confirm(
        isHindi
          ? "क्या आप वाकई यह टोकन रद्द करना चाहते हैं?"
          : "Are you sure you want to cancel this token?"
      )
    ) {
      return;
    }
    try {
      await api.patch(`/tokens/${id}/cancel`);
      fetchTokens();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel token");
    }
  };

  const allTokens = activeToken ? [activeToken, ...pastTokens] : pastTokens;

  return (
    <PublicLayout>
      <div className="border-b border-line-strong bg-surface px-6 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto max-w-page">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <Eyebrow>{isHindi ? "टोकन सूची" : "MY TICKETS"}</Eyebrow>
              <h1 className="mt-2 text-3xl font-bold text-forest-950 sm:text-4xl">
                {isHindi ? "मेरे टोकन एवं लाइव स्थिति" : "My Tokens & Queue Status"}
              </h1>
              <p className="mt-1 text-sm text-slate-text">
                {isHindi
                  ? "आपके सक्रिय और पूर्व में जारी किए गए सभी टोकन कार्ड।"
                  : "All current, pending, and past virtual tokens issued to your account."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={fetchTokens}
                className="inline-flex items-center gap-1.5 rounded-btn border border-line-soft bg-white px-4 py-2.5 text-xs font-semibold text-forest-950 hover:bg-surface cursor-pointer"
              >
                <RotateCw className="h-3.5 w-3.5" />
                <span>{isHindi ? "ताज़ा करें" : "Refresh"}</span>
              </button>
              <Link
                to="/book"
                className="inline-flex items-center gap-2 rounded-btn bg-forest-950 px-5 py-2.5 text-xs font-semibold text-lime-300 hover:bg-forest-800"
              >
                <Plus className="h-4 w-4" />
                <span>{isHindi ? "नया टोकन लें" : "Book New Token"}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-page px-6 py-12 sm:px-12 lg:px-20">
        {loading && allTokens.length === 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="h-72 animate-pulse rounded-card border border-line-strong bg-white"
              />
            ))}
          </div>
        ) : allTokens.length > 0 ? (
          <div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-3">
            {allTokens.map((token) => (
              <div key={token.id} className="p-2">
                <TokenCard
                  {...token}
                  lang={lang}
                  onCancel={token.status === "waiting" ? () => handleCancel(token.id) : undefined}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-card border border-line-strong bg-white p-12 text-center">
            <Ticket className="mx-auto h-12 w-12 text-slate-muted/60" />
            <h3 className="mt-4 text-lg font-bold text-forest-950">
              {isHindi ? "कोई टोकन नहीं मिला" : "No tokens found"}
            </h3>
            <p className="mt-1 text-sm text-slate-text">
              {isHindi
                ? "आपने अभी तक कोई टोकन बुक नहीं किया है।"
                : "You have not booked any mandi queue tokens yet."}
            </p>
            <Link
              to="/book"
              className="mt-6 inline-flex items-center gap-2 rounded-btn bg-forest-950 px-5 py-2.5 text-sm font-medium text-lime-300 hover:bg-forest-800"
            >
              <Plus className="h-4 w-4" />
              <span>{isHindi ? "टोकन बुक करें" : "Book Your First Token"}</span>
            </Link>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
