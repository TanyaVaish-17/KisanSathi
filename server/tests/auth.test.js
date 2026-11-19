import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { startDB, clearDB, stopDB } from "./setup.js";
import app from "../src/app.js";
import User from "../src/models/User.js";

before(startDB);
beforeEach(clearDB);
after(stopDB);

const farmer = { name: "Ramesh Kumar", phone: "9876543210", password: "secret123" };

test("health route responds", async () => {
  const res = await request(app).get("/api/health");
  assert.equal(res.status, 200);
  assert.equal(res.body.database, "connected");
});

test("register creates a farmer and returns a token", async () => {
  const res = await request(app).post("/api/auth/register").send(farmer);
  assert.equal(res.status, 201);
  assert.ok(res.body.token);
  assert.equal(res.body.user.role, "farmer");
  assert.equal(res.body.user.password, undefined);
});

test("register cannot be used to create an admin", async () => {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ ...farmer, role: "admin" });
  assert.equal(res.status, 201);
  assert.equal(res.body.user.role, "farmer");
});

test("password is stored hashed", async () => {
  await request(app).post("/api/auth/register").send(farmer);
  const user = await User.findOne({ phone: farmer.phone }).select("+password");
  assert.notEqual(user.password, farmer.password);
});

test("register needs an email or a phone number", async () => {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: "No Contact", password: "secret123" });
  assert.equal(res.status, 400);
});

test("register rejects an invalid mobile number", async () => {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ ...farmer, phone: "12345" });
  assert.equal(res.status, 400);
});

test("register rejects a duplicate phone number", async () => {
  await request(app).post("/api/auth/register").send(farmer);
  const res = await request(app).post("/api/auth/register").send(farmer);
  assert.equal(res.status, 409);
});

test("login works with phone and correct password", async () => {
  await request(app).post("/api/auth/register").send(farmer);
  const res = await request(app)
    .post("/api/auth/login")
    .send({ identifier: farmer.phone, password: farmer.password });
  assert.equal(res.status, 200);
  assert.ok(res.body.token);
});

test("login fails with a wrong password", async () => {
  await request(app).post("/api/auth/register").send(farmer);
  const res = await request(app)
    .post("/api/auth/login")
    .send({ identifier: farmer.phone, password: "wrong-password" });
  assert.equal(res.status, 401);
});

test("deactivated users cannot log in", async () => {
  await request(app).post("/api/auth/register").send(farmer);
  await User.updateOne({ phone: farmer.phone }, { isActive: false });
  const res = await request(app)
    .post("/api/auth/login")
    .send({ identifier: farmer.phone, password: farmer.password });
  assert.equal(res.status, 403);
});

test("/me needs a valid token", async () => {
  const none = await request(app).get("/api/auth/me");
  assert.equal(none.status, 401);

  const bad = await request(app).get("/api/auth/me").set("Authorization", "Bearer not-a-jwt");
  assert.equal(bad.status, 401);
});

test("/me returns the logged in user", async () => {
  const { body } = await request(app).post("/api/auth/register").send(farmer);
  const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${body.token}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.user.phone, farmer.phone);
});

test("farmers cannot use admin routes", async () => {
  const { body } = await request(app).post("/api/auth/register").send(farmer);
  const res = await request(app)
    .post("/api/centers")
    .set("Authorization", `Bearer ${body.token}`)
    .send({ name: "Test Mandi", address: "Road 1", district: "Agra" });
  assert.equal(res.status, 403);
});

test("unknown routes return 404", async () => {
  const res = await request(app).get("/api/does-not-exist");
  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);
});
