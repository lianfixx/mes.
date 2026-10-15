import test from "node:test";
import assert from "node:assert/strict";
import {
  parseMoney,
  nextOccurrence,
  assertDate,
  confirmPayment,
  summary,
  removeEntry,
  updateRecurring,
  pauseRecurring,
  recurringState,
  changeRecurringKind,
  pendingThrough,
  displayDate,
  occurrences,
  todayLocal,
} from "./model";
import { createDemo } from "../data/demo";
test("exact minor units and validation", () => {
  assert.equal(parseMoney("0.10") + parseMoney("0.20"), 30);
  assert.equal(parseMoney("18,90"), 1890);
  for (const v of ["-1", "0", "1.999", "NaN", "Infinity", "1,000.00"])
    assert.throws(() => parseMoney(v));
});
test("calendar anchor survives short and leap months", () => {
  assert.equal(nextOccurrence("2027-01-31", "monthly", 31), "2027-02-28");
  assert.equal(nextOccurrence("2027-02-28", "monthly", 31), "2027-03-31");
  assert.equal(nextOccurrence("2028-01-31", "monthly", 31), "2028-02-29");
  assert.equal(nextOccurrence("2026-12-31", "monthly", 31), "2027-01-31");
  assert.throws(() => assertDate("2026-02-30"));
});
test("weekly and yearly frequencies use calendar dates", () => {
  assert.equal(nextOccurrence("2026-12-28", "weekly", 28), "2027-01-04");
  assert.equal(nextOccurrence("2028-02-29", "yearly", 29), "2029-02-28");
});
test("confirming twice creates a single expense and advances once", () => {
  const d = createDemo(new Date("2026-10-02T12:00:00"));
  const pay = {
    recurringId: "r1",
    dueDate: "2026-10-06",
    paidDate: "2026-10-02",
    amount: 12900,
  };
  const one = confirmPayment(d, pay);
  const two = confirmPayment(one, pay);
  assert.equal(two.entries.length, d.entries.length + 1);
  assert.equal(two.recurring[0].nextDate, "2026-11-06");
  assert.equal(
    summary(two, "personal", "2026-10", "MXN").spent -
      summary(d, "personal", "2026-10", "MXN").spent,
    12900,
  );
});
test("debt payment is separate from consumption and totals isolate spaces/currencies", () => {
  const d = createDemo(new Date("2026-10-02T12:00:00"));
  const next = confirmPayment(d, {
    recurringId: "r3",
    dueDate: "2026-10-12",
    paidDate: "2026-10-02",
    amount: 120000,
  });
  assert.equal(
    summary(next, "personal", "2026-10", "MXN").spent,
    summary(d, "personal", "2026-10", "MXN").spent,
  );
  assert.equal(summary(next, "personal", "2026-10", "MXN").debtPaid, 120000);
  assert.equal(summary(next, "personal", "2026-10", "USD").spent, 0);
  assert.equal(summary(next, "shared", "2026-10", "MXN").debtPaid, 0);
});
test("undo restores due date without losing unrelated records", () => {
  const d = createDemo(new Date("2026-10-02T12:00:00"));
  const next = confirmPayment(d, {
    recurringId: "r1",
    dueDate: "2026-10-06",
    paidDate: "2026-10-02",
    amount: 12900,
  });
  const undo = removeEntry(next, next.entries[0].id);
  assert.equal(undo.entries.length, d.entries.length);
  assert.equal(undo.recurring[0].nextDate, "2026-11-06");
  assert.equal(
    summary(undo, "personal", "2026-10", "MXN").pending.find(
      (o) => o.r.id === "r1",
    )?.date,
    "2026-10-06",
  );
});
test("pause/cancel omit projections without changing paid history", () => {
  const d = createDemo(new Date("2026-10-02T12:00:00"));
  d.recurring[0].status = "paused";
  assert(
    !summary(d, "personal", "2026-10", "MXN").pending.some(
      (v) => v.r.id === "r1",
    ),
  );
  d.recurring[1].cancelDate = "2026-10-09";
  assert(
    !summary(d, "personal", "2026-10", "MXN").pending.some(
      (v) => v.r.id === "r2",
    ),
  );
});
test("two stale payment commands cannot skip a month", () => {
  const d = createDemo(new Date("2026-10-02T12:00:00"));
  assert.throws(() =>
    confirmPayment(d, {
      recurringId: "r1",
      dueDate: "2026-11-06",
      paidDate: "2026-10-02",
      amount: 12900,
    }),
  );
});
test("editing cannot restore an already paid due date or reinterpret its currency", () => {
  const d = createDemo(new Date("2026-10-02T12:00:00"));
  const paid = confirmPayment(d, {
    recurringId: "r1",
    dueDate: "2026-10-06",
    paidDate: "2026-10-02",
    amount: 12900,
  });
  assert.throws(() =>
    updateRecurring(paid, { ...paid.recurring[0], nextDate: "2026-10-06" }),
  );
  assert.throws(() =>
    updateRecurring(paid, { ...paid.recurring[0], currency: "USD" }),
  );
});
test("removing a payment cannot silently restore changed price conditions", () => {
  const d = createDemo(new Date("2026-10-02T12:00:00"));
  let paid = confirmPayment(d, {
    recurringId: "r1",
    dueDate: "2026-10-06",
    paidDate: "2026-10-02",
    amount: 12900,
  });
  paid = updateRecurring(paid, { ...paid.recurring[0], amount: 15000 });
  const undo = removeEntry(paid, paid.entries[0].id);
  assert.equal(
    summary(undo, "personal", "2026-10", "MXN").pending.find(
      (o) => o.r.id === "r1",
    )?.r.amount,
    12900,
  );
  assert.equal(undo.recurring[0].amount, 15000);
});
test("pause preserves old unpaid dues and blocks skipping them on resume", () => {
  const d = createDemo(new Date("2026-10-02T12:00:00"));
  const paused = pauseRecurring(d, "r1", "2026-10-10");
  assert.equal(
    summary(paused, "personal", "2026-10", "MXN").pending.filter(
      (v) => v.r.id === "r1",
    ).length,
    1,
  );
  assert.equal(
    summary(paused, "personal", "2026-11", "MXN").pending.filter(
      (v) => v.r.id === "r1",
    ).length,
    0,
  );
  assert.throws(() =>
    updateRecurring(paused, {
      ...paused.recurring[0],
      status: "active",
      nextDate: "2026-11-06",
    }),
  );
});
test("changing an unpaid recurrent type removes irrelevant conditions", () => {
  const d = createDemo(new Date("2026-10-02T12:00:00"));
  const next = updateRecurring(d, {
    ...d.recurring[2],
    kind: "service",
    endDate: "2026-12-12",
    trialEnd: "2026-10-01",
  });
  assert.equal(next.recurring[2].endDate, undefined);
  assert.equal(next.recurring[2].trialEnd, undefined);
});
test("resume requires resolving pre-pause dues before future projection", () => {
  const d = createDemo(new Date("2026-09-01T12:00:00"));
  d.recurring[0].nextDate = "2026-09-01";
  d.recurring[0].anchorDay = 1;
  const paused = pauseRecurring(d, "r1", "2026-09-15");
  assert.throws(() =>
    updateRecurring(paused, { ...paused.recurring[0], status: "active" }),
  );
  const paid = confirmPayment(paused, {
    recurringId: "r1",
    dueDate: "2026-09-01",
    paidDate: "2026-11-01",
    amount: 12900,
  });
  const resumed = updateRecurring(paid, {
    ...paid.recurring[0],
    status: "active",
    nextDate: "2026-11-01",
  });
  assert.equal(
    summary(resumed, "personal", "2026-10", "MXN").pending.filter(
      (v) => v.r.id === "r1",
    ).length,
    0,
  );
});

