// Mes: qué viene por pagar y cuándo → cuánto se gastó y en qué → presupuesto
// opcional → meta. Una cifra protagonista por sección; nada de saldo inventado.
import React from "react";
import { View } from "react-native";
import { endOfMonth } from "../../domain/model";
import { daysBetween } from "../../domain/derive";
import { useApp } from "../../app/context";
import { canConfirm, freqLower, kindLabel } from "../../app/useMesApp";
import {
  Button,
  Divider,
  EmptyState,
  KeyValue,
  MoneyText,
  SectionHeader,
  StatusTag,
  Txt,
  useUI,
} from "../components";
import {
  dayMonth,
  formatMoney,
  fullDate,
  interval,
  monthLower,
  percent,
  plural,
  relativeDue,
} from "../format";
import { ScheduleRow, Tag } from "../rows";
import { space } from "../tokens";
import type { PendingOccurrence } from "../../domain/model";

function DueRows({
  rows,
  firstUpcoming,
}: {
  rows: PendingOccurrence[];
  firstUpcoming?: PendingOccurrence;
}) {
  const app = useApp();
  return (
    <View>
      {rows.map((o, i) => {
        const tags: Tag[] = [];
        if (o.date < app.today)
          tags.push({ kind: "toConfirm", label: "Por confirmar" });
        if (o === firstUpcoming) {
          const days = daysBetween(app.today, o.date);
          const rel = relativeDue(days);
          tags.push({
            kind: days === 0 ? "today" : "soon",
            label: rel
              ? days === 0
                ? rel
                : `Siguiente · ${rel.toLowerCase()}`
              : "Siguiente",
          });
        }
        if (
          o.r.trialEnd &&
          o.date === o.r.nextDate &&
          o.r.trialEnd >= app.today
        )
          tags.push({
            kind: "note",
            label: `Primer cobro tras la prueba (${dayMonth(o.r.trialEnd)})`,
          });
        const payable = canConfirm(app.data, o.r, o.date);
        const earlier = rows.find((p) => p.r.id === o.r.id && p.date < o.date);
        if (!payable)
          tags.push({
            kind: "note",
            label: `Se confirma después del ${dayMonth(earlier?.date ?? o.r.nextDate)}`,
          });
        return (
          <ScheduleRow
            key={o.r.id + o.date}
            name={o.r.name}
            meta={`${kindLabel[o.r.kind]} · ${freqLower[o.r.frequency]}`}
            date={o.date}
            tags={tags}
            amount={o.r.amount}
            currency={o.r.currency}
            estimated={o.r.variable}
            openLabel="Ver detalle"
            onOpen={() =>
              app.openDetail(
                app.data.recurring.find((r) => r.id === o.r.id) ?? o.r,
              )
            }
            confirm={
              payable
                ? {
                    label: `Registrar pago de ${o.r.name} del ${fullDate(o.date)}`,
                    onPress: () => app.startPayment(o.r, o.date),
                  }
                : "waiting"
            }
            last={i === rows.length - 1}
          />
        );
      })}
    </View>
  );
}

