export type Currency = "MXN" | "USD" | "EUR";
export type SpaceId = "personal" | "shared";
export type EntryKind = "expense" | "income" | "debt_payment" | "refund";
export type Frequency = "monthly" | "yearly" | "weekly";
export type RecurringKind = "subscription" | "service" | "debt";
export type RecurringStatus = "active" | "paused" | "cancelled";
export type Category =
  | "Comida"
  | "Transporte"
  | "Servicios"
  | "Entretenimiento"
  | "Salud"
  | "Educación"
  | "Compras"
  | "Otros"
  | "Sin clasificar";
export const categories: Category[] = [
  "Comida",
  "Transporte",
  "Servicios",
  "Entretenimiento",
  "Salud",
  "Educación",
  "Compras",
  "Otros",
  "Sin clasificar",
];
export const currencies: Currency[] = ["MXN", "USD", "EUR"];
export interface Entry {
  id: string;
  space: SpaceId;
  kind: EntryKind;
  title: string;
  amount: number;
  currency: Currency;
  date: string;
  category: Category;
  method: string;
  note: string;
  occurrenceId?: string;
  recurringSnapshot?: Recurring;
  createdBy: string;
}
export interface PriceChange {
  date: string;
  previous: number;
  next: number;
}
export interface Recurring {
  id: string;
  space: SpaceId;
  name: string;
  amount: number;
  currency: Currency;
  category: Category;
  kind: RecurringKind;
  frequency: Frequency;
  anchorDay: number;
  nextDate: string;
  status: RecurringStatus;
  pausedDate?: string;
  method: string;
  note: string;
  variable: boolean;
  trialEnd?: string;
  cancelDate?: string;
  endDate?: string;
  priceHistory: PriceChange[];
}
export interface Goal {
  name: string;
  target: number;
  saved: number;
  currency: Currency;
}
export interface Budget {
  amount: number | null;
  currency: Currency;
}
export interface AppData {
  schemaVersion: 1;
  retained?: PendingOccurrence[];
  scheduleChanges?: {
    recurringId: string;
    from: string;
    to: string;
    action: string;
    at: string;
  }[];
  entries: Entry[];
  recurring: Recurring[];
  budgets: Record<SpaceId, Partial<Record<Currency, Budget>>>;
  goals: Record<SpaceId, Goal>;
}
export interface PendingOccurrence {
  r: Recurring;
  date: string;
}
export interface Payment {
  recurringId: string;
  dueDate: string;
  paidDate: string;
  amount: number;
  confirmDifferentTotal?: boolean;
}

