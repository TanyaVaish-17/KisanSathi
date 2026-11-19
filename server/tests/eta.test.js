import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateQueueETA } from "../src/services/etaService.js";

const now = new Date("2026-11-20T10:00:00Z");
const minutesAgo = (m) => new Date(now.getTime() - m * 60000);

test("empty queue gives no estimates", () => {
  assert.deepEqual(calculateQueueETA([], 10, now), []);
});

test("first waiting token starts now when nobody is being served", () => {
  const [entry] = calculateQueueETA([{ status: "waiting" }], 10, now);
  assert.equal(entry.estimatedWaitMinutes, 0);
  assert.equal(entry.estimatedStartAt.getTime(), now.getTime());
  assert.equal(entry.estimatedCompletionAt.getTime(), now.getTime() + 10 * 60000);
});

test("waiting tokens line up one after another", () => {
  const tokens = [{ status: "waiting" }, { status: "waiting" }, { status: "waiting" }];
  const waits = calculateQueueETA(tokens, 10, now).map((e) => e.estimatedWaitMinutes);
  assert.deepEqual(waits, [0, 10, 20]);
});

test("waiting tokens wait for the remaining time of the token being served", () => {
  const tokens = [
    { status: "serving", servingStartedAt: minutesAgo(4) },
    { status: "waiting" },
  ];
  const [serving, waiting] = calculateQueueETA(tokens, 10, now);
  assert.equal(serving.estimatedWaitMinutes, 0);
  assert.equal(waiting.estimatedWaitMinutes, 6);
});

test("an overrunning serving token does not give negative waits", () => {
  const tokens = [
    { status: "serving", servingStartedAt: minutesAgo(25) },
    { status: "waiting" },
  ];
  const [, waiting] = calculateQueueETA(tokens, 10, now);
  assert.equal(waiting.estimatedWaitMinutes, 0);
});

test("a token's own service time overrides the default duration", () => {
  const tokens = [{ status: "waiting", estimatedServiceMinutes: 25 }, { status: "waiting" }];
  const [, second] = calculateQueueETA(tokens, 10, now);
  assert.equal(second.estimatedWaitMinutes, 25);
});

test("serving tokens are handled before waiting tokens whatever the input order", () => {
  const tokens = [{ status: "waiting" }, { status: "serving", servingStartedAt: now }];
  const result = calculateQueueETA(tokens, 10, now);
  assert.equal(result[0].token.status, "serving");
  assert.equal(result[1].estimatedWaitMinutes, 10);
});
