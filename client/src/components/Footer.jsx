import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function Footer() {
  const { t, isHindi } = useLanguage();

  return (
    <footer className="border-t border-forest-800 bg-forest-950 text-mint-200">
      <div className="mx-auto max-w-page px-6 py-16 sm:px-12 sm:py-20 lg:px-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-[4px] bg-lime-brand font-mono font-bold text-forest-950 text-base">
                KS
              </span>
              <span className="text-xl font-bold tracking-tight text-white">
                {isHindi ? "किसान सारथी" : "Kisan Sarthi"}
              </span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-[150%] text-mint-200/80">
              {t("footer.desc")}
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-mono">
              <span className="rounded-[2px] bg-forest-800 px-2 py-1 text-mint-200">
                APMC Mandi
              </span>
              <span className="rounded-[2px] bg-forest-800 px-2 py-1 text-mint-200">
                MSP Procurement
              </span>
              <span className="rounded-[2px] bg-forest-800 px-2 py-1 text-mint-200">
                Fair Turn Algorithm
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-mono text-xs font-semibold uppercase tracking-[.2em] text-lime-300">
              {t("footer.quickLinks")}
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/centers" className="transition-colors hover:text-lime-300">
                  {t("nav.centers")}
                </Link>
              </li>
              <li>
                <a href="/#how-it-works" className="transition-colors hover:text-lime-300">
                  {t("nav.howItWorks")}
                </a>
              </li>
              <li>
                <Link to="/login" className="transition-colors hover:text-lime-300">
                  {t("nav.login")}
                </Link>
              </li>
              <li>
                <Link to="/register" className="transition-colors hover:text-lime-300">
                  {t("nav.register")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Portal access */}
          <div>
            <h4 className="font-mono text-xs font-semibold uppercase tracking-[.2em] text-lime-300">
              {isHindi ? "पोर्टल" : "Portals"}
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/farmer" className="transition-colors hover:text-lime-300">
                  {isHindi ? "किसान पोर्टल" : "Farmer Portal"}
                </Link>
              </li>
              <li>
                <Link to="/operator" className="transition-colors hover:text-lime-300">
                  {isHindi ? "ऑपरेटर कंसोल" : "Operator Console"}
                </Link>
              </li>
              <li>
                <Link to="/admin" className="transition-colors hover:text-lime-300">
                  {isHindi ? "प्रशासन (Admin)" : "Admin Dashboard"}
                </Link>
              </li>
              <li>
                <span className="inline-block mt-2 font-mono text-[11px] text-mint-200/60">
                  API: v1.0.4 · UP Govt Mandi Hub
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Oversized Wordmark (Keyvo style) */}
        <div className="mt-16 border-t border-forest-800/80 pt-12 text-center select-none overflow-hidden">
          <p className="font-bold tracking-tighter text-forest-800 text-[11vw] sm:text-[9vw] leading-none opacity-40">
            KISAN SARTHI
          </p>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-forest-800/60 pt-6 text-xs text-mint-200/70 sm:flex-row">
          <p>{t("footer.copyright")}</p>
          <div className="flex gap-6">
            <span className="font-mono">HOST GROTESK + AZERET MONO</span>
            <span className="font-mono">LIGHT DESIGN SYSTEM</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
