import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import BrandHero from "../components/ui/BrandHero";
import TokenCard from "../components/ui/TokenCard";
import Eyebrow from "../components/common/Eyebrow";
import Chip from "../components/common/Chip";
import { useLanguage } from "../context/LanguageContext";
import api from "../services/api";
import {
  Clock,
  MapPin,
  CheckCircle2,
  Users,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  Calendar,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  const { t, isHindi, lang } = useLanguage();
  const [featuredCenters, setFeaturedCenters] = useState([]);
  const [loadingCenters, setLoadingCenters] = useState(true);

  useEffect(() => {
    api
      .get("/centers")
      .then((res) => {
        if (res.data.success) {
          const list = res.data.centers || res.data.data || [];
          setFeaturedCenters(list.slice(0, 3));
        }
      })
      .catch((err) => {
        console.error("Failed to load featured centers:", err);
      })
      .finally(() => setLoadingCenters(false));
  }, []);

  return (
    <PublicLayout>
      {/* 1. Hero Section */}
      <section className="border-b border-line-strong bg-white px-6 py-12 sm:px-12 sm:py-20 lg:px-20 lg:py-24">
        <div className="mx-auto max-w-page">
          <BrandHero hindi={isHindi} />

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/centers"
              className="flex h-[52px] items-center gap-2 rounded-btn bg-forest-950 px-8 text-base font-medium text-lime-300 transition-colors hover:bg-forest-800"
            >
              <span>{t("hero.findCenter")}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/register"
              className="flex h-[52px] items-center rounded-btn border border-line-soft bg-white px-8 text-base font-medium text-ink transition-colors hover:bg-surface"
            >
              {t("hero.register")}
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-xs font-mono text-slate-muted">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-forest-500" />
              <span>LIVE MANDI QUEUES</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-lime-brand" />
              <span>SMS & APP UPDATES</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-forest-600" />
              <span>UP GOVT INTEGRATION</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Problem Section (Utilising the user-uploaded images) */}
      <section className="border-b border-line-strong bg-surface px-6 py-20 sm:px-12 sm:py-28 lg:px-20">
        <div className="mx-auto max-w-page">
          <div className="max-w-2xl">
            <Eyebrow>{t("problem.eyebrow")}</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold leading-[120%] text-forest-950 sm:text-4xl lg:text-5xl">
              {t("problem.title")}
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Image Card 1: Endless queues */}
            <article className="overflow-hidden rounded-card border border-line-strong bg-white p-4 transition-transform hover:-translate-y-1">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-mint-100">
                <img
                  src="/images/mandi-long-queue.jpg"
                  alt="Farmers waiting in a long queue at mandi procurement counter"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3">
                  <Chip variant="orange">{isHindi ? "लंबी कतार" : "6-12 HR WAIT"}</Chip>
                </div>
              </div>
              <div className="mt-5 p-2">
                <h3 className="text-xl font-bold leading-[120%] text-forest-950">
                  {t("problem.card1Title")}
                </h3>
                <p className="mt-2 text-sm leading-[150%] text-slate-text">
                  {t("problem.card1Desc")}
                </p>
              </div>
            </article>

            {/* Image Card 2: Wasted trips */}
            <article className="overflow-hidden rounded-card border border-line-strong bg-white p-4 transition-transform hover:-translate-y-1">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-mint-100">
                <img
                  src="/images/confused-farmer-slip.jpg"
                  alt="Farmer looking confused at paper slip next to bicycle"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3">
                  <Chip variant="orange">{isHindi ? "अनिश्चितता" : "PAUSED COUNTERS"}</Chip>
                </div>
              </div>
              <div className="mt-5 p-2">
                <h3 className="text-xl font-bold leading-[120%] text-forest-950">
                  {t("problem.card2Title")}
                </h3>
                <p className="mt-2 text-sm leading-[150%] text-slate-text">
                  {t("problem.card2Desc")}
                </p>
              </div>
            </article>

            {/* Image Card 3: No visibility */}
            <article className="overflow-hidden rounded-card border border-line-strong bg-white p-4 transition-transform hover:-translate-y-1">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-mint-100">
                <img
                  src="/images/farmer-phone-mandi.jpg"
                  alt="Farmer checking phone with receipt at mandi"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3">
                  <Chip variant="highlight">{isHindi ? "डिजिटल समाधान" : "ZERO VISIBILITY"}</Chip>
                </div>
              </div>
              <div className="mt-5 p-2">
                <h3 className="text-xl font-bold leading-[120%] text-forest-950">
                  {t("problem.card3Title")}
                </h3>
                <p className="mt-2 text-sm leading-[150%] text-slate-text">
                  {t("problem.card3Desc")}
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 3. Solution Section with Interactive TokenCard */}
      <section className="border-b border-line-strong bg-white px-6 py-20 sm:px-12 sm:py-28 lg:px-20">
        <div className="mx-auto max-w-page">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Eyebrow>{t("solution.eyebrow")}</Eyebrow>
              <h2 className="mt-3 text-3xl font-bold leading-[120%] text-forest-950 sm:text-4xl lg:text-5xl">
                {t("solution.title")}
              </h2>
              <p className="mt-4 text-base leading-[150%] text-slate-text">
                {isHindi
                  ? "किसान सारथी मंडी के हर काउंटर को डिजिटल कतार से जोड़ता है। अपना टोकन घर से बुक करें और केवल तभी मंडी पहुंचें जब आपकी बारी आने वाली हो।"
                  : "Kisan Sarthi turns chaotic mandi grounds into orderly virtual queues. Know your exact position, avoid wasted fuel, and protect your precious working hours."}
              </p>

              <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="rounded-card border border-line-soft bg-surface-2 p-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-forest-950 text-lime-300">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h4 className="mt-3 text-base font-bold text-forest-950">
                    {t("solution.feat1Title")}
                  </h4>
                  <p className="mt-1 text-sm text-slate-text">{t("solution.feat1Desc")}</p>
                </div>

                <div className="rounded-card border border-line-soft bg-surface-2 p-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-forest-950 text-lime-300">
                    <Clock className="h-5 w-5" />
                  </div>
                  <h4 className="mt-3 text-base font-bold text-forest-950">
                    {t("solution.feat2Title")}
                  </h4>
                  <p className="mt-1 text-sm text-slate-text">{t("solution.feat2Desc")}</p>
                </div>

                <div className="rounded-card border border-line-soft bg-surface-2 p-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-forest-950 text-lime-300">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <h4 className="mt-3 text-base font-bold text-forest-950">
                    {t("solution.feat3Title")}
                  </h4>
                  <p className="mt-1 text-sm text-slate-text">{t("solution.feat3Desc")}</p>
                </div>

                <div className="rounded-card border border-line-soft bg-surface-2 p-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-forest-950 text-lime-300">
                    <Users className="h-5 w-5" />
                  </div>
                  <h4 className="mt-3 text-base font-bold text-forest-950">
                    {t("solution.feat4Title")}
                  </h4>
                  <p className="mt-1 text-sm text-slate-text">{t("solution.feat4Desc")}</p>
                </div>
              </div>
            </div>

            {/* Spec Sample Token Card */}
            <div className="flex flex-col items-center justify-center lg:col-span-5">
              <div className="mb-4">
                <Chip variant="highlight">{t("solution.sampleBadge")}</Chip>
              </div>
              <div className="p-4 sm:p-8">
                <TokenCard
                  tokenCode="A-042"
                  status="waiting"
                  delayed={false}
                  centerName={isHindi ? "डासना कृषि मंडी" : "Dasna Krishi Mandi"}
                  serviceName={isHindi ? "फसल पंजीकरण (गेहूं)" : "Crop Registration (Wheat)"}
                  counterName={isHindi ? "काउंटर १" : "Counter 1"}
                  position={3}
                  aheadCount={2}
                  estimatedWaitMinutes={30}
                  nowServing="A-040"
                  arrivalMessage={
                    isHindi
                      ? "आप लगभग १५ मिनट में मंडी केंद्र पहुँच सकते हैं।"
                      : "You can reach the center in about 15 minutes."
                  }
                  lang={lang}
                  onDetails={() => {}}
                />
              </div>
              <p className="mt-2 text-center text-xs text-slate-muted">
                {isHindi
                  ? "प्रत्येक किसान को जारी होने वाला डिजिटल टिकट"
                  : "Live token ticket view visible on farmer mobile phones"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section
        id="how-it-works"
        className="border-b border-line-strong bg-surface px-6 py-20 sm:px-12 sm:py-28 lg:px-20"
      >
        <div className="mx-auto max-w-page">
          <div className="text-center">
            <Eyebrow>{t("howItWorks.eyebrow")}</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold leading-[120%] text-forest-950 sm:text-4xl lg:text-5xl">
              {t("howItWorks.title")}
            </h2>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-card border border-line-strong bg-white p-8">
              <span className="font-mono text-2xl font-bold text-forest-800">01</span>
              <h3 className="mt-4 text-xl font-bold text-forest-950">
                {t("howItWorks.step1Title")}
              </h3>
              <p className="mt-3 text-sm leading-[150%] text-slate-text">
                {t("howItWorks.step1Desc")}
              </p>
            </div>

            <div className="rounded-card border border-line-strong bg-white p-8">
              <span className="font-mono text-2xl font-bold text-forest-800">02</span>
              <h3 className="mt-4 text-xl font-bold text-forest-950">
                {t("howItWorks.step2Title")}
              </h3>
              <p className="mt-3 text-sm leading-[150%] text-slate-text">
                {t("howItWorks.step2Desc")}
              </p>
            </div>

            <div className="rounded-card border border-line-strong bg-white p-8">
              <span className="font-mono text-2xl font-bold text-forest-800">03</span>
              <h3 className="mt-4 text-xl font-bold text-forest-950">
                {t("howItWorks.step3Title")}
              </h3>
              <p className="mt-3 text-sm leading-[150%] text-slate-text">
                {t("howItWorks.step3Desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Featured Centers from API */}
      <section className="border-b border-line-strong bg-white px-6 py-20 sm:px-12 sm:py-28 lg:px-20">
        <div className="mx-auto max-w-page">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <Eyebrow>{t("centers.eyebrow")}</Eyebrow>
              <h2 className="mt-2 text-3xl font-bold text-forest-950 sm:text-4xl">
                {isHindi ? "सक्रिय मंडी केंद्र" : "Active Mandi Centers"}
              </h2>
            </div>
            <Link
              to="/centers"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest-950 hover:underline"
            >
              <span>{isHindi ? "सभी केंद्र देखें" : "View all centers"}</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loadingCenters ? (
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-48 animate-pulse rounded-card border border-line-strong bg-surface p-6"
                />
              ))
            ) : featuredCenters.length > 0 ? (
              featuredCenters.map((center) => (
                <div
                  key={center._id}
                  className="flex flex-col justify-between rounded-card border border-line-strong bg-white p-6 transition-transform hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Chip variant="default">{center.type?.replace("_", " ")}</Chip>
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-forest-600">
                        <span className="h-2 w-2 rounded-full bg-forest-500" />
                        ACTIVE
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-forest-950">{center.name}</h3>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-text">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-muted" />
                      <span>
                        {center.district}, {center.state || "Uttar Pradesh"}
                      </span>
                    </p>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-text">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-slate-muted" />
                      <span>
                        {center.openTime || "09:00"} - {center.closeTime || "17:00"}
                      </span>
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-line-soft">
                    <Link
                      to={`/centers/${center._id}`}
                      className="inline-flex w-full items-center justify-center rounded-btn bg-surface px-4 py-2 text-xs font-semibold text-forest-950 hover:bg-mint-200 transition-colors"
                    >
                      {t("centers.viewDetails")}
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full rounded-card border border-line-soft bg-surface p-8 text-center text-sm text-slate-muted">
                {t("centers.noCenters")}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. Trust & Transparency */}
      <section className="border-b border-line-strong bg-surface px-6 py-20 sm:px-12 sm:py-24 lg:px-20">
        <div className="mx-auto max-w-page">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-6 w-6 text-forest-800 shrink-0" />
              <div>
                <h4 className="font-bold text-forest-950">
                  {isHindi ? "सत्यापित खरीद केंद्र" : "Verified Centers"}
                </h4>
                <p className="mt-1 text-xs text-slate-text">
                  {isHindi
                    ? "केवल पंजीकृत एवं सरकारी मान्यता प्राप्त एपीएमसी मंडियां।"
                    : "Directly mapped to government authorized APMC yards."}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="h-6 w-6 text-forest-800 shrink-0" />
              <div>
                <h4 className="font-bold text-forest-950">
                  {isHindi ? "ऑपरेटर द्वारा नियंत्रित" : "Operator Supervised"}
                </h4>
                <p className="mt-1 text-xs text-slate-text">
                  {isHindi
                    ? "प्रत्येक काउंटर प्रशिक्षित कर्मियों द्वारा संचालित।"
                    : "Live counters managed by verified mandi staff."}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Smartphone className="h-6 w-6 text-forest-800 shrink-0" />
              <div>
                <h4 className="font-bold text-forest-950">
                  {isHindi ? "द्विभाषी इंटरफ़ेस" : "Hindi & English"}
                </h4>
                <p className="mt-1 text-xs text-slate-text">
                  {isHindi
                    ? "हर किसान के लिए सरल हिंदी भाषा और आवाज सहायता।"
                    : "Accessible design made specifically for rural users."}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-forest-800 shrink-0" />
              <div>
                <h4 className="font-bold text-forest-950">
                  {isHindi ? "निष्पक्ष एवं पारदर्शी" : "Zero Line Skipping"}
                </h4>
                <p className="mt-1 text-xs text-slate-text">
                  {isHindi
                    ? "प्रथम आगमन, प्रथम सेवा के आधार पर डिजिटल टोकन।"
                    : "Strict algorithmic ordering prevents queue jumping."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Final CTA Section (White page with #17ee1a panel, 16px radius) */}
      <section className="bg-white px-6 py-20 sm:px-12 sm:py-28 lg:px-20">
        <div className="mx-auto max-w-page">
          <div className="relative overflow-hidden rounded-panel border border-forest-950 bg-lime-brand px-8 py-16 text-center sm:px-16 sm:py-20">
            {/* Soft decorative elements */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/20 blur-2xl" />
            <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-forest-950/10 blur-2xl" />

            <div className="relative z-10 mx-auto max-w-2xl">
              <Eyebrow className="text-forest-950">GET STARTED</Eyebrow>
              <h2 className="mt-4 text-3xl font-bold leading-[115%] text-forest-950 sm:text-5xl">
                {isHindi ? "क्या आप कतार में समय बचाना चाहते हैं?" : "Ready to skip the line?"}
              </h2>
              <p className="mt-4 text-base font-medium text-forest-950/80">
                {isHindi
                  ? "आज ही किसान सारथी पर अपना निःशुल्क खाता बनाएं और अपनी अगली फसल बिक्री को परेशानी मुक्त बनाएं।"
                  : "Register in under a minute with your mobile number. Book appointments, see waiting times, and reclaim your day."}
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  to="/register"
                  className="flex h-[52px] items-center rounded-btn bg-forest-950 px-8 text-base font-medium text-lime-300 transition-colors hover:bg-forest-800"
                >
                  {t("nav.register")}
                </Link>
                <Link
                  to="/centers"
                  className="flex h-[52px] items-center rounded-btn border border-forest-950 bg-white px-8 text-base font-medium text-forest-950 transition-colors hover:bg-surface"
                >
                  {t("hero.findCenter")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
