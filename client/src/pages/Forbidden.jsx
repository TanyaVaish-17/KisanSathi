import React from "react";
import { Link } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

export default function Forbidden() {
  const { isHindi } = useLanguage();
  const { user } = useAuth();

  const getDashboardPath = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin";
    if (user.role === "operator") return "/operator";
    return "/farmer";
  };

  return (
    <PublicLayout>
      <div className="flex min-h-[70vh] items-center justify-center px-6 py-20 text-center">
        <div className="w-full max-w-md rounded-card border border-danger/30 bg-white p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger-soft text-danger">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <span className="mt-6 block font-mono text-xs font-semibold uppercase tracking-[.2em] text-danger">
            403 FORBIDDEN
          </span>
          <h1 className="mt-2 text-2xl font-bold text-forest-950 sm:text-3xl">
            {isHindi ? "पहुंच अस्वीकृत।" : "Access Denied."}
          </h1>
          <p className="mt-3 text-sm text-slate-text">
            {isHindi
              ? "आपके वर्तमान खाते में इस पृष्ठ को देखने की अनुमति नहीं है।"
              : "Your current account role does not have permission to access this internal portal."}
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to={getDashboardPath()}
              className="flex h-11 items-center gap-2 rounded-btn bg-forest-950 px-6 text-sm font-medium text-lime-300 hover:bg-forest-800"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{isHindi ? "अपने डैशबोर्ड पर वापस जाएं" : "Return to My Dashboard"}</span>
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
