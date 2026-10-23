// Estado temporal de la alfa y comandos de la interfaz. Las reglas financieras
// viven en src/domain; aquí solo se validan formularios, se llaman los comandos
// del dominio y se decide qué mostrar. Trasladado desde App.tsx 0.1.2 sin
// cambiar sus invariantes (ver docs/HANDOFF.md).
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Platform,
  ScrollView,
  Share,
  useColorScheme,
} from "react-native";
import * as Haptics from "expo-haptics";
import {
  AppData,
  Category,
  Currency,
  Entry,
  EntryKind,
  Frequency,
  Recurring,
  RecurringKind,
  SpaceId,
  assertDate,
  changeMonth,
  changeRecurringKind,
  confirmPayment,
  currencies,
  endOfMonth,
  id,
  parseMoney,
  pauseRecurring,
  payable,
  pendingThrough,
  removeEntry,
  summary,
  todayLocal,
  updateRecurring,
} from "../domain/model";
import {
  droppedByKindChange,
  overdueByRule,
  priceInsight,
  splitPending,
} from "../domain/derive";
import { createDemo, emptyData } from "../data/demo";
import { dayMonth, formatMoney, monthLower } from "../ui/format";

export type Tab = "Mes" | "Recurrentes" | "Movimientos";
export type SheetName =
  | "entry"
  | "recurring"
  | "payment"
  | "detail"
  | "budget"
  | "goal"
  | "settings"
  | "spaces"
  | null;
export type ThemeMode = "system" | "light" | "dark";
export interface FormError {
  message: string;
  field?: string;
}
export class FieldError extends Error {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message);
  }
}
function withField<T>(field: string, run: () => T): T {
  try {
    return run();
  } catch (e) {
    throw new FieldError((e as Error).message, field);
  }
}

export const entryLabel: Record<EntryKind, string> = {
  expense: "Gasto",
  income: "Ingreso",
  refund: "Devolución",
  debt_payment: "Pago de deuda",
};
export const entryNoun: Record<EntryKind, string> = {
  expense: "gasto",
  income: "ingreso",
  refund: "devolución",
  debt_payment: "pago de deuda",
};
export const kindLabel: Record<RecurringKind, string> = {
  subscription: "Suscripción",
  service: "Servicio",
  debt: "Cuota de deuda",
};
export const freqLabel: Record<Frequency, string> = {
  weekly: "Semanal",
  monthly: "Mensual",
  yearly: "Anual",
};
export const freqLower: Record<Frequency, string> = {
  weekly: "semanal",
  monthly: "mensual",
  yearly: "anual",
};
export const spaceLabel: Record<SpaceId, string> = {
  personal: "Personal",
  shared: "Casa · ejemplo",
};
export const methods = [
  "Efectivo",
  "Tarjeta personal",
  "Transferencia",
  "Sin especificar",
];
/** Favoritos fijos de la alfa. El importe sugerido solo existe en MXN y nunca se
 * convierte a otra moneda. */
export const favorites: { name: string; amount: string; category: Category }[] =
  [
    { name: "Comida", amount: "150", category: "Comida" },
    { name: "Pasajes", amount: "14", category: "Transporte" },
    { name: "Café", amount: "45", category: "Comida" },
  ];

export const recInitial = () => ({
  name: "",
  amount: "",
  currency: "MXN" as Currency,
  category: "Servicios" as Category,
  frequency: "monthly" as Frequency,
  kind: "subscription" as RecurringKind,
  date: "",
  method: "Sin especificar",
  note: "",
  variable: false,
  trialEnd: "",
  cancelDate: "",
  endDate: "",
});
export type RecForm = ReturnType<typeof recInitial>;
export const entryInitial = () => ({
  title: "",
  amount: "",
  currency: "MXN" as Currency,
  category: "Sin clasificar" as Category,
  kind: "expense" as EntryKind,
  date: todayLocal(),
  method: "Sin especificar",
  note: "",
});
export type EntryForm = ReturnType<typeof entryInitial>;

/** Construye la regla a partir del formulario, validando en el orden en que se
 * ven los campos para enfocar el primero inválido. Misma lógica de 0.1.2. */