function DueSection() {
  const app = useApp();
  const { split, today, month, currency, pastDue } = app;
  const start = month + "-01";
  const end = endOfMonth(month);
  const pastMonth = end < today;
  const all = [...split.toConfirm, ...split.upcoming];
  const rows = app.showAllDue ? all : all.slice(0, 5);
  const firstUpcoming = split.upcoming[0];
  const lastPast = (() => {
    const d = new Date(today + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() - 1);
    const y = d.toISOString().slice(0, 10);
    return y < end ? y : end;
  })();
  const pastDueTotal = pastDue.reduce((s, o) => s + o.r.amount, 0);
  const hasRules = app.baseRecurring.length > 0;
  return (
    <View style={{ gap: space.md }}>
      {!pastMonth ? (
        <View style={{ gap: space.xxs }}>
          <SectionHeader
            title={`Por pagar · ${interval(start > today ? start : today, end)}`}
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "baseline",
              gap: space.xs,
            }}
          >
            <View style={{ flex: 1, minWidth: 0 }}>
              <MoneyText
                amount={split.upcomingTotal}
                currency={currency}
                variant={app.layout.desktop ? "displayWide" : "display"}
                fit
                smallCents
                minSize={20}
              />
            </View>
            <Txt variant="meta" tone="muted">
              {currency}
            </Txt>
          </View>
          <Txt variant="meta" tone="muted">
            {split.upcoming.length
              ? `${plural(split.upcoming.length, "pago", "pagos")}${split.upcomingEstimated ? " · incluye importes estimados" : ""}`
              : "Nada pendiente en este intervalo"}
          </Txt>
        </View>
      ) : (
        <SectionHeader title={`Pagos de ${monthLower(month)}`} />
      )}
      {split.toConfirm.length > 0 && (
        <View style={{ gap: 2 }}>
          <KeyValue
            label={`Por confirmar · ${interval(start, lastPast)} (${split.toConfirm.length})`}
            value={
              <MoneyText
                amount={split.toConfirmTotal}
                currency={currency}
                variant="secondary"
              />
            }
          />
          <Txt variant="meta" tone="muted">
            Fechas pasadas sin pago registrado. Confírmalas cuando las veas en
            tu banco.
          </Txt>
        </View>
      )}
      {pastDue.length > 0 && (
        <View style={{ gap: space.xs }}>
          <Button
            variant="secondary"
            compact
            icon="pending"
            iconRight={app.showPastDue ? "chevronUp" : "chevronDown"}
            expanded={app.showPastDue}
            label={`${plural(pastDue.length, "pago", "pagos")} de meses anteriores por confirmar · ${formatMoney(pastDueTotal, currency)}`}
            onPress={() => app.setShowPastDue(!app.showPastDue)}
          />
          {app.showPastDue && (
            <View>
              <Txt variant="meta" tone="muted">
                Anteriores a {monthLower(month)}. No se suman al total de este
                mes.
              </Txt>
              <DueRows rows={pastDue} />
            </View>
          )}
        </View>
      )}
      {all.length ? (
        <View>
          <Divider />
          <DueRows rows={rows} firstUpcoming={firstUpcoming} />
          {all.length > 5 && (
            <Button
              variant="quiet"
              align="flex-start"
              label={
                app.showAllDue
                  ? "Mostrar solo los primeros 5"
                  : `Ver los ${all.length} pagos de ${monthLower(month)}`
              }
              expanded={app.showAllDue}
              onPress={() => app.setShowAllDue(!app.showAllDue)}
            />
          )}
        </View>
      ) : hasRules ? (
        <EmptyState
          title={`No quedan pagos por registrar en ${monthLower(month)}.`}
          body="Los próximos cobros aparecen aquí por fecha."
        />
      ) : (
        <EmptyState
          title={`Aún no tienes pagos recurrentes en ${currency}.`}
          body="Agrega suscripciones, servicios o cuotas para ver aquí lo que viene y cuándo."
          action="Agregar recurrente"
          onAction={app.newRecurring}
        />
      )}
    </View>
  );
}