export function assertDate(value: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new Error("Escribe una fecha válida (AAAA-MM-DD).");
  if (value < "1900-01-01" || value > "2100-12-31")
    throw new Error("Usa una fecha entre 1900 y 2100.");
  const d = new Date(value + "T12:00:00Z");
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value)
    throw new Error("Revisa el día, mes y año.");
}
export function displayDate(value: string): string {
  try {
    assertDate(value);
  } catch {
    return "Fecha por elegir";
  }
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(new Date(value + "T12:00:00Z"))
    .replace(".", "");
}
export function todayLocal(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
export function monthKey(date: string): string {
  assertDate(date);
  return date.slice(0, 7);
}
export function changeMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  const result = d.toISOString().slice(0, 7);
  return result < "1900-01"
    ? "1900-01"
    : result > "2100-12"
      ? "2100-12"
      : result;
}
export function endOfMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
}
export function parseMoney(input: string, allowZero = false): number {
  const s = input.trim().replace(",", ".");
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(s))
    throw new Error(
      "Usa un importe positivo con hasta dos decimales, sin separadores de miles.",
    );
  const [whole, cents = ""] = s.split(".");
  const value = Number(whole) * 100 + Number(cents.padEnd(2, "0"));
  if (!Number.isSafeInteger(value) || (allowZero ? value < 0 : value <= 0))
    throw new Error("El importe debe ser mayor que cero.");
  return value;
}
export function money(
  amount: number,
  currency: Currency = "MXN",
  decimals = false,
): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: decimals || amount % 100 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount / 100);
}
export function id(prefix = "id"): string {
  return (
    prefix +
    "_" +
    (globalThis.crypto?.randomUUID?.() ??
      `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`)
  );
}
export function nextOccurrence(
  date: string,
  frequency: Frequency,
  anchorDay: number,
): string {
  assertDate(date);
  const [y, m, d] = date.split("-").map(Number);
  if (!Number.isInteger(anchorDay) || anchorDay < 1 || anchorDay > 31)
    throw new Error("Día de cobro inválido.");
  if (frequency === "weekly") {
    const result = new Date(Date.UTC(y, m - 1, d + 7))
      .toISOString()
      .slice(0, 10);
    assertDate(result);
    return result;
  }
  const target = new Date(
    Date.UTC(
      y + (frequency === "yearly" ? 1 : 0),
      m - 1 + (frequency === "monthly" ? 1 : 0),
      1,
    ),
  );
  const last = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(anchorDay, last));
  const result = target.toISOString().slice(0, 10);
  assertDate(result);
  return result;
}
export function inRange(r: Recurring, date: string): boolean {
  return (
    (r.status === "active" ||
      (r.status === "paused" && !!r.pausedDate && date < r.pausedDate)) &&
    (!r.cancelDate || date < r.cancelDate) &&
    (!r.endDate || date <= r.endDate)
  );
}
export function occurrences(r: Recurring, through: string): string[] {
  assertDate(through);
  const dates: string[] = [];
  let date = r.nextDate;
  for (let i = 0; i < 12000 && date <= through && inRange(r, date); i++) {
    dates.push(date);
    if (date === through) break;
    try {
      date = nextOccurrence(date, r.frequency, r.anchorDay);
    } catch (error) {
      if (date.startsWith("2100-")) break;
      throw error;
    }
  }
  return dates;
}
export function paidId(r: Recurring, dueDate: string): string {
  return `${r.id}:${dueDate}`;
}
export function confirmPayment(data: AppData, payment: Payment): AppData {
  const r = payable(data, payment.recurringId, payment.dueDate);
  if (!r) throw new Error("Este pago ya no existe.");
  assertDate(payment.dueDate);
  assertDate(payment.paidDate);
  if (!Number.isSafeInteger(payment.amount) || payment.amount <= 0)
    throw new Error("Importe inválido.");
  const occurrenceId = paidId(r, payment.dueDate);
  if (data.entries.some((e) => e.occurrenceId === occurrenceId)) return data;
  const retained = (data.retained ?? []).some(
    (o) => o.r.id === r.id && o.date === payment.dueDate,
  );
  if (
    (!retained && !inRange(r, payment.dueDate)) ||
    payment.dueDate !== r.nextDate
  )
    throw new Error("El vencimiento cambió. Revisa la próxima fecha.");
  if (
    !r.variable &&
    payment.amount !== r.amount &&
    !payment.confirmDifferentTotal
  )
    throw new Error(
      "El importe difiere del previsto. Confirma que es el total real; los abonos parciales aún no se admiten.",
    );
  const entry: Entry = {
    id: id("entry"),
    space: r.space,
    kind: r.kind === "debt" ? "debt_payment" : "expense",
    title: r.name,
    amount: payment.amount,
    currency: r.currency,
    date: payment.paidDate,
    category: r.category,
    method: r.method,
    note: r.note,
    occurrenceId,
    recurringSnapshot: { ...r },
    createdBy: "Tú",
  };
  return {
    ...data,
    entries: [entry, ...data.entries],
    retained: (data.retained ?? []).filter(
      (o) => !(o.r.id === r.id && o.date === payment.dueDate),
    ),
    recurring: data.recurring.map((item) =>
      item.id === r.id && (!retained || item.nextDate === payment.dueDate)
        ? {
            ...item,
            nextDate: nextOccurrence(
              item.nextDate,
              item.frequency,
              item.anchorDay,
            ),
          }
        : item,
    ),
  };
}
export function removeEntry(data: AppData, entryId: string): AppData {
  const entry = data.entries.find((e) => e.id === entryId);
  if (!entry) return data;
  let retained = data.retained ?? [];
  if (entry.occurrenceId) {
    const due = entry.occurrenceId.slice(-10);
    const original = entry.recurringSnapshot;
    if (!original)
      throw new Error(
        "Este pago no tiene los datos necesarios para restaurar su vencimiento.",
      );
    const snapshot = { ...original, nextDate: due };
    retained = [
      ...retained.filter((o) => paidId(o.r, o.date) !== entry.occurrenceId),
      { r: snapshot, date: due },
    ];
  }
  return {
    ...data,
    entries: data.entries.filter((e) => e.id !== entryId),
    retained,
  };
}
export function payable(
  data: AppData,
  recurringId: string,
  dueDate: string,
): Recurring | undefined {
  return (
    data.retained?.find((o) => o.r.id === recurringId && o.date === dueDate)
      ?.r ?? data.recurring.find((r) => r.id === recurringId)
  );
}
export function pendingThrough(
  data: AppData,
  through: string,
): PendingOccurrence[] {
  const indexed = new Map<string, PendingOccurrence>();
  for (const r of data.recurring)
    for (const date of occurrences(r, through))
      indexed.set(paidId(r, date), { r, date });
  for (const o of data.retained ?? [])
    if (o.date <= through) indexed.set(paidId(o.r, o.date), o);
  const paid = new Set(
    data.entries.flatMap((e) => (e.occurrenceId ? [e.occurrenceId] : [])),
  );
  return [...indexed.values()]
    .filter((o) => !paid.has(paidId(o.r, o.date)))
    .sort((a, b) => a.date.localeCompare(b.date));
}
export function recurringState(r: Recurring): string {
  if (r.status === "paused") return "Pausado";
  if (r.status === "cancelled" || (r.cancelDate && r.nextDate >= r.cancelDate))
    return "Cancelado";
  if (r.endDate && r.nextDate > r.endDate) return "Finalizado";
  return "Activo";
}
export function changeRecurringKind<
  T extends { kind: RecurringKind; trialEnd: string; endDate: string },