export function buildRecord(
  form: RecForm,
  previous: Recurring | undefined,
  ids: { editId: string | null; resumeId: string | null; space: SpaceId },
): Recurring {
  if (!form.name.trim())
    throw new FieldError("Escribe el nombre del pago.", "name");
  if (!form.amount.trim())
    throw new FieldError("Escribe el importe previsto.", "amount");
  const amount = withField("amount", () => parseMoney(form.amount));
  if (!form.date)
    throw new FieldError("Elige la fecha del próximo cobro.", "date");
  withField("date", () => assertDate(form.date));
  for (const field of ["trialEnd", "cancelDate", "endDate"] as const)
    if (form[field]) withField(field, () => assertDate(form[field]));
  const today = todayLocal();
  return {
    id: ids.editId ?? id("r"),
    space: ids.space,
    name: form.name.trim(),
    amount,
    currency: form.currency,
    category: form.category,
    frequency: form.frequency,
    kind: form.kind,
    nextDate: form.date,
    anchorDay:
      previous && previous.nextDate === form.date
        ? previous.anchorDay
        : Number(form.date.slice(-2)),
    status:
      ids.resumeId === ids.editId ? "active" : (previous?.status ?? "active"),
    method: form.method,
    note: form.note,
    variable: form.variable,
    pausedDate: previous?.pausedDate,
    trialEnd:
      form.kind === "subscription" ? form.trialEnd || undefined : undefined,
    cancelDate: form.cancelDate || undefined,
    endDate: form.kind === "debt" ? form.endDate || undefined : undefined,
    priceHistory:
      previous?.amount !== undefined && previous.amount !== amount
        ? [
            ...previous.priceHistory,
            {
              date: form.date < today ? today : form.date,
              previous: previous.amount,
              next: amount,
            },
          ]
        : (previous?.priceHistory ?? []),
  };
}

/** Asocia los errores del dominio al campo que la persona debe revisar. */
export function recurringErrorField(message: string): string | undefined {
  if (/calendario|futuros deben comenzar/.test(message)) return "scope";
  if (/fecha final/.test(message)) return "endDate";
  if (/terminar la prueba/.test(message)) return "trialEnd";
  if (/ya está pagada|anteriores a la pausa/.test(message)) return "date";
  if (/su tipo/.test(message)) return "kind";
  return undefined;
}

export function canConfirm(data: AppData, r: Recurring, date: string) {
  return (
    date === r.nextDate ||
    (data.retained ?? []).some((o) => o.r.id === r.id && o.date === date)
  );
}

