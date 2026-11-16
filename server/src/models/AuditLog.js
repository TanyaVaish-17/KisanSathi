import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    category: { type: String, enum: ["queue", "admin"], required: true },
    action: { type: String, required: true, trim: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    actorRole: { type: String, enum: ["farmer", "operator", "admin"] },
    entityType: { type: String, enum: ["token", "counter", "center", "service"] },
    entityId: { type: mongoose.Schema.Types.ObjectId, default: null },
    center: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceCenter", default: null },
    counter: { type: mongoose.Schema.Types.ObjectId, ref: "Counter", default: null },
    token: { type: mongoose.Schema.Types.ObjectId, ref: "Token", default: null },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ category: 1, action: 1, createdAt: -1 });
auditLogSchema.index({ center: 1, createdAt: -1 });
auditLogSchema.index({ actor: 1, createdAt: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;