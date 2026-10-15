import {
  AppData,
  Entry,
  Recurring,
  SpaceId,
  todayLocal,
} from "../domain/model";
export function createDemo(now = new Date()): AppData {
  const current = todayLocal(now);
  const month = current.slice(0, 7);
  const day = Number(current.slice(-2));
  const date = (n: number) =>
    `${month}-${String(Math.min(n, new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate())).padStart(2, "0")}`;
  const prior = (n: number) => date(Math.max(1, day - n));
  const r = (
    id: string,
    name: string,
    amount: number,
    category: Recurring["category"],
    nextDay: number,
    kind: Recurring["kind"] = "subscription",
    space: SpaceId = "personal",
  ): Recurring => ({
    id,
    space,
    name,
    amount,
    currency: "MXN",
    category,
    kind,
    frequency: "monthly",
    anchorDay: nextDay,
    nextDate: date(Math.max(day, nextDay)),
    status: "active",
    method: kind === "debt" ? "Transferencia" : "Tarjeta personal",
    note: "",
    variable: false,
    priceHistory: [],
  });
  const e = (
    n: number,
    title: string,
    amount: number,
    category: Entry["category"],
    ago: number,
    space: SpaceId = "personal",
  ): Entry => ({
    id: "demo-" + space + "-" + n,
    space,
    kind: "expense",
    title,
    amount,
    currency: "MXN",
    category,
    date: prior(ago),
    method: n % 2 ? "Efectivo" : "Tarjeta personal",
    note: "",
    createdBy: space === "shared" && n % 2 ? "Alex" : "Tú",
  });
  return {
    schemaVersion: 1,
    recurring: [
      r("r1", "Spotify", 12900, "Entretenimiento", 6),
      r("r2", "Internet", 59900, "Servicios", 9, "service"),
      r("r3", "Laptop", 120000, "Educación", 12, "debt"),
      r("r4", "iCloud", 4900, "Servicios", 16),
      r("r5", "Gimnasio", 54900, "Salud", 22, "service"),
      r("r6", "Dentista", 45000, "Salud", 25, "service"),
      r("s1", "Renta", 850000, "Servicios", 5, "service", "shared"),
      r("s2", "Internet de casa", 59900, "Servicios", 9, "service", "shared"),
    ],
    entries: [
      e(1, "Comida", 18500, "Comida", 0),
      e(2, "Metro", 1400, "Transporte", 0),
      e(3, "Café", 6500, "Comida", 1),
      e(4, "Supermercado", 78650, "Comida", 1),
      e(5, "Gasolina", 60000, "Transporte", 1),
      e(6, "Cena", 42000, "Comida", 0),
      e(7, "Libros", 58000, "Educación", 1),
      e(8, "Cine", 32000, "Entretenimiento", 1),
      e(9, "Comida", 15900, "Comida", 0),
      e(10, "Despensa", 124000, "Comida", 1, "shared"),
      e(11, "Limpieza", 60000, "Servicios", 0, "shared"),
      {
        id: "demo-income",
        space: "personal",
        kind: "income",
        title: "Ingreso del mes",
        amount: 1500000,
        currency: "MXN",
        date: date(1),
        category: "Otros",
        method: "Transferencia",
        note: "",
        createdBy: "Tú",
      } as Entry,
    ],
    budgets: {
      personal: { MXN: { amount: 800000, currency: "MXN" } },
      shared: { MXN: { amount: 1400000, currency: "MXN" } },
    },
    goals: {
      personal: {
        name: "Mi próximo viaje",
        target: 1500000,
        saved: 420000,
        currency: "MXN",
      },
      shared: {
        name: "Fondo de casa",
        target: 3000000,
        saved: 650000,
        currency: "MXN",
      },
    },
  };
}
export const emptyData = (): AppData => ({
  schemaVersion: 1,
  entries: [],
  recurring: [],
  budgets: { personal: {}, shared: {} },
  goals: {
    personal: { name: "Mi meta", target: 1000000, saved: 0, currency: "MXN" },
    shared: {
      name: "Meta compartida",
      target: 1000000,
      saved: 0,
      currency: "MXN",
    },
  },
});
