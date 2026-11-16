import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Eye, EyeOff, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const { isHindi } = useLanguage();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState(isHindi ? "hi" : "en");
  const [village, setVillage] = useState("");
  const [district, setDistrict] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError(isHindi ? "नाम कम से कम २ अक्षरों का होना चाहिए।" : "Name must be at least 2 characters.");
      return;
    }

    if (!email.trim() && !phone.trim()) {
      setError(isHindi ? "ईमेल या १० अंकों का मोबाइल नंबर में से कम से कम एक अवश्य भरें।" : "Please provide either email or mobile number.");
      return;
    }

    if (phone.trim() && !/^[6-9]\d{9}$/.test(phone.trim())) {
      setError(isHindi ? "कृपया १० अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें (6-9 से शुरू)।" : "Phone must be a valid 10-digit Indian mobile number starting with 6-9.");
      return;
    }

    if (password.length < 6) {
      setError(isHindi ? "पासवर्ड कम से कम ६ अक्षरों का होना चाहिए।" : "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        password,
        preferredLanguage,
      };
      if (email.trim()) payload.email = email.trim();
      if (phone.trim()) payload.phone = phone.trim();
      if (village.trim()) payload.village = village.trim();
      if (district.trim()) payload.district = district.trim();

      await register(payload);
      navigate("/farmer", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || (isHindi ? "पंजीकरण विफल रहा।" : "Registration failed. Please check your details.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      eyebrow={isHindi ? "नया किसान खाता" : "NEW FARMER"}
      title={isHindi ? "अपना खाता बनाएं।" : "Create your account."}
      panelTitle={isHindi ? "खेत से ही अपनी बारी बुक करें।" : "Book your turn from the field."}
      panelText={
        isHindi
          ? "हजारों किसानों के साथ जुड़ें जो हर मंडी दौरे में ५ से १० घंटे बचा रहे हैं।"
          : "Join thousands of farmers saving up to 10 hours per mandi visit with fair digital queuing."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
            htmlFor="name"
            className="block text-xs font-semibold uppercase tracking-wider text-forest-950"
          >
            {isHindi ? "पूरा नाम *" : "Full Name *"}
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isHindi ? "उदा. रमेश कुमार" : "e.g. Ramesh Kumar"}
            required
            className="mt-1.5 h-11 w-full rounded-btn border border-line-soft bg-white px-4 text-sm text-forest-950 placeholder:text-slate-muted focus-visible:outline-2 focus-visible:outline-forest-950"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="phone"
              className="block text-xs font-semibold uppercase tracking-wider text-forest-950"
            >
              {isHindi ? "मोबाइल नंबर *" : "Mobile Number *"}
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
              className="mt-1.5 h-11 w-full rounded-btn border border-line-soft bg-white px-4 text-sm text-forest-950 placeholder:text-slate-muted focus-visible:outline-2 focus-visible:outline-forest-950"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-wider text-forest-950"
            >
              {isHindi ? "ईमेल (वैकल्पिक)" : "Email (Optional)"}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="farmer@example.com"
              className="mt-1.5 h-11 w-full rounded-btn border border-line-soft bg-white px-4 text-sm text-forest-950 placeholder:text-slate-muted focus-visible:outline-2 focus-visible:outline-forest-950"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-semibold uppercase tracking-wider text-forest-950"
          >
            {isHindi ? "पासवर्ड (कम से कम ६ अक्षर) *" : "Password (min 6 characters) *"}
          </label>
          <div className="relative mt-1.5">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="h-11 w-full rounded-btn border border-line-soft bg-white pl-4 pr-11 text-sm text-forest-950 placeholder:text-slate-muted focus-visible:outline-2 focus-visible:outline-forest-950"
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="district"
              className="block text-xs font-semibold uppercase tracking-wider text-forest-950"
            >
              {isHindi ? "जिला" : "District"}
            </label>
            <input
              id="district"
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder={isHindi ? "उदा. गाज़ियाबाद" : "e.g. Ghaziabad"}
              className="mt-1.5 h-11 w-full rounded-btn border border-line-soft bg-white px-4 text-sm text-forest-950 placeholder:text-slate-muted focus-visible:outline-2 focus-visible:outline-forest-950"
            />
          </div>

          <div>
            <label
              htmlFor="village"
              className="block text-xs font-semibold uppercase tracking-wider text-forest-950"
            >
              {isHindi ? "गांव / क्षेत्र" : "Village / Area"}
            </label>
            <input
              id="village"
              type="text"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              placeholder={isHindi ? "उदा. डासना" : "e.g. Dasna"}
              className="mt-1.5 h-11 w-full rounded-btn border border-line-soft bg-white px-4 text-sm text-forest-950 placeholder:text-slate-muted focus-visible:outline-2 focus-visible:outline-forest-950"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="preferredLanguage"
            className="block text-xs font-semibold uppercase tracking-wider text-forest-950"
          >
            {isHindi ? "पसंदीदा भाषा" : "Preferred Language"}
          </label>
          <select
            id="preferredLanguage"
            value={preferredLanguage}
            onChange={(e) => setPreferredLanguage(e.target.value)}
            className="mt-1.5 h-11 w-full rounded-btn border border-line-soft bg-white px-3 text-sm text-forest-950 focus-visible:outline-2 focus-visible:outline-forest-950"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी (Hindi)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-btn bg-forest-950 px-6 text-sm font-medium text-lime-300 transition-colors hover:bg-forest-800 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-lime-300" />
          ) : (
            <>
              <span>{isHindi ? "खाता बनाएं" : "Create Account"}</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <div className="pt-2 text-center text-xs text-slate-text">
          <span>{isHindi ? "पहले से पंजीकृत हैं?" : "Already registered?"} </span>
          <Link to="/login" className="font-semibold text-forest-950 hover:underline">
            {isHindi ? "यहाँ लॉग इन करें" : "Log in here"}
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
