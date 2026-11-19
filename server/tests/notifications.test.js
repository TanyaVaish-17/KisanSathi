import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { startDB, clearDB, stopDB } from "./setup.js";
import app from "../src/app.js";
import ServiceCenter from "../src/models/ServiceCenter.js";
import Service from "../src/models/Service.js";
import Counter from "../src/models/Counter.js";
import Notification from "../src/models/Notification.js";

before(startDB);
beforeEach(clearDB);
after(stopDB);

let phoneSeq = 0;
const registerFarmer = async () => {
  phoneSeq += 1;
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: "Farmer", phone: `97654${String(phoneSeq).padStart(5, "0")}`, password: "secret123" });
  return res.body.token;
};

// Booking a token sends the farmer a "token booked" notification
const registerAndBook = async () => {
  const center = await ServiceCenter.create({ name: `Mandi ${phoneSeq}`, address: "Road 1", district: "Agra" });
  const service = await Service.create({ center: center._id, name: "Wheat sale", estimatedDuration: 10 });
  await Counter.create({ center: center._id, service: service._id, name: "Counter 1" });

  const auth = await registerFarmer();
  await request(app)
    .post("/api/tokens")
    .set("Authorization", `Bearer ${auth}`)
    .send({ center: center._id.toString(), service: service._id.toString() });
  return auth;
};

const list = (auth, query = "") =>
  request(app).get(`/api/notifications${query}`).set("Authorization", `Bearer ${auth}`);

test("notifications need a logged in user", async () => {
  const res = await request(app).get("/api/notifications");
  assert.equal(res.status, 401);
});

test("booking a token creates an unread notification", async () => {
  const auth = await registerAndBook();
  const res = await list(auth);
  assert.equal(res.status, 200);
  assert.equal(res.body.unreadCount, 1);
  assert.equal(res.body.notifications.length, 1);
  assert.equal(res.body.notifications[0].isRead, false);
});

test("marking one as read returns the updated notification", async () => {
  const auth = await registerAndBook();
  const [notification] = (await list(auth)).body.notifications;

  const res = await request(app)
    .patch(`/api/notifications/${notification._id}/read`)
    .set("Authorization", `Bearer ${auth}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.notification.isRead, true);
  assert.ok(res.body.notification.readAt);
  assert.equal(res.body.unreadCount, 0);
});

test("a user cannot mark another user's notification", async () => {
  const owner = await registerAndBook();
  const [notification] = (await list(owner)).body.notifications;

  const res = await request(app)
    .patch(`/api/notifications/${notification._id}/read`)
    .set("Authorization", `Bearer ${await registerFarmer()}`);
  assert.equal(res.status, 404);

  const saved = await Notification.findById(notification._id);
  assert.equal(saved.isRead, false);
});

test("mark all as read clears the unread count", async () => {
  const auth = await registerAndBook();
  const res = await request(app)
    .patch("/api/notifications/read-all")
    .set("Authorization", `Bearer ${auth}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.updated, 1);

  const after = await list(auth, "?unread=true");
  assert.equal(after.body.unreadCount, 0);
  assert.equal(after.body.notifications.length, 0);
});