function SpendSection() {
  const app = useApp();
  const { t, narrow } = useUI();
  const { totals, currency, month, data, space: sp } = app;
  const entries = data.entries.filter(
    (e) =>
      e.space === sp && e.currency === currency && e.date.startsWith(month),
  );
  const consumption = entries
    .filter((e) => e.kind === "expense")
    .reduce((s, e) => s + e.amount, 0);
  const refunds = entries
    .filter((e) => e.kind === "refund")
    .reduce((s, e) => s + e.amount, 0);
  const max = Math.max(1, ...totals.byCategory.map((c) => Math.abs(c.amount)));
  const hasNegative = totals.byCategory.some((c) => c.amount < 0);
  return (
    <View style={{ gap: space.md }}>
      <SectionHeader
        title={`Gasto neto · ${monthLower(month)}`}
        right={
          <Txt variant="meta" tone="muted">
            {currency}
          </Txt>
        }
      />
      {consumption || refunds ? (
        <>
          <View style={{ gap: 2 }}>
            <MoneyText
              amount={totals.spent}
              currency={currency}
              variant="amount"
              fit
              smallCents
            />
            {refunds > 0 && (
              <Txt variant="meta" tone="muted">
                Consumo {formatMoney(consumption, currency)} − devoluciones{" "}
                {formatMoney(refunds, currency)}
              </Txt>
            )}
          </View>
          <View style={{ gap: space.xs }}>
            {totals.byCategory.map((c) => {
              const width =
                `${Math.max(2, (Math.abs(c.amount) / max) * 100)}%` as const;
              const bar = (
                <View
                  style={{
                    flex: 1,
                    height: 6,
                    justifyContent: "center",
                    minWidth: 40,
                  }}
                >
                  <View
                    style={{
                      width,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: c.amount < 0 ? "transparent" : t.ink,
                      borderWidth: c.amount < 0 ? 1.5 : 0,
                      borderColor: t.ink,
                    }}
                  />
                </View>
              );
              return (
                <View
                  key={c.category}
                  accessible
                  accessibilityLabel={`${c.category}: ${formatMoney(c.amount, currency)}${c.amount < 0 ? ", devoluciones netas" : ""}`}
                  style={{
                    flexDirection: narrow ? "column" : "row",
                    alignItems: narrow ? "stretch" : "center",
                    gap: narrow ? 4 : space.sm,
                    minHeight: 28,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      gap: space.sm,
                      width: narrow ? undefined : 132,
                    }}
                  >
                    <Txt
                      variant="secondary"
                      style={{ flex: narrow ? 1 : undefined }}
                    >
                      {c.category}
                    </Txt>
                    {narrow ? (
                      <MoneyText
                        amount={c.amount}
                        currency={currency}
                        variant="secondary"
                      />
                    ) : null}
                  </View>
                  {bar}
                  {!narrow ? (
                    <View style={{ minWidth: 96, alignItems: "flex-end" }}>
                      <MoneyText
                        amount={c.amount}
                        currency={currency}
                        variant="secondary"
                        align="right"
                      />
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
          <Txt variant="meta" tone="muted">
            Cada barra compara la categoría con la mayor; no son porcentajes del
            total.
            {hasNegative ? " Contorno: devoluciones netas." : ""} Las categorías
            suman el gasto neto.
          </Txt>
        </>
      ) : (
        <Txt variant="secondary" tone="muted">
          Sin gastos registrados en {monthLower(month)}. Usa «Registrar gasto»
          al pagar algo; puedes anotarlo después.
        </Txt>
      )}
      <View>
        <Divider />
        <KeyValue
          label="Ingresos registrados"
          value={
            <MoneyText
              amount={totals.income}
              currency={currency}
              variant="secondary"
            />
          }
        />
        <KeyValue
          label="Cuotas de deuda pagadas"
          value={
            <MoneyText
              amount={totals.debtPaid}
              currency={currency}
              variant="secondary"
            />
          }
        />
        <Txt variant="meta" tone="muted">
          Ingresos y cuotas se muestran aparte; no forman un saldo.
        </Txt>
      </View>
    </View>
  );
}

function Meter({ value, label }: { value: number; label: string }) {
  const { t } = useUI();
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }}
      style={{
        height: 8,
        borderRadius: 4,
        backgroundColor: t.surface,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: t.divider,
      }}
    >
      <View
        style={{ width: `${pct}%`, height: "100%", backgroundColor: t.ink }}
      />
    </View>
  );
}

function BudgetSection() {
  const app = useApp();
  const { budget, totals, currency, month, today } = app;
  const isCurrent = month === today.slice(0, 7);
  return (
    <View style={{ gap: space.sm }}>
      <SectionHeader
        title="Presupuesto de gastos"
        right={
          budget.amount !== null ? (
            <Button
              variant="quiet"
              label="Cambiar límite"
              onPress={app.startBudget}
              accessibilityLabel={`Cambiar límite de gastos en ${currency}`}
            />
          ) : undefined
        }
      />
      {budget.amount !== null ? (
        <>
          <Txt variant="meta" tone="muted">
            Restante del presupuesto de gastos
          </Txt>
          <MoneyText
            amount={budget.amount - totals.spent}
            currency={currency}
            variant="amount"
            fit
            smallCents
          />
          <Txt variant="meta" tone="muted">
            Límite {formatMoney(budget.amount, currency)} · gasto neto{" "}
            {formatMoney(totals.spent, currency)}
          </Txt>
          <Meter
            value={(totals.spent / budget.amount) * 100}
            label={`Gasto neto: ${percent(Math.max(0, (totals.spent / budget.amount) * 100))} del límite`}
          />
          {totals.spent > budget.amount && (
            <Txt variant="secondary" weight="600">
              El gasto neto supera el límite por{" "}
              {formatMoney(totals.spent - budget.amount, currency)}.
            </Txt>
          )}
          <Txt variant="meta" tone="muted">
            No es tu saldo bancario.{" "}
            {isCurrent
              ? ""
              : `Se usa el límite vigente como referencia; Mes aún no guarda un límite distinto para ${monthLower(month)}.`}
          </Txt>
        </>
      ) : (
        <>
          <Txt variant="secondary" tone="muted">
            Sin límite en {currency}. Puedes observar tu gasto y fijar uno
            cuando quieras.
          </Txt>
          <Button
            variant="secondary"
            compact
            label="Fijar un límite"
            onPress={app.startBudget}
          />
        </>
      )}
      {totals.debtPending > 0 && (
        <View>
          <Divider spacing={space.xs} />
          <KeyValue
            label={`Cuotas por pagar en ${monthLower(month)}`}
            value={
              <MoneyText
                amount={totals.debtPending}
                currency={currency}
                variant="secondary"
              />
            }
          />
          <Txt variant="meta" tone="muted">
            Aparte del presupuesto de gastos.
          </Txt>
        </View>
      )}
    </View>
  );
}

function GoalSection() {
  const app = useApp();
  const { goal, currency } = app;
  const pct = goal.target > 0 ? (goal.saved / goal.target) * 100 : 0;
  return (
    <View style={{ gap: space.sm }}>
      <SectionHeader
        title={`Meta · ${goal.name}`}
        right={
          goal.currency !== currency ? (
            <StatusTag kind="note" label={`En ${goal.currency}`} />
          ) : undefined
        }
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "baseline",
          flexWrap: "wrap",
          gap: space.xs,
        }}
      >
        <MoneyText
          amount={goal.saved}
          currency={goal.currency}
          variant="heading"
        />
        <Txt variant="secondary" tone="muted">
          aportados de {formatMoney(goal.target, goal.currency)} ·{" "}
          {percent(Math.floor(pct))}
        </Txt>
      </View>
      <Meter
        value={pct}
        label={`Meta ${goal.name}: ${percent(Math.floor(pct))} aportado`}
      />
      <Txt variant="meta" tone="muted">
        {goal.saved >= goal.target
          ? "Meta alcanzada con lo que registraste como apartado."
          : `Faltan ${formatMoney(goal.target - goal.saved, goal.currency)}. Solo cuenta lo que registras como apartado.`}
        {goal.currency !== currency
          ? ` La meta está en ${goal.currency} y no cambia con el filtro de moneda.`
          : ""}
      </Txt>
      <Button
        variant="secondary"
        compact
        icon="plus"
        label="Registrar aporte"
        onPress={app.startGoal}
      />
    </View>
  );
}

function Observation() {
  const app = useApp();
  const rise = app.priceRise;
  if (!rise?.insight) return null;
  const i = rise.insight;
  return (
    <View style={{ gap: space.xs }}>
      <SectionHeader title="Observación" />
      <Txt variant="secondary">
        {rise.r.name} subió {formatMoney(i.diff, i.currency)} por cobro{" "}
        {freqLower[i.frequency]}
        {i.percent !== null ? ` (+${percent(i.percent)})` : ""}: de{" "}
        {formatMoney(i.previous, i.currency)} a{" "}
        {formatMoney(i.next, i.currency)}, registrado el {fullDate(i.date)}.
        {i.monthlyEquivalent
          ? ` Equivale a unos ${formatMoney(i.monthlyEquivalent.next - i.monthlyEquivalent.previous, i.currency)} más al mes; el cobro real es anual.`
          : ""}
      </Txt>
      <Button
        variant="quiet"
        align="flex-start"
        label={`Ver ${rise.r.name}`}
        onPress={() => app.openDetail(rise.r)}
      />
    </View>
  );
}

export function MesScreen() {
  const { wide, desktop } = useUI();
  const gap = desktop ? space.xl : space.lg;
  if (wide)
    return (
      <View style={{ gap: space.xl }}>
        <View
          style={{
            flexDirection: "row",
            gap: space.xxl,
            alignItems: "flex-start",
          }}
        >
          <View style={{ flex: 1.45, minWidth: 0 }}>
            <DueSection />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <SpendSection />
          </View>
        </View>
        <Divider />
        <View
          style={{
            flexDirection: "row",
            gap: space.xxl,
            alignItems: "flex-start",
          }}
        >
          <View style={{ flex: 1.45, minWidth: 0 }}>
            <BudgetSection />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <GoalSection />
          </View>
        </View>
        <Observation />
      </View>
    );
  return (
    <View style={{ gap }}>
      <DueSection />
      <Divider />
      <SpendSection />
      <Divider />
      <BudgetSection />
      <Divider />
      <GoalSection />
      <Observation />
    </View>
  );
}
