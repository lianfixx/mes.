import test from "node:test";
import assert from "node:assert/strict";
import { confirmPayment, removeEntry, summary, Recurring } from "./model";
import {
  afterPayment,
  daysBetween,
  droppedByKindChange,
  overdueByRule,
  previewScheduleChange,
  priceInsight,
  splitPending,
  upcomingDates,
} from "./derive";
import { createDemo } from "../data/demo";

const demo = () => createDemo(new Date("2026-10-02T12:00:00"));

test("split pending reconciles with the month total and keeps today as upcoming", () => {
  const d = demo();
  const s = summary(d, "personal", "2026-10", "MXN");
  const split = splitPending(s.pending, "2026-10-09");
  assert.equal(split.toConfirmTotal + split.upcomingTotal, s.upcoming);
  assert(split.toConfirm.every((o) => o.date < "2026-10-09"));
  assert(split.upcoming.some((o) => o.date === "2026-10-09"));
});

test("overdue dues are grouped by rule and exclude today", () => {
  const d = demo();
  d.recurring = [{ ...d.recurring[0], nextDate: "2026-08-06", anchorDay: 6 }];
  const map = overdueByRule(d, "2026-10-06");
  assert.deepEqual(
    map.get("r1")?.map((o) => o.date),
    ["2026-08-06", "2026-09-06"],
  );
});

test("upcoming dates respect last instalment, cancellation, pause and 2100", () => {
  const base = demo().recurring[2];
  assert.deepEqual(upcomingDates({ ...base, endDate: "2026-11-12" }, 5), [
    "2026-10-12",
    "2026-11-12",
  ]);
  assert.deepEqual(upcomingDates({ ...base, cancelDate: "2026-11-12" }, 5), [
    "2026-10-12",
  ]);
  assert.deepEqual(
    upcomingDates({ ...base, status: "paused", pausedDate: "2026-10-01" }, 3),
    [],
  );
  assert.deepEqual(
    upcomingDates({ ...base, nextDate: "2100-12-12", anchorDay: 12 }, 3),
    ["2100-12-12"],
  );
  assert.deepEqual(upcomingDates({ ...base, nextDate: "2026-" }, 3), []);
});

test("after a payment the next due, or none for a finished loan, is reported", () => {
  const d = demo();
  assert.deepEqual(afterPayment(d, "r1", "2026-10-06"), {
    nextDate: "2026-11-06",
    otherPending: [],
  });
  d.recurring[2].endDate = "2026-10-12";
  assert.equal(afterPayment(d, "r3", "2026-10-12")?.nextDate, null);
  assert.equal(afterPayment(d, "r1", "2026-11-06"), null);
});

test("after paying a restored older due the current schedule is unchanged", () => {
  let d = demo();
  d = confirmPayment(d, {
    recurringId: "r1",
    dueDate: "2026-10-06",
    paidDate: "2026-10-02",
    amount: 12900,
  });
  d = removeEntry(d, d.entries[0].id);
  assert.equal(d.recurring[0].nextDate, "2026-11-06");
  assert.equal(afterPayment(d, "r1", "2026-10-06")?.nextDate, "2026-11-06");
});

test("only a real kind change reports the conditions it would drop", () => {
  const loan = { kind: "debt" as const, trialEnd: "", endDate: "2026-12-12" };
  assert.deepEqual(droppedByKindChange(loan, "debt"), []);
  assert.deepEqual(droppedByKindChange(loan, "service"), [
    { field: "endDate", value: "2026-12-12" },
  ]);
  const trial = {
    kind: "subscription" as const,
    trialEnd: "2026-10-06",
    endDate: "",
  };
  assert.deepEqual(droppedByKindChange(trial, "debt"), [
    { field: "trialEnd", value: "2026-10-06" },
  ]);
  assert.deepEqual(
    droppedByKindChange({ kind: "service", trialEnd: "", endDate: "" }, "debt"),
    [],
  );
});

test("price insight shows difference, percentage and yearly monthly equivalent", () => {
  const r = demo().recurring[3];
  assert.equal(priceInsight({ ...r, priceHistory: [] }), null);
  const monthly = priceInsight({
    ...r,
    amount: 4900,
    priceHistory: [{ date: "2026-09-16", previous: 3900, next: 4900 }],
  })!;
  assert.equal(monthly.diff, 1000);
  assert.equal(monthly.percent!.toFixed(1), "25.6");
  assert.equal(monthly.monthlyEquivalent, null);
  const yearly = priceInsight({
    ...r,
    frequency: "yearly",
    priceHistory: [{ date: "2026-09-16", previous: 100000, next: 120000 }],
  })!;
  assert.deepEqual(yearly.monthlyEquivalent, { previous: 8333, next: 10000 });
  const fromZero = priceInsight({
    ...r,
    priceHistory: [{ date: "2026-09-16", previous: 0, next: 4900 }],
  })!;
  assert.equal(fromZero.percent, null);
});

test("schedule preview keeps pending dues, explains invalid choices and never mutates data", () => {
  const d = demo();
  const before = JSON.stringify(d);
  const later: Recurring = {
    ...d.recurring[0],
    nextDate: "2026-12-08",
    anchorDay: 8,
  };
  const future = previewScheduleChange(d, later, "future");
  assert(future.ok);
  assert.deepEqual(
    future.kept.map((o) => o.date),
    ["2026-10-06", "2026-11-06", "2026-12-06"],
  );
  assert.deepEqual(future.upcoming, ["2026-12-08", "2027-01-08", "2027-02-08"]);
  const moved = previewScheduleChange(d, later, "reschedule");
  assert(moved.ok);
  assert.deepEqual(moved.kept, []);
  assert.equal(moved.upcoming[0], "2026-12-08");
  const earlier = previewScheduleChange(
    d,
    { ...d.recurring[0], nextDate: "2026-10-04", anchorDay: 4 },
    "future",
  );
  assert(!earlier.ok);
  assert.match(earlier.error, /después del vencimiento pendiente/);
  assert.equal(JSON.stringify(d), before);
});

test("civil day differences ignore time zones and leap years", () => {
  assert.equal(daysBetween("2026-10-03", "2026-10-06"), 3);
  assert.equal(daysBetween("2028-02-28", "2028-03-01"), 2);
  assert.equal(daysBetween("2026-10-06", "2026-10-03"), -3);
  assert.equal(daysBetween("2026-12-31", "2027-01-01"), 1);
});
