import { test, before, after, afterEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import jwt from "jsonwebtoken";
import { startDB, stopDB } from "./setup.js";
import app from "../src/app.js";
import generateToken from "../src/utils/generateToken.js";

before(startDB);
after(stopDB);

const savedEnv = { ...process.env };
afterEach(() => {
  process.env.NODE_ENV = savedEnv.NODE_ENV;
  process.env.JWT_EXPIRES_IN = savedEnv.JWT_EXPIRES_IN;
});

test("error responses hide the stack trace when NODE_ENV is not set", async () => {
  delete process.env.NODE_ENV;
  const res = await request(app).get("/api/does-not-exist");
  assert.equal(res.status, 404);
  assert.equal(res.body.stack, undefined);
});

test("error responses hide the stack trace in production", async () => {
  process.env.NODE_ENV = "production";
  const res = await request(app).get("/api/does-not-exist");
  assert.equal(res.body.stack, undefined);
});

test("error responses show the stack trace in development", async () => {
  process.env.NODE_ENV = "development";
  const res = await request(app).get("/api/does-not-exist");
  assert.ok(res.body.stack);
});

test("login tokens expire after 7 days when JWT_EXPIRES_IN is not set", () => {
  delete process.env.JWT_EXPIRES_IN;
  const decoded = jwt.decode(generateToken({ _id: "abc", role: "farmer" }));
  assert.equal(decoded.exp - decoded.iat, 7 * 24 * 60 * 60);
});

test("JWT_EXPIRES_IN still controls the expiry when it is set", () => {
  process.env.JWT_EXPIRES_IN = "1h";
  const decoded = jwt.decode(generateToken({ _id: "abc", role: "farmer" }));
  assert.equal(decoded.exp - decoded.iat, 60 * 60);
});
