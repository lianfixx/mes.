// Cálculos derivados para presentar el estado sin alterarlo. Todas las funciones
// son puras y reutilizan las reglas de model.ts; ninguna escribe datos.
import {
  AppData,
  PendingOccurrence,
  Recurring,
  RecurringKind,
  assertDate,
  confirmPayment,
  inRange,
  nextOccurrence,
  paidId,
  pendingThrough,
  updateRecurring,
} from "./model";

const sumAmounts = (list: PendingOccurrence[]) =>
  list.reduce((s, o) => s + o.r.amount, 0);

/** Separa los pendientes de un período en «por confirmar» (antes de hoy) y
 * «próximos» (hoy en adelante). Los dos totales suman el total del período. */
export function splitPending(pending: PendingOccurrence[], today: string) {
  const toConfirm = pending.filter((o) => o.date < today);
  const upcoming = pending.filter((o) => o.date >= today);
  return {
    toConfirm,
    upcoming,
    toConfirmTotal: sumAmounts(toConfirm),
    upcomingTotal: sumAmounts(upcoming),
    toConfirmEstimated: toConfirm.some((o) => o.r.variable),
    upcomingEstimated: upcoming.some((o) => o.r.variable),
  };
}

/** Pendientes anteriores a hoy agrupados por recurrente. */
export function overdueByRule(
  data: AppData,
  today: string,
): Map<string, PendingOccurrence[]> {
  const map = new Map<string, PendingOccurrence[]>();
  for (const o of pendingThrough(data, today))
    if (o.date < today) map.set(o.r.id, [...(map.get(o.r.id) ?? []), o]);
  return map;
}

/** Próximas fechas de cobro de una regla, desde su próximo vencimiento, sin
 * salir de su vigencia (pausa, cancelación, última cuota) ni del año 2100. */
export function upcomingDates(r: Recurring, count: number): string[] {
  const out: string[] = [];
  let date = r.nextDate;
  try {
    assertDate(date);
  } catch {
    return out;
  }
  for (let i = 0; i < count && inRange(r, date); i++) {
    out.push(date);
    try {
      date = nextOccurrence(date, r.frequency, r.anchorDay);
    } catch {
      break;
    }
  }
  return out;
}

/** Lo que queda después de confirmar un vencimiento, calculado con la misma
 * regla de dominio que registra el pago. */
export function afterPayment(
  data: AppData,
  recurringId: string,
  dueDate: string,
): { nextDate: string | null; otherPending: string[] } | null {
  const current = data.recurring.find((r) => r.id === recurringId);
  const retained = (data.retained ?? []).find(
    (o) => o.r.id === recurringId && o.date === dueDate,
  );
  const source = retained?.r ?? current;
  if (!source) return null;
  let next: AppData;
  try {
    next = confirmPayment(data, {
      recurringId,
      dueDate,
      paidDate: dueDate,
      amount: source.amount,
      confirmDifferentTotal: true,
    });
  } catch {
    return null;
  }
  const rule = next.recurring.find((r) => r.id === recurringId);
  const otherPending = pendingThrough(
    next,
    rule && inRange(rule, rule.nextDate) ? rule.nextDate : dueDate,
  )
    .filter((o) => o.r.id === recurringId && o.date !== rule?.nextDate)
    .map((o) => o.date);
  return {
    nextDate: rule && inRange(rule, rule.nextDate) ? rule.nextDate : null,
    otherPending,
  };
}

/** Condiciones que se perderían al cambiar realmente de tipo. Seleccionar el
 * mismo tipo no pierde nada (ver changeRecurringKind). */
export function droppedByKindChange(
  form: { kind: RecurringKind; trialEnd: string; endDate: string },
  kind: RecurringKind,
): { field: "trialEnd" | "endDate"; value: string }[] {
  if (kind === form.kind) return [];
  const dropped: { field: "trialEnd" | "endDate"; value: string }[] = [];
  if (kind !== "subscription" && form.trialEnd)
    dropped.push({ field: "trialEnd", value: form.trialEnd });
  if (kind !== "debt" && form.endDate)
    dropped.push({ field: "endDate", value: form.endDate });
  return dropped;
}

/** Último cambio de precio de una regla con su diferencia transparente:
 * diferencia = nuevo − anterior; porcentaje = diferencia / anterior × 100 si el
 * anterior es positivo. Para una anualidad agrega su equivalente mensual
 * (anualidad / 12, redondeado al centavo), que no es un cobro real. */
export function priceInsight(r: Recurring) {
  const last = r.priceHistory.at(-1);
  if (!last) return null;
  const diff = last.next - last.previous;
  return {
    date: last.date,
    previous: last.previous,
    next: last.next,
    diff,
    percent: last.previous > 0 ? (diff / last.previous) * 100 : null,
    currency: r.currency,
    frequency: r.frequency,
    monthlyEquivalent:
      r.frequency === "yearly"
        ? {
            previous: Math.round(last.previous / 12),
            next: Math.round(last.next / 12),
          }
        : null,
  };
}

/** Vista previa de un cambio de calendario sin aplicarlo: qué vencimientos se
 * conservan pendientes y cuáles serán los próximos cobros de la regla. */
export function previewScheduleChange(
  data: AppData,
  record: Recurring,
  action: "reschedule" | "future",
  count = 3,
):
  | { ok: true; kept: PendingOccurrence[]; upcoming: string[] }
  | { ok: false; error: string } {
  try {
    const next = updateRecurring(data, record, action);
    const paid = new Set(next.entries.map((e) => e.occurrenceId));
    const kept = (next.retained ?? [])
      .filter((o) => o.r.id === record.id && !paid.has(paidId(o.r, o.date)))
      .sort((a, b) => a.date.localeCompare(b.date));
    const rule = next.recurring.find((r) => r.id === record.id);
    return { ok: true, kept, upcoming: rule ? upcomingDates(rule, count) : [] };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** Días civiles entre dos fechas AAAA-MM-DD (b − a), sin zona horaria. */
export function daysBetween(a: string, b: string): number {
  const ms = (s: string) =>
    Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
  return Math.round((ms(b) - ms(a)) / 86400000);
}
