import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500";

const initialForm = {
  name: "",
  phone: "",
  email: "",
  village: "",
  district: "",
  preferredLanguage: "en",
  password: "",
  confirmPassword: "",
};

export default function Register() {
  const { user, register } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      return setError("Enter a valid 10-digit mobile number");
    }
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }
    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    const { confirmPassword, ...payload } = form;
    if (!payload.email) delete payload.email;

    setSubmitting(true);
    try {
      await register(payload);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-sm border border-green-100">
        <h1 className="text-2xl font-bold text-green-700">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Register as a farmer to book queue tokens</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">Full name</label>
            <input id="name" name="name" required value={form.name} onChange={handleChange} className={inputClass} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium">Mobile number</label>
              <input id="phone" name="phone" inputMode="numeric" maxLength={10} required value={form.phone} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium">Email (optional)</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="village" className="block text-sm font-medium">Village</label>
              <input id="village" name="village" value={form.village} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label htmlFor="district" className="block text-sm font-medium">District</label>
              <input id="district" name="district" value={form.district} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div>
            <label htmlFor="preferredLanguage" className="block text-sm font-medium">Preferred language</label>
            <select id="preferredLanguage" name="preferredLanguage" value={form.preferredLanguage} onChange={handleChange} className={inputClass}>
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="password" className="block text-sm font-medium">Password</label>
              <input id="password" name="password" type="password" required value={form.password} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium">Confirm password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" required value={form.confirmPassword} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-green-600 py-2.5 font-semibold text-white hover:bg-green-700 disabled:opacity-60"
          >
            {submitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-green-700 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}