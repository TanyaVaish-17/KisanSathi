import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import {
  LayoutDashboard,
  Building2,
  Wrench,
  Layers,
  Users,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import Chip from "../components/common/Chip";

export default function AdminLayout({ children, title, subtitle, action }) {
  const { user, logout } = useAuth();
  const { isHindi } = useLanguage();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    {
      to: "/admin",
      label: isHindi ? "डैशबोर्ड" : "Dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      to: "/admin/centers",
      label: isHindi ? "मंडी केंद्र" : "Centers",
      icon: Building2,
    },
    {
      to: "/admin/services",
      label: isHindi ? "सेवाएं" : "Services",
      icon: Wrench,
    },
    {
      to: "/admin/counters",
      label: isHindi ? "काउंटर प्रबंधन" : "Counters",
      icon: Layers,
    },
    {
      to: "/admin/operators",
      label: isHindi ? "ऑपरेटर्स" : "Operators",
      icon: Users,
    },
  ];

  const isCurrent = (item) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-forest-800 bg-forest-950 text-mint-200 md:flex">
        {/* Brand */}
        <div className="flex h-16 items-center gap-2.5 border-b border-forest-800 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-[4px] bg-lime-brand font-mono text-sm font-bold text-forest-950">
            KS
          </div>
          <div>
            <span className="block text-base font-bold text-white">
              {isHindi ? "किसान सारथी" : "Kisan Sarthi"}
            </span>
            <span className="block text-[10px] font-mono uppercase tracking-wider text-lime-300">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => {
            const active = isCurrent(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-forest-800 text-lime-300 font-semibold"
                    : "text-mint-200/80 hover:bg-forest-900 hover:text-lime-300"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-lime-300" : "text-mint-200/60"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer / Switch link */}
        <div className="border-t border-forest-800 p-4">
          <Link
            to="/"
            className="flex items-center justify-between rounded-btn border border-forest-800 px-3 py-2 text-xs text-mint-200/80 hover:bg-forest-900 hover:text-lime-300"
          >
            <span>{isHindi ? "पब्लिक साइट देखें" : "View Public Site"}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line-strong bg-white px-6">
          <div className="flex items-center gap-3 md:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-btn p-1.5 text-forest-950 hover:bg-surface"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <span className="font-bold text-forest-950">Kisan Sarthi Admin</span>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <ShieldCheck className="h-4 w-4 text-forest-600" />
            <span className="font-mono text-xs uppercase tracking-wider text-slate-muted">
              System Administrator Mode
            </span>
          </div>

          {/* User menu */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-forest-950">{user?.name}</span>
              <Chip variant="highlight">ADMIN</Chip>
            </div>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 rounded-btn border border-line-soft px-3 py-1.5 text-xs font-medium text-slate-muted hover:border-danger hover:text-danger cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>{isHindi ? "लॉग आउट" : "Log out"}</span>
            </button>
          </div>
        </header>

        {/* Mobile Sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 md:hidden">
            <div className="flex h-full w-64 flex-col bg-forest-950 text-mint-200 p-4">
              <div className="flex items-center justify-between border-b border-forest-800 pb-4">
                <span className="font-bold text-white">Admin Navigation</span>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-btn p-1 text-mint-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="mt-4 flex-1 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-medium text-mint-200 hover:text-lime-300"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Page Header and Content */}
        <div className="flex-1 p-6 sm:p-10">
          {(title || action) && (
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {title && (
                  <h1 className="text-2xl font-bold text-forest-950 sm:text-3xl">
                    {title}
                  </h1>
                )}
                {subtitle && <p className="mt-1 text-sm text-slate-text">{subtitle}</p>}
              </div>
              {action && <div>{action}</div>}
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
