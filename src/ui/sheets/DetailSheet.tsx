import React from "react";
import { View } from "react-native";
import { inRange } from "../../domain/model";
import { upcomingDates } from "../../domain/derive";
import { useApp } from "../../app/context";
import { canConfirm, freqLower, kindLabel } from "../../app/useMesApp";
import {
  Button,
  Divider,
  KeyValue,
  MoneyText,
  Notice,
  SectionHeader,
  StatusTag,
  Txt,
} from "../components";
import { dayMonth, formatMoney, fullDate, percent } from "../format";
import { ruleView } from "../screens/RecurrentesScreen";
import { space } from "../tokens";

export function DetailBody() {
  const app = useApp();
  const r = app.currentRec;
  if (!r) return null;
  const overdue = app.overdue.get(r.id) ?? [];
  const view = ruleView(r, overdue.length, app.today);
  const next = upcomingDates(r, 3);
  const payments = app.data.entries
    .filter((e) => e.occurrenceId?.startsWith(r.id + ":"))
    .sort((a, b) => b.occurrenceId!.localeCompare(a.occurrenceId!));
  return (
    <>
      <View style={{ gap: space.xs }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: space.xs,
          }}
        >
          <MoneyText
            amount={r.amount}
            currency={r.currency}
            variant="amount"
            smallCents
          />
          <Txt variant="meta" tone="muted">
            {r.currency} · {r.variable ? "estimado · " : ""}
            {freqLower[r.frequency]} · {kindLabel[r.kind]}
          </Txt>
        </View>
        {view.tags.length ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {view.tags.map((g) => (
              <StatusTag key={g.label} kind={g.kind} label={g.label} />
            ))}
          </View>
        ) : (
          <StatusTag kind="note" label="Activo" />
        )}
      </View>

      <View style={{ gap: space.xs }}>
        <SectionHeader title="Próximos cobros" />
        {next.length ? (
          next.map((d) => (
            <KeyValue
              key={d}
              label={fullDate(d)}
              value={
                <MoneyText
                  amount={r.amount}
                  currency={r.currency}
                  variant="secondary"
                />
              }
            />
          ))
        ) : (
          <Txt variant="secondary" tone="muted">
            Sin próximos cobros.
          </Txt>
        )}
        {r.trialEnd && r.trialEnd >= app.today ? (
          <Txt variant="meta" tone="muted">
            La prueba termina el {fullDate(r.trialEnd)}. No es un cobro
            confirmado.
          </Txt>
        ) : null}
      </View>

      {overdue.length > 0 && (
        <View style={{ gap: space.xs }}>
          <SectionHeader title={`Por confirmar (${overdue.length})`} />
          {overdue.map((o) => (
            <View
              key={o.date}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: space.sm,
                flexWrap: "wrap",
              }}
            >
              <View style={{ flex: 1, minWidth: 140 }}>
                <KeyValue
                  label={fullDate(o.date)}
                  value={
                    <MoneyText
                      amount={o.r.amount}
                      currency={o.r.currency}
                      variant="secondary"
                    />
                  }
                />
              </View>
              {canConfirm(app.data, o.r, o.date) ? (
                <Button
                  compact
                  variant="secondary"
                  icon="check"
                  label="Registrar"
                  accessibilityLabel={`Registrar pago del ${fullDate(o.date)}`}
                  onPress={() => app.startPayment(o.r, o.date)}
                />
              ) : (
                <Txt variant="meta" tone="muted">
                  Después del anterior
                </Txt>
              )}
            </View>
          ))}
        </View>
      )}

      <View>
        <SectionHeader title="Datos" />
        <KeyValue label="Categoría" value={r.category} />
        <KeyValue label="Forma de pago" value={r.method || "Sin especificar"} />
        {r.trialEnd ? (
          <KeyValue label="Fin de la prueba" value={fullDate(r.trialEnd)} />
        ) : null}
        {r.endDate ? (
          <KeyValue label="Última cuota" value={fullDate(r.endDate)} />
        ) : null}
        {r.cancelDate ? (
          <KeyValue label="Cancelar desde" value={fullDate(r.cancelDate)} />
        ) : null}
        {r.note ? <KeyValue label="Nota" value={r.note} /> : null}
      </View>

      {r.kind === "debt" && (
        <Notice>
          Se registra como pago de deuda, aparte de tu gasto. Mes no conoce
          saldo, intereses ni cuotas restantes.
        </Notice>
      )}
      {r.cancelDate && (
        <Notice>{`Cancelación prevista desde el ${fullDate(r.cancelDate)}. Cancélala también con el proveedor.`}</Notice>
      )}
      {r.status === "paused" && r.pausedDate && (
        <Notice>{`Pausado desde el ${fullDate(r.pausedDate)}. Los cobros anteriores siguen pendientes; reanudar no inventa cobros durante la pausa.`}</Notice>
      )}

      {r.priceHistory.length > 0 && (
        <View style={{ gap: space.xxs }}>
          <SectionHeader title="Cambios de precio" />
          {r.priceHistory.map((p, i) => {
            const diff = p.next - p.previous;
            return (
              <Txt key={i} variant="secondary">
                {fullDate(p.date)} · {formatMoney(p.previous, r.currency)} →{" "}
                {formatMoney(p.next, r.currency)} (
                {formatMoney(diff, r.currency, "always")}
                {p.previous > 0
                  ? `, ${diff >= 0 ? "+" : ""}${percent((diff / p.previous) * 100)}`
                  : ""}
                )
              </Txt>
            );
          })}
        </View>
      )}

      <View style={{ gap: space.xxs }}>
        <SectionHeader title={`Pagos registrados (${payments.length})`} />
        {payments.length ? (
          payments
            .slice(0, 3)
            .map((e) => (
              <KeyValue
                key={e.id}
                label={`${fullDate(e.date)} · vencimiento ${dayMonth(e.occurrenceId!.slice(-10))}`}
                value={
                  <MoneyText
                    amount={e.amount}
                    currency={e.currency}
                    variant="secondary"
                  />
                }
              />
            ))
        ) : (
          <Txt variant="secondary" tone="muted">
            Aún no registras pagos de esta regla.
          </Txt>
        )}
      </View>

      <Divider />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.xs }}>
        <Button
          compact
          variant="secondary"
          icon="edit"
          label="Editar"
          onPress={() => app.editRecurring(r)}
        />
        {r.status === "active" && inRange(r, r.nextDate) && (
          <Button
            compact
            variant="secondary"
            icon="pause"
            label="Pausar desde hoy"
            onPress={() => app.pause(r)}
          />
        )}
        {r.status === "paused" && (
          <Button
            compact
            variant="secondary"
            label="Reanudar y revisar fecha"
            onPress={() => app.resume(r)}
          />
        )}
      </View>
      <Txt variant="meta" tone="muted">
        Recordatorios del teléfono: aún no disponibles en esta prueba.
      </Txt>
    </>
  );
}

export function DetailFooter() {
  const app = useApp();
  const r = app.currentRec;
  if (!r || !inRange(r, r.nextDate)) return null;
  return (
    <Button
      testID="detail-pay"
      fullWidth
      label={`Registrar pago del ${dayMonth(r.nextDate)}`}
      onPress={() => app.startPayment(r)}
    />
  );
}
