import { test } from "node:test";
import assert from "node:assert/strict";
import { suggestArrival, ARRIVAL_BUFFER_MINUTES } from "../src/services/queueService.js";
import { getDateKey, getIstClock } from "../src/utils/dateKey.js";
import pick from "../src/utils/pick.js";

const now = new Date("2026-11-20T10:00:00Z");

test("farmer is told to come now when the wait is within the buffer", () => {
  const advice = suggestArrival(ARRIVAL_BUFFER_MINUTES, now);
  assert.equal(advice.arriveInMinutes, 0);
  assert.equal(advice.arriveAt, now.toISOString());
});

test("farmer is told to arrive a buffer before their turn on longer waits", () => {
  const advice = suggestArrival(40, now);
  assert.equal(advice.arriveInMinutes, 40 - ARRIVAL_BUFFER_MINUTES);
  assert.equal(
    advice.arriveAt,
    new Date(now.getTime() + (40 - ARRIVAL_BUFFER_MINUTES) * 60000).toISOString()
  );
});

test("date key uses India time, not UTC", () => {
  // 20:00 UTC is already the next day (01:30) in India
  assert.equal(getDateKey(new Date("2026-11-20T20:00:00Z")), "2026-11-21");
  assert.equal(getDateKey(new Date("2026-11-20T10:00:00Z")), "2026-11-20");
});

test("IST clock returns weekday and minutes since midnight", () => {
  // Friday 20 Nov 2026, 10:00 UTC = 15:30 IST
  assert.deepEqual(getIstClock(now), { day: 5, minutes: 15 * 60 + 30 });
});

test("pick copies only the listed keys that are defined", () => {
  const source = { name: "A", district: undefined, role: "admin" };
  assert.deepEqual(pick(source, ["name", "district"]), { name: "A" });
});
