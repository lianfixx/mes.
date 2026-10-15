import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
  Modal,
  Platform,
  KeyboardAvoidingView,
  useWindowDimensions,
  Switch,
  Share,
  AccessibilityInfo,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  AppData,
  Entry,
  Recurring,
  SpaceId,
  Currency,
  Category,
  Frequency,
  RecurringKind,
  EntryKind,
  categories,
  currencies,
  summary,
  money,
  parseMoney,
  todayLocal,
  changeMonth,
  confirmPayment,
  removeEntry,
  id,
  assertDate,
  nextOccurrence,
  inRange,
  updateRecurring,
  pauseRecurring,
  payable,
  pendingThrough,
  recurringState,
  changeRecurringKind,
  endOfMonth,
  displayDate,
} from "./src/domain/model";
import { createDemo, emptyData } from "./src/data/demo";
import { themes, Theme } from "./src/ui/tokens";

type Tab = "Mes" | "Recurrentes" | "Movimientos";
type Sheet =
  | "entry"
  | "recurring"
  | "payment"
  | "detail"
  | "budget"
  | "goal"
  | "settings"
  | "spaces"
  | null;
const ThemeContext = createContext<Theme>(themes.light);
const txt = (t: Theme) => ({
  color: t.ink,
  fontFamily:
    Platform.OS === "web"
      ? '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      : undefined,
});
function Label({
  children,
  muted = false,
  size = 14,
  weight = "400",
  style = {},
}: {
  children: React.ReactNode;
  muted?: boolean;
  size?: number;
  weight?: "400" | "500" | "600" | "700" | "800";
  style?: any;
}) {
  const t = useContext(ThemeContext);
  return (
    <Text
      style={[
        txt(t),
        {
          fontSize: size,
          lineHeight: size * 1.4,
          fontWeight: weight,
          fontVariant: ["tabular-nums"],
          flexShrink: 1,
          minWidth: 0,
          color: muted ? t.muted : t.ink,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
function Button({
  children,
  onPress,
  secondary = false,
  small = false,
  disabled = false,
  testID,
}: {
  children: React.ReactNode;
  onPress: () => void;
  secondary?: boolean;
  small?: boolean;
  disabled?: boolean;
  testID?: string;
}) {
  const t = useContext(ThemeContext);
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: 50,
        backgroundColor: secondary ? "transparent" : t.strong,
        borderWidth: 1,
        borderColor: secondary ? t.control : t.strong,
        paddingHorizontal: small ? 16 : 22,
        paddingVertical: small ? 11 : 15,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.4 : pressed ? 0.65 : 1,
        minHeight: 48,
        maxWidth: "100%",
        flexShrink: 1,
      })}
    >
      <Text
        style={[
          txt(t),
          {
            color: secondary ? t.ink : t.onStrong,
            fontSize: 14,
            fontWeight: "600",
            textAlign: "center",
            flexShrink: 1,
          },
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}
function IconButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: string;
  onPress: () => void;
}) {
  const t = useContext(ThemeContext);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 48,
        height: 48,
        flexShrink: 0,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: pressed ? t.surface : "transparent",
      })}
    >
      <Label size={23}>{icon}</Label>
    </Pressable>
  );
}
function CurrencyPicker({
  value,
  onChange,
}: {
  value: Currency;
  onChange: (c: Currency) => void;
}) {
  const t = useContext(ThemeContext);
  const [expanded, setExpanded] = useState(false);
  return (
    <View>
      <Button small secondary onPress={() => setExpanded(!expanded)}>
        {value}
      </Button>
      <Modal
        visible={expanded}
        accessibilityLabel="Elegir moneda"
        transparent
        animationType="none"
        onRequestClose={() => setExpanded(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,.4)",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <ScrollView
            accessibilityViewIsModal
            accessibilityLabel="Elegir moneda"
            style={{
              maxHeight: "100%",
              width: "100%",
              maxWidth: 350,
              flexGrow: 0,
            }}
            contentContainerStyle={{
              backgroundColor: t.bg,
              padding: 24,
              borderRadius: 16,
              width: "100%",
              maxWidth: 350,
              gap: 16,
            }}
          >
            <Label size={20} weight="600">
              Elegir moneda
            </Label>
            <Label muted>Cambiar moneda no convierte los importes.</Label>
            {currencies.map((c) => (
              <Button
                key={c}
                secondary={c !== value}
                onPress={() => {
                  onChange(c);
                  setExpanded(false);
                }}
              >
                {c}
                {c === value ? " · seleccionada" : ""}
              </Button>
            ))}
            <Button secondary onPress={() => setExpanded(false)}>
              Cerrar
            </Button>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
}) {
  const t = useContext(ThemeContext);
  const [expanded, setExpanded] = useState(false);
  const [manual, setManual] = useState(false);
  const [month, setMonth] = useState(
    /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? value.slice(0, 7)
      : todayLocal().slice(0, 7),
  );
  const valid = (() => {
    try {
      assertDate(value);
      return true;
    } catch {
      return false;
    }
  })();
  const count = Number(endOfMonth(month).slice(-2));
  return (
    <View style={{ gap: 10, marginBottom: 18 }}>
      <Label weight="500">{label.replace(" (AAAA-MM-DD)", "")}</Label>
      <Button
        secondary
        onPress={() => {
          if (valid) setMonth(value.slice(0, 7));
          setExpanded(!expanded);
        }}
      >
        {valid
          ? new Intl.DateTimeFormat("es-MX", {
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "UTC",
            }).format(new Date(value + "T12:00:00Z"))
          : "Elegir fecha"}
      </Button>
      {expanded && (
        <View style={{ gap: 12, paddingVertical: 12 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <IconButton
              label="Mes anterior del calendario"
              icon="‹"
              onPress={() => setMonth(changeMonth(month, -1))}
            />
            <Label>
              {titleMonth(month)} {month.slice(0, 4)}
            </Label>
            <IconButton
              label="Mes siguiente del calendario"
              icon="›"
              onPress={() => setMonth(changeMonth(month, 1))}
            />
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {Array.from({ length: count }, (_, i) => {
              const n = i + 1;
              const date = month + "-" + String(n).padStart(2, "0");
              return (
                <View key={i} style={{ width: "20%", minHeight: 48 }}>
                  {n > 0 && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${n} de ${titleMonth(month)} de ${month.slice(0, 4)}`}
                      accessibilityState={{ selected: date === value }}
                      onPress={() => {
                        onChange(date);
                        setExpanded(false);
                      }}
                      style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 8,
                        backgroundColor: date === value ? t.surface : t.bg,
                        borderWidth: date === value ? 1 : 0,
                        borderColor: t.ink,
                      }}
                    >
                      <Label>{n}</Label>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>
          <Button
            small
            secondary
            onPress={() => {
              onChange(todayLocal());
              setExpanded(false);
            }}
          >
            Hoy
          </Button>
          {label.includes("opcional") && (
            <Button
              small
              secondary
              onPress={() => {
                onChange("");
                setExpanded(false);
              }}
            >
              Sin fecha
            </Button>
          )}
          <Button small secondary onPress={() => setManual(!manual)}>
            Escribir fecha
          </Button>
          {manual && (
            <TextInput
              accessibilityLabel={`${label}, formato año-mes-día`}
              value={value}
              onChangeText={onChange}
              placeholder="AAAA-MM-DD"
              placeholderTextColor={t.muted}
              style={[
                txt(t),
                {
                  padding: 14,
                  fontSize: 16,
                  borderWidth: 1,
                  borderColor: t.muted,
                  borderRadius: 8,
                },
              ]}
            />
          )}
        </View>
      )}
    </View>
  );
}
function Field({
  label,
  value,
  onChange,
  placeholder,
  number = false,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  number?: boolean;
  multiline?: boolean;
}) {
  const t = useContext(ThemeContext);
  if (label.includes("AAAA-MM-DD") || placeholder === "AAAA-MM-DD")
    return <DateField label={label} value={value} onChange={onChange} />;
  return (
    <View style={{ gap: 8, marginBottom: 18 }}>
      <Label size={14} weight="500">
        {label}
      </Label>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={t.faint}
        keyboardType={number ? "decimal-pad" : "default"}
        multiline={multiline}
        maxLength={multiline ? 500 : 120}
        style={[
          txt(t),
          {
            fontSize: 16,
            padding: 14,
            borderWidth: 1,
            borderColor: t.control,
            borderRadius: 12,
            minHeight: 52,
            backgroundColor: t.bg,
          },
        ]}
      />
    </View>
  );
}
function Chips({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (s: string) => void;
}) {
  const t = useContext(ThemeContext);
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 18,
      }}
    >
      {options.map((o) => (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: o === value }}
          onPress={() => onChange(o)}
          key={o}
          style={({ pressed }) => ({
            paddingHorizontal: 14,
            paddingVertical: 11,
            minHeight: 48,
            maxWidth: "100%",
            flexShrink: 1,
            justifyContent: "center",
            borderRadius: 30,
            borderWidth: 1,
            borderColor: o === value ? t.ink : t.control,
            backgroundColor:
              o === value ? t.strong : pressed ? t.surface : t.bg,
          })}
        >
          <Text
            style={[
              txt(t),
              {
                fontSize: 14,
                flexShrink: 1,
                textAlign: "center",
                color: o === value ? t.onStrong : t.ink,
              },
            ]}
          >
            {o}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
const kindLabel = {
  subscription: "Suscripción",
  service: "Servicio",
  debt: "Cuota de deuda",
};
const freqLabel = { monthly: "Mensual", yearly: "Anual", weekly: "Semanal" };
const entryLabel = {
  expense: "Gasto",
  income: "Ingreso",
  debt_payment: "Pago de deuda",
  refund: "Devolución",
};
const shortDate = displayDate;
function dateTitle(date: string) {
  const today = todayLocal();
  return date === today
    ? "Hoy"
    : new Intl.DateTimeFormat("es-MX", {
        day: "numeric",
        month: "long",
        timeZone: "UTC",
      }).format(new Date(date + "T12:00:00Z"));
}
function titleMonth(month: string) {
  const label = new Intl.DateTimeFormat("es-MX", {
    month: "long",
    timeZone: "UTC",
  }).format(new Date(month + "-01T12:00:00Z"));
  return label[0].toUpperCase() + label.slice(1);
}
const recInitial = () => ({
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
const entryInitial = () => ({
  title: "",
  amount: "",
  currency: "MXN" as Currency,
  category: "Sin clasificar" as Category,
  kind: "expense" as EntryKind,
  date: todayLocal(),
  method: "Sin especificar",
  note: "",
});

export default function App() {
  const { width, height, fontScale } = useWindowDimensions();
  const layoutWidth = width / Math.max(1, fontScale);
  const wide = layoutWidth >= 1200;
  const desktop = layoutWidth >= 960;
  const compact = layoutWidth < 600;
  const [dark, setDark] = useState(false);
  const t = dark ? themes.dark : themes.light;
  const [data, setData] = useState<AppData>(() => createDemo());
  const [space, setSpace] = useState<SpaceId>("personal");
  const [tab, setTab] = useState<Tab>("Mes");
  const [month, setMonth] = useState(todayLocal().slice(0, 7));
  const [currency, setCurrency] = useState<Currency>("MXN");
  const [sheet, setSheet] = useState<Sheet>(null);
  const [error, setError] = useState("");
  const [paymentDue, setPaymentDue] = useState("");
  const [differentTotal, setDifferentTotal] = useState(false);
  const [dateAction, setDateAction] = useState<
    "reschedule" | "future" | undefined
  >();
  const [showAllPayments, setShowAllPayments] = useState(false);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const draftBaseline = useRef("");
  const modalScroll = useRef<ScrollView>(null);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [recFilter, setRecFilter] = useState("Activas");
  const [entryFilter, setEntryFilter] = useState("Todos");
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
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const live = useRef({ data, space, month, currency });
  live.current = { data, space, month, currency };
  const totals = useMemo(
    () => summary(data, space, month, currency),
    [data, space, month, currency],
  );
  const budget = data.budgets[space][currency] ?? { amount: null, currency };
  const goal = data.goals[space];
  const currentRec =
    sheet === "payment"
      ? payable(data, selected ?? "", paymentDue)
      : data.recurring.find((r) => r.id === selected);
  const spaceName = space === "personal" ? "Personal" : "Casa · ejemplo";
  const baseRecurring = data.recurring.filter(
    (r) => r.space === space && r.currency === currency,
  );
  const filteredRecurring = baseRecurring
    .filter(
      (r) =>
        (recFilter === "Todas" ||
          (recFilter === "Activas"
            ? recurringState(r) === "Activo"
            : recurringState(r) !== "Activo")) &&
        r.name.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => a.nextDate.localeCompare(b.nextDate));
  const visibleEntries = data.entries
    .filter(
      (e) =>
        e.space === space &&
        e.currency === currency &&
        e.date.startsWith(month) &&
        (entryFilter === "Todos" || entryLabel[e.kind] === entryFilter) &&
        (e.title + " " + e.category)
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  const dueRows = showAllPayments ? totals.pending : totals.pending.slice(0, 5);
  const priceRise = baseRecurring.find(
    (r) =>
      r.status === "active" &&
      r.priceHistory.length > 0 &&
      r.priceHistory.at(-1)!.next > r.priceHistory.at(-1)!.previous,
  );
  const pastDue = pendingThrough(data, month + "-01").filter(
    (o) =>
      o.date < month + "-01" &&
      o.r.space === space &&
      o.r.currency === currency,
  );
  const hasOtherCurrencies =
    data.entries.some((e) => e.space === space && e.currency !== currency) ||
    data.recurring.some((r) => r.space === space && r.currency !== currency);
  const notify = (s: string) => {
    if (Platform.OS !== "web") void Haptics.selectionAsync().catch(() => {});
    setToast(s);
    AccessibilityInfo.announceForAccessibility(s);
  };
  const open = (next: Sheet) => {
    setError("");
    setConfirmDelete(false);
    setConfirmReset(false);
    setExtras(false);
    setConfirmRestore(false);
    setConfirmDiscard(false);
    setDifferentTotal(false);
    setDateAction(undefined);
    setSheet(next);
  };
  const finish = () => {
    setSheet(null);
    setError("");
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
  const close = () => {
    if (
      ["entry", "recurring", "payment", "budget", "goal"].includes(
        sheet ?? "",
      ) &&
      draft !== draftBaseline.current
    ) {
      setConfirmDiscard(true);
      modalScroll.current?.scrollTo({ y: 0, animated: !reduceMotion });
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
  useEffect(() => {
    if (error) {
      modalScroll.current?.scrollTo({ y: 0, animated: !reduceMotion });
      AccessibilityInfo.announceForAccessibility(error);
    }
  }, [error, reduceMotion]);
  const navigate = (next: Tab) => {
    setTab(next);
    setSearch("");
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };
  const newEntry = () => {
    setEditId(null);
    setEntryForm({ ...entryInitial(), currency });
    open("entry");
  };
  const newRecurring = () => {
    setResumeId(null);
    setEditId(null);
    setRecForm({ ...recInitial(), currency });
    open("recurring");
  };
  const editRecurring = (r: Recurring) => {
    setResumeId(null);
    setEditId(r.id);
    setRecForm({
      name: r.name,
      amount: (r.amount / 100).toString(),
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
    open("recurring");
  };
  const editEntry = (e: Entry) => {
    setEditId(e.id);
    setEntryForm({
      title: e.title,
      amount: (e.amount / 100).toString(),
      currency: e.currency,
      category: e.category,
      kind: e.kind,
      date: e.date,
      method: e.method,
      note: e.note,
    });
    open("entry");
  };
  const startPayment = (r: Recurring, dueDate = r.nextDate) => {
    setPaymentDue(dueDate);
    setSelected(r.id);
    setPaymentAmount((r.amount / 100).toString());
    setPaymentDate(todayLocal());
    open("payment");
  };
  useEffect(() => setDifferentTotal(false), [paymentAmount, entryForm.amount]);
  const saveEntry = () => {
    try {
      const amount = parseMoney(entryForm.amount);
      assertDate(entryForm.date);
      if (entryForm.date > todayLocal())
        throw new Error("Para un pago futuro, crea un recurrente.");

      const previous = data.entries.find((e) => e.id === editId);
      if (
        previous?.occurrenceId &&
        (entryForm.kind !== previous.kind ||
          entryForm.currency !== previous.currency)
      )
        throw new Error("Conserva el tipo y la moneda del pago vinculado.");
      if (
        previous?.recurringSnapshot &&
        !previous.recurringSnapshot.variable &&
        amount !== previous.amount &&
        !differentTotal
      )
        throw new Error(
          "Confirma que el importe corregido es el total completo, no un abono parcial.",
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
      setData((d) => ({
        ...d,
        entries: editId
          ? d.entries.map((e) => (e.id === editId ? entry : e))
          : [entry, ...d.entries],
      }));
      setMonth(entry.date.slice(0, 7));
      setCurrency(entry.currency);
      finish();
      notify(editId ? "Movimiento actualizado" : "Movimiento registrado");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const saveRecurring = () => {
    try {
      const amount = parseMoney(recForm.amount);
      assertDate(recForm.date);
      if (!recForm.name.trim()) throw new Error("Escribe el nombre del pago.");
      for (const date of [
        recForm.trialEnd,
        recForm.cancelDate,
        recForm.endDate,
      ])
        if (date) assertDate(date);
      const previous = data.recurring.find((r) => r.id === editId);
      const record: Recurring = {
        id: editId ?? id("r"),
        space,
        name: recForm.name.trim(),
        amount,
        currency: recForm.currency,
        category: recForm.category,
        frequency: recForm.frequency,
        kind: recForm.kind,
        nextDate: recForm.date,
        anchorDay:
          previous && previous.nextDate === recForm.date
            ? previous.anchorDay
            : Number(recForm.date.slice(-2)),
        status: resumeId === editId ? "active" : (previous?.status ?? "active"),
        method: recForm.method,
        note: recForm.note,
        variable: recForm.variable,
        pausedDate: previous?.pausedDate,
        trialEnd:
          recForm.kind === "subscription"
            ? recForm.trialEnd || undefined
            : undefined,
        cancelDate: recForm.cancelDate || undefined,
        endDate:
          recForm.kind === "debt" ? recForm.endDate || undefined : undefined,
        priceHistory:
          previous?.amount !== undefined && previous.amount !== amount
            ? [
                ...previous.priceHistory,
                {
                  date:
                    recForm.date < todayLocal() ? todayLocal() : recForm.date,
                  previous: previous.amount,
                  next: amount,
                },
              ]
            : (previous?.priceHistory ?? []),
      };
      setData(updateRecurring(data, record, dateAction));
      setCurrency(record.currency);
      finish();
      notify(editId ? "Recurrente actualizado" : "Recurrente creado");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const pay = () => {
    try {
      if (!currentRec) return;
      const amount = parseMoney(paymentAmount);
      assertDate(paymentDate);
      if (paymentDate > todayLocal())
        throw new Error("La fecha de pago no puede estar en el futuro.");
      const command = {
        recurringId: currentRec.id,
        dueDate: paymentDue,
        confirmDifferentTotal: differentTotal,
        paidDate: paymentDate,
        amount,
      };
      confirmPayment(data, command);
      setData((d) => confirmPayment(d, command));
      finish();
      notify("Pago registrado para este vencimiento.");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const saveBudget = () => {
    try {
      const amount = budgetAmount.trim() ? parseMoney(budgetAmount) : null;
      setData((d) => ({
        ...d,
        budgets: {
          ...d.budgets,
          [space]: { ...d.budgets[space], [currency]: { amount, currency } },
        },
      }));
      finish();
      notify(amount ? "Presupuesto actualizado" : "Límite de gastos retirado");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const saveGoal = () => {
    try {
      const target = parseMoney(goalTarget);
      const saved = goalSaved.trim() === "" ? 0 : parseMoney(goalSaved, true);
      const add = contribution.trim() ? parseMoney(contribution, true) : 0;
      if (!goalName.trim()) throw new Error("Pon un nombre a tu meta.");
      setData((d) => ({
        ...d,
        goals: {
          ...d.goals,
          [space]: {
            name: goalName.trim(),
            target,
            saved: saved + add,
            currency: goal.currency,
          },
        },
      }));
      finish();
      notify("Meta actualizada");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const startGoal = () => {
    setGoalName(goal.name);
    setGoalTarget(String(goal.target / 100));
    setGoalSaved(String(goal.saved / 100));
    setContribution("");
    open("goal");
  };
  const startBudget = () => {
    setBudgetAmount(
      budget.currency === currency && budget.amount
        ? String(budget.amount / 100)
        : "",
    );
    open("budget");
  };
  const exportData = async () => {
    const snapshot = {
      ...data,
      exportedAt: new Date().toISOString(),
      mode: "demo",
    };
    const content = JSON.stringify(snapshot, null, 2);
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
    notify("Copia de prueba preparada");
  };
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(""), 4200);
    return () => clearTimeout(timeout);
  }, [toast]);
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
  const nav = (
    <>
      {(["Mes", "Recurrentes", "Movimientos"] as Tab[]).map((name, i) => (
        <Pressable
          key={name}
          accessibilityRole="tab"
          accessibilityState={{ selected: tab === name }}
          onPress={() => navigate(name)}
          style={({ pressed }) => [
            desktop ? styles.navDesktop : styles.navMobile,
            {
              backgroundColor:
                desktop && tab === name
                  ? t.surface
                  : pressed
                    ? t.inset
                    : "transparent",
            },
          ]}
        >
          <Label
            size={desktop ? 19 : 20}
            style={{ opacity: tab === name ? 1 : 0.55 }}
          >
            {["◫", "↻", "≡"][i]}
          </Label>
          <Label
            size={desktop ? 15 : 12}
            weight={tab === name ? "600" : "400"}
            muted={tab !== name}
          >
            {name}
          </Label>
          {desktop && tab === name && (
            <View
              style={{
                marginLeft: "auto",
                width: 5,
                height: 5,
                borderRadius: 3,
                backgroundColor: t.ink,
              }}
            />
          )}
        </Pressable>
      ))}
    </>
  );
  function Empty({
    title,
    subtitle,
    action,
    onAction,
  }: {
    title: string;
    subtitle: string;
    action?: string;
    onAction?: () => void;
  }) {
    return (
      <View style={{ paddingVertical: 40, gap: 10, alignItems: "flex-start" }}>
        <Label size={20} weight="500">
          {title}
        </Label>
        <Label muted style={{ maxWidth: 320, marginBottom: 10 }}>
          {subtitle}
        </Label>
        {action && onAction && (
          <Button small secondary onPress={onAction}>
            {action}
          </Button>
        )}
      </View>
    );
  }
  function PaymentRow({
    r,
    date,
    last = false,
  }: {
    r: Recurring;
    date: string;
    last?: boolean;
  }) {
    const overdue = date < todayLocal();
    const stacked =
      layoutWidth < 380 || money(r.amount, r.currency).length > 10;
    const canPay =
      date === r.nextDate ||
      (data.retained ?? []).some((o) => o.r.id === r.id && o.date === date);
    return (
      <View
        style={[
          styles.paymentRow,
          { flexWrap: stacked ? "wrap" : "nowrap", gap: stacked ? 8 : 0 },
          { borderBottomWidth: last ? 0 : 1, borderColor: t.line },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Ver ${canPay ? "pago de " : ""}${r.name}`}
          onPress={() => {
            if (canPay) startPayment(r, date);
            else {
              setSelected(r.id);
              open("detail");
            }
          }}
          style={{
            flex: stacked ? undefined : 1,
            width: stacked ? "100%" : undefined,
            minWidth: 0,
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
          }}
        >
          <View style={[styles.dateTile, { borderColor: t.line }]}>
            <Label size={21} weight="500">
              {date.slice(-2)}
            </Label>
            <Label size={12} muted>
              {shortDate(date).split(" ")[1]}
            </Label>
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Label size={15} weight="500">
              {r.name}
            </Label>
            <Label muted size={13}>
              {overdue ? "Por confirmar · " : ""}
              {r.kind === "debt"
                ? "Cuota mensual"
                : r.trialEnd && r.trialEnd >= todayLocal()
                  ? "Prueba gratuita"
                  : r.category}
            </Label>
          </View>
        </Pressable>
        <View
          style={{
            alignItems: stacked ? "flex-start" : "flex-end",
            flex: stacked ? 1 : undefined,
            maxWidth: "100%",
            gap: 3,
          }}
        >
          <Label size={15} weight="500">
            {r.variable ? "≈ " : ""}
            {money(r.amount, currency)}
          </Label>
          <Label size={12} muted>
            {freqLabel[r.frequency]}
          </Label>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Registrar pago de ${r.name}`}
          onPress={() => startPayment(r, date)}
          disabled={!canPay}
          style={({ pressed }) => ({
            marginLeft: 12,
            width: 48,
            height: 48,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: t.line,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: pressed ? t.surface : "transparent",
            opacity: canPay ? 1 : 0.3,
          })}
        >
          <Label size={17}>✓</Label>
        </Pressable>
      </View>
    );
  }
  function Separator() {
    return (
      <View
        style={{ height: 1, backgroundColor: t.line, marginVertical: 24 }}
      />
    );
  }
  return (
    <SafeAreaProvider>
      <ThemeContext.Provider value={t}>
        <SafeAreaView
          edges={["top", "bottom", "left", "right"]}
          style={[styles.root, { backgroundColor: t.bg }]}
        >
          <StatusBar style={dark ? "light" : "dark"} />
          {desktop && (
            <View style={[styles.sidebar, { borderColor: t.line }]}>
              <View>
                <Label size={43} weight="700" style={{ letterSpacing: -3 }}>
                  mes.
                </Label>
                <Label muted size={12} style={{ marginTop: 4 }}>
                  SISTEMAS DIGITALES
                </Label>
              </View>
              <View style={{ gap: 6, marginTop: 52 }}>{nav}</View>
              <View style={{ marginTop: "auto", gap: 20 }}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => open("spaces")}
                  style={{
                    paddingVertical: 12,
                    minHeight: 48,
                    justifyContent: "center",
                  }}
                >
                  <Label size={14} weight="500">
                    {spaceName} ⌄
                  </Label>
                  <Label muted size={12} style={{ marginTop: 5 }}>
                    {space === "personal"
                      ? "Solo para ti"
                      : "Presupuesto compartido de ejemplo"}
                  </Label>
                </Pressable>
                <View
                  style={{
                    borderTopWidth: 1,
                    borderColor: t.line,
                    paddingTop: 18,
                  }}
                >
                  <Pressable
                    onPress={() => open("settings")}
                    style={{ minHeight: 48, justifyContent: "center" }}
                    accessibilityRole="button"
                  >
                    <Label muted size={14}>
                      Ajustes de la prueba
                    </Label>
                  </Pressable>
                  <Label muted size={12} style={{ marginTop: 12 }}>
                    Versión 0.1.2
                  </Label>
                </View>
              </View>
            </View>
          )}
          <View style={{ flex: 1, minWidth: 0 }}>
            <View
              style={[
                styles.topbar,
                {
                  paddingHorizontal: desktop ? 40 : 16,
                  minHeight: desktop ? 80 : 64,
                  paddingVertical: desktop ? 10 : 6,
                  borderColor: t.line,
                },
              ]}
            >
              {!desktop ? (
                <Label size={32} weight="700" style={{ letterSpacing: -2 }}>
                  mes.
                </Label>
              ) : (
                <Label size={14} muted>
                  Tu dinero, a la vista.
                </Label>
              )}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: desktop ? 12 : 3,
                }}
              >
                <CurrencyPicker value={currency} onChange={setCurrency} />
                <IconButton
                  label={dark ? "Activar modo claro" : "Activar modo oscuro"}
                  icon={dark ? "☼" : "◐"}
                  onPress={() => setDark(!dark)}
                />
                {!desktop && (
                  <IconButton
                    label="Ajustes"
                    icon="⋯"
                    onPress={() => open("settings")}
                  />
                )}
              </View>
            </View>
            <ScrollView
              ref={scrollRef}
              contentContainerStyle={{
                paddingHorizontal: desktop ? 40 : 16,
                paddingTop: desktop ? 28 : 20,
                paddingBottom: 130,
              }}
              keyboardShouldPersistTaps="handled"
            >
              <View
                style={{ maxWidth: 1180, width: "100%", alignSelf: "center" }}
              >
                {!desktop && (
                  <Pressable
                    onPress={() => open("spaces")}
                    accessibilityRole="button"
                    style={{
                      paddingVertical: 12,
                      marginBottom: 12,
                      alignSelf: "flex-start",
                    }}
                  >
                    <Label size={14}>{spaceName} ⌄</Label>
                  </Pressable>
                )}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => open("settings")}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 11,
                    paddingHorizontal: 14,
                    borderRadius: 8,
                    backgroundColor: t.inset,
                    borderWidth: 1,
                    borderColor: t.line,
                    marginBottom: 16,
                  }}
                >
                  <Label size={12} muted>
                    DEMO · SE REINICIA AL RECARGAR
                  </Label>
                  <Label size={14} muted>
                    ⓘ
                  </Label>
                </Pressable>
                <View
                  style={{
                    flexDirection: layoutWidth < 380 ? "column" : "row",
                    justifyContent: "space-between",
                    alignItems: layoutWidth < 380 ? "flex-start" : "center",
                    gap: 12,
                    marginBottom: desktop ? 36 : 26,
                  }}
                >
                  <View>
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        alignItems: "baseline",
                        gap: 10,
                      }}
                    >
                      <Label
                        size={desktop ? 46 : 36}
                        weight="500"
                        style={{
                          letterSpacing: -1.8,
                          lineHeight: desktop ? 56 : 46,
                        }}
                      >
                        {tab === "Mes" ? titleMonth(month) : tab}
                      </Label>
                      {tab === "Mes" && (
                        <Label size={14} muted>
                          {month.slice(0, 4)}
                        </Label>
                      )}
                    </View>
                    {tab !== "Mes" && (
                      <Label muted style={{ marginTop: 6 }}>
                        {tab === "Recurrentes"
                          ? "Cada pago, en su momento."
                          : `${titleMonth(month)} ${month.slice(0, 4)}`}
                      </Label>
                    )}
                  </View>
                  {tab === "Mes" || tab === "Movimientos" ? (
                    <View style={{ flexDirection: "row" }}>
                      <IconButton
                        label="Mes anterior"
                        icon="‹"
                        onPress={() => setMonth(changeMonth(month, -1))}
                      />
                      <IconButton
                        label="Mes siguiente"
                        icon="›"
                        onPress={() => setMonth(changeMonth(month, 1))}
                      />
                    </View>
                  ) : (
                    <Button small onPress={newRecurring}>
                      + Agregar
                    </Button>
                  )}
                </View>
                {hasOtherCurrencies && (
                  <Label size={13} muted style={{ marginBottom: 16 }}>
                    Viendo solo {currency}. Toca la moneda de arriba para
                    cambiarla.
                  </Label>
                )}
                {tab === "Mes" && (
                  <>
                    <View
                      style={{
                        flexDirection: wide ? "row" : "column",
                        gap: wide ? 48 : 32,
                      }}
                    >
                      <View style={{ flex: wide ? 1.6 : undefined }}>
                        <View
                          style={{
                            paddingBottom: 24,
                            borderBottomWidth: 1,
                            borderColor: t.line,
                          }}
                        >
                          <Label size={14} muted>
                            POR PAGAR ESTE MES
                          </Label>
                          <View
                            style={{
                              flexDirection: "row",
                              flexWrap: "wrap",
                              alignItems: "baseline",
                              gap: 10,
                              marginTop: 8,
                            }}
                          >
                            <Label
                              size={desktop ? 60 : compact ? 34 : 46}
                              weight="500"
                              style={{
                                letterSpacing: -2.5,
                                lineHeight: desktop ? 76 : 60,
                              }}
                            >
                              {money(totals.upcoming, currency)}
                            </Label>
                            <Label muted size={13}>
                              {currency}
                            </Label>
                          </View>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 10,
                              marginTop: 8,
                            }}
                          >
                            <View
                              style={{
                                width: 24,
                                height: 1,
                                backgroundColor: t.ink,
                              }}
                            />
                            <Label muted size={14}>
                              {totals.pending.length}{" "}
                              {totals.pending.length === 1
                                ? "pago pendiente"
                                : "pagos pendientes"}
                              {totals.pending.some((p) => p.r.variable)
                                ? " · incluye estimados"
                                : ""}
                            </Label>
                          </View>
                        </View>
                        {pastDue.length > 0 && (
                          <View style={{ marginTop: 16 }}>
                            <Button
                              small
                              secondary
                              onPress={() =>
                                setShowAllPayments(!showAllPayments)
                              }
                            >
                              {pastDue.length} pagos de meses anteriores por
                              confirmar
                            </Button>
                            {showAllPayments && (
                              <>
                                <Label muted style={{ marginTop: 12 }}>
                                  Anteriores a {titleMonth(month)} ·{" "}
                                  {money(
                                    pastDue.reduce((a, o) => a + o.r.amount, 0),
                                    currency,
                                  )}{" "}
                                  adicionales al total de este mes
                                </Label>
                                {pastDue.map((o) => (
                                  <PaymentRow
                                    key={o.r.id + o.date}
                                    r={o.r}
                                    date={o.date}
                                  />
                                ))}
                              </>
                            )}
                          </View>
                        )}
                        {dueRows.length ? (
                          dueRows.map(({ r, date }, i) => (
                            <PaymentRow
                              key={r.id + date}
                              r={r}
                              date={date}
                              last={i === dueRows.length - 1}
                            />
                          ))
                        ) : (
                          <Empty
                            title="Este mes, sin pagos pendientes."
                            subtitle="Los pagos que agregues aparecerán aquí por fecha."
                            action="Agregar recurrente"
                            onAction={newRecurring}
                          />
                        )}
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => setShowAllPayments(!showAllPayments)}
                          style={{
                            paddingTop: 18,
                            paddingBottom: 12,
                            alignSelf: "flex-start",
                          }}
                        >
                          <Label
                            size={14}
                            weight="500"
                            style={{ textDecorationLine: "underline" }}
                          >
                            {showAllPayments
                              ? "Mostrar menos pagos"
                              : `Ver los ${totals.pending.length} pagos pendientes`}
                          </Label>
                        </Pressable>
                      </View>
                      <View
                        style={{
                          flex: wide ? 1 : undefined,
                          borderLeftWidth: wide ? 1 : 0,
                          borderColor: t.line,
                          paddingLeft: wide ? 36 : 0,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Label muted size={14}>
                            GASTO NETO DEL MES
                          </Label>
                          <Label muted size={13}>
                            {currency}
                          </Label>
                        </View>
                        <Label
                          size={38}
                          weight="500"
                          style={{
                            letterSpacing: -1.5,
                            marginTop: 8,
                            marginBottom: 24,
                          }}
                        >
                          {money(totals.spent, currency)}
                        </Label>
                        <Label muted size={13} style={{ marginBottom: 16 }}>
                          Importes netos por categoría. Las barras comparan
                          magnitudes; un importe negativo indica devoluciones
                          netas.
                        </Label>
                        {totals.byCategory.length ? (
                          totals.byCategory.map((c, i) => (
                            <View key={c.category} style={{ marginBottom: 16 }}>
                              <View
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  marginBottom: 8,
                                }}
                              >
                                <Label size={14}>{c.category}</Label>
                                <Label size={14}>
                                  {money(c.amount, currency)}
                                </Label>
                              </View>
                              <View
                                accessibilityLabel={`${c.category}, ${money(c.amount, currency)}`}
                                style={{
                                  height: 5,
                                  backgroundColor: t.surface,
                                  borderRadius: 4,
                                  overflow: "hidden",
                                }}
                              >
                                <View
                                  style={{
                                    height: 5,
                                    width: `${Math.min(100, (Math.abs(c.amount) / Math.max(1, ...totals.byCategory.map((c) => Math.abs(c.amount)))) * 100)}%`,
                                    backgroundColor: t.ink,
                                    opacity: 1,
                                    borderRadius: 4,
                                  }}
                                />
                              </View>
                            </View>
                          ))
                        ) : (
                          <Label muted style={{ paddingBottom: 24 }}>
                            Al registrar gastos, aquí verás en qué se fue tu
                            dinero.
                          </Label>
                        )}
                        <Separator />
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginBottom: 10,
                          }}
                        >
                          <Label size={14} muted>
                            Ingresos registrados
                          </Label>
                          <Label size={14}>
                            {money(totals.income, currency)}
                          </Label>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                          }}
                        >
                          <Label size={14} muted>
                            Cuotas pagadas
                          </Label>
                          <Label size={14}>
                            {money(totals.debtPaid, currency)}
                          </Label>
                        </View>
                      </View>
                    </View>
                    <View
                      style={{
                        height: 1,
                        backgroundColor: t.line,
                        marginVertical: desktop ? 36 : 30,
                      }}
                    />
                    <View
                      style={{
                        flexDirection: wide ? "row" : "column",
                        gap: wide ? 48 : 28,
                      }}
                    >
                      <View style={{ flex: wide ? 1.6 : undefined }}>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 18,
                          }}
                        >
                          <Label size={19} weight="500">
                            Presupuesto de gastos
                          </Label>
                          <Pressable
                            accessibilityRole="button"
                            onPress={startBudget}
                            style={{
                              padding: 8,
                              minHeight: 48,
                              minWidth: 48,
                              justifyContent: "center",
                            }}
                          >
                            <Label size={13} muted>
                              Editar
                            </Label>
                          </Pressable>
                        </View>
                        {budget.amount !== null &&
                        budget.currency === currency ? (
                          <>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "baseline",
                                justifyContent: "space-between",
                              }}
                            >
                              <Label
                                size={30}
                                weight="500"
                                style={{ letterSpacing: -1 }}
                              >
                                {money(budget.amount - totals.spent, currency)}
                              </Label>
                              <Label size={13} muted>
                                de {money(budget.amount, currency)}
                              </Label>
                            </View>
                            <View
                              accessibilityLabel={`${Math.round((totals.spent / budget.amount) * 100)} por ciento del presupuesto de gastos utilizado`}
                              style={{
                                height: 8,
                                backgroundColor: t.surface,
                                borderRadius: 5,
                                marginTop: 16,
                                overflow: "hidden",
                              }}
                            >
                              <View
                                style={{
                                  height: 8,
                                  width: `${Math.max(0, Math.min(100, (totals.spent / budget.amount) * 100))}%`,
                                  backgroundColor: t.ink,
                                  borderRadius: 5,
                                }}
                              />
                            </View>
                            <Label muted size={13} style={{ marginTop: 10 }}>
                              {totals.spent > budget.amount
                                ? "Superaste tu límite de gastos."
                                : "Restante del límite mensual vigente."}
                            </Label>
                          </>
                        ) : (
                          <>
                            <Label muted style={{ marginBottom: 14 }}>
                              Primero observa. Pon un límite cuando lo
                              necesites.
                            </Label>
                            <Button small secondary onPress={startBudget}>
                              Definir presupuesto
                            </Button>
                          </>
                        )}
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            gap: 15,
                            marginTop: 18,
                            paddingTop: 16,
                            borderTopWidth: 1,
                            borderColor: t.line,
                          }}
                        >
                          <View style={{ flex: 1, minWidth: 0 }}>
                            <Label size={14}>Cuotas por pagar</Label>
                            <Label muted size={12} style={{ marginTop: 4 }}>
                              Se muestran por separado del límite de gastos.
                            </Label>
                          </View>
                          <Label size={15} weight="500">
                            {money(totals.debtPending, currency)}
                          </Label>
                        </View>
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        onPress={startGoal}
                        style={({ pressed }) => ({
                          flex: wide ? 1 : undefined,
                          padding: 24,
                          borderRadius: 14,
                          backgroundColor: t.surface,
                          opacity: pressed ? 0.75 : 1,
                        })}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Label size={12} muted>
                            META DE AHORRO
                          </Label>
                          <Label size={17}>◎</Label>
                        </View>
                        <Label
                          size={20}
                          weight="500"
                          style={{ marginTop: 12, marginBottom: 20 }}
                        >
                          {goal.name}
                        </Label>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "baseline",
                            justifyContent: "space-between",
                          }}
                        >
                          <Label
                            size={25}
                            weight="500"
                            style={{ letterSpacing: -0.5 }}
                          >
                            {money(goal.saved, goal.currency)}
                          </Label>
                          <Label size={13} muted>
                            {Math.round((goal.saved / goal.target) * 100)} %
                          </Label>
                        </View>
                        <View
                          style={{
                            height: 5,
                            backgroundColor: t.line,
                            marginTop: 14,
                            borderRadius: 4,
                            overflow: "hidden",
                          }}
                        >
                          <View
                            style={{
                              width: `${Math.min(100, (goal.saved / goal.target) * 100)}%`,
                              height: 5,
                              backgroundColor: t.ink,
                            }}
                          />
                        </View>
                        <Label size={13} muted style={{ marginTop: 12 }}>
                          de {money(goal.target, goal.currency)} {goal.currency}{" "}
                          · Registrar aporte
                        </Label>
                      </Pressable>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 15,
                        marginTop: 32,
                        paddingVertical: 22,
                        borderTopWidth: 1,
                        borderColor: t.line,
                      }}
                    >
                      <Label size={21}>✳</Label>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Label size={14} weight="500">
                          Una cosa a la vez.
                        </Label>
                        <Label size={14} muted style={{ marginTop: 5 }}>
                          {priceRise
                            ? `${priceRise.name} pasó de ${money(priceRise.priceHistory.at(-1)!.previous, currency)} a ${money(priceRise.amount, currency)} por cobro. Revisa si el cambio te conviene.`
                            : goal.currency === currency &&
                                goal.saved < goal.target
                              ? `Te faltan ${money(goal.target - goal.saved, goal.currency)} para ${goal.name.toLowerCase()}. Solo los aportes que registres contarán como ahorro.`
                              : "Revisa tus próximos pagos antes de decidir un nuevo gasto."}
                        </Label>
                      </View>
                    </View>
                  </>
                )}
                {tab === "Recurrentes" && (
                  <>
                    <View
                      style={{
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <Chips
                        options={["Activas", "Pausados / terminados", "Todas"]}
                        value={recFilter}
                        onChange={setRecFilter}
                      />
                      <TextInput
                        accessibilityLabel="Buscar recurrentes"
                        placeholder="Buscar un pago"
                        placeholderTextColor={t.muted}
                        value={search}
                        onChangeText={setSearch}
                        style={[
                          txt(t),
                          {
                            borderBottomWidth: 1,
                            borderColor: t.line,
                            paddingVertical: 12,
                            paddingHorizontal: 4,
                            fontSize: 14,
                            minWidth: desktop ? 200 : undefined,
                            marginBottom: 18,
                          },
                        ]}
                      />
                    </View>
                    {filteredRecurring.length ? (
                      filteredRecurring.map((r) => (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Detalle de ${r.name}`}
                          key={r.id}
                          onPress={() => {
                            setSelected(r.id);
                            open("detail");
                          }}
                          style={({ pressed }) => ({
                            flexDirection: "row",
                            flexWrap: "wrap",
                            alignItems: "center",
                            gap: 16,
                            paddingVertical: 22,
                            borderBottomWidth: 1,
                            borderColor: t.line,
                            opacity: pressed ? 0.6 : 1,
                          })}
                        >
                          <View
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 14,
                              backgroundColor: t.surface,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Label size={22} weight="500">
                              {r.name.charAt(0)}
                            </Label>
                          </View>
                          <View style={{ flex: 1, minWidth: 0, gap: 5 }}>
                            <Label size={16} weight="500">
                              {r.name}
                            </Label>
                            <Label muted size={13}>
                              {kindLabel[r.kind]} ·{" "}
                              {r.status === "active"
                                ? inRange(r, r.nextDate)
                                  ? shortDate(r.nextDate)
                                  : recurringState(r)
                                : r.status === "paused"
                                  ? "Pausada"
                                  : "Cancelada"}
                            </Label>
                            {r.cancelDate && (
                              <Label muted size={12}>
                                Cancelación desde {shortDate(r.cancelDate)}
                              </Label>
                            )}
                          </View>
                          <View
                            style={{
                              alignItems: "flex-end",
                              width: compact ? "100%" : undefined,
                              maxWidth: "100%",
                              gap: 5,
                            }}
                          >
                            <Label size={17} weight="500">
                              {r.variable ? "≈ " : ""}
                              {money(r.amount, r.currency)}
                            </Label>
                            <Label muted size={13}>
                              {freqLabel[r.frequency]}
                            </Label>
                          </View>
                        </Pressable>
                      ))
                    ) : (
                      <Empty
                        title={
                          search ||
                          (recFilter !== "Todas" &&
                            data.recurring.some(
                              (r) =>
                                r.space === space && r.currency === currency,
                            ))
                            ? "No hay resultados con estos filtros."
                            : "Aquí comienza tu calendario."
                        }
                        subtitle={
                          search
                            ? "Prueba otro nombre o limpia los filtros."
                            : "Agrega una suscripción, un servicio o una cuota."
                        }
                        action={
                          search ||
                          (recFilter !== "Todas" &&
                            data.recurring.some(
                              (r) =>
                                r.space === space && r.currency === currency,
                            ))
                            ? "Limpiar filtros"
                            : "Agregar recurrente"
                        }
                        onAction={
                          search ||
                          (recFilter !== "Todas" &&
                            data.recurring.some(
                              (r) =>
                                r.space === space && r.currency === currency,
                            ))
                            ? () => {
                                setSearch("");
                                setRecFilter("Todas");
                              }
                            : newRecurring
                        }
                      />
                    )}
                    <View style={{ paddingVertical: 26 }}>
                      <Label muted size={13}>
                        Los importes son previstos. Registra cada pago para
                        sumarlo a tus movimientos.
                      </Label>
                    </View>
                  </>
                )}
                {tab === "Movimientos" && (
                  <>
                    <View
                      style={{
                        flexDirection: "column",
                        gap: 12,
                        justifyContent: "space-between",
                      }}
                    >
                      <Chips
                        options={[
                          "Todos",
                          "Gasto",
                          "Ingreso",
                          "Pago de deuda",
                          "Devolución",
                        ]}
                        value={entryFilter}
                        onChange={setEntryFilter}
                      />
                      <TextInput
                        accessibilityLabel="Buscar movimientos"
                        placeholder="Buscar un movimiento"
                        placeholderTextColor={t.muted}
                        value={search}
                        onChangeText={setSearch}
                        style={[
                          txt(t),
                          {
                            fontSize: 14,
                            borderBottomWidth: 1,
                            borderColor: t.line,
                            paddingVertical: 12,
                            marginBottom: 18,
                            minWidth: desktop ? 200 : undefined,
                          },
                        ]}
                      />
                    </View>
                    {visibleEntries.length ? (
                      visibleEntries.map((e, i) => (
                        <View key={e.id}>
                          {(i === 0 ||
                            visibleEntries[i - 1].date !== e.date) && (
                            <Label
                              size={13}
                              muted
                              style={{ paddingTop: 22, paddingBottom: 10 }}
                            >
                              {dateTitle(e.date)}
                            </Label>
                          )}
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Editar ${e.title}, ${money(e.amount, e.currency)}`}
                            onPress={() => editEntry(e)}
                            style={({ pressed }) => ({
                              paddingVertical: 18,
                              borderBottomWidth: 1,
                              borderColor: t.line,
                              flexDirection: "row",
                              flexWrap: "wrap",
                              alignItems: "center",
                              gap: 14,
                              opacity: pressed ? 0.6 : 1,
                            })}
                          >
                            <View
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: t.surface,
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Label size={17}>
                                {e.kind === "income"
                                  ? "+"
                                  : e.kind === "refund"
                                    ? "↩"
                                    : e.kind === "debt_payment"
                                      ? "◷"
                                      : "−"}
                              </Label>
                            </View>
                            <View style={{ flex: 1, minWidth: 0 }}>
                              <Label size={15} weight="500">
                                {e.title}
                              </Label>
                              <Label muted size={12} style={{ marginTop: 4 }}>
                                {entryLabel[e.kind]} · {e.category}
                                {space === "shared" ? ` · ${e.createdBy}` : ""}
                              </Label>
                              {e.note !== "" && (
                                <Label muted size={12} style={{ marginTop: 4 }}>
                                  {e.note}
                                </Label>
                              )}
                            </View>
                            <View
                              style={{
                                alignItems: "flex-end",
                                width: compact ? "100%" : undefined,
                                maxWidth: "100%",
                              }}
                            >
                              <Label size={16} weight="500">
                                {e.kind === "income" || e.kind === "refund"
                                  ? "+"
                                  : ""}
                                {money(e.amount, e.currency)}
                              </Label>
                              <Label muted size={12} style={{ marginTop: 4 }}>
                                {e.method}
                              </Label>
                            </View>
                          </Pressable>
                        </View>
                      ))
                    ) : (
                      <Empty
                        title={
                          search || entryFilter !== "Todos"
                            ? "No hay resultados para estos filtros."
                            : "Todavía no hay movimientos."
                        }
                        subtitle="Puedes registrar un movimiento o limpiar la búsqueda y los filtros."
                        action={
                          search || entryFilter !== "Todos"
                            ? "Limpiar filtros"
                            : "Registrar movimiento"
                        }
                        onAction={() => {
                          if (search || entryFilter !== "Todos") {
                            setSearch("");
                            setEntryFilter("Todos");
                          } else newEntry();
                        }}
                      />
                    )}
                  </>
                )}
                <View
                  style={{
                    marginTop: 30,
                    paddingTop: 20,
                    borderTopWidth: 1,
                    borderColor: t.line,
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Label size={12} muted>
                    mes. por Sistemas Digitales
                  </Label>
                  <Label size={12} muted>
                    Prueba local
                  </Label>
                </View>
              </View>
            </ScrollView>
            {toast && (
              <View
                accessibilityLiveRegion="polite"
                style={{
                  position: "absolute",
                  bottom: desktop ? 100 : 150,
                  left: 22,
                  right: 22,
                  alignItems: "center",
                  zIndex: 20,
                }}
              >
                <View
                  style={{
                    backgroundColor: t.strong,
                    borderRadius: 10,
                    paddingVertical: 14,
                    paddingHorizontal: 20,
                    maxWidth: 550,
                  }}
                >
                  <Text style={[txt(t), { color: t.onStrong, fontSize: 14 }]}>
                    {toast}
                  </Text>
                </View>
              </View>
            )}
            <View
              style={{
                position: desktop ? "absolute" : "relative",
                bottom: desktop ? 30 : undefined,
                right: desktop ? 40 : undefined,
                paddingHorizontal: desktop ? 0 : 16,
                paddingVertical: desktop ? 0 : 8,
                alignItems: "flex-end",
                backgroundColor: t.bg,
                shadowColor: "#000",
                shadowOpacity: 0.12,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 6 },
                elevation: 3,
              }}
            >
              <Button testID="add-expense" onPress={newEntry}>
                ＋ Registrar gasto
              </Button>
            </View>
            {!desktop && (
              <View
                style={{
                  flexDirection: "row",
                  borderTopWidth: 1,
                  borderColor: t.line,
                  backgroundColor: t.bg,
                  paddingBottom: 8,
                  paddingTop: 8,
                }}
              >
                {nav}
              </View>
            )}
          </View>
          <Modal
            visible={sheet !== null}
            accessibilityLabel="Formulario de Mes"
            transparent
            animationType={reduceMotion ? "none" : "fade"}
            onRequestClose={close}
          >
            <SafeAreaView
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.38)",
                justifyContent: desktop ? "center" : "flex-end",
                alignItems: "center",
              }}
            >
              <Pressable
                accessibilityLabel="Cerrar ventana"
                onPress={close}
                style={StyleSheet.absoluteFill}
              />
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{
                  width: "100%",
                  maxWidth: desktop ? 520 : 600,
                  maxHeight: height * (desktop ? 0.92 : 0.94),
                }}
              >
                <View
                  accessibilityViewIsModal
                  accessibilityLabel="Formulario de Mes"
                  style={{
                    backgroundColor: t.bg,
                    borderRadius: desktop ? 20 : 24,
                    borderBottomLeftRadius: desktop ? 20 : 0,
                    borderBottomRightRadius: desktop ? 20 : 0,
                    overflow: "hidden",
                    maxHeight: "100%",
                  }}
                >
                  <View
                    style={{
                      paddingTop: 18,
                      paddingBottom: 10,
                      paddingHorizontal: 24,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottomWidth: 1,
                      borderColor: t.line,
                    }}
                  >
                    <View style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                      <Label size={20} weight="500">
                        {sheet === "entry"
                          ? editId
                            ? "Editar movimiento"
                            : "Registrar movimiento"
                          : sheet === "recurring"
                            ? editId
                              ? "Editar recurrente"
                              : "Nuevo recurrente"
                            : sheet === "payment"
                              ? "Registrar pago"
                              : sheet === "detail"
                                ? currentRec?.name
                                : sheet === "budget"
                                  ? "Presupuesto de gastos"
                                  : sheet === "goal"
                                    ? "Tu meta"
                                    : sheet === "spaces"
                                      ? "Tus espacios"
                                      : "Acerca de esta prueba"}
                      </Label>
                      <Label size={12} muted style={{ marginTop: 3 }}>
                        {spaceName} ·{" "}
                        {sheet === "goal"
                          ? goal.currency
                          : sheet === "entry"
                            ? entryForm.currency
                            : sheet === "recurring"
                              ? recForm.currency
                              : sheet === "payment"
                                ? currentRec?.currency
                                : currency}
                      </Label>
                    </View>
                    <IconButton label="Cerrar" icon="×" onPress={close} />
                  </View>
                  <ScrollView
                    ref={modalScroll}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{
                      padding: compact ? 16 : 24,
                      paddingBottom: 36,
                    }}
                  >
                    {error !== "" && (
                      <View
                        accessibilityRole="alert"
                        style={{
                          marginTop: 18,
                          padding: 14,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: t.ink,
                        }}
                      >
                        <Label size={14}>{error}</Label>
                      </View>
                    )}
                    {confirmDiscard && (
                      <View style={{ gap: 12, marginBottom: 24 }}>
                        <Label weight="600">Tienes cambios sin guardar.</Label>
                        <Button onPress={() => setConfirmDiscard(false)}>
                          Seguir editando
                        </Button>
                        <Button secondary onPress={finish}>
                          Descartar cambios y cerrar
                        </Button>
                      </View>
                    )}
                    {sheet === "entry" && (
                      <>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "baseline",
                            gap: 8,
                            marginBottom: 20,
                          }}
                        >
                          <Label size={30}>
                            {entryForm.currency === "EUR" ? "€" : "$"}
                          </Label>
                          <TextInput
                            accessibilityLabel="Importe del movimiento"
                            autoFocus={!editId}
                            value={entryForm.amount}
                            onChangeText={(amount) =>
                              setEntryForm((f) => ({ ...f, amount }))
                            }
                            placeholder="0.00"
                            placeholderTextColor={t.faint}
                            keyboardType="decimal-pad"
                            maxLength={13}
                            style={[
                              txt(t),
                              {
                                fontSize: compact ? 32 : 44,
                                minWidth: 0,
                                letterSpacing: -1.5,
                                flex: 1,
                                paddingVertical: 8,
                              },
                            ]}
                          />
                          <CurrencyPicker
                            value={entryForm.currency}
                            onChange={(currency) =>
                              setEntryForm((f) => ({ ...f, currency }))
                            }
                          />
                        </View>
                        {!editId && (
                          <>
                            <Label size={12} muted style={{ marginBottom: 10 }}>
                              FAVORITOS
                            </Label>
                            <View
                              style={{
                                flexDirection: "row",
                                flexWrap: "wrap",
                                gap: 8,
                                marginBottom: 20,
                              }}
                            >
                              {[
                                {
                                  name: "Comida",
                                  amount: "150",
                                  cat: "Comida",
                                },
                                {
                                  name: "Pasajes",
                                  amount: "14",
                                  cat: "Transporte",
                                },
                                { name: "Café", amount: "45", cat: "Comida" },
                              ].map((fav) => (
                                <Button
                                  key={fav.name}
                                  small
                                  secondary
                                  onPress={() =>
                                    setEntryForm((f) => ({
                                      ...f,
                                      title: fav.name,
                                      amount:
                                        f.amount ||
                                        (f.currency === "MXN"
                                          ? fav.amount
                                          : ""),
                                      category: fav.cat as Category,
                                      kind: "expense",
                                    }))
                                  }
                                >
                                  {fav.name}
                                </Button>
                              ))}
                            </View>
                          </>
                        )}
                        <Label muted style={{ marginBottom: 12 }}>
                          Fecha: {shortDate(entryForm.date)} ·{" "}
                          {entryForm.method}
                        </Label>
                        {editId &&
                          data.entries.find((e) => e.id === editId)
                            ?.occurrenceId && (
                            <View style={{ marginBottom: 12 }}>
                              <Button
                                secondary
                                onPress={() =>
                                  setDifferentTotal(!differentTotal)
                                }
                              >
                                {differentTotal
                                  ? "✓ Total completo confirmado"
                                  : "Si cambias el importe: confirmar total completo"}
                              </Button>
                            </View>
                          )}
                        <View style={{ marginBottom: 20 }}>
                          <Button onPress={saveEntry}>
                            {editId
                              ? "Guardar cambios"
                              : `Guardar en ${spaceName}`}
                          </Button>
                        </View>
                        <Label
                          size={14}
                          weight="500"
                          style={{ marginBottom: 10 }}
                        >
                          Categoría
                        </Label>
                        <Chips
                          options={categories}
                          value={entryForm.category}
                          onChange={(category) =>
                            setEntryForm((f) => ({
                              ...f,
                              category: category as Category,
                            }))
                          }
                        />
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => setExtras(!extras)}
                          style={{
                            paddingVertical: 10,
                            minHeight: 48,
                            justifyContent: "center",
                            marginBottom: 14,
                          }}
                        >
                          <Label size={14} muted>
                            {extras
                              ? "− Ocultar detalles"
                              : "+ Nombre, tipo, fecha, forma de pago y nota"}
                          </Label>
                        </Pressable>
                        {extras && (
                          <>
                            <Chips
                              options={Object.values(entryLabel)}
                              value={entryLabel[entryForm.kind]}
                              onChange={(s) =>
                                setEntryForm((f) => ({
                                  ...f,
                                  kind: (
                                    Object.keys(entryLabel) as EntryKind[]
                                  ).find((k) => entryLabel[k] === s)!,
                                }))
                              }
                            />{" "}
                            <Field
                              label="Nombre"
                              value={entryForm.title}
                              onChange={(title) =>
                                setEntryForm((f) => ({ ...f, title }))
                              }
                              placeholder="¿En qué fue?"
                            />
                            <Field
                              label="Fecha (AAAA-MM-DD)"
                              value={entryForm.date}
                              onChange={(date) =>
                                setEntryForm((f) => ({ ...f, date }))
                              }
                            />
                            <Chips
                              options={[
                                "Efectivo",
                                "Tarjeta personal",
                                "Transferencia",
                                "Sin especificar",
                              ]}
                              value={entryForm.method}
                              onChange={(method) =>
                                setEntryForm((f) => ({ ...f, method }))
                              }
                            />
                            <Field
                              label="Nota opcional"
                              value={entryForm.note}
                              onChange={(note) =>
                                setEntryForm((f) => ({ ...f, note }))
                              }
                              multiline
                            />
                          </>
                        )}
                        {entryForm.kind === "debt_payment" && (
                          <Label muted size={13} style={{ marginBottom: 16 }}>
                            Se registrará por separado de tus gastos de consumo.
                          </Label>
                        )}

                        {editId && (
                          <View style={{ marginTop: 12 }}>
                            <Button
                              secondary
                              onPress={() => {
                                if (!confirmDelete) {
                                  setConfirmDelete(true);
                                  return;
                                }
                                try {
                                  setData(removeEntry(data, editId));
                                  finish();
                                  notify("Movimiento retirado");
                                } catch (e) {
                                  setError((e as Error).message);
                                }
                              }}
                            >
                              {confirmDelete
                                ? "Confirmar que quiero retirarlo"
                                : "Retirar este movimiento"}
                            </Button>
                            {confirmDelete && (
                              <Label size={12} muted style={{ marginTop: 8 }}>
                                Si era un pago recurrente, su vencimiento
                                volverá a quedar pendiente.
                              </Label>
                            )}
                          </View>
                        )}
                      </>
                    )}
                    {sheet === "recurring" && (
                      <>
                        <Field
                          label="Nombre del pago"
                          value={recForm.name}
                          onChange={(name) =>
                            setRecForm((f) => ({ ...f, name }))
                          }
                          placeholder="Por ejemplo, Internet"
                        />
                        <Chips
                          options={Object.values(kindLabel)}
                          value={kindLabel[recForm.kind]}
                          onChange={(s) =>
                            setRecForm((f) =>
                              changeRecurringKind(
                                f,
                                (
                                  Object.keys(kindLabel) as RecurringKind[]
                                ).find((k) => kindLabel[k] === s)!,
                              ),
                            )
                          }
                        />
                        <View style={{ flexDirection: "row", gap: 14 }}>
                          <View style={{ flex: 1, minWidth: 0 }}>
                            <Field
                              label="Importe previsto"
                              value={recForm.amount}
                              onChange={(amount) =>
                                setRecForm((f) => ({ ...f, amount }))
                              }
                              number
                              placeholder="0.00"
                            />
                          </View>
                          <View
                            style={{ justifyContent: "center", paddingTop: 10 }}
                          >
                            <CurrencyPicker
                              value={recForm.currency}
                              onChange={(currency) =>
                                setRecForm((f) => ({ ...f, currency }))
                              }
                            />
                          </View>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 20,
                          }}
                        >
                          <Label size={14}>El importe puede variar</Label>
                          <Switch
                            accessibilityLabel="Importe variable"
                            value={recForm.variable}
                            onValueChange={(variable) =>
                              setRecForm((f) => ({ ...f, variable }))
                            }
                            trackColor={{ false: t.line, true: t.ink }}
                            thumbColor={t.bg}
                          />
                        </View>
                        <Chips
                          options={Object.values(freqLabel)}
                          value={freqLabel[recForm.frequency]}
                          onChange={(s) =>
                            setRecForm((f) => ({
                              ...f,
                              frequency: (
                                Object.keys(freqLabel) as Frequency[]
                              ).find((k) => freqLabel[k] === s)!,
                            }))
                          }
                        />
                        <Field
                          label="Próximo cobro (AAAA-MM-DD)"
                          value={recForm.date}
                          onChange={(date) =>
                            setRecForm((f) => ({ ...f, date }))
                          }
                        />
                        {editId &&
                          data.recurring.find((r) => r.id === editId) &&
                          (data.recurring.find((r) => r.id === editId)
                            ?.nextDate !== recForm.date ||
                            data.recurring.find((r) => r.id === editId)
                              ?.frequency !== recForm.frequency) && (
                            <View>
                              <Label style={{ marginBottom: 8 }}>
                                ¿Cómo debe cambiar el calendario?
                              </Label>
                              <Chips
                                options={[
                                  "Mover desde este vencimiento",
                                  "Conservar pendientes y cambiar futuros",
                                ]}
                                value={
                                  dateAction === "reschedule"
                                    ? "Mover desde este vencimiento"
                                    : dateAction === "future"
                                      ? "Conservar pendientes y cambiar futuros"
                                      : ""
                                }
                                onChange={(v) =>
                                  setDateAction(
                                    v === "Mover desde este vencimiento"
                                      ? "reschedule"
                                      : "future",
                                  )
                                }
                              />
                              <Label muted style={{ marginBottom: 16 }}>
                                Mover cambia este pendiente y el calendario a
                                partir de él. Conservar mantiene sus importes y
                                fechas originales.
                              </Label>
                            </View>
                          )}
                        {editId &&
                          recurringState(
                            data.recurring.find((r) => r.id === editId)!,
                          ) !== "Activo" && (
                            <Label muted style={{ marginBottom: 12 }}>
                              Estado:{" "}
                              {recurringState(
                                data.recurring.find((r) => r.id === editId)!,
                              )}
                              . Puedes editar su información sin crear cobros
                              nuevos.
                            </Label>
                          )}
                        <Label size={13} muted style={{ marginBottom: 20 }}>
                          {(() => {
                            try {
                              assertDate(recForm.date);
                              return `Después: ${shortDate(nextOccurrence(recForm.date, recForm.frequency, data.recurring.find((r) => r.id === editId && r.nextDate === recForm.date)?.anchorDay ?? Number(recForm.date.slice(-2))))}. Los meses cortos usarán su último día.`;
                            } catch {
                              return "Revisa la próxima fecha antes de guardar.";
                            }
                          })()}
                        </Label>
                        <Label
                          size={14}
                          weight="500"
                          style={{ marginBottom: 10 }}
                        >
                          Categoría
                        </Label>
                        <Chips
                          options={categories}
                          value={recForm.category}
                          onChange={(category) =>
                            setRecForm((f) => ({
                              ...f,
                              category: category as Category,
                            }))
                          }
                        />
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => setExtras(!extras)}
                          style={{
                            paddingVertical: 10,
                            minHeight: 48,
                            justifyContent: "center",
                            marginBottom: 14,
                          }}
                        >
                          <Label size={14} muted>
                            {extras
                              ? "− Ocultar detalles"
                              : "+ Prueba, cancelación y otros detalles"}
                          </Label>
                        </Pressable>
                        {extras && (
                          <>
                            <Field
                              label="Forma de pago o alias de tarjeta"
                              value={recForm.method}
                              onChange={(method) =>
                                setRecForm((f) => ({ ...f, method }))
                              }
                            />
                            {recForm.kind === "subscription" && (
                              <Field
                                label="Fin de prueba gratuita (opcional)"
                                value={recForm.trialEnd}
                                onChange={(trialEnd) =>
                                  setRecForm((f) => ({ ...f, trialEnd }))
                                }
                                placeholder="AAAA-MM-DD"
                              />
                            )}
                            <Field
                              label="Cancelar desde (opcional)"
                              value={recForm.cancelDate}
                              onChange={(cancelDate) =>
                                setRecForm((f) => ({ ...f, cancelDate }))
                              }
                              placeholder="AAAA-MM-DD"
                            />
                            {recForm.kind === "debt" && (
                              <Field
                                label="Última cuota (si la conoces)"
                                value={recForm.endDate}
                                onChange={(endDate) =>
                                  setRecForm((f) => ({ ...f, endDate }))
                                }
                                placeholder="AAAA-MM-DD"
                              />
                            )}
                            <Field
                              label="Nota opcional"
                              value={recForm.note}
                              onChange={(note) =>
                                setRecForm((f) => ({ ...f, note }))
                              }
                              multiline
                            />
                          </>
                        )}
                        <Button onPress={saveRecurring}>
                          {editId ? "Guardar cambios" : "Agregar recurrente"}
                        </Button>
                      </>
                    )}
                    {sheet === "payment" && currentRec && (
                      <>
                        <Label
                          size={25}
                          weight="500"
                          style={{ marginBottom: 8 }}
                        >
                          {currentRec.name}
                        </Label>
                        <Label muted style={{ marginBottom: 24 }}>
                          Cobro previsto el {shortDate(paymentDue)}.
                        </Label>
                        <Field
                          label={`Importe pagado (${currentRec.currency})`}
                          value={paymentAmount}
                          onChange={setPaymentAmount}
                          number
                        />
                        <Field
                          label="Fecha de pago (AAAA-MM-DD)"
                          value={paymentDate}
                          onChange={setPaymentDate}
                        />
                        <Label muted size={13} style={{ marginBottom: 22 }}>
                          Confirma únicamente un pago completo que ya hiciste.
                          Se registrará para el vencimiento del{" "}
                          {shortDate(paymentDue)}.
                        </Label>
                        {!currentRec.variable &&
                          (() => {
                            try {
                              return (
                                parseMoney(paymentAmount) !== currentRec.amount
                              );
                            } catch {
                              return false;
                            }
                          })() && (
                            <View style={{ marginBottom: 20, gap: 10 }}>
                              <Label>
                                Si el total real fue distinto al previsto,
                                confírmalo. Los abonos parciales aún no se
                                admiten.
                              </Label>
                              <Button
                                secondary
                                onPress={() =>
                                  setDifferentTotal(!differentTotal)
                                }
                              >
                                {differentTotal
                                  ? "✓ Confirmo que es el total completo"
                                  : "Confirmar total completo distinto"}
                              </Button>
                            </View>
                          )}
                        <Button onPress={pay}>
                          Registrar pago en {spaceName}
                        </Button>
                      </>
                    )}
                    {sheet === "detail" && currentRec && (
                      <>
                        <Label
                          size={42}
                          weight="500"
                          style={{ letterSpacing: -1.5 }}
                        >
                          {money(currentRec.amount, currentRec.currency)}
                        </Label>
                        <Label muted style={{ marginTop: 5, marginBottom: 24 }}>
                          {currentRec.currency} ·{" "}
                          {freqLabel[currentRec.frequency]} ·{" "}
                          {kindLabel[currentRec.kind]}
                        </Label>
                        {[
                          [
                            "Próximo cobro",
                            inRange(currentRec, currentRec.nextDate)
                              ? shortDate(currentRec.nextDate)
                              : "Sin próximos cobros",
                          ],
                          ["Estado", recurringState(currentRec)],
                          ["Categoría", currentRec.category],
                          [
                            "Forma de pago",
                            currentRec.method || "Sin especificar",
                          ],
                        ].map(([key, value]) => (
                          <View
                            key={key}
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              gap: 16,
                              paddingVertical: 14,
                              borderBottomWidth: 1,
                              borderColor: t.line,
                            }}
                          >
                            <Label muted>{key}</Label>
                            <Label
                              style={{ flexShrink: 1, textAlign: "right" }}
                            >
                              {value}
                            </Label>
                          </View>
                        ))}
                        {currentRec.cancelDate && (
                          <Label muted size={13} style={{ marginTop: 16 }}>
                            Cancelación prevista desde{" "}
                            {shortDate(currentRec.cancelDate)}. Debes cancelarla
                            también con el proveedor.
                          </Label>
                        )}
                        {currentRec.kind === "debt" && (
                          <Label muted size={13} style={{ marginTop: 16 }}>
                            Esta cuota se registra como pago de deuda. El saldo
                            y los intereses aún no se conocen.
                          </Label>
                        )}
                        {currentRec.pausedDate &&
                          currentRec.status === "paused" && (
                            <Label muted size={13} style={{ marginTop: 16 }}>
                              Pausado desde {shortDate(currentRec.pausedDate)}.
                              Los cobros anteriores siguen pendientes.
                            </Label>
                          )}
                        {currentRec.note !== "" && (
                          <Label muted style={{ marginTop: 16 }}>
                            {currentRec.note}
                          </Label>
                        )}
                        {currentRec.priceHistory.length > 0 && (
                          <View style={{ marginTop: 20 }}>
                            <Label weight="500">Cambios de precio</Label>
                            {currentRec.priceHistory.map((p, i) => (
                              <Label
                                key={i}
                                muted
                                size={13}
                                style={{ marginTop: 8 }}
                              >
                                {shortDate(p.date)} ·{" "}
                                {money(p.previous, currentRec.currency)} a{" "}
                                {money(p.next, currentRec.currency)}
                              </Label>
                            ))}
                          </View>
                        )}
                        <View style={{ marginTop: 28, gap: 12 }}>
                          {inRange(currentRec, currentRec.nextDate) && (
                            <Button onPress={() => startPayment(currentRec)}>
                              Registrar pago
                            </Button>
                          )}
                          <Button
                            secondary
                            onPress={() => editRecurring(currentRec)}
                          >
                            Editar datos
                          </Button>
                          {(recurringState(currentRec) === "Activo" ||
                            currentRec.status === "paused") && (
                            <Button
                              secondary
                              onPress={() => {
                                if (currentRec.status === "active") {
                                  setData((d) =>
                                    pauseRecurring(d, currentRec.id),
                                  );
                                  finish();
                                  notify(
                                    "Pausado desde hoy. Los cobros anteriores siguen pendientes.",
                                  );
                                } else {
                                  setResumeId(currentRec.id);
                                  setEditId(currentRec.id);
                                  setRecForm({
                                    ...recInitial(),
                                    name: currentRec.name,
                                    amount: String(currentRec.amount / 100),
                                    currency: currentRec.currency,
                                    category: currentRec.category,
                                    frequency: currentRec.frequency,
                                    kind: currentRec.kind,
                                    date:
                                      currentRec.pausedDate &&
                                      currentRec.nextDate <
                                        currentRec.pausedDate
                                        ? currentRec.nextDate
                                        : todayLocal(),
                                    method: currentRec.method,
                                    note: currentRec.note,
                                    variable: currentRec.variable,
                                    trialEnd: currentRec.trialEnd ?? "",
                                    cancelDate: currentRec.cancelDate ?? "",
                                    endDate: currentRec.endDate ?? "",
                                  });
                                  open("recurring");
                                  notify(
                                    "Revisa la próxima fecha antes de guardar.",
                                  );
                                }
                              }}
                            >
                              {currentRec.status === "active"
                                ? "Pausar recurrente"
                                : "Reanudar y revisar fecha"}
                            </Button>
                          )}
                        </View>
                        <Label muted size={12} style={{ marginTop: 18 }}>
                          Los avisos del teléfono se conectarán en la beta
                          móvil.
                        </Label>
                      </>
                    )}
                    {sheet === "budget" && (
                      <>
                        <Label muted style={{ marginBottom: 22 }}>
                          Elige cuánto quieres gastar al mes en {currency}.
                          Puedes dejarlo vacío para observar sin límite.
                        </Label>
                        <Field
                          label="Límite mensual"
                          value={budgetAmount}
                          onChange={setBudgetAmount}
                          number
                          placeholder="Sin límite"
                        />
                        <Label muted size={13} style={{ marginBottom: 24 }}>
                          Las cuotas de deuda se muestran por separado. Este
                          límite no es tu saldo bancario.
                        </Label>
                        <Button onPress={saveBudget}>
                          Guardar presupuesto
                        </Button>
                      </>
                    )}
                    {sheet === "goal" && (
                      <>
                        <Field
                          label="Nombre de tu meta"
                          value={goalName}
                          onChange={setGoalName}
                        />
                        <Field
                          label={`Objetivo (${goal.currency})`}
                          value={goalTarget}
                          onChange={setGoalTarget}
                          number
                        />
                        <Field
                          label="Ya aportado"
                          value={goalSaved}
                          onChange={setGoalSaved}
                          number
                        />
                        <Field
                          label="Agregar un aporte (opcional)"
                          value={contribution}
                          onChange={setContribution}
                          number
                          placeholder="0.00"
                        />
                        <Label muted size={13} style={{ marginBottom: 24 }}>
                          Registra dinero que ya apartaste. La app no transfiere
                          fondos.
                        </Label>
                        <Button onPress={saveGoal}>Guardar meta</Button>
                      </>
                    )}
                    {sheet === "spaces" && (
                      <>
                        <Label muted style={{ marginBottom: 24 }}>
                          Cada espacio tiene sus propios movimientos, pagos y
                          presupuesto.
                        </Label>
                        {(["personal", "shared"] as SpaceId[]).map((s) => (
                          <Pressable
                            accessibilityRole="button"
                            key={s}
                            onPress={() => {
                              setSpace(s);
                              finish();
                              setSearch("");
                              notify(
                                s === "personal"
                                  ? "Estás en Personal"
                                  : "Estás en el ejemplo compartido",
                              );
                            }}
                            style={{
                              padding: 20,
                              borderWidth: 1,
                              borderColor: s === space ? t.ink : t.line,
                              borderRadius: 12,
                              marginBottom: 12,
                            }}
                          >
                            <Label size={18} weight="500">
                              {s === "personal" ? "Personal" : "Casa · ejemplo"}
                              {s === space ? "  ✓" : ""}
                            </Label>
                            <Label muted size={13} style={{ marginTop: 6 }}>
                              {s === "personal"
                                ? "Tus movimientos y objetivos."
                                : "Tú y Alex · datos ficticios"}
                            </Label>
                          </Pressable>
                        ))}
                        <Label muted size={13} style={{ marginTop: 16 }}>
                          En esta prueba, el espacio compartido es una
                          demostración. Las invitaciones y la colaboración entre
                          cuentas aún no están conectadas.
                        </Label>
                      </>
                    )}
                    {sheet === "settings" && (
                      <>
                        <Label
                          size={29}
                          weight="600"
                          style={{ letterSpacing: -1, marginBottom: 12 }}
                        >
                          Un mes más claro.
                        </Label>
                        <Label muted style={{ marginBottom: 22 }}>
                          Esta es la primera versión funcional de Mes, un nombre
                          provisional para la app de Sistemas Digitales.
                        </Label>
                        <View
                          style={{
                            padding: 18,
                            borderRadius: 12,
                            backgroundColor: t.surface,
                            marginBottom: 24,
                            gap: 10,
                          }}
                        >
                          <Label weight="500">Prueba con datos ficticios</Label>
                          <Label muted size={14}>
                            Los cambios viven en esta sesión y se reinician al
                            recargar. Exporta una copia si quieres conservar tu
                            prueba. Todavía no hay cuenta, respaldo ni
                            sincronización; usa solo información de ejemplo.
                          </Label>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 24,
                          }}
                        >
                          <Label>Modo oscuro</Label>
                          <Switch
                            accessibilityLabel="Modo oscuro"
                            value={dark}
                            onValueChange={setDark}
                            trackColor={{ false: t.line, true: t.ink }}
                            thumbColor={t.bg}
                          />
                        </View>
                        <View style={{ gap: 12 }}>
                          <Button onPress={exportData}>
                            Exportar datos de prueba
                          </Button>
                          <Button
                            secondary
                            onPress={() => {
                              if (!confirmReset) {
                                setConfirmReset(true);
                                return;
                              }
                              setData(emptyData());
                              setMonth(todayLocal().slice(0, 7));
                              finish();
                              notify("Tu prueba está en blanco");
                            }}
                          >
                            {confirmReset
                              ? "Confirmar que quiero empezar en blanco"
                              : "Empezar una prueba en blanco"}
                          </Button>
                          <Button
                            secondary
                            onPress={() => {
                              if (!confirmRestore) {
                                setConfirmRestore(true);
                                return;
                              }
                              setData(createDemo());
                              setMonth(todayLocal().slice(0, 7));
                              setCurrency("MXN");
                              finish();
                              notify("Ejemplo restaurado");
                            }}
                          >
                            {confirmRestore
                              ? "Confirmar: reemplazar los datos de esta sesión"
                              : "Restaurar ejemplo"}
                          </Button>
                        </View>
                        <Separator />
                        <Label weight="500" style={{ marginBottom: 8 }}>
                          En construcción
                        </Label>
                        <Label muted size={14}>
                          Cuentas, colaboración real, respaldo, avisos del
                          teléfono y acceso biométrico. El código ya separa la
                          interfaz de los cálculos para continuar con esas
                          conexiones.
                        </Label>
                        <Label muted size={12} style={{ marginTop: 22 }}>
                          v0.1.2 · Español · Prueba web
                        </Label>
                      </>
                    )}
                  </ScrollView>
                </View>
              </KeyboardAvoidingView>
            </SafeAreaView>
          </Modal>
        </SafeAreaView>
      </ThemeContext.Provider>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: "row" },
  sidebar: {
    width: 220,
    borderRightWidth: 1,
    paddingHorizontal: 26,
    paddingVertical: 30,
  },
  navDesktop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 10,
    minHeight: 48,
  },
  navMobile: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
    minHeight: 48,
  },
  topbar: {
    minHeight: 80,
    paddingVertical: 10,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateTile: {
    width: 46,
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
  },
});
