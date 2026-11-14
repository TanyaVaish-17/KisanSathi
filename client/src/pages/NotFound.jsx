import React from "react";
import { Link } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import { Compass, ArrowLeft, Building2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function NotFound() {
  const { isHindi } = useLanguage();

  return (
    <PublicLayout>
      <div className="flex min-h-[70vh] items-center justify-center px-6 py-20 text-center">
        <div className="w-full max-w-md rounded-card border border-line-strong bg-white p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface text-forest-800">
            <Compass className="h-8 w-8" />
          </div>
          <span className="mt-6 block font-mono text-xs font-semibold uppercase tracking-[.2em] text-slate-muted">
            404 ERROR
          </span>
          <h1 className="mt-2 text-2xl font-bold text-forest-950 sm:text-3xl">
            {isHindi ? "पृष्ठ नहीं मिला।" : "Page not found."}
          </h1>
          <p className="mt-3 text-sm text-slate-text">
            {isHindi
              ? "आप जिस पृष्ठ को ढूंढ रहे हैं वह मौजूद नहीं है या उसका पता बदल गया है।"
              : "The page you are looking for doesn't exist or has been moved to another location."}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/"
              className="flex h-11 items-center gap-2 rounded-btn bg-forest-950 px-5 text-sm font-medium text-lime-300 hover:bg-forest-800"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{isHindi ? "मुख्य पृष्ठ" : "Back to Home"}</span>
            </Link>
            <Link
              to="/centers"
              className="flex h-11 items-center gap-2 rounded-btn border border-line-soft bg-white px-5 text-sm font-medium text-forest-950 hover:bg-surface"
            >
              <Building2 className="h-4 w-4" />
              <span>{isHindi ? "मंडी केंद्र" : "Browse Centers"}</span>
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