export function useMesApp(layout: { desktop: boolean }) {
  const scheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const dark =
    themeMode === "dark" || (themeMode === "system" && scheme === "dark");
  const [data, setData] = useState<AppData>(() => createDemo());
  const [space, setSpaceState] = useState<SpaceId>("personal");
  const [tab, setTab] = useState<Tab>("Mes");
  const [month, setMonth] = useState(todayLocal().slice(0, 7));
  const [currency, setCurrency] = useState<Currency>("MXN");
  const [sheet, setSheet] = useState<SheetName>(null);
  const [error, setError] = useState<FormError | null>(null);
  const [paymentDue, setPaymentDue] = useState("");
  const [differentTotal, setDifferentTotal] = useState(false);
  const [dateAction, setDateAction] = useState<"reschedule" | "future">();
  const [showAllDue, setShowAllDue] = useState(false);
  const [showPastDue, setShowPastDue] = useState(false);
  const [confirm, setConfirm] = useState<
    "discard" | "delete" | "reset" | "restore" | null
  >(null);
  const [pendingKind, setPendingKind] = useState<RecurringKind | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const draftBaseline = useRef("");
  const sheetScroll = useRef<ScrollView>(null);
  const [toast, setToast] = useState<{
    message: string;
    undo: boolean;
    key: number;
  }>({ message: "", undo: false, key: 0 });
  const [lastOp, setLastOp] = useState<{
    before: AppData;
    after: AppData;
  } | null>(null);
  const [search, setSearch] = useState("");
  const [recFilter, setRecFilter] = useState<"active" | "inactive" | "all">(
    "active",
  );
  const [entryFilter, setEntryFilter] = useState<EntryKind | "all">("all");
  const [entryForm, setEntryForm] = useState(entryInitial);
  const [recForm, setRecForm] = useState(recInitial);
  const [editId, setEditId] = useState<string | null>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [extras, setExtras] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(todayLocal());
  const [budgetAmount, setBudgetAmount] = useState("");
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalSaved, setGoalSaved] = useState("");
  const [contribution, setContribution] = useState("");
  const [goalDetails, setGoalDetails] = useState(false);
  const live = useRef({ data, space, month, currency });
  live.current = { data, space, month, currency };

  const today = todayLocal();
  const totals = useMemo(
    () => summary(data, space, month, currency),
    [data, space, month, currency],
  );
  const split = useMemo(
    () => splitPending(totals.pending, today),
    [totals, today],
  );
  const pastDue = useMemo(
    () =>
      pendingThrough(data, month + "-01").filter(
        (o) =>
          o.date < month + "-01" &&
          o.r.space === space &&
          o.r.currency === currency,
      ),
    [data, month, space, currency],
  );
  const overdue = useMemo(() => overdueByRule(data, today), [data, today]);
  const budget = data.budgets[space][currency] ?? { amount: null, currency };
  const goal = data.goals[space];
  const spaceName = spaceLabel[space];
  const baseRecurring = data.recurring.filter(
    (r) => r.space === space && r.currency === currency,
  );
  const otherCurrencies = currencies.filter(
    (c) =>
      c !== currency &&
      (data.entries.some((e) => e.space === space && e.currency === c) ||
        data.recurring.some((r) => r.space === space && r.currency === c)),
  );
  /** Observación solo con evidencia: último aumento registrado de un cobro
   * activo en este espacio y moneda, ocurrido hasta dos meses antes. */
  const priceRise = useMemo(() => {
    const from = changeMonth(month, -2) + "-01";
    const to = endOfMonth(month);
    return baseRecurring
      .filter((r) => r.status === "active")
      .map((r) => ({ r, insight: priceInsight(r) }))
      .filter(
        (x) =>
          x.insight &&
          x.insight.diff > 0 &&
          x.insight.date >= from &&
          x.insight.date <= to,
      )
      .sort((a, b) => b.insight!.date.localeCompare(a.insight!.date))[0];
  }, [baseRecurring, month]);
  const currentRec =
    sheet === "payment"
      ? payable(data, selected ?? "", paymentDue)
      : data.recurring.find((r) => r.id === selected);

  const notify = (message: string, undo = false) => {
    if (Platform.OS !== "web") void Haptics.selectionAsync().catch(() => {});
    if (Platform.OS === "ios")
      AccessibilityInfo.announceForAccessibility(message);
    setToast((t) => ({ message, undo, key: t.key + 1 }));
  };
  /** Aplica un cambio y ofrece deshacerlo mientras nada más haya cambiado. */
  const commit = (next: AppData, message: string) => {
    setLastOp({ before: data, after: next });
    setData(next);
    notify(message, true);
  };
  const canUndo = !!lastOp && data === lastOp.after;
  const undo = () => {
    if (!lastOp || data !== lastOp.after) return;
    setData(lastOp.before);
    setLastOp(null);
    notify("Cambio deshecho");
  };
  useEffect(() => {
    if (!toast.message) return;
    const timeout = setTimeout(
      () => setToast((t) => ({ ...t, message: "" })),
      toast.undo ? 8000 : 4500,
    );
    return () => clearTimeout(timeout);
  }, [toast.key]);

  const fail = (e: unknown, mapField?: (m: string) => string | undefined) => {
    const message = (e as Error).message;
    const field = e instanceof FieldError ? e.field : mapField?.(message);
    setError({ message, field });
    if (Platform.OS !== "web")
      AccessibilityInfo.announceForAccessibility(message);
    if (!field)
      sheetScroll.current?.scrollTo({ y: 0, animated: !reduceMotion });
  };
  const open = (next: SheetName) => {
    setError(null);
    setConfirm(null);
    setExtras(false);
    setDifferentTotal(false);
    setDateAction(undefined);
    setPendingKind(null);
    setGoalDetails(false);
    setSheet(next);
  };
  const finish = () => {
    setSheet(null);
    setError(null);
    setConfirm(null);
  };
  const draft = JSON.stringify({
    entryForm,
    recForm,
    paymentAmount,
    paymentDate,
    budgetAmount,
    goalName,
    goalTarget,
    goalSaved,
    contribution,
  });
  useEffect(() => {
    draftBaseline.current = draft;
  }, [sheet]);
  const dirty =
    ["entry", "recurring", "payment", "budget", "goal"].includes(sheet ?? "") &&
    draft !== draftBaseline.current;
  const close = () => {
    if (dirty) {
      setConfirm("discard");
      sheetScroll.current?.scrollTo({ y: 0, animated: !reduceMotion });
      if (Platform.OS !== "web")
        AccessibilityInfo.announceForAccessibility(
          "Tienes cambios sin guardar. Elige seguir editando o descartar.",
        );
      return;
    }
    finish();
  };

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );
    return () => sub.remove();
  }, []);
  useEffect(() => setDifferentTotal(false), [paymentAmount, entryForm.amount]);

  const navigate = (next: Tab) => {
    setTab(next);
    setSearch("");
  };
  const setSpace = (s: SpaceId) => {
    setSpaceState(s);
    setSearch("");
    finish();
    notify(
      s === "personal"
        ? "Estás en Personal"
        : "Estás en Casa · ejemplo, con datos ficticios",
    );
  };

  // Movimientos
  const newEntry = () => {
    setEditId(null);
    setEntryForm({ ...entryInitial(), currency });
    open("entry");
  };
  const editEntry = (e: Entry) => {
    setEditId(e.id);
    setEntryForm({
      title: e.title,
      amount: (e.amount / 100).toFixed(2),
      currency: e.currency,
      category: e.category,
      kind: e.kind,
      date: e.date,
      method: e.method,
      note: e.note,
    });
    open("entry");
  };
  const saveEntry = () => {
    try {
      if (!entryForm.amount.trim())
        throw new FieldError("Escribe el importe.", "amount");
      const amount = withField("amount", () => parseMoney(entryForm.amount));
      withField("date", () => assertDate(entryForm.date));
      if (entryForm.date > todayLocal())
        throw new FieldError(
          "Para un pago futuro, crea un recurrente.",
          "date",
        );
      const previous = data.entries.find((e) => e.id === editId);
      if (
        previous?.occurrenceId &&
        (entryForm.kind !== previous.kind ||
          entryForm.currency !== previous.currency)
      )
        throw new FieldError(
          "Conserva el tipo y la moneda del pago vinculado.",
          "kind",
        );
      if (
        previous?.recurringSnapshot &&
        !previous.recurringSnapshot.variable &&
        amount !== previous.amount &&
        !differentTotal
      )
        throw new FieldError(
          "Confirma que el importe corregido es el total completo, no un abono parcial.",
          "differentTotal",
        );
      const entry: Entry = {
        ...entryForm,
        id: editId ?? id("e"),
        space,
        amount,
        title:
          entryForm.title.trim() ||
          (entryForm.category === "Sin clasificar"
            ? entryLabel[entryForm.kind]
            : entryForm.category),
        createdBy: previous?.createdBy ?? "Tú",
        occurrenceId: previous?.occurrenceId,
        recurringSnapshot: previous?.recurringSnapshot,
      };
      const next = {
        ...data,
        entries: editId
          ? data.entries.map((e) => (e.id === editId ? entry : e))
          : [entry, ...data.entries],
      };
      const entryMonth = entry.date.slice(0, 7);
      const where =
        entryMonth === month
          ? spaceName
          : `${monthLower(entryMonth)} · ${spaceName}`;
      commit(
        next,
        editId
          ? "Movimiento actualizado"
          : `${entryLabel[entry.kind]} guardado en ${where} · ${formatMoney(amount, entry.currency)}`,
      );
      setMonth(entryMonth);
      setCurrency(entry.currency);
      finish();
    } catch (e) {
      fail(e);
    }
  };
  const retireEntry = () => {
    if (!editId) return;
    try {
      const next = removeEntry(data, editId);
      commit(next, "Movimiento retirado");
      finish();
    } catch (e) {
      fail(e);
    }
  };

  // Recurrentes
  const newRecurring = () => {
    setResumeId(null);
    setEditId(null);
    setRecForm({ ...recInitial(), currency });
    open("recurring");
  };
  const formFromRule = (r: Recurring) => ({
    name: r.name,
    amount: (r.amount / 100).toFixed(2),
    currency: r.currency,
    category: r.category,
    frequency: r.frequency,
    kind: r.kind,
    date: r.nextDate,
    method: r.method,
    note: r.note,
    variable: r.variable,
    trialEnd: r.trialEnd ?? "",
    cancelDate: r.cancelDate ?? "",
    endDate: r.endDate ?? "",
  });
  const editRecurring = (r: Recurring) => {
    setResumeId(null);
    setEditId(r.id);
    setRecForm(formFromRule(r));
    open("recurring");
  };
  /** Pulsar el tipo ya elegido no cambia nada (A1). Un cambio real que quitaría
   * prueba o última cuota pide confirmación antes de aplicarse. */
  const chooseKind = (kind: RecurringKind) => {
    if (droppedByKindChange(recForm, kind).length) setPendingKind(kind);
    else {
      setPendingKind(null);
      setRecForm((f) => changeRecurringKind(f, kind));
    }
  };
  const applyPendingKind = () => {
    if (pendingKind) setRecForm((f) => changeRecurringKind(f, pendingKind));
    setPendingKind(null);
  };
  const recPrevious = data.recurring.find((r) => r.id === editId);
  const saveRecurring = () => {
    try {
      const record = buildRecord(recForm, recPrevious, {
        editId,
        resumeId,
        space,
      });
      const next = updateRecurring(data, record, dateAction);
      commit(
        next,
        resumeId && resumeId === editId
          ? `${record.name} reanudado`
          : editId
            ? `${record.name} actualizado`
            : `${record.name} agregado a Recurrentes`,
      );
      setCurrency(record.currency);
      finish();
    } catch (e) {
      fail(e, recurringErrorField);
    }
  };
  const openDetail = (r: Recurring) => {
    setSelected(r.id);
    open("detail");
  };
  const pause = (r: Recurring) => {
    commit(
      pauseRecurring(data, r.id),
      `${r.name} pausado desde hoy. Los cobros anteriores siguen pendientes.`,
    );
    finish();
  };
  const resume = (r: Recurring) => {
    setResumeId(r.id);
    setEditId(r.id);
    setRecForm({
      ...formFromRule(r),
      date:
        r.pausedDate && r.nextDate < r.pausedDate ? r.nextDate : todayLocal(),
    });
    open("recurring");
    notify("Revisa la próxima fecha antes de guardar.");
  };

  // Pagos
  const startPayment = (r: Recurring, dueDate = r.nextDate) => {
    setPaymentDue(dueDate);
    setSelected(r.id);
    setPaymentAmount((r.amount / 100).toFixed(2));
    setPaymentDate(todayLocal());
    open("payment");
  };
  const pay = () => {
    try {
      if (!currentRec) return;
      if (!paymentAmount.trim())
        throw new FieldError("Escribe el importe pagado.", "amount");
      const amount = withField("amount", () => parseMoney(paymentAmount));
      withField("paidDate", () => assertDate(paymentDate));
      if (paymentDate > todayLocal())
        throw new FieldError(
          "La fecha de pago no puede estar en el futuro.",
          "paidDate",
        );
      const next = confirmPayment(data, {
        recurringId: currentRec.id,
        dueDate: paymentDue,
        confirmDifferentTotal: differentTotal,
        paidDate: paymentDate,
        amount,
      });
      commit(
        next,
        `Pago de ${currentRec.name} del ${dayMonth(paymentDue)} registrado`,
      );
      finish();
    } catch (e) {
      fail(e, (m) => (/difiere/.test(m) ? "differentTotal" : undefined));
    }
  };

  // Presupuesto y meta
  const startBudget = () => {
    setBudgetAmount(budget.amount ? (budget.amount / 100).toFixed(2) : "");
    open("budget");
  };
  const writeBudget = (amount: number | null) => ({
    ...data,
    budgets: {
      ...data.budgets,
      [space]: { ...data.budgets[space], [currency]: { amount, currency } },
    },
  });
  const saveBudget = () => {
    try {
      const amount = budgetAmount.trim()
        ? withField("amount", () => parseMoney(budgetAmount))
        : null;
      commit(
        writeBudget(amount),
        amount ? "Límite de gastos actualizado" : "Límite de gastos retirado",
      );
      finish();
    } catch (e) {
      fail(e);
    }
  };
  const clearBudget = () => {
    commit(writeBudget(null), "Límite de gastos retirado");
    finish();
  };
  const startGoal = () => {
    setGoalName(goal.name);
    setGoalTarget((goal.target / 100).toFixed(2));
    setGoalSaved((goal.saved / 100).toFixed(2));
    setContribution("");
    open("goal");
  };
  const saveGoal = () => {
    try {
      if (!goalName.trim())
        throw new FieldError("Pon un nombre a tu meta.", "name");
      const target = withField("target", () => parseMoney(goalTarget));
      const saved =
        goalSaved.trim() === ""
          ? 0
          : withField("saved", () => parseMoney(goalSaved, true));
      const add = contribution.trim()
        ? withField("contribution", () => parseMoney(contribution, true))
        : 0;
      commit(
        {
          ...data,
          goals: {
            ...data.goals,
            [space]: {
              name: goalName.trim(),
              target,
              saved: saved + add,
              currency: goal.currency,
            },
          },
        },
        add
          ? `Aporte de ${formatMoney(add, goal.currency)} registrado`
          : "Meta actualizada",
      );
      finish();
    } catch (e) {
      if (!goalDetails && e instanceof FieldError && e.field !== "contribution")
        setGoalDetails(true);
      fail(e);
    }
  };

  // Ajustes de la prueba
  const exportData = async () => {
    const content = JSON.stringify(
      { ...data, exportedAt: new Date().toISOString(), mode: "demo" },
      null,
      2,
    );
    if (Platform.OS === "web") {
      const blob = new Blob([content], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mes-prueba-" + todayLocal() + ".json";
      a.click();
      URL.revokeObjectURL(url);
    } else
      await Share.share({ message: content, title: "Mis datos de prueba" });
    notify("Copia de prueba preparada (JSON, sin importador)");
  };
  const resetBlank = () => {
    commit(emptyData(), "Prueba en blanco");
    setMonth(todayLocal().slice(0, 7));
    finish();
  };
  const restoreDemo = () => {
    commit(createDemo(), "Ejemplo restaurado");
    setMonth(todayLocal().slice(0, 7));
    setCurrency("MXN");
    finish();
  };

  // Web: título, colores del documento y herramienta de solo lectura.
  useEffect(() => {
    if (Platform.OS !== "web") return;
    document.title = "Mes · Finanzas";
    const context = (document as any).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      Promise.resolve(
        context.registerTool(
          {
            name: "read_current_month",
            title: "Consultar el mes de prueba",
            description:
              "Devuelve el resumen visible del espacio, mes y moneda seleccionados. No modifica datos.",
            inputSchema: {
              type: "object",
              properties: {},
              additionalProperties: false,
            },
            annotations: { readOnlyHint: true, untrustedContentHint: true },
            execute(input: unknown) {
              if (
                !input ||
                typeof input !== "object" ||
                Array.isArray(input) ||
                Object.keys(input).length
              )
                throw new Error("No se admiten parámetros.");
              const v = live.current;
              const s = summary(v.data, v.space, v.month, v.currency);
              return {
                mode: "demo",
                space: v.space,
                month: v.month,
                currency: v.currency,
                spentMinor: s.spent,
                debtPaidMinor: s.debtPaid,
                upcomingMinor: s.upcoming,
              };
            },
          },
          { signal: lifecycle.signal },
        ),
      ).catch(() => {});
    } catch {}
    return () => lifecycle.abort();
  }, []);

  return {
    layout,
    themeMode,
    setThemeMode,
    dark,
    reduceMotion,
    data,
    today,
    space,
    spaceName,
    setSpace,
    tab,
    navigate,
    month,
    setMonth,
    currency,
    setCurrency,
    otherCurrencies,
    totals,
    split,
    pastDue,
    overdue,
    budget,
    goal,
    baseRecurring,
    priceRise,
    sheet,
    open,
    close,
    finish,
    sheetScroll,
    error,
    setError,
    confirm,
    setConfirm,
    toast,
    canUndo,
    undo,
    search,
    setSearch,
    recFilter,
    setRecFilter,
    entryFilter,
    setEntryFilter,
    showAllDue,
    setShowAllDue,
    showPastDue,
    setShowPastDue,
    entryForm,
    setEntryForm,
    recForm,
    setRecForm,
    recPrevious,
    editId,
    resumeId,
    extras,
    setExtras,
    currentRec,
    paymentDue,
    paymentAmount,
    setPaymentAmount,
    paymentDate,
    setPaymentDate,
    differentTotal,
    setDifferentTotal,
    dateAction,
    setDateAction,
    pendingKind,
    setPendingKind,
    chooseKind,
    applyPendingKind,
    budgetAmount,
    setBudgetAmount,
    goalName,
    setGoalName,
    goalTarget,
    setGoalTarget,
    goalSaved,
    setGoalSaved,
    contribution,
    setContribution,
    goalDetails,
    setGoalDetails,
    newEntry,
    editEntry,
    saveEntry,
    retireEntry,
    newRecurring,
    editRecurring,
    saveRecurring,
    openDetail,
    pause,
    resume,
    startPayment,
    pay,
    startBudget,
    saveBudget,
    clearBudget,
    startGoal,
    saveGoal,
    exportData,
    resetBlank,
    restoreDemo,
  };
}
export type MesApp = ReturnType<typeof useMesApp>;
