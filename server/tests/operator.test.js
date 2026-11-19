import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { startDB, clearDB, stopDB } from "./setup.js";
import app from "../src/app.js";
import User from "../src/models/User.js";
import ServiceCenter from "../src/models/ServiceCenter.js";
import Service from "../src/models/Service.js";
import Counter from "../src/models/Counter.js";
import Token from "../src/models/Token.js";

before(startDB);
beforeEach(clearDB);
after(stopDB);

let phoneSeq = 0;
const nextPhone = () => `91234${String(++phoneSeq).padStart(5, "0")}`;

const loginAs = async (role) => {
  const phone = nextPhone();
  const user = await User.create({ name: `Test ${role}`, phone, password: "secret123", role });
  const res = await request(app).post("/api/auth/login").send({ identifier: phone, password: "secret123" });
  return { user, auth: res.body.token };
};

// One center and service, with one counter run by an operator
const seed = async ({ extraCounter = false } = {}) => {
  const center = await ServiceCenter.create({ name: "Test Mandi", address: "Road 1", district: "Agra" });
  const service = await Service.create({ center: center._id, name: "Wheat sale", estimatedDuration: 10 });
  const operator = await loginAs("operator");
  const counter = await Counter.create({
    center: center._id,
    service: service._id,
    name: "Counter 1",
    operator: operator.user._id,
  });
  const other = extraCounter
    ? await Counter.create({ center: center._id, service: service._id, name: "Counter 2" })
    : null;
  return { center, service, counter, other, op: operator.auth };
};

const bookToken = async (center, service) => {
  const farmer = await loginAs("farmer");
  const res = await request(app)
    .post("/api/tokens")
    .set("Authorization", `Bearer ${farmer.auth}`)
    .send({ center: center._id.toString(), service: service._id.toString() });
  return { ...farmer, token: res.body.token };
};

const post = (path, auth, body = {}) =>
  request(app).post(`/api/counters/mine/${path}`).set("Authorization", `Bearer ${auth}`).send(body);

test("operator routes are closed to farmers", async () => {
  const farmer = await loginAs("farmer");
  const res = await post("call-next", farmer.auth);
  assert.equal(res.status, 403);
});

