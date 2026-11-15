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
  AlertCircle,
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function AdminCenters() {
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Form Fields
  const [name, setName] = useState("");
  const [type, setType] = useState("mandi");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [stateName, setStateName] = useState("Uttar Pradesh");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [openTime, setOpenTime] = useState("09:00");
  const [closeTime, setCloseTime] = useState("17:00");
  const [status, setStatus] = useState("active");

  const fetchCenters = () => {
    setLoading(true);
    setError(null);
    api
      .get("/centers/admin/all")
      .then((res) => {
        if (res.data.success) {
          setCenters(res.data.centers || []);
        } else {
          setError(res.data.message || "Failed to load centers");
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || "Failed to connect to API");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCenters();
  }, []);

  const openCreateModal = () => {
    setEditingCenter(null);
    setName("");
    setType("mandi");
    setAddress("");
    setDistrict("");
    setStateName("Uttar Pradesh");
    setLatitude("");
    setLongitude("");
    setOpenTime("09:00");
    setCloseTime("17:00");
    setStatus("active");
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingCenter(c);
    setName(c.name || "");
    setType(c.type || "mandi");
    setAddress(c.address || "");
    setDistrict(c.district || "");
    setStateName(c.state || "Uttar Pradesh");
    setLatitude(c.latitude !== undefined && c.latitude !== null ? String(c.latitude) : "");
    setLongitude(c.longitude !== undefined && c.longitude !== null ? String(c.longitude) : "");
    setOpenTime(c.openTime || "09:00");
    setCloseTime(c.closeTime || "17:00");
    setStatus(c.status || "active");
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || !address.trim() || !district.trim()) {
      setFormError("Name, Address, and District are required.");
      return;
    }

    setFormSubmitting(true);
    const payload = {
      name: name.trim(),
      type,
      address: address.trim(),
      district: district.trim(),
      state: stateName.trim() || "Uttar Pradesh",
      openTime,
      closeTime,
      status,
    };
    if (latitude) payload.latitude = parseFloat(latitude);
    if (longitude) payload.longitude = parseFloat(longitude);

    try {
      if (editingCenter) {
        await api.put(`/centers/${editingCenter._id}`, payload);
      } else {
        await api.post("/centers", payload);
      }
      setModalOpen(false);
      fetchCenters();
    } catch (err) {
      setFormError(err.response?.data?.message || "Operation failed");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (centerId, centerName) => {
    if (!window.confirm(`Are you sure you want to delete "${centerName}"? This cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/centers/${centerId}`);
      fetchCenters();
    } catch (err) {
      alert(err.response?.data?.message || "Cannot delete center because services or counters still exist.");
    }
  };

  return (
    <AdminLayout
      title="Mandi & Procurement Centers"
      subtitle="Manage government mandis, yard locations, and operational hours."
      action={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchCenters}
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
            <span>Add Center</span>
          </button>
        </div>
      }
    >
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
                  <th className="px-6 py-4">Center Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">District / State</th>
                  <th className="px-6 py-4">Hours</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {centers.length > 0 ? (
                  centers.map((c) => (
                    <tr key={c._id} className="hover:bg-surface/50">
                      <td className="px-6 py-4">
                        <span className="font-bold text-forest-950">{c.name}</span>
                        <p className="text-xs text-slate-muted truncate max-w-xs">{c.address}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Chip variant="default">{c.type?.replace("_", " ")}</Chip>
                      </td>
                      <td className="px-6 py-4 text-slate-text">
                        {c.district}, {c.state || "UP"}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-text">
                        {c.openTime || "09:00"} - {c.closeTime || "17:00"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 font-mono text-xs font-bold ${
                            c.status === "active" ? "text-forest-600" : "text-slate-muted"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              c.status === "active" ? "bg-forest-500" : "bg-slate-muted"
                            }`}
                          />
                          {c.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(c)}
                            className="p-1.5 text-slate-muted hover:text-forest-950"
                            title="Edit Center"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(c._id, c.name)}
                            className="p-1.5 text-slate-muted hover:text-danger"
                            title="Delete Center"
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
                      No service centers configured. Click "Add Center" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Create / Edit Center */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-card border border-line-strong bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-line-soft pb-4">
              <h3 className="text-xl font-bold text-forest-950">
                {editingCenter ? "Edit Center" : "Create New Mandi Center"}
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase text-forest-950">
                    Center Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dasna Krishi Mandi"
                    required
                    className="mt-1 h-10 w-full rounded-btn border border-line-soft px-3 text-sm text-forest-950 focus-visible:outline-forest-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-forest-950">
                    Center Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="mt-1 h-10 w-full rounded-btn border border-line-soft px-3 text-sm text-forest-950 focus-visible:outline-forest-950"
                  >
                    <option value="mandi">Mandi (APMC Yard)</option>
                    <option value="procurement_center">Procurement Center</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-forest-950">
                    Operational Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="mt-1 h-10 w-full rounded-btn border border-line-soft px-3 text-sm text-forest-950 focus-visible:outline-forest-950"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase text-forest-950">
                    Full Physical Address *
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. NH-24 Bypass, Near Grain Depot"
                    required
                    className="mt-1 h-10 w-full rounded-btn border border-line-soft px-3 text-sm text-forest-950 focus-visible:outline-forest-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-forest-950">
                    District *
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Ghaziabad"
                    required
                    className="mt-1 h-10 w-full rounded-btn border border-line-soft px-3 text-sm text-forest-950 focus-visible:outline-forest-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-forest-950">
                    State
                  </label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="Uttar Pradesh"
                    className="mt-1 h-10 w-full rounded-btn border border-line-soft px-3 text-sm text-forest-950 focus-visible:outline-forest-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-forest-950">
                    Open Time (HH:mm)
                  </label>
                  <input
                    type="text"
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    placeholder="09:00"
                    className="mt-1 h-10 w-full rounded-btn border border-line-soft px-3 text-sm font-mono text-forest-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-forest-950">
                    Close Time (HH:mm)
                  </label>
                  <input
                    type="text"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    placeholder="17:00"
                    className="mt-1 h-10 w-full rounded-btn border border-line-soft px-3 text-sm font-mono text-forest-950"
                  />
                </div>
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
                  {formSubmitting ? "Saving..." : editingCenter ? "Save Changes" : "Create Center"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
