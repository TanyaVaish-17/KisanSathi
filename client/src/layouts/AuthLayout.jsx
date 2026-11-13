import React from "react";
import { Link } from "react-router-dom";
import AuthAnimation from "../components/AuthAnimation";
import { useLanguage } from "../context/LanguageContext";
import { Globe, ArrowLeft } from "lucide-react";

export default function AuthLayout({
  eyebrow,
  title,
  panelTitle,
  panelText,
  children,
}) {
  const { toggleLang, t, isHindi } = useLanguage();

  return (
    <div className="relative min-h-screen bg-white">
      {/* Top bar for navigation and language */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-5 sm:px-10">
        <Link
          to="/"
          className="flex items-center gap-2 text-forest-950 font-bold hover:opacity-80 transition-opacity"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-[4px] bg-forest-950 text-lime-brand font-mono text-sm font-bold">
            KS
          </div>
          <span className="text-lg">{isHindi ? "किसान सारथी" : "Kisan Sarthi"}</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-muted hover:text-forest-950"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{isHindi ? "होम पर वापस" : "Back to Home"}</span>
          </Link>
          <button
            type="button"
            onClick={toggleLang}
            className="flex items-center gap-1.5 rounded-[4px] border border-line-soft bg-surface px-3 py-1 font-mono text-xs font-semibold text-forest-950 hover:bg-mint-200 cursor-pointer"
          >
            <Globe className="h-3 w-3 text-forest-800" />
            <span>{t("nav.toggleLang")}</span>
          </button>
        </div>
      </div>

      <div className="grid min-h-screen pt-16 lg:pt-0 lg:grid-cols-[45fr_55fr]">
        {/* Animation panel (desktop) */}
        <aside className="hidden flex-col items-center justify-center gap-6 border-r border-line-soft bg-surface p-12 lg:flex">
          <div className="w-full max-w-[560px]">
            <AuthAnimation />
            <div className="mt-6 text-center">
              <h2 className="text-2xl font-bold leading-[120%] text-forest-950 sm:text-3xl">
                {panelTitle}
              </h2>
              <p className="mt-2 text-sm leading-[150%] text-slate-text sm:text-base">
                {panelText}
              </p>
            </div>
          </div>
        </aside>

        {/* Form panel */}
        <main className="flex items-center justify-center px-6 py-12 sm:px-12 sm:py-20">
          <div className="w-full max-w-[440px]">
            <p className="font-mono text-xs font-semibold uppercase tracking-[.2em] text-forest-950">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-[120%] text-forest-950 sm:text-4xl">
              {title}
            </h1>
            <div className="mt-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
