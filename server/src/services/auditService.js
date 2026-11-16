import AuditLog from "../models/AuditLog.js";

export const logAudit = async (entry) => {
  try {
    await AuditLog.create(entry);
  } catch (error) {
    console.error("Audit log failed:", error.message);
  }
};