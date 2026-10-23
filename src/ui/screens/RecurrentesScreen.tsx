import React from "react";
import { View } from "react-native";
import { Recurring, recurringState } from "../../domain/model";
import { useApp } from "../../app/context";
import { freqLower, kindLabel } from "../../app/useMesApp";
import { ChipGroup, EmptyState, SearchField, Txt, useUI } from "../components";
import { dayMonth, fullDate, plural } from "../format";
import { IconName } from "../icons";
import { ScheduleRow, Tag } from "../rows";
import { space } from "../tokens";

/** Estado visible de una regla, escrito con palabras e icono propio. */
export function ruleView(
  r: Recurring,
  overdue: number,
  today: string,
): { date: string | null; icon?: IconName; tags: Tag[] } {
  const state = recurringState(r);
  const tags: Tag[] = [];
  let date: string | null = null;
  let icon: IconName | undefined;
  if (r.status === "paused") {
    icon = "pause";
    tags.push({
      kind: "paused",
      label: r.pausedDate
        ? `Pausado desde ${dayMonth(r.pausedDate)}`
        : "Pausado",
    });
  } else if (state === "Cancelado") {
    icon = "cancel";
    tags.push({
      kind: "cancelled",
      label: r.cancelDate
        ? `Cancelado desde ${dayMonth(r.cancelDate)}`
        : "Cancelado",
    });
  } else if (state === "Finalizado") {
    icon = "end";
    tags.push({ kind: "ended", label: "Finalizado · sin próximos cobros" });
  } else {
    date = r.nextDate;
    if (r.trialEnd && r.trialEnd >= today)
      tags.push({
        kind: "note",
        label: `Prueba hasta ${dayMonth(r.trialEnd)}`,
      });
    if (r.cancelDate)
      tags.push({
        kind: "note",
        label: `Cancelación desde ${fullDate(r.cancelDate)}`,
      });
    if (r.endDate)
      tags.push({ kind: "note", label: `Última cuota ${fullDate(r.endDate)}` });
  }
  if (overdue)
    tags.unshift({ kind: "toConfirm", label: `${overdue} por confirmar` });
  return { date, icon, tags };
}

export function RecurrentesScreen() {
  const app = useApp();
  const { tablet } = useUI();
  const { baseRecurring, search, recFilter, overdue, today } = app;
  const isActive = (r: Recurring) => recurringState(r) === "Activo";
  const counts = {
    active: baseRecurring.filter(isActive).length,
    inactive: baseRecurring.filter((r) => !isActive(r)).length,
    all: baseRecurring.length,
  };
  const query = search.trim().toLowerCase();
  const rows = baseRecurring
    .filter(
      (r) =>
        (recFilter === "all" ||
          (recFilter === "active" ? isActive(r) : !isActive(r))) &&
        r.name.toLowerCase().includes(query),
    )
    .sort((a, b) => a.nextDate.localeCompare(b.nextDate));
  const filtered = query !== "" || (recFilter !== "all" && counts.all > 0);
  return (
    <View style={{ gap: space.md }}>
      <ChipGroup
        label="Mostrar recurrentes"
        value={recFilter}
        onChange={app.setRecFilter}
        options={[
          { value: "active", label: `Activos (${counts.active})` },
          {
            value: "inactive",
            label: `Pausados y terminados (${counts.inactive})`,
          },
          { value: "all", label: `Todos (${counts.all})` },
        ]}
      />
      <SearchField
        label="Buscar recurrentes por nombre"
        placeholder="Buscar por nombre"
        value={search}
        onChangeText={app.setSearch}
      />
      {rows.length ? (
        <View>
          {tablet && (
            <View
              style={{
                flexDirection: "row",
                paddingBottom: space.xs,
                gap: space.sm,
              }}
            >
              <Txt variant="meta" tone="muted" style={{ width: 44 }}>
                Cobro
              </Txt>
              <Txt variant="meta" tone="muted" style={{ flex: 1 }}>
                Nombre
              </Txt>
              <Txt variant="meta" tone="muted" align="right">
                Importe previsto ({app.currency})
              </Txt>
            </View>
          )}
          {rows.map((r, i) => {
            const v = ruleView(r, overdue.get(r.id)?.length ?? 0, today);
            return (
              <ScheduleRow
                key={r.id}
                name={r.name}
                meta={`${kindLabel[r.kind]} · ${freqLower[r.frequency]}${r.method && r.method !== "Sin especificar" ? " · " + r.method : ""}`}
                date={v.date}
                statusIcon={v.icon}
                tags={v.tags}
                amount={r.amount}
                currency={r.currency}
                estimated={r.variable}
                openLabel="Ver detalle"
                onOpen={() => app.openDetail(r)}
                last={i === rows.length - 1}
              />
            );
          })}
        </View>
      ) : filtered ? (
        <EmptyState
          title="No hay resultados para estos filtros."
          body={
            query
              ? `Ningún recurrente se llama «${search.trim()}» con este filtro.`
              : "Prueba con otro filtro."
          }
          action="Limpiar filtros"
          onAction={() => {
            app.setSearch("");
            app.setRecFilter("all");
          }}
        />
      ) : (
        <EmptyState
          title={`Aún no tienes recurrentes en ${app.currency}.`}
          body="Agrega una suscripción, un servicio o una cuota. Solo necesitas nombre, importe y fecha del próximo cobro."
          action="Agregar recurrente"
          onAction={app.newRecurring}
        />
      )}
      <Txt variant="meta" tone="muted">
        Los importes son previstos. {plural(counts.all, "regla", "reglas")} en{" "}
        {app.currency}. Registra cada pago para sumarlo a tus movimientos.
      </Txt>
    </View>
  );
}
