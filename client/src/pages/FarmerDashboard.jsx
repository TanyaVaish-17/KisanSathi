import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import TokenCard from "../components/ui/TokenCard";
import Eyebrow from "../components/common/Eyebrow";
import Chip from "../components/common/Chip";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import api from "../services/api";
import {
  Search,
  Ticket,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle,
  RotateCw,
  Plus,
} from "lucide-react";

export default function FarmerDashboard() {
  const { user } = useAuth();
  const { isHindi, lang } = useLanguage();

  const [activeTokenData, setActiveTokenData] = useState(null);
  const [pastTokens, setPastTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchMyTokens = () => {
    api
      .get("/tokens/mine")
      .then((res) => {
        if (res.data.success) {
          const { activeToken, queueInfo, arrivalAdvice, pastTokens: pList } = res.data;
          if (activeToken) {
            setActiveTokenData({
              id: activeToken._id,
              tokenCode: activeToken.tokenCode,
              status: activeToken.status,
              delayed: queueInfo?.delayed || false,
              centerName: activeToken.center?.name || "Mandi Center",
              serviceName:
                isHindi && activeToken.service?.nameHi
                  ? activeToken.service.nameHi
                  : activeToken.service?.name || "Service",
              counterName: activeToken.counter?.name || "Window",
              position: queueInfo?.position ?? 1,
              aheadCount: queueInfo?.aheadCount ?? 0,
              estimatedWaitMinutes:
                queueInfo?.estimatedWaitMinutes ?? activeToken.estimatedWaitMinutes,
              nowServing: queueInfo?.nowServing || "—",
              arrivalMessage:
                arrivalAdvice?.message ||
                (isHindi
                  ? "कृपया समय पर केंद्र पहुँचें।"
                  : "Please reach the mandi center on time."),
            });
          } else {
            setActiveTokenData(null);
          }
          setPastTokens(pList || []);
        }
      })
      .catch((err) => console.error("Error loading tokens:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMyTokens();
    const interval = setInterval(fetchMyTokens, 8000);
    return () => clearInterval(interval);
  }, [isHindi]);

  const handleCancelToken = async (id) => {
    if (
      !window.confirm(
        isHindi
          ? "क्या आप वाकई यह टोकन रद्द करना चाहते हैं?"
          : "Are you sure you want to cancel this token?"
      )
    ) {
      return;
    }
    setCancelling(true);
    try {
      await api.patch(`/tokens/${id}/cancel`);
      fetchMyTokens();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel token");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <PublicLayout>
      {/* Welcome Banner */}
      <div className="border-b border-line-strong bg-surface px-6 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto max-w-page">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <Eyebrow>{isHindi ? "किसान पोर्टल" : "FARMER WORKSPACE"}</Eyebrow>
              <h1 className="mt-2 text-3xl font-bold text-forest-950 sm:text-4xl">
                {isHindi
                  ? `नमस्ते, ${user?.name || "किसान भाई"}!`
                  : `Welcome back, ${user?.name || "Farmer"}!`}
              </h1>
              <p className="mt-2 text-sm text-slate-text">
                {isHindi
                  ? "अपनी सक्रिय मंडी पर्चियों और कतार क्रम की जांच करें।"
                  : "Track your live mandi appointments, token queue position, and arrival times."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/book"
                className="flex h-11 items-center gap-2 rounded-btn bg-forest-950 px-5 text-sm font-medium text-lime-300 transition-colors hover:bg-forest-800"
              >
                <Plus className="h-4 w-4" />
                <span>{isHindi ? "नया टोकन बुक करें" : "Book New Token"}</span>
              </Link>
              <Link
                to="/centers"
                className="flex h-11 items-center gap-2 rounded-btn border border-line-soft bg-white px-4 text-sm font-medium text-forest-950 hover:bg-surface"
              >
                <Search className="h-4 w-4" />
                <span>{isHindi ? "मंडी केंद्र खोजें" : "Find a Center"}</span>
              </Link>
              <Link
                to="/profile"
                className="flex h-11 items-center rounded-btn border border-line-soft bg-white px-4 text-sm font-medium text-forest-950 hover:bg-surface"
              >
                {isHindi ? "प्रोफ़ाइल देखें" : "View Profile"}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-page px-6 py-12 sm:px-12 lg:px-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Active Tokens Column */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between border-b border-line-strong pb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-forest-950">
                  {isHindi ? "सक्रिय कतार टोकन" : "Active Queue Tokens"}
                </h2>
                {activeTokenData && <Chip variant="highlight">LIVE</Chip>}
              </div>
              <button
                type="button"
                onClick={fetchMyTokens}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-muted hover:text-forest-950 cursor-pointer"
              >
                <RotateCw className="h-3.5 w-3.5" />
                <span>{isHindi ? "ताज़ा करें" : "Refresh"}</span>
              </button>
            </div>

            <div className="mt-8">
              {loading && !activeTokenData ? (
                <div className="h-64 animate-pulse rounded-card border border-line-strong bg-white" />
              ) : activeTokenData ? (
                <div className="flex flex-wrap gap-8 items-start">
                  <div className="p-2 sm:p-4">
                    <TokenCard
                      {...activeTokenData}
                      lang={lang}
                      onCancel={() => handleCancelToken(activeTokenData.id)}
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-card border border-line-strong bg-white p-12 text-center">
                  <Ticket className="mx-auto h-12 w-12 text-slate-muted/60" />
                  <h3 className="mt-4 text-lg font-bold text-forest-950">
                    {isHindi ? "वर्तमान में कोई सक्रिय टोकन नहीं है" : "No active tokens right now"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-text">
                    {isHindi
                      ? "जब आप किसी मंडी केंद्र पर अपनी बारी बुक करेंगे, तो आपका लाइव टोकन टिकट यहाँ दिखाई देगा।"
                      : "When you book a turn at any mandi center, your live ticket will be displayed here."}
                  </p>
                  <div className="mt-6 flex justify-center gap-4">
                    <Link
                      to="/book"
                      className="inline-flex items-center gap-2 rounded-btn bg-forest-950 px-5 py-2.5 text-sm font-medium text-lime-300"
                    >
                      <Plus className="h-4 w-4" />
                      <span>{isHindi ? "टोकन बुक करें" : "Book a Token"}</span>
                    </Link>
                    <Link
                      to="/centers"
                      className="inline-flex items-center gap-2 rounded-btn border border-line-soft bg-white px-5 py-2.5 text-sm font-medium text-forest-950 hover:bg-surface"
                    >
                      <span>{isHindi ? "केंद्र सूची देखें" : "Browse Mandis"}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Past Tokens */}
            <div className="mt-14">
              <h3 className="text-xl font-bold text-forest-950 border-b border-line-strong pb-3">
                {isHindi ? "हालिया इतिहास" : "Recent Token History"}
              </h3>
              <div className="mt-6 space-y-4">
                {pastTokens.length > 0 ? (
                  pastTokens.map((p) => (
                    <div
                      key={p._id || p.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-card border border-line-strong bg-white p-5"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base font-bold text-forest-950">
                            #{p.tokenCode}
                          </span>
                          <Chip
                            variant={
                              p.status === "completed"
                                ? "green"
                                : p.status === "cancelled"
                                ? "red"
                                : "default"
                            }
                          >
                            {p.status.toUpperCase()}
                          </Chip>
                        </div>
                        <h4 className="mt-1 font-semibold text-forest-950">
                          {p.center?.name || "Center"}
                        </h4>
                        <p className="text-xs text-slate-muted">
                          {(isHindi && p.service?.nameHi ? p.service.nameHi : p.service?.name) ||
                            "Service"}{" "}
                          · {p.counter?.name || "Counter"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-muted">
                        <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-muted italic">
                    {isHindi ? "कोई पिछला रिकॉर्ड नहीं है।" : "No past tokens found."}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar / Profile summary & Advice */}
          <div className="space-y-6 lg:col-span-4">
            <div className="rounded-card border border-line-strong bg-white p-6">
              <h3 className="font-bold text-forest-950">
                {isHindi ? "किसान विवरण" : "Farmer Details"}
              </h3>
              <div className="mt-4 space-y-3 text-sm text-slate-text">
                <div>
                  <span className="text-xs font-mono uppercase text-slate-muted">Name</span>
                  <p className="font-semibold text-forest-950">{user?.name}</p>
                </div>
                <div>
                  <span className="text-xs font-mono uppercase text-slate-muted">Contact</span>
                  <p className="font-semibold text-forest-950">
                    {user?.phone ? `+91 ${user.phone}` : user?.email || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-mono uppercase text-slate-muted">District</span>
                  <p className="font-semibold text-forest-950">
                    {user?.district || "Sitapur / Western UP"}
                  </p>
                </div>
              </div>
            </div>

            {/* Smart Arrival Tip */}
            <div className="rounded-card border border-lime-brand bg-mint-100 p-6 text-forest-950">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-forest-800" />
                <h4 className="font-bold">
                  {isHindi ? "समय बचाने का सुझाव" : "Smart Arrival Tip"}
                </h4>
              </div>
              <p className="mt-3 text-xs leading-[160%]">
                {isHindi
                  ? "जब आपका टोकन क्रम ३ या उससे कम हो, तभी मंडी के लिए प्रस्थान करें। इससे आपके खेत के काम में व्यवधान नहीं आएगा।"
                  : "Only travel when your queue position is 3 or lower. This gives you ample transit time while avoiding waiting at the yard."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
