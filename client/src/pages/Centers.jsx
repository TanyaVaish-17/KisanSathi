import React, { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import Eyebrow from "../components/common/Eyebrow";
import Chip from "../components/common/Chip";
import { useLanguage } from "../context/LanguageContext";
import api from "../services/api";
import {
  Search,
  MapPin,
  Clock,
  Calendar,
  Filter,
  ArrowRight,
  RotateCw,
  Building2,
} from "lucide-react";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES_HI = ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"];

export default function Centers() {
  const { t, isHindi } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const queryDistrict = searchParams.get("district") || "";
  const queryQ = searchParams.get("q") || "";
  const queryType = searchParams.get("type") || "";

  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchInput, setSearchInput] = useState(queryQ);
  const [districtFilter, setDistrictFilter] = useState(queryDistrict);
  const [typeFilter, setTypeFilter] = useState(queryType);

  // Sync inputs with URL params
  useEffect(() => {
    setSearchInput(queryQ);
    setDistrictFilter(queryDistrict);
    setTypeFilter(queryType);
  }, [queryQ, queryDistrict, queryType]);

  // Debounce search update to URL
  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams();
      if (searchInput.trim()) params.set("q", searchInput.trim());
      if (districtFilter) params.set("district", districtFilter);
      if (typeFilter) params.set("type", typeFilter);
      setSearchParams(params, { replace: true });
    }, 300);

    return () => clearTimeout(handler);
  }, [searchInput, districtFilter, typeFilter, setSearchParams]);

  const fetchCenters = () => {
    setLoading(true);
    setError(null);

    const params = {};
    if (queryQ) params.q = queryQ;
    if (queryDistrict) params.district = queryDistrict;

    api
      .get("/centers", { params })
      .then((res) => {
        if (res.data.success) {
          setCenters(res.data.centers || res.data.data || []);
        } else {
          setError(res.data.message || "Failed to load centers");
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || "Cannot connect to server");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCenters();
  }, [queryQ, queryDistrict]);

  // Extract unique districts for dropdown filter
  const districts = useMemo(() => {
    const dList = new Set();
    centers.forEach((c) => {
      if (c.district) dList.add(c.district);
    });
    return Array.from(dList).sort();
  }, [centers]);

  // Filter client-side by center type if set
  const filteredCenters = useMemo(() => {
    if (!typeFilter) return centers;
    return centers.filter((c) => c.type === typeFilter);
  }, [centers, typeFilter]);

  const formatDays = (workingDays) => {
    if (!workingDays || !Array.isArray(workingDays) || workingDays.length === 0) {
      return isHindi ? "सोम - शनि" : "Mon - Sat";
    }
    const days = isHindi ? DAY_NAMES_HI : DAY_NAMES;
    return workingDays.map((d) => days[d] || d).join(", ");
  };

  return (
    <PublicLayout>
      <div className="border-b border-line-strong bg-surface py-12 px-6 sm:px-12 lg:px-20">
        <div className="mx-auto max-w-page">
          <Eyebrow>{t("centers.eyebrow")}</Eyebrow>
          <h1 className="mt-3 text-3xl font-bold leading-[120%] text-forest-950 sm:text-4xl lg:text-5xl">
            {t("centers.title")}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-slate-text">
            {t("centers.subtitle")}
          </p>

          {/* Search and Filters Bar */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-12">
            {/* Search Input */}
            <div className="relative sm:col-span-6 lg:col-span-6">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-muted" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t("centers.searchPlaceholder")}
                className="h-12 w-full rounded-btn border border-line-soft bg-white pl-11 pr-4 text-sm text-forest-950 placeholder:text-slate-muted focus-visible:outline-2 focus-visible:outline-forest-950"
              />
            </div>

            {/* District Filter */}
            <div className="sm:col-span-3 lg:col-span-3">
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="h-12 w-full rounded-btn border border-line-soft bg-white px-3 text-sm text-forest-950 focus-visible:outline-2 focus-visible:outline-forest-950"
              >
                <option value="">{t("centers.allDistricts")}</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="sm:col-span-3 lg:col-span-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-12 w-full rounded-btn border border-line-soft bg-white px-3 text-sm text-forest-950 focus-visible:outline-2 focus-visible:outline-forest-950"
              >
                <option value="">{t("centers.typeAll")}</option>
                <option value="mandi">{t("centers.typeMandi")}</option>
                <option value="procurement_center">{t("centers.typeProcurement")}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="mx-auto max-w-page px-6 py-12 sm:px-12 lg:px-20">
        <div className="mb-6 flex items-center justify-between text-xs font-mono text-slate-muted">
          <span>
            {t("centers.showing")} {filteredCenters.length} {t("centers.centersFound")}
          </span>
          {(searchInput || districtFilter || typeFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setDistrictFilter("");
                setTypeFilter("");
              }}
              className="text-forest-950 underline hover:text-forest-800"
            >
              {isHindi ? "फ़िल्टर हटाएं" : "Clear filters"}
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="h-56 animate-pulse rounded-card border border-line-strong bg-surface p-6"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-card border border-danger/30 bg-danger-soft p-8 text-center">
            <p className="text-base font-semibold text-danger">{error}</p>
            <button
              type="button"
              onClick={fetchCenters}
              className="mt-4 inline-flex items-center gap-2 rounded-btn bg-forest-950 px-5 py-2.5 text-sm font-medium text-lime-300"
            >
              <RotateCw className="h-4 w-4" />
              <span>{isHindi ? "पुनः प्रयास करें" : "Try Again"}</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredCenters.length === 0 && (
          <div className="rounded-card border border-line-strong bg-white p-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-slate-muted/60" />
            <h3 className="mt-4 text-lg font-bold text-forest-950">
              {t("centers.noCenters")}
            </h3>
            <p className="mt-1 text-sm text-slate-text">
              {isHindi
                ? "कृपया अन्य जिला या नाम लिखकर खोजें।"
                : "Try searching with a different center name or reset your filters."}
            </p>
          </div>
        )}

        {/* Grid of Center Cards */}
        {!loading && !error && filteredCenters.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCenters.map((center) => (
              <article
                key={center._id}
                className="flex flex-col justify-between rounded-card border border-line-strong bg-white p-6 transition-all hover:-translate-y-1 hover:border-forest-950"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <Chip variant="default">
                      {center.type === "mandi"
                        ? isHindi
                          ? "मंडी"
                          : "MANDI"
                        : isHindi
                        ? "खरीद केंद्र"
                        : "PROCUREMENT"}
                    </Chip>
                    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-forest-600 font-semibold">
                      <span className="h-2 w-2 rounded-full bg-forest-500" />
                      {center.status === "active" ? t("centers.statusActive") : t("centers.statusInactive")}
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-bold leading-[120%] text-forest-950">
                    {center.name}
                  </h3>

                  <div className="mt-4 space-y-2 text-sm text-slate-text">
                    <p className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-slate-muted mt-0.5" />
                      <span>
                        {center.address}, {center.district}, {center.state || "Uttar Pradesh"}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0 text-slate-muted" />
                      <span>
                        {center.openTime || "09:00"} – {center.closeTime || "17:00"}
                      </span>
                    </p>
                    <p className="flex items-center gap-2 text-xs text-slate-muted">
                      <Calendar className="h-4 w-4 shrink-0 text-slate-muted" />
                      <span>{formatDays(center.workingDays)}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-line-soft pt-4">
                  <Link
                    to={`/centers/${center._id}`}
                    className="flex h-11 items-center justify-between rounded-btn bg-surface px-4 text-sm font-semibold text-forest-950 transition-colors hover:bg-mint-200"
                  >
                    <span>{t("centers.viewDetails")}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
