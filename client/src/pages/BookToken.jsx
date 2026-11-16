import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import Eyebrow from "../components/common/Eyebrow";
import Chip from "../components/common/Chip";
import TokenCard from "../components/ui/TokenCard";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import api from "../services/api";
import {
  Ticket,
  Building2,
  Wrench,
  Clock,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  RotateCw,
} from "lucide-react";

export default function BookToken() {
  const { user } = useAuth();
  const { isHindi, lang } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlCenter = searchParams.get("center") || "";

  const [step, setStep] = useState(1);
  const [centers, setCenters] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState(null);

  // Form selections
  const [selectedCenter, setSelectedCenter] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("09:30 AM");
  const [createdToken, setCreatedToken] = useState(null);

  useEffect(() => {
    api
      .get("/centers")
      .then((res) => {
        if (res.data.success) {
          const list = res.data.centers || res.data.data || [];
          setCenters(list);
          if (list.length > 0) {
            if (urlCenter && list.some((c) => c._id === urlCenter)) {
              setSelectedCenter(urlCenter);
            } else {
              setSelectedCenter(list[0]._id);
            }
          }
        }
      })
      .finally(() => setLoading(false));
  }, [urlCenter]);

  useEffect(() => {
    if (selectedCenter) {
      api
        .get(`/centers/${selectedCenter}`)
        .then((res) => {
          if (res.data.success) {
            const sList = res.data.services || [];
            setServices(sList);
            if (sList.length > 0) {
              setSelectedService(sList[0]._id);
            } else {
              setSelectedService("");
            }
          }
        })
        .catch(() => setServices([]));
    }
  }, [selectedCenter]);

  const handleConfirmBooking = async () => {
    setBooking(true);
    setError(null);

    try {
      const res = await api.post("/tokens", {
        center: selectedCenter,
        service: selectedService,
      });

      if (res.data.success) {
        const { token, queueInfo, arrivalAdvice } = res.data;
        const chosenCenter = token.center || centers.find((c) => c._id === selectedCenter);
        const chosenService = token.service || services.find((s) => s._id === selectedService);

        const cardProps = {
          tokenCode: token.tokenCode,
          status: token.status,
          delayed: queueInfo?.delayed || false,
          centerName: chosenCenter?.name || "Service Center",
          serviceName:
            isHindi && chosenService?.nameHi ? chosenService.nameHi : chosenService?.name || "Service",
          counterName: token.counter?.name || "Assigned Window",
          position: queueInfo?.position ?? 1,
          aheadCount: queueInfo?.aheadCount ?? 0,
          estimatedWaitMinutes: queueInfo?.estimatedWaitMinutes ?? token.estimatedWaitMinutes,
          nowServing: queueInfo?.nowServing || "—",
          arrivalMessage:
            arrivalAdvice?.message ||
            (isHindi
              ? "कृपया समय पर केंद्र पहुँचें।"
              : "Please reach the mandi center on time."),
        };

        setCreatedToken(cardProps);
        setStep(3);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to issue token. Please check if you already have an active token."
      );
    } finally {
      setBooking(false);
    }
  };

  const centerObj = centers.find((c) => c._id === selectedCenter);
  const serviceObj = services.find((s) => s._id === selectedService);

  return (
    <PublicLayout>
      <div className="border-b border-line-strong bg-surface px-6 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto max-w-page">
          <Eyebrow>{isHindi ? "डिजिटल कतार बुकिंग" : "VIRTUAL QUEUE BOOKING"}</Eyebrow>
          <h1 className="mt-2 text-3xl font-bold text-forest-950 sm:text-4xl">
            {isHindi ? "अपनी बारी बुक करें" : "Book Your Mandi Token"}
          </h1>
          <p className="mt-1 text-sm text-slate-text">
            {isHindi
              ? "बिना कतार में खड़े हुए घर से ही अपनी बारी सुरक्षित करें।"
              : "Reserve your spot in the virtual queue before leaving your field or home."}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-12 sm:px-12">
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-card border border-danger/40 bg-danger-soft p-4 text-sm text-danger">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{error}</p>
              {error.includes("already have an active token") && (
                <div className="mt-2">
                  <Link
                    to="/farmer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold underline hover:text-danger/80"
                  >
                    <span>{isHindi ? "सक्रिय टोकन देखें" : "View Active Token on Dashboard"}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {step < 3 && (
          <div className="mb-8 flex items-center justify-between border-b border-line-soft pb-4 text-xs font-mono">
            <span className={step === 1 ? "font-bold text-forest-950" : "text-slate-muted"}>
              1. {isHindi ? "केंद्र एवं सेवा" : "Select Center & Service"}
            </span>
            <span className="text-slate-muted">→</span>
            <span className={step === 2 ? "font-bold text-forest-950" : "text-slate-muted"}>
              2. {isHindi ? "समीक्षा एवं पुष्टि" : "Review & Confirm"}
            </span>
            <span className="text-slate-muted">→</span>
            <span className="text-slate-muted">3. {isHindi ? "टोकन टिकट" : "Live Ticket"}</span>
          </div>
        )}

        {/* Step 1: Center & Service */}
        {step === 1 && (
          <div className="space-y-6 rounded-card border border-line-strong bg-white p-6 sm:p-8">
            <div>
              <label className="block text-xs font-semibold uppercase text-forest-950">
                {isHindi ? "मंडी / खरीद केंद्र चुनें *" : "Choose Mandi / Procurement Center *"}
              </label>
              <select
                value={selectedCenter}
                onChange={(e) => setSelectedCenter(e.target.value)}
                className="mt-2 h-12 w-full rounded-btn border border-line-soft bg-white px-4 text-sm text-forest-950 focus-visible:outline-forest-950"
              >
                {centers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} — {c.district} ({c.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-forest-950">
                {isHindi ? "आवश्यक सेवा चुनें *" : "Select Required Service *"}
              </label>
              {services.length > 0 ? (
                <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {services.map((s) => (
                    <div
                      key={s._id}
                      onClick={() => setSelectedService(s._id)}
                      className={`cursor-pointer rounded-btn border p-4 transition-colors ${
                        selectedService === s._id
                          ? "border-forest-950 bg-mint-100 font-semibold"
                          : "border-line-soft bg-white hover:bg-surface"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-forest-950">
                          {isHindi && s.nameHi ? s.nameHi : s.name}
                        </span>
                        <span className="font-mono text-xs text-slate-muted">
                          ~{s.estimatedDuration}m
                        </span>
                      </div>
                      {s.description && (
                        <p className="mt-1 text-xs text-slate-text line-clamp-2">
                          {s.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-muted">
                  {isHindi ? "सेवाएं लोड हो रही हैं..." : "Loading services for selected center..."}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-forest-950">
                {isHindi ? "अनुमानित आगमन समय स्लॉट" : "Preferred Arrival Slot"}
              </label>
              <div className="mt-2 grid grid-cols-3 gap-3">
                {["09:30 AM", "11:00 AM", "02:00 PM"].map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTimeSlot(slot)}
                    className={`h-11 rounded-btn border text-xs font-mono font-semibold transition-colors ${
                      selectedTimeSlot === slot
                        ? "border-forest-950 bg-forest-950 text-lime-300"
                        : "border-line-soft bg-white text-forest-950 hover:bg-surface"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-line-soft flex justify-end">
              <button
                type="button"
                disabled={!selectedCenter || !selectedService}
                onClick={() => setStep(2)}
                className="flex h-12 items-center gap-2 rounded-btn bg-forest-950 px-6 text-sm font-medium text-lime-300 hover:bg-forest-800 disabled:opacity-50 cursor-pointer"
              >
                <span>{isHindi ? "आगे बढ़ें" : "Proceed to Confirm"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <div className="space-y-6 rounded-card border border-line-strong bg-white p-6 sm:p-8">
            <h3 className="text-xl font-bold text-forest-950 border-b border-line-soft pb-4">
              {isHindi ? "टोकन बुकिंग विवरण की समीक्षा करें" : "Review Token Booking Details"}
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between py-2 border-b border-line-soft">
                <span className="text-slate-muted">{isHindi ? "किसान का नाम" : "Farmer Name"}</span>
                <span className="font-semibold text-forest-950">{user?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-line-soft">
                <span className="text-slate-muted">{isHindi ? "मोबाइल नंबर" : "Phone"}</span>
                <span className="font-semibold text-forest-950">{user?.phone || user?.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-line-soft">
                <span className="text-slate-muted">{isHindi ? "मंडी केंद्र" : "Mandi Center"}</span>
                <span className="font-semibold text-forest-950">{centerObj?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-line-soft">
                <span className="text-slate-muted">{isHindi ? "सेवा" : "Service"}</span>
                <span className="font-semibold text-forest-950">
                  {isHindi && serviceObj?.nameHi ? serviceObj.nameHi : serviceObj?.name}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-line-soft">
                <span className="text-slate-muted">{isHindi ? "समय स्लॉट" : "Slot Time"}</span>
                <span className="font-mono font-semibold text-forest-950">{selectedTimeSlot}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-line-soft">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-muted hover:text-forest-950 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{isHindi ? "संशोधन करें" : "Back to Edit"}</span>
              </button>
              <button
                type="button"
                disabled={booking}
                onClick={handleConfirmBooking}
                className="flex h-12 items-center gap-2 rounded-btn bg-forest-950 px-8 text-sm font-medium text-lime-300 hover:bg-forest-800 disabled:opacity-50 cursor-pointer"
              >
                {booking ? (
                  <>
                    <RotateCw className="h-4 w-4 animate-spin" />
                    <span>{isHindi ? "टोकन जारी हो रहा है..." : "Issuing Token..."}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{isHindi ? "टोकन कन्फर्म करें" : "Confirm & Issue Token"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success Ticket Display */}
        {step === 3 && createdToken && (
          <div className="space-y-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-mint-200 text-forest-950">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-forest-950 sm:text-3xl">
                {isHindi ? "आपका टोकन सफलतापूर्वक जारी हो गया!" : "Token Issued Successfully!"}
              </h2>
              <p className="mt-2 text-sm text-slate-text">
                {isHindi
                  ? "नीचे आपका आधिकारिक डिजिटल टोकन टिकट है। मंडी काउंटर पर यह टिकट दिखाएं।"
                  : "Here is your official virtual queue ticket. Show this token code when your turn is announced."}
              </p>
            </div>

            <div className="flex justify-center p-4">
              <TokenCard {...createdToken} lang={lang} />
            </div>

            <div className="flex justify-center gap-4">
              <Link
                to="/farmer"
                className="flex h-11 items-center gap-2 rounded-btn bg-forest-950 px-6 text-sm font-medium text-lime-300 hover:bg-forest-800"
              >
                <span>{isHindi ? "किसान पोर्टल पर जाएं" : "Go to Farmer Workspace"}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