test("selecting the same kind preserves loan end and trial dates", () => {
  const form = { kind: "debt" as const, trialEnd: "", endDate: "2026-12-12" };
  assert.deepEqual(changeRecurringKind(form, "debt"), form);
  const trial = {
    kind: "subscription" as const,
    trialEnd: "2026-10-06",
    endDate: "",
  };
  assert.deepEqual(changeRecurringKind(trial, "subscription"), trial);
});
test("a smaller fixed payment requires explicit full-total correction", () => {
  const d = createDemo(new Date("2026-10-02T12:00:00"));
  const command = {
    recurringId: "r3",
    dueDate: "2026-10-12",
    paidDate: "2026-10-02",
    amount: 100,
  };
  assert.throws(() => confirmPayment(d, command), /total real/);
  assert.equal(summary(d, "personal", "2026-10", "MXN").debtPending, 120000);
  assert.equal(
    confirmPayment(d, { ...command, confirmDifferentTotal: true }).entries[0]
      .amount,
    100,
  );
});
test("variable bills accept the actual full amount", () => {
  const d = createDemo(new Date("2026-10-02T12:00:00"));
  d.recurring[1].variable = true;
  assert.equal(
    confirmPayment(d, {
      recurringId: "r2",
      dueDate: "2026-10-09",
      paidDate: "2026-10-02",
      amount: 71000,
    }).entries[0].amount,
    71000,
  );
});
test("finished loan permits metadata edits and has no new dues", () => {
  const d = createDemo(new Date("2026-10-02T12:00:00"));
  d.recurring[2].endDate = "2026-10-12";
  const paid = confirmPayment(d, {
    recurringId: "r3",
    dueDate: "2026-10-12",
    paidDate: "2026-10-02",
    amount: 120000,
  });
  const edited = updateRecurring(paid, {
    ...paid.recurring[2],
    note: "Liquidado",
  });
  assert.equal(recurringState(edited.recurring[2]), "Finalizado");
  assert.equal(edited.recurring[2].note, "Liquidado");
  assert.equal(summary(edited, "personal", "2026-11", "MXN").debtPending, 0);
});
test("undo after pause and resume restores an independent original due", () => {
  const d = createDemo(new Date("2026-10-02T12:00:00"));
  let next = confirmPayment(d, {
    recurringId: "r1",
    dueDate: "2026-10-06",
    paidDate: "2026-10-02",
    amount: 12900,
  });
  const entry = next.entries[0];
  next = pauseRecurring(next, "r1", "2026-10-10");
  next = updateRecurring(next, { ...next.recurring[0], status: "active" });
  const undo = removeEntry(next, entry.id);
  assert.equal(
    summary(undo, "personal", "2026-10", "MXN").pending.find(
      (o) => o.r.id === "r1",
    )?.r.amount,
    12900,
  );
  const repaid = confirmPayment(undo, {
    recurringId: "r1",
    dueDate: "2026-10-06",
    paidDate: "2026-10-12",
    amount: 12900,
  });
  assert.equal(repaid.recurring[0].nextDate, "2026-11-06");
});
test("changing schedule cannot silently discard pending obligations", () => {
  const d = createDemo(new Date("2026-10-02T12:00:00"));
  const changed = { ...d.recurring[0], nextDate: "2026-12-06", amount: 15000 };
  assert.throws(() => updateRecurring(d, changed), /Elige/);
  const next = updateRecurring(d, changed, "future");
  assert.equal(
    summary(next, "personal", "2026-10", "MXN").pending.find(
      (o) => o.r.id === "r1",
    )?.r.amount,
    12900,
  );
  assert.equal(
    summary(next, "personal", "2026-11", "MXN").pending.find(
      (o) => o.r.id === "r1",
    )?.r.amount,
    12900,
  );
  assert.equal(
    summary(next, "personal", "2026-12", "MXN").pending.find(
      (o) => o.r.id === "r1",
    )?.r.amount,
    15000,
  );
  assert.equal(next.scheduleChanges?.length, 1);
});
test("explicit rescheduling moves one due and records the decision", () => {
  const d = createDemo(new Date("2026-10-02T12:00:00"));
  const next = updateRecurring(
    d,
    { ...d.recurring[0], nextDate: "2026-10-08" },
    "reschedule",
  );
  assert.equal(
    summary(next, "personal", "2026-10", "MXN").pending.find(
      (o) => o.r.id === "r1",
    )?.date,
    "2026-10-08",
  );
  assert.equal(next.scheduleChanges?.[0].from, "2026-10-06");
});
test("older payment can be corrected without losing later paid installments", () => {
  const d = createDemo(new Date("2026-10-02T12:00:00"));
  let n = confirmPayment(d, {
    recurringId: "r1",
    dueDate: "2026-10-06",
    paidDate: "2026-10-02",
    amount: 12900,
  });
  const old = n.entries[0];
  n = confirmPayment(n, {
    recurringId: "r1",
    dueDate: "2026-11-06",
    paidDate: "2026-11-06",
    amount: 12900,
  });
  const undo = removeEntry(n, old.id);
  assert.equal(undo.recurring[0].nextDate, "2026-12-06");
  assert(undo.entries.some((e) => e.occurrenceId === "r1:2026-11-06"));
  assert.equal(
    pendingThrough(undo, "2026-11-30").filter((o) => o.r.id === "r1").length,
    1,
  );
});
test("category net values reconcile with spending including refunds", () => {
  const d = createDemo(new Date("2026-10-02T12:00:00"));
  d.entries.push({
    ...d.entries[0],
    id: "refund-test",
    kind: "refund",
    amount: 500000,
  });
  const s = summary(d, "personal", "2026-10", "MXN");
  assert.equal(
    s.byCategory.reduce((a, c) => a + c.amount, 0),
    s.spent,
  );
  assert(s.byCategory.some((c) => c.amount < 0));
});

