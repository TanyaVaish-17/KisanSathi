import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Eye, EyeOff, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const { isHindi } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError(isHindi ? "कृपया अपना ईमेल या मोबाइल नंबर दर्ज करें।" : "Please enter your email or 10-digit mobile number.");
      return;
    }
    if (!password) {
      setError(isHindi ? "कृपया अपना पासवर्ड दर्ज करें।" : "Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const user = await login(identifier.trim(), password);
      // Redirect based on role or previous location
      const from = location.state?.from?.pathname;
      if (from && from !== "/login" && from !== "/register") {
        navigate(from, { replace: true });
      } else if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else if (user.role === "operator") {
        navigate("/operator", { replace: true });
      } else {
        navigate("/farmer", { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || (isHindi ? "लॉग इन विफल रहा।" : "Invalid credentials. Please try again.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow={isHindi ? "स्वागत है" : "WELCOME BACK"}
      title={isHindi ? "किसान सारथी में लॉग इन करें।" : "Log in to Kisan Sarthi."}
      panelTitle={isHindi ? "कतार छोड़ें। अपना समय बचाएं।" : "Skip the line. Keep your day."}
      panelText={
        isHindi
          ? "अपने खेत या घर से ही मंडी की कतार की लाइव स्थिति देखें और सही समय पर पहुंचें।"
          : "Track your mandi queue number in real-time from your farm or home without waiting in line."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Form-level error banner */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-btn border border-danger/40 bg-danger-soft p-3.5 text-xs text-danger font-medium"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 text-danger mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label
            htmlFor="identifier"
            className="block text-xs font-semibold uppercase tracking-wider text-forest-950"
          >
            {isHindi ? "ईमेल या मोबाइल नंबर" : "Email or 10-digit Mobile Number"}
          </label>
          <input
            id="identifier"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={isHindi ? "उदा. 9876543210 या farmer@example.com" : "e.g. 9876543210 or farmer@example.com"}
            autoComplete="username"
            required
            className="mt-2 h-12 w-full rounded-btn border border-line-soft bg-white px-4 text-sm text-forest-950 placeholder:text-slate-muted focus-visible:outline-2 focus-visible:outline-forest-950"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-forest-950"
            >
              {isHindi ? "पासवर्ड" : "Password"}
            </label>
          </div>
          <div className="relative mt-2">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              className="h-12 w-full rounded-btn border border-line-soft bg-white pl-4 pr-11 text-sm text-forest-950 placeholder:text-slate-muted focus-visible:outline-2 focus-visible:outline-forest-950"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-muted hover:text-forest-950 cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-btn bg-forest-950 px-6 text-sm font-medium text-lime-300 transition-colors hover:bg-forest-800 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-lime-300" />
          ) : (
            <>
              <span>{isHindi ? "लॉग इन करें" : "Log in"}</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <div className="pt-2 text-center text-xs text-slate-text">
          <span>{isHindi ? "खाता नहीं है?" : "Don't have an account?"} </span>
          <Link
            to="/register"
            className="font-semibold text-forest-950 hover:underline"
          >
            {isHindi ? "नया किसान खाता बनाएं" : "Create farmer account"}
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
