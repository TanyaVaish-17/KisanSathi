import React, { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import Chip from "../../components/common/Chip";
import CounterStatusPill from "../../components/common/CounterStatusPill";
import api from "../../services/api";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  RotateCw,
  Layers,
  Filter,
  User,
  Pause,
  Play,
  Power,
} from "lucide-react";

export default function AdminCounters() {
  const [counters, setCounters] = useState([]);
  const [centers, setCenters] = useState([]);
  const [services, setServices] = useState([]);
  const [operators, setOperators] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCounter, setEditingCounter] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Form Fields
  const [centerId, setCenterId] = useState("");
  const [name, setName] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [operatorId, setOperatorId] = useState("");
  const [status, setStatus] = useState("active");

  // Load initial dropdowns
  useEffect(() => {
    Promise.all([
      api.get("/centers/admin/all"),
      api.get("/counters/operators"),
    ])
      .then(([cRes, oRes]) => {
        setCenters(cRes.data.centers || []);
        setOperators(oRes.data.operators || []);
      })
      .catch((err) => console.error(err));
  }, []);

  // When centerId changes in create modal, fetch services for that center
  useEffect(() => {
    if (centerId) {
      api
        .get(`/services/admin/all?center=${centerId}`)
        .then((res) => setServices(res.data.services || []))
        .catch(() => setServices([]));
    } else {
      setServices([]);
    }
  }, [centerId]);

  const fetchCounters = () => {
    setLoading(true);
    setError(null);
    const params = {};
    if (selectedCenter) params.center = selectedCenter;

    api
      .get("/counters/admin/all", { params })
      .then((res) => {
        if (res.data.success) {
          setCounters(res.data.counters || []);
        } else {
          setError(res.data.message || "Failed to load counters");
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || "Failed to fetch counters");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCounters();
  }, [selectedCenter]);

  const openCreateModal = () => {
    setEditingCounter(null);
    const initialCenter = selectedCenter || (centers[0]?._id || "");
    setCenterId(initialCenter);
    setName("");
    setServiceId("");
    setOperatorId("");
    setStatus("active");
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (cnt) => {
    setEditingCounter(cnt);
    const cId = cnt.center?._id || cnt.center || "";
    setCenterId(cId);
    setName(cnt.name || "");
    setServiceId(cnt.service?._id || cnt.service || "");
    setOperatorId(cnt.operator?._id || cnt.operator || "");
    setStatus(cnt.status || "active");
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError("Counter name is required.");
      return;
    }
    if (!serviceId) {
      setFormError("Assigned service is required.");
      return;
    }
    if (!editingCounter && !centerId) {
      setFormError("Assigned center is required.");
      return;
    }

    setFormSubmitting(true);
    const payload = {
      name: name.trim(),
      service: serviceId,
      status,
    };
    if (operatorId) payload.operator = operatorId;
    if (!editingCounter) payload.center = centerId;

    try {
      if (editingCounter) {
        await api.put(`/counters/${editingCounter._id}`, payload);
      } else {
        await api.post("/counters", payload);
      }
      setModalOpen(false);
      fetchCounters();
    } catch (err) {
      setFormError(err.response?.data?.message || "Counter operation failed");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleQuickStatus = async (counterId, newStatus) => {
    try {
      await api.patch(`/counters/${counterId}/status`, { status: newStatus });
      fetchCounters();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (counterId, counterName) => {
    if (!window.confirm(`Delete counter window "${counterName}"?`)) return;
    try {
      await api.delete(`/counters/${counterId}`);
      fetchCounters();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete counter");
    }
  };

  return (
    <AdminLayout
      title="Counter Windows"
      subtitle="Supervise active queues, assign operators, and toggle physical counter status."
      action={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchCounters}
            className="inline-flex items-center gap-1.5 rounded-btn border border-line-soft bg-white px-3 py-2 text-xs font-semibold text-forest-950 hover:bg-surface"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-btn bg-forest-950 px-4 py-2 text-xs font-semibold text-lime-300 hover:bg-forest-800"
          >
            <Plus className="h-4 w-4" />
            <span>Add Counter</span>
          </button>
        </div>
      }
    >
      {/* Filter by Center */}
      <div className="mb-6 flex items-center gap-3">
        <Filter className="h-4 w-4 text-slate-muted" />
        <select
          value={selectedCenter}
          onChange={(e) => setSelectedCenter(e.target.value)}
          className="h-10 rounded-btn border border-line-soft bg-white px-3 text-xs font-medium text-forest-950 focus-visible:outline-forest-950"
        >
          <option value="">All Mandi Centers</option>
          {centers.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name} ({c.district})
            </option>
          ))}
        </select>
        {selectedCenter && (
          <button
            type="button"
            onClick={() => setSelectedCenter("")}
            className="text-xs text-forest-950 underline"
          >
            Clear filter
          </button>
        )}
      </div>

      {loading ? (
        <div className="h-64 animate-pulse rounded-card border border-line-strong bg-white" />
      ) : error ? (
        <div className="rounded-card border border-danger/30 bg-danger-soft p-6 text-danger">
          <p className="font-semibold">{error}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-line-strong bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line-strong bg-surface text-xs font-mono uppercase text-slate-muted">
                <tr>
                  <th className="px-6 py-4">Counter</th>
                  <th className="px-6 py-4">Mandi Center</th>
                  <th className="px-6 py-4">Assigned Service</th>
                  <th className="px-6 py-4">Operator On Duty</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {counters.length > 0 ? (
                  counters.map((cnt) => (
                    <tr key={cnt._id} className="hover:bg-surface/50">
                      <td className="px-6 py-4">
                        <span className="font-bold text-forest-950">{cnt.name}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-text">
                        {cnt.center?.name || "All Centers"}
                      </td>
                      <td className="px-6 py-4 font-medium text-forest-950">
                        {cnt.service?.name || "General"}
                      </td>
                      <td className="px-6 py-4">
                        {cnt.operator ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-950">
                            <User className="h-3.5 w-3.5 text-forest-600" />
                            {cnt.operator.name || cnt.operator.email}
                          </span>
                        ) : (
                          <span className="font-mono text-xs text-warn">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <CounterStatusPill status={cnt.status} showDelayNotice={false} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {cnt.status === "active" ? (
                            <button
                              type="button"
                              onClick={() => handleQuickStatus(cnt._id, "paused")}
                              className="p-1.5 text-warn hover:bg-warn/10 rounded"
                              title="Pause Counter"
                            >
                              <Pause className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleQuickStatus(cnt._id, "active")}
                              className="p-1.5 text-forest-600 hover:bg-mint-100 rounded"
                              title="Activate Counter"
                            >
                              <Play className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openEditModal(cnt)}
                            className="p-1.5 text-slate-muted hover:text-forest-950"
                            title="Edit Counter"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(cnt._id, cnt.name)}
                            className="p-1.5 text-slate-muted hover:text-danger"
                            title="Delete Counter"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-muted">
                      No counters found. Click "Add Counter" to set up a counter window.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-card border border-line-strong bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-line-soft pb-4">
              <h3 className="text-xl font-bold text-forest-950">
                {editingCounter ? "Edit Counter Window" : "Create Counter Window"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-muted hover:text-forest-950"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 rounded-btn border border-danger/30 bg-danger-soft p-3 text-xs text-danger font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {!editingCounter && (
                <div>
                  <label className="block text-xs font-semibold uppercase text-forest-950">
                    Center *
                  </label>
                  <select
                    value={centerId}
                    onChange={(e) => setCenterId(e.target.value)}
                    required
                    className="mt-1 h-10 w-full rounded-btn border border-line-soft px-3 text-sm text-forest-950"
                  >
                    <option value="">Select Center...</option>
                    {centers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.district})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase text-forest-950">
                  Counter Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Counter 1 (Registration)"
                  required
                  className="mt-1 h-10 w-full rounded-btn border border-line-soft px-3 text-sm text-forest-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-forest-950">
                  Assigned Service *
                </label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  required
                  className="mt-1 h-10 w-full rounded-btn border border-line-soft px-3 text-sm text-forest-950"
                >
                  <option value="">Select Service...</option>
                  {services.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} (~{s.estimatedDuration} mins)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-forest-950">
                  Assigned Operator (Optional)
                </label>
                <select
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                  className="mt-1 h-10 w-full rounded-btn border border-line-soft px-3 text-sm text-forest-950"
                >
                  <option value="">None (Unassigned)</option>
                  {operators.map((op) => (
                    <option key={op._id || op.id} value={op._id || op.id}>
                      {op.name} ({op.phone || op.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-forest-950">
                  Counter Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 h-10 w-full rounded-btn border border-line-soft px-3 text-sm text-forest-950"
                >
                  <option value="active">Active (Open for queue)</option>
                  <option value="paused">Paused (Lunch / Delay)</option>
                  <option value="inactive">Inactive (Offline)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-line-soft">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-btn border border-line-soft px-4 py-2 text-xs font-semibold text-slate-muted hover:text-forest-950"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="rounded-btn bg-forest-950 px-5 py-2 text-xs font-semibold text-lime-300 hover:bg-forest-800 disabled:opacity-50"
                >
                  {formSubmitting ? "Saving..." : editingCounter ? "Save Changes" : "Create Counter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
