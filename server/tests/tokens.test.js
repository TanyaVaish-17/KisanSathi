import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { startDB, clearDB, stopDB } from "./setup.js";
import app from "../src/app.js";
import ServiceCenter from "../src/models/ServiceCenter.js";
import Service from "../src/models/Service.js";
import Counter from "../src/models/Counter.js";
import Token from "../src/models/Token.js";

before(startDB);
beforeEach(clearDB);
after(stopDB);

let phoneSeq = 0;
const registerFarmer = async () => {
  phoneSeq += 1;
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: "Farmer", phone: `98765${String(phoneSeq).padStart(5, "0")}`, password: "secret123" });
  return res.body.token;
};

const seedCenter = async ({ counters = 1, duration = 10 } = {}) => {
  const center = await ServiceCenter.create({ name: "Test Mandi", address: "Road 1", district: "Agra" });
  const service = await Service.create({ center: center._id, name: "Wheat sale", estimatedDuration: duration });
  const counterDocs = [];
  for (let i = 1; i <= counters; i += 1) {
    counterDocs.push(await Counter.create({ center: center._id, service: service._id, name: `Counter ${i}` }));
  }
  return { center, service, counters: counterDocs };
};

const book = (auth, center, service) =>
  request(app)
    .post("/api/tokens")
    .set("Authorization", `Bearer ${auth}`)
    .send({ center: center._id.toString(), service: service._id.toString() });

test("token routes need a logged in farmer", async () => {
  const res = await request(app).get("/api/tokens/mine");
  assert.equal(res.status, 401);
});

test("farmer can book a token and gets a wait estimate", async () => {
  const { center, service } = await seedCenter();
  const res = await book(await registerFarmer(), center, service);

  assert.equal(res.status, 201);
  assert.equal(res.body.token.tokenCode, "001");
  assert.equal(res.body.token.status, "waiting");
  assert.equal(res.body.queueInfo.position, 1);
  assert.equal(res.body.queueInfo.estimatedWaitMinutes, 0);
  assert.ok(res.body.arrivalAdvice.message);
});

test("token numbers go up and later farmers wait longer", async () => {
  const { center, service } = await seedCenter({ duration: 10 });
  await book(await registerFarmer(), center, service);
  const second = await book(await registerFarmer(), center, service);

  assert.equal(second.body.token.tokenCode, "002");
  assert.equal(second.body.queueInfo.position, 2);
  assert.equal(second.body.queueInfo.estimatedWaitMinutes, 10);
});

test("a farmer cannot hold two active tokens", async () => {
  const { center, service } = await seedCenter();
  const auth = await registerFarmer();
  await book(auth, center, service);
  const res = await book(auth, center, service);
  assert.equal(res.status, 409);
});

test("new tokens go to the least busy counter", async () => {
  const { center, service, counters } = await seedCenter({ counters: 2 });
  const first = await book(await registerFarmer(), center, service);
  const second = await book(await registerFarmer(), center, service);

  const used = [first.body.token.counter._id, second.body.token.counter._id].sort();
  assert.deepEqual(used, counters.map((c) => c._id.toString()).sort());
});

test("booking fails when no counter is active", async () => {
  const { center, service, counters } = await seedCenter();
  await Counter.updateOne({ _id: counters[0]._id }, { status: "paused" });
  const res = await book(await registerFarmer(), center, service);
  assert.equal(res.status, 400);
});

test("booking fails for an inactive center", async () => {
  const { center, service } = await seedCenter();
  await ServiceCenter.updateOne({ _id: center._id }, { status: "inactive" });
  const res = await book(await registerFarmer(), center, service);
  assert.equal(res.status, 404);
});

test("booking rejects invalid ids", async () => {
  const res = await request(app)
    .post("/api/tokens")
    .set("Authorization", `Bearer ${await registerFarmer()}`)
    .send({ center: "abc", service: "xyz" });
  assert.equal(res.status, 400);
});

test("/mine returns the active token with queue info", async () => {
  const { center, service } = await seedCenter();
  const auth = await registerFarmer();
  await book(auth, center, service);

  const res = await request(app).get("/api/tokens/mine").set("Authorization", `Bearer ${auth}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.activeToken.status, "waiting");
  assert.equal(res.body.queueInfo.position, 1);
  assert.deepEqual(res.body.pastTokens, []);
});

test("cancelling frees the farmer to book again and moves the queue up", async () => {
  const { center, service } = await seedCenter();
  const firstAuth = await registerFarmer();
  const secondAuth = await registerFarmer();
  const first = await book(firstAuth, center, service);
  await book(secondAuth, center, service);

  const cancel = await request(app)
    .patch(`/api/tokens/${first.body.token._id}/cancel`)
    .set("Authorization", `Bearer ${firstAuth}`);
  assert.equal(cancel.status, 200);
  assert.equal(cancel.body.token.status, "cancelled");

  const mine = await request(app).get("/api/tokens/mine").set("Authorization", `Bearer ${secondAuth}`);
  assert.equal(mine.body.queueInfo.position, 1);

  const rebook = await book(firstAuth, center, service);
  assert.equal(rebook.status, 201);
});

test("a farmer cannot cancel another farmer's token", async () => {
  const { center, service } = await seedCenter();
  const owner = await book(await registerFarmer(), center, service);
  const res = await request(app)
    .patch(`/api/tokens/${owner.body.token._id}/cancel`)
    .set("Authorization", `Bearer ${await registerFarmer()}`);
  assert.equal(res.status, 404);
});

test("tokens from earlier days are expired when the farmer books", async () => {
  const { center, service, counters } = await seedCenter();
  const auth = await registerFarmer();
  const me = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${auth}`);

  await Token.create({
    tokenNumber: 1,
    tokenCode: "001",
    dateKey: "2020-01-01",
    center: center._id,
    service: service._id,
    counter: counters[0]._id,
    farmer: me.body.user.id,
  });

  const res = await book(auth, center, service);
  assert.equal(res.status, 201);
  const old = await Token.findOne({ dateKey: "2020-01-01" });
  assert.equal(old.status, "expired");
});
