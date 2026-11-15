import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import Chip from "../components/common/Chip";
import CounterStatusPill from "../components/common/CounterStatusPill";
import api from "../services/api";
import {
  Building2,
  Wrench,
  Layers,
  Users,
  AlertTriangle,
  ArrowRight,
  RotateCw,
  Plus,
} from "lucide-react";

export default function AdminDashboard() {
  const [centers, setCenters] = useState([]);
  const [services, setServices] = useState([]);
  const [counters, setCounters] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.get("/centers/admin/all"),
      api.get("/services/admin/all"),
      api.get("/counters/admin/all"),
      api.get("/counters/operators"),
    ])
      .then(([cRes, sRes, cntRes, opRes]) => {
        setCenters(cRes.data.centers || []);
        setServices(sRes.data.services || []);
        setCounters(cntRes.data.counters || []);
        setOperators(opRes.data.operators || []);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || "Failed to load admin stats");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const activeCounters = counters.filter((c) => c.status === "active");
  const pausedCounters = counters.filter((c) => c.status === "paused");
  const inactiveCounters = counters.filter((c) => c.status === "inactive");

  // Operators without counter assignment
  const unassignedOperators = operators.filter((op) => !op.counter && !op.assignedCounter);

  return (
    <AdminLayout
      title="System Overview"
      subtitle="Operational metrics across mandis, queues, counters, and operators."
      action={
        <button
          type="button"
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-2 rounded-btn border border-line-soft bg-white px-3 py-2 text-xs font-semibold text-forest-950 hover:bg-surface cursor-pointer"
        >
          <RotateCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      }
    >
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-card border border-line-strong bg-white" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-card border border-danger/30 bg-danger-soft p-6 text-danger">
          <p className="font-semibold">{error}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Unassigned Operator Alert */}
          {unassignedOperators.length > 0 && (
            <div className="flex items-center justify-between rounded-card border border-warn bg-warn/10 p-4 text-forest-950">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-warn shrink-0" />
                <p className="text-sm font-medium">
                  <strong>{unassignedOperators.length} Operator(s)</strong> are currently unassigned to any counter.
                </p>
              </div>
              <Link
                to="/admin/operators"
                className="rounded-btn bg-forest-950 px-3.5 py-1.5 text-xs font-semibold text-lime-300 hover:bg-forest-800"
              >
                Assign Now
              </Link>
            </div>
          )}

          {/* Metric Overview Tiles */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/admin/centers"
              className="rounded-card border border-line-strong bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-forest-950"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-muted">
                  TOTAL CENTERS
                </span>
                <Building2 className="h-5 w-5 text-forest-800" />
              </div>
              <p className="mt-4 text-4xl font-bold tracking-tight text-forest-950">
                {centers.length}
              </p>
              <p className="mt-2 text-xs text-slate-text">
                {centers.filter((c) => c.status === "active").length} active · {centers.filter((c) => c.status === "inactive").length} inactive
              </p>
            </Link>

            <Link
              to="/admin/services"
              className="rounded-card border border-line-strong bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-forest-950"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-muted">
                  SERVICES
                </span>
                <Wrench className="h-5 w-5 text-forest-800" />
              </div>
              <p className="mt-4 text-4xl font-bold tracking-tight text-forest-950">
                {services.length}
              </p>
              <p className="mt-2 text-xs text-slate-text">
                {services.filter((s) => s.isActive).length} active offerings
              </p>
            </Link>

            <Link
              to="/admin/counters"
              className="rounded-card border border-line-strong bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-forest-950"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-muted">
                  ACTIVE COUNTERS
                </span>
                <Layers className="h-5 w-5 text-forest-800" />
              </div>
              <p className="mt-4 text-4xl font-bold tracking-tight text-forest-950">
                {activeCounters.length}
              </p>
              <p className="mt-2 text-xs text-slate-text">
                {pausedCounters.length} paused · {inactiveCounters.length} offline
              </p>
            </Link>

            <Link
              to="/admin/operators"
              className="rounded-card border border-line-strong bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-forest-950"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-muted">
                  OPERATORS
                </span>
                <Users className="h-5 w-5 text-forest-800" />
              </div>
              <p className="mt-4 text-4xl font-bold tracking-tight text-forest-950">
                {operators.length}
              </p>
              <p className="mt-2 text-xs text-slate-text">
                {operators.length - unassignedOperators.length} on duty
              </p>
            </Link>
          </div>

          {/* Section: Live Counter Breakdown */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="rounded-card border border-line-strong bg-white p-6">
              <div className="flex items-center justify-between border-b border-line-soft pb-4">
                <h3 className="font-bold text-forest-950">Counter Operational Status</h3>
                <Link
                  to="/admin/counters"
                  className="text-xs font-semibold text-forest-950 hover:underline"
                >
                  Manage Counters →
                </Link>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-btn bg-surface">
                  <div className="flex items-center gap-2.5">
                    <span className="h-3 w-3 rounded-full bg-forest-500" />
                    <span className="text-sm font-semibold text-forest-950">Active Counters</span>
                  </div>
                  <span className="font-mono text-sm font-bold text-forest-950">
                    {activeCounters.length}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-btn bg-surface">
                  <div className="flex items-center gap-2.5">
                    <span className="h-3 w-3 rounded-full bg-warn" />
                    <span className="text-sm font-semibold text-forest-950">Paused Counters</span>
                  </div>
                  <span className="font-mono text-sm font-bold text-forest-950">
                    {pausedCounters.length}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-btn bg-surface">
                  <div className="flex items-center gap-2.5">
                    <span className="h-3 w-3 rounded-full bg-slate-muted" />
                    <span className="text-sm font-semibold text-forest-950">Inactive Counters</span>
                  </div>
                  <span className="font-mono text-sm font-bold text-forest-950">
                    {inactiveCounters.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-card border border-line-strong bg-white p-6">
              <h3 className="font-bold text-forest-950 border-b border-line-soft pb-4">
                Quick Setup Shortcuts
              </h3>
              <div className="mt-6 space-y-3">
                <Link
                  to="/admin/centers"
                  className="flex items-center justify-between rounded-btn border border-line-soft p-3 hover:bg-surface transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-forest-800" />
                    <span className="text-sm font-medium text-forest-950">Register New Mandi Center</span>
                  </div>
                  <Plus className="h-4 w-4 text-slate-muted" />
                </Link>

                <Link
                  to="/admin/services"
                  className="flex items-center justify-between rounded-btn border border-line-soft p-3 hover:bg-surface transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Wrench className="h-4 w-4 text-forest-800" />
                    <span className="text-sm font-medium text-forest-950">Add Mandi Service Offering</span>
                  </div>
                  <Plus className="h-4 w-4 text-slate-muted" />
                </Link>

                <Link
                  to="/admin/counters"
                  className="flex items-center justify-between rounded-btn border border-line-soft p-3 hover:bg-surface transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Layers className="h-4 w-4 text-forest-800" />
                    <span className="text-sm font-medium text-forest-950">Configure Service Counter Window</span>
                  </div>
                  <Plus className="h-4 w-4 text-slate-muted" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
