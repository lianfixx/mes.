import React from "react";
import { View } from "react-native";
import { Entry, EntryKind } from "../../domain/model";
import { useApp } from "../../app/context";
import { entryLabel } from "../../app/useMesApp";
import { ChipGroup, EmptyState, SearchField, Txt } from "../components";
import { dayHeading, dayMonth, monthLower, plural } from "../format";
import { EntryRow } from "../rows";
import { space } from "../tokens";

const filters: { value: EntryKind | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "expense", label: "Gastos" },
  { value: "income", label: "Ingresos" },
  { value: "refund", label: "Devoluciones" },
  { value: "debt_payment", label: "Cuotas" },
];

export function entryMeta(e: Entry, shared: boolean): string {
  const parts = [entryLabel[e.kind]];
  if (e.occurrenceId)
    parts.push(`vencimiento ${dayMonth(e.occurrenceId.slice(-10))}`);
  else parts.push(e.category);
  if (e.method && e.method !== "Sin especificar") parts.push(e.method);
  if (shared) parts.push(e.createdBy);
  return parts.join(" · ");
}

export function MovimientosScreen() {
  const app = useApp();
  const { data, space: sp, currency, month, search, entryFilter } = app;
  const inMonth = data.entries.filter(
    (e) =>
      e.space === sp && e.currency === currency && e.date.startsWith(month),
  );
  const query = search.trim().toLowerCase();
  const visible = inMonth
    .filter(
      (e) =>
        (entryFilter === "all" || e.kind === entryFilter) &&
        `${e.title} ${e.category} ${e.note}`.toLowerCase().includes(query),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  const filtered = query !== "" || entryFilter !== "all";
  return (
    <View style={{ gap: space.md }}>
      <ChipGroup
        label="Tipo de movimiento"
        value={entryFilter}
        onChange={app.setEntryFilter}
        options={filters}
      />
      <SearchField
        label="Buscar movimientos por nombre, categoría o nota"
        placeholder="Buscar nombre, categoría o nota"
        value={search}
        onChangeText={app.setSearch}
      />
      {visible.length ? (
        <View>
          <Txt variant="meta" tone="muted">
            {plural(visible.length, "movimiento", "movimientos")} en{" "}
            {monthLower(month)}
            {filtered ? ` · con filtros (de ${inMonth.length})` : ""}
          </Txt>
          {visible.map((e, i) => {
            const header = i === 0 || visible[i - 1].date !== e.date;
            const lastOfDay =
              i === visible.length - 1 || visible[i + 1].date !== e.date;
            return (
              <View key={e.id}>
                {header && (
                  <Txt
                    accessibilityRole="header"
                    variant="meta"
                    weight="600"
                    style={{ paddingTop: space.lg, paddingBottom: space.xxs }}
                  >
                    {dayHeading(e.date, app.today)}
                  </Txt>
                )}
                <EntryRow
                  entry={e}
                  meta={entryMeta(e, sp === "shared")}
                  onPress={() => app.editEntry(e)}
                  last={lastOfDay}
                />
              </View>
            );
          })}
        </View>
      ) : filtered ? (
        <EmptyState
          title="No hay resultados para estos filtros."
          body={`Hay ${plural(inMonth.length, "movimiento", "movimientos")} en ${monthLower(month)}; ninguno coincide.`}
          action="Limpiar filtros"
          onAction={() => {
            app.setSearch("");
            app.setEntryFilter("all");
          }}
        />
      ) : (
        <EmptyState
          title={`Aún no registras movimientos en ${monthLower(month)}.`}
          body="Anota un gasto al pagarlo o después; basta con el importe."
          action="Registrar gasto"
          onAction={app.newEntry}
        />
      )}
    </View>
  );
}