>(form: T, kind: RecurringKind): T {
  return kind === form.kind
    ? form
    : {
        ...form,
        kind,
        trialEnd: kind === "subscription" ? form.trialEnd : "",
        endDate: kind === "debt" ? form.endDate : "",
      };
}

export function summary(
  data: AppData,
  space: SpaceId,
  month: string,
  currency: Currency,
) {
  const entries = data.entries.filter(
    (e) =>
      e.space === space && e.currency === currency && e.date.startsWith(month),
  );
  const spent = entries.reduce(
    (s, e) =>
      s +
      (e.kind === "expense" ? e.amount : e.kind === "refund" ? -e.amount : 0),
    0,
  );
  const debtPaid = entries
    .filter((e) => e.kind === "debt_payment")
    .reduce((s, e) => s + e.amount, 0);
  const income = entries
    .filter((e) => e.kind === "income")
    .reduce((s, e) => s + e.amount, 0);
  const pending = pendingThrough(data, endOfMonth(month)).filter(
    (o) =>
      o.r.space === space &&
      o.r.currency === currency &&
      o.date.startsWith(month),
  );
  const upcoming = pending.reduce((s, o) => s + o.r.amount, 0);
  const debtPending = pending
    .filter((o) => o.r.kind === "debt")
    .reduce((s, o) => s + o.r.amount, 0);
  const byCategory = categories
    .map((category) => ({
      category,
      amount: entries
        .filter((e) => e.category === category)
        .reduce(
          (s, e) =>
            s +
            (e.kind === "expense"
              ? e.amount
              : e.kind === "refund"
                ? -e.amount
                : 0),
          0,
        ),
    }))
    .filter((c) => c.amount !== 0)
    .sort((a, b) => b.amount - a.amount);
  return {
    spent,
    debtPaid,
    income,
    upcoming,
    debtPending,
    byCategory,
    pending: pending.sort((a, b) => a.date.localeCompare(b.date)),
  };
}
export function updateRecurring(
  data: AppData,
  record: Recurring,
  dateAction?: "reschedule" | "future",
): AppData {
  const previous = data.recurring.find((r) => r.id === record.id);
  if (
    data.entries.some((e) => e.occurrenceId === paidId(record, record.nextDate))
  )
    throw new Error(
      "Esa fecha ya está pagada. Elige el siguiente vencimiento.",
    );
  if (previous && previous.currency !== record.currency)
    throw new Error(
      "Crea otro recurrente para cambiar de moneda y conservar el historial.",
    );
  if (
    previous &&
    previous.kind !== record.kind &&
    data.entries.some((e) => e.occurrenceId?.startsWith(record.id + ":"))
  )
    throw new Error(
      "Este recurrente ya tiene pagos. Crea otro para cambiar su tipo.",
    );
  if (
    previous?.status === "paused" &&
    previous.pausedDate &&
    previous.nextDate < previous.pausedDate &&
    (previous.nextDate !== record.nextDate || record.status === "active")
  )
    throw new Error(
      "Confirma los cobros anteriores a la pausa antes de cambiar su próxima fecha.",
    );
  assertDate(record.nextDate);
  for (const date of [record.endDate, record.cancelDate, record.trialEnd])
    if (date) assertDate(date);
  if (!previous && record.endDate && record.endDate < record.nextDate)
    throw new Error("La fecha final debe incluir el primer cobro.");
  if (record.trialEnd && record.trialEnd > record.nextDate)
    throw new Error(
      "El primer cobro debe ser al terminar la prueba o después.",
    );
  let retained = data.retained ?? [];
  let scheduleChanges = data.scheduleChanges ?? [];
  if (
    previous &&
    dateAction !== "reschedule" &&
    (previous.amount !== record.amount ||
      previous.frequency !== record.frequency ||
      previous.kind !== record.kind ||
      previous.variable !== record.variable ||
      previous.endDate !== record.endDate ||
      previous.cancelDate !== record.cancelDate)
  ) {
    const seen = new Set(retained.map((o) => paidId(o.r, o.date)));
    const paid = new Set(data.entries.map((e) => e.occurrenceId));
    const past = occurrences(previous, todayLocal()).filter(
      (date) =>
        date < todayLocal() &&
        !seen.has(paidId(previous, date)) &&
        !paid.has(paidId(previous, date)),
    );
    retained = [
      ...retained,
      ...past.map((date) => ({ r: { ...previous, nextDate: date }, date })),
    ];
  }

  if (
    previous &&
    (previous.nextDate !== record.nextDate ||
      previous.frequency !== record.frequency) &&
    inRange(previous, previous.nextDate)
  ) {
    if (!dateAction)
      throw new Error(
        "Elige cómo cambiar el calendario: mover desde este vencimiento o conservar pendientes y cambiar los cobros futuros.",
      );
    if (dateAction === "future") {
      if (record.nextDate <= previous.nextDate)
        throw new Error(
          "Los cobros futuros deben comenzar después del vencimiento pendiente.",
        );
      const dates = occurrences(previous, record.nextDate).filter(
        (d) => d < record.nextDate,
      );
      const existing = new Set(retained.map((o) => paidId(o.r, o.date)));
      retained = [
        ...retained,
        ...dates
          .filter(
            (date) =>
              !existing.has(paidId(previous, date)) &&
              !data.entries.some(
                (e) => e.occurrenceId === paidId(previous, date),
              ),
          )
          .map((date) => ({ r: { ...previous, nextDate: date }, date })),
      ];
    }
    scheduleChanges = [
      ...scheduleChanges,
      {
        recurringId: record.id,
        from: previous.nextDate,
        to: record.nextDate,
        action: dateAction,
        at: todayLocal(),
      },
    ];
  }
  const clean = {
    ...record,
    trialEnd: record.kind === "subscription" ? record.trialEnd : undefined,
    endDate: record.kind === "debt" ? record.endDate : undefined,
  };
  return {
    ...data,
    retained,
    scheduleChanges,
    recurring: previous
      ? data.recurring.map((r) => (r.id === record.id ? clean : r))
      : [...data.recurring, clean],
  };
}
export function pauseRecurring(
  data: AppData,
  recurringId: string,
  date = todayLocal(),
): AppData {
  assertDate(date);
  return {
    ...data,
    recurring: data.recurring.map((r) =>
      r.id === recurringId ? { ...r, status: "paused", pausedDate: date } : r,
    ),
  };
}
