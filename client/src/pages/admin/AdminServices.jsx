import React, { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import Chip from "../../components/common/Chip";
import api from "../../services/api";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  RotateCw,
  Wrench,
  Clock,
  Filter,
} from "lucide-react";

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Form Fields
  const [centerId, setCenterId] = useState("");
  const [name, setName] = useState("");
  const [nameHi, setNameHi] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState(15);
  const [isActive, setIsActive] = useState(true);

  // Load centers for filter dropdown
  useEffect(() => {
    api
      .get("/centers/admin/all")
      .then((res) => {
        if (res.data.success) {
          setCenters(res.data.centers || []);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const fetchServices = () => {
    setLoading(true);
    setError(null);
    const params = {};
    if (selectedCenter) params.center = selectedCenter;

    api
      .get("/services/admin/all", { params })
      .then((res) => {
        if (res.data.success) {
          setServices(res.data.services || []);
        } else {
          setError(res.data.message || "Failed to load services");
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || "Failed to fetch services");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchServices();
  }, [selectedCenter]);

  const openCreateModal = () => {
    setEditingService(null);
    setCenterId(selectedCenter || (centers[0]?._id || ""));
    setName("");
    setNameHi("");
    setDescription("");
    setEstimatedDuration(15);
    setIsActive(true);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (s) => {
    setEditingService(s);
    setCenterId(s.center?._id || s.center || "");
    setName(s.name || "");
    setNameHi(s.nameHi || "");
    setDescription(s.description || "");
    setEstimatedDuration(s.estimatedDuration || 15);
    setIsActive(s.isActive ?? true);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError("Service name is required.");
      return;
    }
    if (!editingService && !centerId) {
      setFormError("Target center is required.");
      return;
    }

    const duration = parseInt(estimatedDuration, 10);
    if (isNaN(duration) || duration < 1 || duration > 240) {
      setFormError("Estimated duration must be between 1 and 240 minutes.");
      return;
    }

    setFormSubmitting(true);
    const payload = {
      name: name.trim(),
      nameHi: nameHi.trim(),
      description: description.trim(),
      estimatedDuration: duration,
      isActive,
    };
    if (!editingService) {
      payload.center = centerId;
    }

    try {
      if (editingService) {
        await api.put(`/services/${editingService._id}`, payload);
      } else {
        await api.post("/services", payload);
      }
      setModalOpen(false);
      fetchServices();
    } catch (err) {
      setFormError(err.response?.data?.message || "Operation failed");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (serviceId, serviceName) => {
    if (!window.confirm(`Are you sure you want to delete service "${serviceName}"?`)) {
      return;
    }
    try {
      await api.delete(`/services/${serviceId}`);
      fetchServices();
    } catch (err) {
      alert(err.response?.data?.message || "Cannot delete service while counters depend on it.");
    }
  };

  return (
    <AdminLayout
      title="Mandi Services"
      subtitle="Configure agricultural processing workflows, duration standards, and bilingual titles."
      action={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchServices}
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
            <span>Add Service</span>
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
                  <th className="px-6 py-4">Service Name</th>
                  <th className="px-6 py-4">Hindi Title (nameHi)</th>
                  <th className="px-6 py-4">Mandi Center</th>
                  <th className="px-6 py-4">Est. Duration</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {services.length > 0 ? (
                  services.map((s) => (
                    <tr key={s._id} className="hover:bg-surface/50">
                      <td className="px-6 py-4">
                        <span className="font-bold text-forest-950">{s.name}</span>
                        {s.description && (
                          <p className="text-xs text-slate-muted truncate max-w-xs">{s.description}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-forest-950">
                        {s.nameHi || "—"}
                      </td>
                      <td className="px-6 py-4 text-slate-text">
                        {s.center?.name || "All Centers"}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-forest-950">
                        ~{s.estimatedDuration} mins
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 font-mono text-xs font-bold ${
                            s.isActive ? "text-forest-600" : "text-slate-muted"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              s.isActive ? "bg-forest-500" : "bg-slate-muted"
                            }`}
                          />
                          {s.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(s)}
                            className="p-1.5 text-slate-muted hover:text-forest-950"
                            title="Edit Service"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(s._id, s.name)}
                            className="p-1.5 text-slate-muted hover:text-danger"
                            title="Delete Service"
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
                      No services configured for this center. Click "Add Service" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Create / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-card border border-line-strong bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-line-soft pb-4">
              <h3 className="text-xl font-bold text-forest-950">
                {editingService ? "Edit Service" : "Add New Mandi Service"}
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
              {!editingService && (
                <div>
                  <label className="block text-xs font-semibold uppercase text-forest-950">
                    Target Center *
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
                  Service Name (English) *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Wheat Crop Registration"
                  required
                  className="mt-1 h-10 w-full rounded-btn border border-line-soft px-3 text-sm text-forest-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-forest-950">
                  Hindi Title (nameHi)
                </label>
                <input
                  type="text"
                  value={nameHi}
                  onChange={(e) => setNameHi(e.target.value)}
                  placeholder="उदा. गेहूं फसल पंजीकरण"
                  className="mt-1 h-10 w-full rounded-btn border border-line-soft px-3 text-sm text-forest-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-forest-950">
                  Estimated Duration (Minutes, 1-240) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="240"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  required
                  className="mt-1 h-10 w-full rounded-btn border border-line-soft px-3 text-sm font-mono text-forest-950"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-forest-950">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="2"
                  placeholder="Documents required, inspection guidelines, etc."
                  className="mt-1 w-full rounded-btn border border-line-soft p-3 text-sm text-forest-950"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-line-soft text-forest-950 focus:ring-forest-950"
                />
                <label htmlFor="isActive" className="text-xs font-semibold text-forest-950">
                  Service is currently active and open for booking
                </label>
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
                  {formSubmitting ? "Saving..." : editingService ? "Save Changes" : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
