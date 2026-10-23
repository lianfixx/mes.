// Formatos de presentación. No calculan dinero: solo lo muestran. Los importes
// siguen en unidades menores enteras con su moneda; las fechas en AAAA-MM-DD.
import { Currency, assertDate } from "../domain/model";
import { daysBetween } from "../domain/derive";

const MINUS = "−";
const nf = new Map<string, Intl.NumberFormat>();
function numberFormat(currency: Currency, display: "symbol" | "name") {
  const key = currency + display;
  if (!nf.has(key))
    nf.set(
      key,
      new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency,
        currencyDisplay: display,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    );
  return nf.get(key)!;
}

/** Importe con dos decimales siempre, signo menos tipográfico y, si se pide,
 * «+» explícito. MXN se muestra con «$»; USD y EUR con su código (es-MX). */
export function formatMoney(
  amount: number,
  currency: Currency,
  sign: "auto" | "always" = "auto",
): string {
  const text = numberFormat(currency, "symbol")
    .format(Math.abs(amount) / 100)
    .replace(/ /g, " ");
  if (amount < 0) return MINUS + text;
  return sign === "always" && amount > 0 ? "+" + text : text;
}

/** Partes para una cifra protagonista: los centavos pueden ir más pequeños. */
export function moneyParts(amount: number, currency: Currency) {
  const parts = numberFormat(currency, "symbol").formatToParts(
    Math.abs(amount) / 100,
  );
  const fraction = parts.find((p) => p.type === "fraction")?.value ?? "00";
  const decimal = parts.find((p) => p.type === "decimal")?.value ?? ".";
  const whole = parts
    .filter((p) => p.type !== "fraction" && p.type !== "decimal")
    .map((p) => p.value)
    .join("")
    .replace(/ /g, " ");
  return {
    sign: amount < 0 ? MINUS : "",
    whole,
    cents: decimal + fraction,
  };
}

/** Lectura para tecnologías de asistencia: «129.50 pesos mexicanos». */
export function spokenMoney(amount: number, currency: Currency): string {
  const text = numberFormat(currency, "name").format(Math.abs(amount) / 100);
  return (amount < 0 ? "menos " : "") + text;
}

/** Prefijo del campo de importe, coherente con las listas: «$», «USD», «EUR». */
export function currencyPrefix(currency: Currency): string {
  return (
    numberFormat(currency, "symbol")
      .formatToParts(0)
      .find((p) => p.type === "currency")?.value ?? currency
  );
}

/** Ancho estimado de una cifra en múltiplos del tamaño de letra. Conservador
 * para cifras tabulares de sistema; se usa para ajustar sin recortar. */
export function estimateWidthEm(text: string): number {
  let w = 0;
  for (const ch of text)
    w += /[0-9$€]/.test(ch)
      ? 0.62
      : /[.,\s]/.test(ch)
        ? 0.3
        : /[A-Z]/.test(ch)
          ? 0.72
          : 0.62;
  return w;
}

/** Tamaño de letra que hace caber el texto en el ancho disponible. */
export function fitFontSize(
  text: string,
  available: number,
  base: number,
  min: number,
): number {
  if (!available) return base;
  const fit = Math.floor(available / estimateWidthEm(text));
  return Math.max(min, Math.min(base, fit));
}

const valid = (date: string) => {
  try {
    assertDate(date);
    return true;
  } catch {
    return false;
  }
};
const at = (date: string) => new Date(date + "T12:00:00Z");
const dtf = (opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("es-MX", { ...opts, timeZone: "UTC" });
const fDayMonth = dtf({ day: "numeric", month: "short" });
const fFull = dtf({ day: "numeric", month: "short", year: "numeric" });
const fLong = dtf({ day: "numeric", month: "long", year: "numeric" });
const fWeekday = dtf({ weekday: "short" });
const fMonth = dtf({ month: "long" });
const clean = (s: string) => s.replace(/\./g, "");

/** «6 oct» */
export function dayMonth(date: string): string {
  return valid(date) ? clean(fDayMonth.format(at(date))) : "Fecha por elegir";
}
/** «6 oct 2026» */
export function fullDate(date: string): string {
  return valid(date) ? clean(fFull.format(at(date))) : "Fecha por elegir";
}
/** «6 de octubre de 2026», para lectores de pantalla y confirmaciones. */
export function longDate(date: string): string {
  return valid(date) ? fLong.format(at(date)) : "fecha por elegir";
}
/** «sáb 3 oct» */
export function weekdayDayMonth(date: string): string {
  return valid(date)
    ? `${clean(fWeekday.format(at(date)))} ${dayMonth(date)}`
    : "Fecha por elegir";
}
/** «Octubre» */
export function monthName(month: string): string {
  const label = fMonth.format(at(month + "-01"));
  return label[0].toUpperCase() + label.slice(1);
}
/** «octubre» en minúsculas para frases. */
export function monthLower(month: string): string {
  return fMonth.format(at(month + "-01"));
}
/** Intervalo legible: «15–31 oct», «28 sep–3 oct», «3 oct». */
export function interval(start: string, end: string): string {
  if (start === end) return dayMonth(start);
  if (start.slice(0, 7) === end.slice(0, 7))
    return `${Number(start.slice(8))}–${dayMonth(end)}`;
  return `${dayMonth(start)}–${dayMonth(end)}`;
}
/** Etiqueta relativa de un vencimiento; null cuando la fecha sola basta. */
export function relativeDue(days: number): string | null {
  if (days === 0) return "Vence hoy";
  if (days === 1) return "Mañana";
  if (days > 1 && days <= 13) return `En ${days} días`;
  return null;
}
/** «Hoy · sáb 3 oct», «Ayer · vie 2 oct», «jue 1 oct» */
export function dayHeading(date: string, today: string): string {
  if (date === today) return `Hoy · ${weekdayDayMonth(date)}`;
  if (daysBetween(today, date) === -1) return `Ayer · ${weekdayDayMonth(date)}`;
  return weekdayDayMonth(date);
}
export function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}
export function percent(value: number): string {
  return (
    new Intl.NumberFormat("es-MX", { maximumFractionDigits: 1 }).format(value) +
    "\u00A0%"
  );
}
