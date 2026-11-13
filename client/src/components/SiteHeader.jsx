import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Menu, X, User, LogOut, LayoutDashboard, Globe } from "lucide-react";
import Chip from "./common/Chip";

export default function SiteHeader() {
  const { user, logout } = useAuth();
  const { lang, toggleLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const getDashboardPath = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin";
    if (user.role === "operator") return "/operator";
    return "/farmer";
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 border-b border-line-strong bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-page items-center justify-between px-6 py-5 sm:px-12 lg:px-20">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-forest-950 text-lime-brand font-mono font-bold text-lg">
            KS
          </div>
          <div>
            <span className="block text-xl font-bold tracking-tight text-forest-950">
              {t("nav.brand")}
            </span>
            <span className="hidden text-[10px] font-medium text-slate-muted sm:block">
              {t("nav.tagline")}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            to="/centers"
            className={`text-sm font-medium transition-colors hover:text-forest-950 ${
              isActive("/centers") ? "text-forest-950 font-bold" : "text-slate-text"
            }`}
          >
            {t("nav.centers")}
          </Link>
          <a
            href="/#how-it-works"
            className="text-sm font-medium text-slate-text transition-colors hover:text-forest-950"
          >
            {t("nav.howItWorks")}
          </a>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLang}
            className="flex items-center gap-1.5 rounded-[4px] border border-line-soft bg-surface px-3 py-1.5 font-mono text-xs font-semibold text-forest-950 transition-colors hover:bg-mint-200 cursor-pointer"
            aria-label="Toggle language"
          >
            <Globe className="h-3.5 w-3.5 text-forest-800" />
            <span>{t("nav.toggleLang")}</span>
          </button>

          {/* Auth buttons or User Profile */}
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to={getDashboardPath()}
                className="flex h-10 items-center gap-2 rounded-btn bg-forest-950 px-4 text-sm font-medium text-lime-300 transition-colors hover:bg-forest-800"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>{t("nav.dashboard")}</span>
              </Link>
              <Link
                to="/profile"
                className="flex h-10 items-center gap-1.5 rounded-btn border border-line-soft px-3 text-sm font-medium text-forest-950 hover:bg-surface"
                title="Profile"
              >
                <User className="h-4 w-4 text-slate-muted" />
                <span className="max-w-[100px] truncate">{user.name?.split(" ")[0]}</span>
                <Chip variant="highlight" className="text-[9px] py-0">{user.role}</Chip>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="flex h-10 items-center justify-center rounded-btn border border-line-soft px-3 text-slate-muted hover:text-danger hover:border-danger cursor-pointer"
                title={t("nav.logout")}
                aria-label={t("nav.logout")}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="flex h-11 items-center rounded-btn border border-line-soft bg-white px-5 text-sm font-medium text-ink transition-colors hover:bg-surface"
              >
                {t("nav.login")}
              </Link>
              <Link
                to="/register"
                className="flex h-11 items-center rounded-btn bg-forest-950 px-5 text-sm font-medium text-lime-300 transition-colors hover:bg-forest-800"
              >
                {t("nav.register")}
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={toggleLang}
            className="flex items-center gap-1 rounded-[4px] border border-line-soft px-2.5 py-1 font-mono text-xs font-semibold text-forest-950"
          >
            <Globe className="h-3 w-3" />
            <span>{t("nav.toggleLang")}</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-btn p-2 text-forest-950 hover:bg-surface focus-visible:outline-forest-950"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-line-strong bg-white px-6 py-6 md:hidden">
          <nav className="flex flex-col gap-4">
            <Link
              to="/centers"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-forest-950 py-1"
            >
              {t("nav.centers")}
            </Link>
            <a
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-forest-950 py-1"
            >
              {t("nav.howItWorks")}
            </a>

            <div className="my-2 border-t border-line-soft" />

            {user ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 py-1">
                  <User className="h-4 w-4 text-slate-muted" />
                  <span className="font-semibold text-forest-950">{user.name}</span>
                  <Chip variant="highlight">{user.role}</Chip>
                </div>
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-12 items-center justify-center rounded-btn bg-forest-950 text-sm font-medium text-lime-300"
                >
                  {t("nav.dashboard")}
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-12 items-center justify-center rounded-btn border border-line-soft text-sm font-medium text-forest-950"
                >
                  {t("nav.profile")}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex h-12 items-center justify-center rounded-btn border border-danger text-sm font-medium text-danger"
                >
                  {t("nav.logout")}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-12 items-center justify-center rounded-btn border border-line-soft text-sm font-medium text-ink"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-12 items-center justify-center rounded-btn bg-forest-950 text-sm font-medium text-lime-300"
                >
                  {t("nav.register")}
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
