import React, { useEffect, useState } from "react";
import PublicLayout from "../layouts/PublicLayout";
import Eyebrow from "../components/common/Eyebrow";
import Chip from "../components/common/Chip";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import api from "../services/api";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Shield,
  Calendar,
  AlertCircle,
  RotateCw,
} from "lucide-react";

export default function Profile() {
  const { user: authUser } = useAuth();
  const { isHindi } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = () => {
    setLoading(true);
    setError(null);
    api
      .get("/auth/me")
      .then((res) => {
        if (res.data.success) {
          setProfile(res.data.user);
        } else {
          setError(res.data.message || "Failed to load profile");
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || "Failed to connect");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const effectiveUser = profile || authUser;

  return (
    <PublicLayout>
      <div className="border-b border-line-strong bg-surface px-6 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto max-w-page">
          <Eyebrow>{isHindi ? "उपयोगकर्ता विवरण" : "ACCOUNT PROFILE"}</Eyebrow>
          <h1 className="mt-2 text-3xl font-bold text-forest-950 sm:text-4xl">
            {isHindi ? "आपकी प्रोफ़ाइल" : "Your Profile"}
          </h1>
          <p className="mt-1 text-sm text-slate-text">
            {isHindi
              ? "पंजीकृत किसान एवं ऑपरेटर पहचान विवरण।"
              : "Registered user credentials and regional assignment."}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-12 sm:px-12">
        {loading ? (
          <div className="h-64 animate-pulse rounded-card border border-line-strong bg-surface p-8" />
        ) : error && !effectiveUser ? (
          <div className="rounded-card border border-danger/40 bg-danger-soft p-8 text-center text-danger">
            <p className="font-semibold">{error}</p>
            <button
              type="button"
              onClick={fetchProfile}
              className="mt-4 inline-flex items-center gap-2 rounded-btn bg-forest-950 px-4 py-2 text-xs font-semibold text-lime-300"
            >
              <RotateCw className="h-4 w-4" />
              <span>Retry</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Notice about read-only status */}
            <div className="flex items-start gap-3 rounded-card border border-line-soft bg-surface-2 p-4 text-xs text-slate-text">
              <AlertCircle className="h-4 w-4 shrink-0 text-slate-muted mt-0.5" />
              <p>
                {isHindi
                  ? "प्रोफ़ाइल संपादन सुरक्षा कारणों से वर्तमान में केवल मंडी प्रशासक द्वारा किया जा सकता है।"
                  : "Profile fields are currently verified and read-only. Contact your mandi administrator for legal record updates."}
              </p>
            </div>

            {/* Profile Card */}
            <div className="rounded-card border border-line-strong bg-white p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-soft pb-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-forest-950 text-lime-brand font-bold text-xl">
                    {effectiveUser?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-forest-950">
                      {effectiveUser?.name}
                    </h2>
                    <p className="text-xs font-mono text-slate-muted">
                      ID: {effectiveUser?.id || effectiveUser?._id}
                    </p>
                  </div>
                </div>
                <div>
                  <Chip variant="highlight" className="text-xs px-3 py-1">
                    {effectiveUser?.role?.toUpperCase()}
                  </Chip>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <span className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-slate-muted">
                    <Mail className="h-3.5 w-3.5" />
                    {isHindi ? "ईमेल पता" : "Email Address"}
                  </span>
                  <p className="text-sm font-semibold text-forest-950">
                    {effectiveUser?.email || (isHindi ? "दर्ज नहीं" : "Not provided")}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-slate-muted">
                    <Phone className="h-3.5 w-3.5" />
                    {isHindi ? "मोबाइल नंबर" : "Mobile Number"}
                  </span>
                  <p className="text-sm font-semibold text-forest-950">
                    {effectiveUser?.phone ? `+91 ${effectiveUser.phone}` : (isHindi ? "दर्ज नहीं" : "Not provided")}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-slate-muted">
                    <MapPin className="h-3.5 w-3.5" />
                    {isHindi ? "जिला एवं क्षेत्र" : "District & Village"}
                  </span>
                  <p className="text-sm font-semibold text-forest-950">
                    {effectiveUser?.village ? `${effectiveUser.village}, ` : ""}
                    {effectiveUser?.district || (isHindi ? "उत्तर प्रदेश" : "Uttar Pradesh")}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-slate-muted">
                    <Globe className="h-3.5 w-3.5" />
                    {isHindi ? "पसंदीदा भाषा" : "Preferred Language"}
                  </span>
                  <p className="text-sm font-semibold text-forest-950 uppercase font-mono">
                    {effectiveUser?.preferredLanguage === "hi" ? "हिन्दी (Hindi)" : "English"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
