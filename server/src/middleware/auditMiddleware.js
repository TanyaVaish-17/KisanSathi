import { logAudit } from "../services/auditService.js";

const OBJECT_ID = /[0-9a-f]{24}/i;

const skipAction = (body) =>
  body.outcome === "no_show" ? "queue.token_no_show" : "queue.token_skipped";

const RULES = [
  { method: "POST", path: /^\/api\/tokens$/, action: "queue.token_booked", entity: "token" },
  { method: "PATCH", path: /^\/api\/tokens\/[^/]+\/cancel$/, action: "queue.token_cancelled", entity: "token" },
  { method: "POST", path: /^\/api\/counters\/mine\/call-next$/, action: "queue.token_called", entity: "token" },
  { method: "POST", path: /^\/api\/counters\/mine\/complete$/, action: "queue.token_completed", entity: "token" },
  { method: "POST", path: /^\/api\/counters\/mine\/skip$/, action: skipAction, entity: "token" },
  { method: "POST", path: /^\/api\/counters\/mine\/no-show$/, action: "queue.token_no_show", entity: "token" },
  { method: "POST", path: /^\/api\/counters\/mine\/walk-in$/, action: "queue.walk_in_registered", entity: "token" },
  { method: "PATCH", path: /^\/api\/counters\/[^/]+\/status$/, action: "queue.counter_status_changed", entity: "counter" },
  { method: "POST", path: /^\/api\/centers$/, action: "admin.center_created", entity: "center" },
  { method: "PUT", path: /^\/api\/centers\/[^/]+$/, action: "admin.center_updated", entity: "center" },
  { method: "DELETE", path: /^\/api\/centers\/[^/]+$/, action: "admin.center_deleted", entity: "center" },
  { method: "POST", path: /^\/api\/services$/, action: "admin.service_created", entity: "service" },
  { method: "PUT", path: /^\/api\/services\/[^/]+$/, action: "admin.service_updated", entity: "service" },
  { method: "DELETE", path: /^\/api\/services\/[^/]+$/, action: "admin.service_deleted", entity: "service" },
  { method: "POST", path: /^\/api\/counters$/, action: "admin.counter_created", entity: "counter" },
  { method: "PUT", path: /^\/api\/counters\/[^/]+$/, action: "admin.counter_updated", entity: "counter" },
  { method: "DELETE", path: /^\/api\/counters\/[^/]+$/, action: "admin.counter_deleted", entity: "counter" },
];

const idOf = (ref) => (ref && ref._id ? ref._id : ref) || null;

const pickEntity = (entity, body) =>
  entity === "token" ? body.token || body.serving || null : body[entity] || null;

const buildMeta = (entity, record, req, body, category) => {
  const meta = {};

  if (entity === "token" && record) {
    meta.tokenCode = record.tokenCode;
    meta.status = record.status;
    meta.source = record.source;
  }
  if (entity === "counter" && record) {
    meta.name = record.name;
    meta.status = record.status;
  }
  if ((entity === "center" || entity === "service") && record?.name) {
    meta.name = record.name;
  }
  if (body.transfer) meta.transfer = body.transfer;
  if (category === "admin" && req.method !== "DELETE") {
    meta.fields = Object.keys(req.body || {}).slice(0, 20);
  }

  return meta;
};

export const auditMutations = (req, res, next) => {
  if (req.method === "GET") return next();

  const path = req.originalUrl.split("?")[0];
  const rule = RULES.find((item) => item.method === req.method && item.path.test(path));
  if (!rule) return next();

  const send = res.json.bind(res);

  res.json = (body) => {
    if (res.statusCode < 400 && body?.success && req.user && !res.locals.auditLogged) {
      const actionName = typeof rule.action === "function" ? rule.action(body) : rule.action;
      const [category, action] = actionName.split(".");
      const record = pickEntity(rule.entity, body);
      const entityId = idOf(record) || path.match(OBJECT_ID)?.[0] || null;

      logAudit({
        category,
        action,
        actor: req.user._id,
        actorRole: req.user.role,
        entityType: rule.entity,
        entityId,
        center: rule.entity === "center" ? entityId : idOf(record?.center),
        counter: rule.entity === "counter" ? entityId : idOf(record?.counter),
        token: rule.entity === "token" ? entityId : null,
        meta: buildMeta(rule.entity, record, req, body, category),
      });
    }

    return send(body);
  };

  next();
};