import test from "node:test";
import assert from "node:assert/strict";
import {
  currencyPrefix,
  dayHeading,
  fitFontSize,
  formatMoney,
  fullDate,
  interval,
  moneyParts,
  relativeDue,
  spokenMoney,
} from "./format";

test("money keeps two decimals, a typographic minus and explicit currency", () => {
  assert.equal(formatMoney(12900, "MXN"), "$129.00");
  assert.equal(formatMoney(78650, "MXN"), "$786.50");
  assert.equal(formatMoney(-50000, "MXN"), "−$500.00");
  assert.equal(formatMoney(150000, "MXN", "always"), "+$1,500.00");
  assert.equal(formatMoney(999, "USD"), "USD 9.99");
  assert.equal(formatMoney(999, "EUR"), "EUR 9.99");
  assert.equal(currencyPrefix("MXN"), "$");
  assert.equal(currencyPrefix("USD"), "USD");
  assert.equal(spokenMoney(-12950, "MXN"), "menos 129.50 pesos mexicanos");
});

test("hero parts and fitting never truncate the largest admitted amount", () => {
  const parts = moneyParts(999999999999, "MXN");
  assert.equal(parts.whole + parts.cents, "$9,999,999,999.99");
  const size = fitFontSize("$9,999,999,999.99", 288, 40, 18);
  assert(size < 40 && size >= 18);
  assert.equal(fitFontSize("$129.00", 288, 40, 18), 40);
});

test("dates read naturally and never shift by time zone", () => {
  assert.equal(fullDate("2026-10-03"), "3 oct 2026");
  assert.equal(fullDate("2026-"), "Fecha por elegir");
  assert.equal(interval("2026-10-15", "2026-10-31"), "15–31 oct");
  assert.equal(interval("2026-09-28", "2026-10-03"), "28 sep–3 oct");
  assert.equal(dayHeading("2026-10-03", "2026-10-03"), "Hoy · sáb 3 oct");
  assert.equal(dayHeading("2026-10-02", "2026-10-03"), "Ayer · vie 2 oct");
  assert.equal(relativeDue(0), "Vence hoy");
  assert.equal(relativeDue(3), "En 3 días");
  assert.equal(relativeDue(40), null);
});