test("draft dates cannot crash the display and unsupported years are rejected", () => {
  for (const value of [
    "",
    "2026-",
    "2026-10-0",
    "2026-02-30",
    "0001-01-01",
    "9999-12-01",
  ])
    assert.equal(displayDate(value), "Fecha por elegir");
  assert.match(displayDate("2026-10-03"), /2026/);
  assert.throws(() => nextOccurrence("2100-12-31", "monthly", 31), /1900/);
});
test("optional zero amounts accept decimal and comma formats", () => {
  for (const value of ["0", "0.00", "0,00", " 0 "])
    assert.equal(parseMoney(value, true), 0);
  assert.throws(() => parseMoney("0.00"));
  assert.equal(parseMoney("129.00"), parseMoney("129"));
});
test("financial edits preserve overdue amounts and retroactive cancellation cannot erase them", () => {
  const d = createDemo(new Date("2026-10-03T12:00:00"));
  const old = {
    ...d.recurring[0],
    nextDate: "2025-09-01",
    frequency: "weekly" as const,
    anchorDay: 1,
    amount: 10000,
  };
  d.recurring = [old];
  d.entries = [];
  const before = summary(d, "personal", "2025-09", "MXN").upcoming;
  const changed = updateRecurring(d, {
    ...old,
    amount: 20000,
    cancelDate: "2025-09-15",
  });
  assert.equal(summary(changed, "personal", "2025-09", "MXN").upcoming, before);
  const paid = confirmPayment(changed, {
    recurringId: old.id,
    dueDate: "2025-09-22",
    paidDate: todayLocal(),
    amount: 10000,
  });
  assert.equal(
    summary(paid, "personal", "2025-09", "MXN").upcoming,
    before - 10000,
  );
});
test("frequency changes require a calendar decision even with the same next date", () => {
  const d = createDemo(new Date("2026-10-03T12:00:00"));
  const old = {
    ...d.recurring[0],
    nextDate: "2025-09-01",
    frequency: "weekly" as const,
    anchorDay: 1,
  };
  d.recurring = [old];
  assert.throws(
    () => updateRecurring(d, { ...old, frequency: "monthly" }),
    /calendario/,
  );
  const changed = updateRecurring(
    d,
    { ...old, frequency: "monthly", nextDate: "2025-10-01" },
    "future",
  );
  assert.equal(
    summary(changed, "personal", "2025-09", "MXN").upcoming,
    summary(d, "personal", "2025-09", "MXN").upcoming,
  );
});
test("long-running weekly dues reach the current month instead of truncating at 600", () => {
  const d = createDemo(new Date("2026-10-03T12:00:00"));
  const old = {
    ...d.recurring[0],
    nextDate: "2010-01-01",
    frequency: "weekly" as const,
    anchorDay: 1,
  };
  const dates = occurrences(old, "2026-10-31");
  assert.equal(dates.filter((d) => d.startsWith("2026-10")).length, 5);
  assert.equal(dates.at(-1), "2026-10-30");
});