test("operator sees their own counter queue", async () => {
  const { center, service, op } = await seed();
  await bookToken(center, service);
  await bookToken(center, service);

  const res = await request(app).get("/api/counters/mine/queue").set("Authorization", `Bearer ${op}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.counter.name, "Counter 1");
  assert.equal(res.body.serving, null);
  assert.equal(res.body.waiting.length, 2);
});

test("call next serves the first waiting token", async () => {
  const { center, service, counter, op } = await seed();
  const first = await bookToken(center, service);
  await bookToken(center, service);

  const res = await post("call-next", op);
  assert.equal(res.status, 200);
  assert.equal(res.body.serving.tokenCode, first.token.tokenCode);
  assert.equal(res.body.serving.status, "serving");

  const saved = await Counter.findById(counter._id);
  assert.equal(String(saved.currentToken), String(res.body.serving._id));
});

test("call next with an empty queue returns no token", async () => {
  const { op } = await seed();
  const res = await post("call-next", op);
  assert.equal(res.status, 200);
  assert.equal(res.body.serving, null);
});

test("a second call next is refused while a token is being served", async () => {
  const { center, service, op } = await seed();
  await bookToken(center, service);
  await bookToken(center, service);

  await post("call-next", op);
  const res = await post("call-next", op);
  assert.equal(res.status, 409);
});

test("completing a token frees the counter and records the service time", async () => {
  const { center, service, counter, op } = await seed();
  await bookToken(center, service);
  await post("call-next", op);

  const res = await post("complete", op);
  assert.equal(res.status, 200);
  assert.equal(res.body.outcome, "completed");
  assert.equal(res.body.token.status, "completed");

  const saved = await Counter.findById(counter._id);
  assert.equal(saved.currentToken, null);

  const updated = await Service.findById(service._id);
  assert.equal(updated.completedServiceCount, 1);
});

test("complete with nobody being served returns 404", async () => {
  const { op } = await seed();
  const res = await post("complete", op);
  assert.equal(res.status, 404);
});

test("a skipped token goes to the back of the queue", async () => {
  const { center, service, op } = await seed();
  const first = await bookToken(center, service);
  const second = await bookToken(center, service);
  await post("call-next", op);

  const skip = await post("skip", op);
  assert.equal(skip.status, 200);
  assert.equal(skip.body.outcome, "skipped");
  assert.equal(skip.body.token.status, "waiting");
  assert.equal(skip.body.token.skipCount, 1);

  const next = await post("call-next", op);
  assert.equal(next.body.serving.tokenCode, second.token.tokenCode);

  const queue = await request(app).get("/api/counters/mine/queue").set("Authorization", `Bearer ${op}`);
  assert.equal(queue.body.waiting[0].tokenCode, first.token.tokenCode);
});

test("the third skip marks the token as a no-show", async () => {
  const { center, service, op } = await seed();
  await bookToken(center, service);

  const outcomes = [];
  for (let i = 0; i < 3; i += 1) {
    await post("call-next", op);
    outcomes.push((await post("skip", op)).body.outcome);
  }
  assert.deepEqual(outcomes, ["skipped", "skipped", "no_show"]);
});

test("no-show ends the visit and lets the farmer book again", async () => {
  const { center, service, op } = await seed();
  const farmer = await bookToken(center, service);
  await post("call-next", op);

  const res = await post("no-show", op);
  assert.equal(res.body.outcome, "no_show");

  const rebook = await request(app)
    .post("/api/tokens")
    .set("Authorization", `Bearer ${farmer.auth}`)
    .send({ center: center._id.toString(), service: service._id.toString() });
  assert.equal(rebook.status, 201);
});

test("operator can issue a walk-in token", async () => {
  const { op } = await seed();
  const res = await post("walk-in", op, { walkInName: "Suresh", walkInPhone: "9123456780" });
  assert.equal(res.status, 201);
  assert.equal(res.body.token.source, "walk_in");
  assert.equal(res.body.token.walkInName, "Suresh");
  assert.equal(res.body.token.status, "waiting");
});

test("walk-in needs a name and a valid phone", async () => {
  const { op } = await seed();
  const noName = await post("walk-in", op, {});
  assert.equal(noName.status, 400);

  const badPhone = await post("walk-in", op, { walkInName: "Suresh", walkInPhone: "123" });
  assert.equal(badPhone.status, 400);
});

test("a paused counter cannot call tokens until resumed", async () => {
  const { center, service, counter, op } = await seed();
  await bookToken(center, service);

  const status = (value) =>
    request(app)
      .patch(`/api/counters/${counter._id}/status`)
      .set("Authorization", `Bearer ${op}`)
      .send({ status: value });

  assert.equal((await status("paused")).status, 200);
  assert.equal((await post("call-next", op)).status, 400);

  assert.equal((await status("active")).status, 200);
  assert.equal((await post("call-next", op)).status, 200);
});

test("operators cannot make a counter inactive", async () => {
  const { counter, op } = await seed();
  const res = await request(app)
    .patch(`/api/counters/${counter._id}/status`)
    .set("Authorization", `Bearer ${op}`)
    .send({ status: "inactive" });
  assert.equal(res.status, 403);
});

test("operators cannot change another counter", async () => {
  const { other, op } = await seed({ extraCounter: true });
  const res = await request(app)
    .patch(`/api/counters/${other._id}/status`)
    .set("Authorization", `Bearer ${op}`)
    .send({ status: "paused" });
  assert.equal(res.status, 403);
});

test("making a counter inactive moves its waiting tokens to another counter", async () => {
  const { center, service, counter, other } = await seed({ extraCounter: true });
  await Counter.updateOne({ _id: other._id }, { status: "paused" });
  await bookToken(center, service);
  await bookToken(center, service);
  await Counter.updateOne({ _id: other._id }, { status: "active" });

  const admin = await loginAs("admin");
  const res = await request(app)
    .patch(`/api/counters/${counter._id}/status`)
    .set("Authorization", `Bearer ${admin.auth}`)
    .send({ status: "inactive" });

  assert.equal(res.status, 200);
  assert.deepEqual(res.body.transfer, { moved: 2, remaining: 0 });
  assert.equal(await Token.countDocuments({ counter: other._id, status: "waiting" }), 2);
});
