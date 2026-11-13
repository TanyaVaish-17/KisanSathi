import React, { useEffect, useState } from "react";
import PublicLayout from "../layouts/PublicLayout";
import Eyebrow from "../components/common/Eyebrow";
import Chip from "../components/common/Chip";
import CounterStatusPill from "../components/common/CounterStatusPill";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import api from "../services/api";
import {
  Pause,
  Play,
  RotateCw,
  Users,
  CheckCircle,
  Megaphone,
  AlertTriangle,
  UserCheck,
  PlusCircle,
  Clock,
  Building2,
  SkipForward,
} from "lucide-react";

export default function OperatorDashboard() {
  const { user } = useAuth();
  const { isHindi } = useLanguage();

  const [counter, setCounter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Queue state for operator console
  const [currentServing, setCurrentServing] = useState(null);
  const [queueList, setQueueList] = useState([]);
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [walkInSuccess, setWalkInSuccess] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  const fetchMyQueue = () => {
    api
      .get("/counters/mine/queue")
      .then((res) => {
        if (res.data.success) {
          setCounter(res.data.counter);
          setCurrentServing(res.data.serving);
          setQueueList(res.data.waiting || []);
        } else {
          setError(res.data.message || "Failed to load assigned counter");
        }
      })
      .catch((err) => {
        setError(
          err.response?.data?.message || err.message || "Failed to fetch counter details"
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMyQueue();
    const interval = setInterval(fetchMyQueue, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleStatus = async () => {
    if (!counter || counter.status === "inactive") return;
    const newStatus = counter.status === "active" ? "paused" : "active";
    setUpdating(true);
    try {
      const res = await api.patch(`/counters/${counter._id}/status`, { status: newStatus });
      if (res.data.success) {
        setCounter(res.data.counter);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update counter status");
    } finally {
      setUpdating(false);
    }
  };

  const handleCallNext = async () => {
    setActionLoading(true);
    try {
      const res = await api.post("/counters/mine/call-next");
      if (res.data.success) {
        setCurrentServing(res.data.serving);
        fetchMyQueue();
        if (res.data.serving) {
          setActionNotice(`Now calling token #${res.data.serving.tokenCode}`);
        } else {
          setActionNotice("No waiting tokens left in queue.");
        }
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to call next token");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteService = async () => {
    if (!currentServing) return;
    setActionLoading(true);
    try {
      const res = await api.post("/counters/mine/complete");
      if (res.data.success) {
        setActionNotice(`Token #${currentServing.tokenCode} marked as completed!`);
        setCurrentServing(null);
        fetchMyQueue();
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to complete token");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSkipService = async () => {
    if (!currentServing) return;
    setActionLoading(true);
    try {
      const res = await api.post("/counters/mine/skip");
      if (res.data.success) {
        setActionNotice(`Token #${currentServing.tokenCode} marked as skipped.`);
        setCurrentServing(null);
        fetchMyQueue();
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to skip token");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddWalkIn = async (e) => {
    e.preventDefault();
    if (!walkInName.trim()) return;

    try {
      const res = await api.post("/counters/mine/walk-in", {
        walkInName: walkInName.trim(),
        walkInPhone: walkInPhone ? walkInPhone.trim() : undefined,
      });

      if (res.data.success) {
        const token = res.data.token;
        setWalkInSuccess(
          `Walk-in registered! Assigned Token #${token.tokenCode} for ${walkInName}`
        );
        setWalkInName("");
        setWalkInPhone("");
        fetchMyQueue();
        setTimeout(() => setWalkInSuccess(null), 5000);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to issue walk-in token");
    }
  };

  return (
    <PublicLayout>
      {/* Top Banner */}
      <div className="border-b border-line-strong bg-surface px-6 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto max-w-page">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <Eyebrow>{isHindi ? "मंडी ऑपरेटर कंसोल" : "OPERATOR QUEUE DESK"}</Eyebrow>
              <h1 className="mt-2 text-3xl font-bold text-forest-950 sm:text-4xl">
                {isHindi ? `काउंटर डेस्क: ${user?.name}` : `Console: ${user?.name}`}
              </h1>
              <p className="mt-2 text-sm text-slate-text">
                {isHindi
                  ? "टोकन बुलाएं, काउंटर स्थिति नियंत्रित करें और वॉक-इन किसानों को दर्ज करें।"
                  : "Call tokens, pause or resume service window, and issue walk-in tickets."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={fetchMyQueue}
                className="flex h-11 items-center gap-2 rounded-btn border border-line-soft bg-white px-4 text-xs font-semibold text-forest-950 hover:bg-surface cursor-pointer"
              >
                <RotateCw className="h-3.5 w-3.5" />
                <span>{isHindi ? "ताज़ा करें" : "Refresh"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-page px-6 py-12 sm:px-12 lg:px-20">
        {loading ? (
          <div className="h-64 animate-pulse rounded-card border border-line-strong bg-surface" />
        ) : error ? (
          <div className="rounded-card border border-danger/40 bg-danger-soft p-8 text-center text-danger">
            <p className="font-semibold">{error}</p>
            <button
              type="button"
              onClick={fetchMyQueue}
              className="mt-4 inline-flex items-center gap-2 rounded-btn bg-forest-950 px-4 py-2 text-xs font-semibold text-lime-300"
            >
              Retry
            </button>
          </div>
        ) : !counter ? (
          /* When counter is null */
          <div className="rounded-card border border-line-strong bg-white p-12 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-warn" />
            <h2 className="mt-4 text-xl font-bold text-forest-950">
              {isHindi ? "कोई काउंटर असाइन नहीं किया गया है" : "No counter assigned yet"}
            </h2>
            <p className="mt-2 text-sm text-slate-text">
              {isHindi
                ? "कृपया अपने मंडी प्रशासक से संपर्क करें ताकि आपको काउंटर सौंपा जा सके।"
                : "Please contact the mandi administrator to assign you an active service counter."}
            </p>
          </div>
        ) : (
          /* Active Operator Workspace */
          <div className="space-y-10">
            {/* Status notice */}
            {actionNotice && (
              <div className="rounded-card border border-lime-brand bg-mint-100 p-4 text-sm font-semibold text-forest-950 animate-fade-in">
                {actionNotice}
              </div>
            )}

            {/* Counter Info & Status Control Card */}
            <div className="rounded-card border border-line-strong bg-white p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs uppercase tracking-wider text-slate-muted">
                      ASSIGNED COUNTER
                    </span>
                    <CounterStatusPill status={counter.status} />
                  </div>
                  <h2 className="mt-2 text-2xl font-bold text-forest-950 sm:text-3xl">
                    {counter.name}
                  </h2>
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-text">
                    <Building2 className="h-4 w-4 text-slate-muted" />
                    <span>{counter.center?.name || "Mandi Center"}</span>
                    <span>·</span>
                    <Clock className="h-4 w-4 text-slate-muted" />
                    <span>
                      {counter.service?.name || "All Services"} (~
                      {counter.service?.estimatedDuration || 15} mins)
                    </span>
                  </p>
                </div>

                {/* Status Toggle Button */}
                <div>
                  {counter.status === "inactive" ? (
                    <div className="rounded-btn border border-line-soft bg-surface p-3 text-xs text-slate-muted">
                      {isHindi
                        ? "यह काउंटर निष्क्रिय है। व्यवस्थापक से संपर्क करें।"
                        : "This counter is inactive. Please contact the admin."}
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={updating}
                      onClick={handleToggleStatus}
                      className={`flex h-12 items-center gap-2.5 rounded-btn px-6 text-sm font-semibold transition-colors cursor-pointer ${
                        counter.status === "active"
                          ? "bg-warn text-forest-950 hover:bg-warn/80"
                          : "bg-forest-950 text-lime-300 hover:bg-forest-800"
                      }`}
                    >
                      {counter.status === "active" ? (
                        <>
                          <Pause className="h-4 w-4" />
                          <span>{isHindi ? "काउंटर रोकें (Pause)" : "Pause Counter"}</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          <span>{isHindi ? "काउंटर पुनः चालू करें (Resume)" : "Resume Counter"}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Queue Console: Now Serving & Call Next */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Call Next & Current Token */}
              <div className="lg:col-span-7 space-y-6">
                <div className="rounded-card border-2 border-forest-950 bg-white p-6 sm:p-8">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-muted">
                      CURRENTLY SERVING AT COUNTER
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-forest-600">
                      <span className="h-2 w-2 rounded-full bg-forest-500 animate-pulse" />
                      {currentServing ? "IN PROGRESS" : "IDLE"}
                    </span>
                  </div>

                  <div className="my-8 text-center">
                    <div className="inline-block rounded-panel border-4 border-forest-950 bg-lime-brand px-10 py-6 text-5xl font-black tracking-tight text-forest-950 sm:text-6xl">
                      {currentServing ? `#${currentServing.tokenCode}` : "—"}
                    </div>
                    <p className="mt-3 text-sm font-semibold text-forest-950">
                      {currentServing ? (
                        <>
                          {currentServing.walkInName || currentServing.farmer?.name || "Farmer"}
                          {currentServing.walkInPhone || currentServing.farmer?.phone
                            ? ` (${currentServing.walkInPhone || currentServing.farmer?.phone})`
                            : ""}
                        </>
                      ) : (
                        <span className="text-slate-muted">
                          {isHindi ? "कोई सक्रिय टोकन नहीं है" : "No farmer currently at counter"}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={handleCallNext}
                      disabled={actionLoading || queueList.length === 0}
                      className="flex h-12 items-center justify-center gap-2 rounded-btn bg-forest-950 px-3 text-xs font-semibold uppercase tracking-wider text-lime-300 hover:bg-forest-800 disabled:opacity-50 cursor-pointer"
                    >
                      <Megaphone className="h-4 w-4" />
                      <span>{isHindi ? "अगला बुलाएं" : "Call Next"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCompleteService}
                      disabled={actionLoading || !currentServing}
                      className="flex h-12 items-center justify-center gap-2 rounded-btn border border-forest-950 bg-mint-100 px-3 text-xs font-semibold uppercase tracking-wider text-forest-950 hover:bg-mint-200 disabled:opacity-50 cursor-pointer"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>{isHindi ? "पूर्ण करें" : "Complete"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSkipService}
                      disabled={actionLoading || !currentServing}
                      className="flex h-12 items-center justify-center gap-2 rounded-btn border border-line-soft bg-white px-3 text-xs font-semibold uppercase tracking-wider text-slate-text hover:bg-surface disabled:opacity-50 cursor-pointer"
                    >
                      <SkipForward className="h-4 w-4" />
                      <span>{isHindi ? "छोड़ें (Skip)" : "Skip"}</span>
                    </button>
                  </div>
                </div>

                {/* Waiting List Preview */}
                <div className="rounded-card border border-line-strong bg-white p-6">
                  <div className="flex items-center justify-between pb-3 border-b border-line-soft">
                    <h3 className="font-bold text-forest-950">
                      {isHindi ? "कतार में प्रतीक्षारत टोकन" : "Waiting Queue"} ({queueList.length})
                    </h3>
                    <span className="font-mono text-xs text-slate-muted">Next Up</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    {queueList.length > 0 ? (
                      queueList.map((token, idx) => (
                        <span
                          key={token._id || token.tokenCode}
                          className={`inline-flex items-center gap-1.5 rounded-btn px-3 py-1.5 font-mono text-xs font-bold ${
                            idx === 0
                              ? "bg-forest-950 text-lime-300"
                              : "bg-surface border border-line-soft text-forest-950"
                          }`}
                        >
                          <span className="text-[10px] text-slate-muted">#{idx + 1}</span>
                          #{token.tokenCode}
                          <span className="text-[10px] font-normal text-slate-muted">
                            ({token.walkInName || token.farmer?.name || "Farmer"})
                          </span>
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-slate-muted italic">
                        {isHindi
                          ? "कतार खाली है। कोई किसान प्रतीक्षा नहीं कर रहा।"
                          : "Queue is empty. No farmers currently waiting."}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Walk-in Desk for Farmers without internet */}
              <div className="lg:col-span-5">
                <div className="rounded-card border border-line-strong bg-surface p-6">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-forest-800" />
                    <h3 className="font-bold text-forest-950">
                      {isHindi ? "वॉक-इन टोकन डेस्क" : "Walk-in Desk"}
                    </h3>
                  </div>
                  <p className="mt-1 text-xs text-slate-text">
                    {isHindi
                      ? "बिना स्मार्टफोन वाले किसानों के लिए तत्काल भौतिक पर्ची जारी करें।"
                      : "Directly issue queue tokens for farmers without phones or offline arrivals."}
                  </p>

                  {walkInSuccess && (
                    <div className="mt-4 rounded-btn border border-forest-600 bg-mint-100 p-3 text-xs text-forest-950 font-medium">
                      {walkInSuccess}
                    </div>
                  )}

                  <form onSubmit={handleAddWalkIn} className="mt-5 space-y-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-forest-950">
                        {isHindi ? "किसान का नाम *" : "Farmer Name *"}
                      </label>
                      <input
                        type="text"
                        value={walkInName}
                        onChange={(e) => setWalkInName(e.target.value)}
                        placeholder="e.g. Ram Charan"
                        required
                        className="mt-1 h-10 w-full rounded-btn border border-line-soft bg-white px-3 text-sm text-forest-950 placeholder:text-slate-muted"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase text-forest-950">
                        {isHindi ? "मोबाइल नंबर (वैकल्पिक)" : "Mobile Number (Optional)"}
                      </label>
                      <input
                        type="tel"
                        value={walkInPhone}
                        onChange={(e) => setWalkInPhone(e.target.value)}
                        placeholder="9876543210"
                        className="mt-1 h-10 w-full rounded-btn border border-line-soft bg-white px-3 text-sm text-forest-950 placeholder:text-slate-muted"
                      />
                    </div>

                    <button
                      type="submit"
                      className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-btn bg-forest-950 px-4 text-xs font-semibold uppercase tracking-wider text-lime-300 hover:bg-forest-800 cursor-pointer"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>{isHindi ? "वॉक-इन टोकन जारी करें" : "Issue Walk-in Token"}</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
