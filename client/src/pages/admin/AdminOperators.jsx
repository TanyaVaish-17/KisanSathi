import React, { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import Chip from "../../components/common/Chip";
import api from "../../services/api";
import {
  Users,
  RotateCw,
  Layers,
  Building2,
  Mail,
  Phone,
  X,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export default function AdminOperators() {
  const [operators, setOperators] = useState([]);
  const [counters, setCounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Assign Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [targetCounterId, setTargetCounterId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState(null);

  const fetchOperators = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      api.get("/counters/operators"),
      api.get("/counters/admin/all"),
    ])
      .then(([opRes, cntRes]) => {
        setOperators(opRes.data.operators || []);
        setCounters(cntRes.data.counters || []);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || "Failed to load operators");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOperators();
  }, []);

  const openAssignModal = (op) => {
    setSelectedOperator(op);
    setTargetCounterId(op.counter?._id || op.counter || "");
    setAssignError(null);
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!targetCounterId) {
      setAssignError("Please choose a counter window to assign.");
      return;
    }

    setAssigning(true);
    setAssignError(null);

    try {
      // Find the chosen counter to update
      const counterObj = counters.find((c) => c._id === targetCounterId);
      if (!counterObj) throw new Error("Selected counter was not found.");

      await api.put(`/counters/${targetCounterId}`, {
        name: counterObj.name,
        service: counterObj.service?._id || counterObj.service,
        operator: selectedOperator._id || selectedOperator.id,
      });

      setAssignModalOpen(false);
      fetchOperators();
    } catch (err) {
      setAssignError(err.response?.data?.message || "Failed to assign counter.");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <AdminLayout
      title="Mandi Operators"
      subtitle="Supervise mandi personnel, check desk duties, and assign counter windows."
      action={
        <button
          type="button"
          onClick={fetchOperators}
          className="inline-flex items-center gap-1.5 rounded-btn border border-line-soft bg-white px-3 py-2 text-xs font-semibold text-forest-950 hover:bg-surface"
        >
          <RotateCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      }
    >
      {loading ? (
        <div className="h-64 animate-pulse rounded-card border border-line-strong bg-white" />
      ) : error ? (
        <div className="rounded-card border border-danger/30 bg-danger-soft p-6 text-danger">
          <p className="font-semibold">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-card border border-line-strong bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line-strong bg-surface text-xs font-mono uppercase text-slate-muted">
                  <tr>
                    <th className="px-6 py-4">Operator Name</th>
                    <th className="px-6 py-4">Contact Info</th>
                    <th className="px-6 py-4">Assigned Counter Window</th>
                    <th className="px-6 py-4">Assigned Mandi</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {operators.length > 0 ? (
                    operators.map((op) => (
                      <tr key={op._id || op.id} className="hover:bg-surface/50">
                        <td className="px-6 py-4">
                          <span className="font-bold text-forest-950">{op.name}</span>
                          <span className="block text-xs font-mono text-slate-muted">
                            Role: Operator
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="flex items-center gap-1.5 text-xs text-slate-text">
                            <Mail className="h-3.5 w-3.5 text-slate-muted" />
                            <span>{op.email || "—"}</span>
                          </p>
                          {op.phone && (
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-text">
                              <Phone className="h-3.5 w-3.5 text-slate-muted" />
                              <span>+91 {op.phone}</span>
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {op.counter ? (
                            <span className="inline-flex items-center gap-1.5 font-semibold text-forest-950">
                              <Layers className="h-4 w-4 text-forest-600" />
                              <span>{op.counter.name || "Counter"}</span>
                            </span>
                          ) : (
                            <Chip variant="orange">UNASSIGNED</Chip>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-text">
                          {op.counter?.center?.name || "—"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => openAssignModal(op)}
                            className="rounded-btn bg-surface border border-line-soft px-3 py-1.5 text-xs font-semibold text-forest-950 hover:bg-mint-200"
                          >
                            Assign Counter
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-muted">
                        No operators registered in the system.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Assign Counter Modal */}
      {assignModalOpen && selectedOperator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-card border border-line-strong bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-line-soft pb-4">
              <h3 className="text-xl font-bold text-forest-950">Assign Counter Window</h3>
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="p-1 text-slate-muted hover:text-forest-950"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {assignError && (
              <div className="mt-4 rounded-btn border border-danger/30 bg-danger-soft p-3 text-xs text-danger font-medium">
                {assignError}
              </div>
            )}

            <div className="mt-4 rounded-btn bg-surface p-3 text-xs text-slate-text">
              Assigning operator: <strong>{selectedOperator.name}</strong> (
              {selectedOperator.email || selectedOperator.phone})
            </div>

            <form onSubmit={handleAssignSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-forest-950">
                  Select Target Counter *
                </label>
                <select
                  value={targetCounterId}
                  onChange={(e) => setTargetCounterId(e.target.value)}
                  required
                  className="mt-1 h-10 w-full rounded-btn border border-line-soft px-3 text-sm text-forest-950"
                >
                  <option value="">Select a counter...</option>
                  {counters.map((cnt) => (
                    <option key={cnt._id} value={cnt._id}>
                      {cnt.name} — {cnt.center?.name || "Center"} ({cnt.service?.name || "Service"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-line-soft">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="rounded-btn border border-line-soft px-4 py-2 text-xs font-semibold text-slate-muted hover:text-forest-950"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="rounded-btn bg-forest-950 px-5 py-2 text-xs font-semibold text-lime-300 hover:bg-forest-800 disabled:opacity-50"
                >
                  {assigning ? "Assigning..." : "Confirm Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
