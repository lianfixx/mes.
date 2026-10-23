// Alta/edición de un recurrente. Indispensables primero; prueba, cancelación,
// última cuota y nota en Detalles. Los cambios de calendario muestran sus
// consecuencias calculadas por el dominio antes de guardar.
import React from "react";
import { View } from "react-native";
import {
  Recurring,
  RecurringKind,
  Frequency,
  categories,
  inRange,
  recurringState,
} from "../../domain/model";
import {
  droppedByKindChange,
  previewScheduleChange,
  upcomingDates,
} from "../../domain/derive";
import { useApp } from "../../app/context";
import { buildRecord, freqLabel, kindLabel } from "../../app/useMesApp";
import {
  Button,
  ChipGroup,
  DateField,
  Disclosure,
  Field,
  FieldMessages,
  Notice,
  RadioCard,
  SwitchRow,
  Txt,
} from "../components";
import { formatMoney, fullDate } from "../format";
import { space } from "../tokens";
import { CurrencyPicker, useFieldError, useFieldRefs } from "./shared";

const detailFields = new Set([
  "trialEnd",
  "cancelDate",
  "endDate",
  "note",
  "method",
]);
const fieldName = { trialEnd: "fin de la prueba", endDate: "última cuota" };

export function recurringSheetTitle(app: ReturnType<typeof useApp>) {
  if (app.resumeId && app.resumeId === app.editId)
    return `Reanudar ${app.recForm.name}`;
  return app.editId ? "Editar recurrente" : "Nuevo recurrente";
}

export function RecurringBody() {
  const app = useApp();
  const f = app.recForm;
  const set = (patch: Partial<typeof f>) =>
    app.setRecForm((x) => ({ ...x, ...patch }));
  const reg = useFieldRefs((field) => {
    if (detailFields.has(field)) app.setExtras(true);
  });
  const fe = useFieldError();
  const previous = app.recPrevious;
  const resuming = !!app.resumeId && app.resumeId === app.editId;

  // Vista previa de fechas con la regla tal como quedaría (sin guardar).
  const draft: Recurring | null = (() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f.date)) return null;
    return {
      ...(previous ?? ({} as Recurring)),
      id: previous?.id ?? "borrador",
      nextDate: f.date,
      frequency: f.frequency,
      anchorDay:
        previous && previous.nextDate === f.date
          ? previous.anchorDay
          : Number(f.date.slice(-2)),
      status: resuming ? "active" : (previous?.status ?? "active"),
      pausedDate: previous?.pausedDate,
      cancelDate: f.cancelDate || undefined,
      endDate: f.kind === "debt" ? f.endDate || undefined : undefined,
    } as Recurring;
  })();
  const nextDates = draft ? upcomingDates(draft, 3) : [];

  const scheduleChanged =
    !!previous &&
    (previous.nextDate !== f.date || previous.frequency !== f.frequency) &&
    inRange(previous, previous.nextDate);
  const record = (() => {
    try {
      return buildRecord(f, previous, {
        editId: app.editId,
        resumeId: app.resumeId,
        space: app.space,
      });
    } catch {
      return null;
    }
  })();
  const preview = (action: "reschedule" | "future") =>
    record ? previewScheduleChange(app.data, record, action) : null;
  const moved = scheduleChanged ? preview("reschedule") : null;
  const kept = scheduleChanged ? preview("future") : null;

  const financialChange =
    !!previous &&
    !!record &&
    (previous.amount !== record.amount ||
      previous.frequency !== record.frequency ||
      previous.kind !== record.kind ||
      previous.variable !== record.variable ||
      previous.endDate !== record.endDate ||
      previous.cancelDate !== record.cancelDate);
  const overdue = previous ? (app.overdue.get(previous.id) ?? []) : [];
  const dropped = app.pendingKind
    ? droppedByKindChange(f, app.pendingKind)
    : [];
  const state = previous ? recurringState(previous) : "Activo";

  return (
    <>
      <Field
        ref={reg("name")}
        id="rec-name"
        label="Nombre"
        value={f.name}
        onChangeText={(name) => set({ name })}
        placeholder="Por ejemplo, Internet"
        error={fe("name")}
      />

      <View style={{ gap: space.xs }}>
        <Txt variant="secondary" weight="500">
          Tipo
        </Txt>
        <ChipGroup
          label="Tipo de recurrente"
          value={f.kind}
          refFor={(v) => (v === f.kind ? reg("kind") : undefined)}
          onChange={(kind: RecurringKind) => app.chooseKind(kind)}
          options={(Object.keys(kindLabel) as RecurringKind[]).map((k) => ({
            value: k,
            label: kindLabel[k],
          }))}
        />
        <FieldMessages id="rec-kind" error={fe("kind")} />
        {app.pendingKind && dropped.length > 0 && (
          <Notice
            icon="alert"
            title={`¿Cambiar a ${kindLabel[app.pendingKind]}?`}
            actions={
              <>
                <Button
                  compact
                  label="Cambiar tipo"
                  onPress={app.applyPendingKind}
                />
                <Button
                  compact
                  variant="secondary"
                  label={`Conservar ${kindLabel[f.kind]}`}
                  onPress={() => app.setPendingKind(null)}
                />
              </>
            }
          >
            {`Se quitará ${dropped.map((d) => `${fieldName[d.field]} (${fullDate(d.value)})`).join(" y ")}, que no aplica a ${kindLabel[app.pendingKind].toLowerCase()}.`}
          </Notice>
        )}
      </View>

      <View style={{ gap: space.xs }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            gap: space.sm,
          }}
        >
          <View style={{ flex: 1, minWidth: 0 }}>
            <Field
              ref={reg("amount")}
              id="rec-amount"
              label={f.variable ? "Importe estimado" : "Importe previsto"}
              value={f.amount}
              onChangeText={(amount) => set({ amount })}
              number
              placeholder="0.00"
              error={fe("amount")}
            />
          </View>
          <View style={{ paddingBottom: fe("amount") ? 26 : 2 }}>
            {app.editId ? (
              <Txt
                variant="secondary"
                weight="600"
                style={{ paddingVertical: 14 }}
              >
                {f.currency}
              </Txt>
            ) : (
              <CurrencyPicker
                value={f.currency}
                onChange={(currency) => set({ currency })}
              />
            )}
          </View>
        </View>
        {app.editId ? (
          <Txt variant="meta" tone="muted">
            La moneda no cambia para conservar el historial; para otra moneda,
            crea otro recurrente.
          </Txt>
        ) : null}
      </View>
      <SwitchRow
        label="El importe puede variar"
        help="Al pagar registrarás el total real; aquí queda como estimado."
        value={f.variable}
        onChange={(variable) => set({ variable })}
      />

      <View style={{ gap: space.xs }}>
        <Txt variant="secondary" weight="500">
          Frecuencia
        </Txt>
        <ChipGroup
          label="Frecuencia"
          value={f.frequency}
          onChange={(frequency: Frequency) => set({ frequency })}
          options={(["weekly", "monthly", "yearly"] as Frequency[]).map(
            (k) => ({ value: k, label: freqLabel[k] }),
          )}
        />
      </View>

      <View style={{ gap: space.xs }}>
        <DateField
          ref={reg("date")}
          id="rec-date"
          label="Próximo cobro"
          value={f.date}
          onChange={(date) => set({ date })}
          error={fe("date")}
        />
        <Txt variant="meta" tone="muted">
          {nextDates.length
            ? nextDates[0] < app.today
              ? `Vencimiento por confirmar: ${fullDate(nextDates[0])}. Después: ${nextDates.slice(1).map(fullDate).join(" · ")}.`
              : `Próximos cobros: ${nextDates.map(fullDate).join(" · ")}.`
            : draft
              ? "Sin cobros en esa fecha con las condiciones actuales (pausa, cancelación o última cuota)."
              : "Elige la fecha para ver los próximos cobros."}
          {draft && draft.anchorDay > 28 && f.frequency !== "weekly"
            ? " Los meses cortos usan su último día."
            : ""}
          {f.kind === "subscription" && f.trialEnd
            ? ` La prueba termina el ${fullDate(f.trialEnd)}; no es un cobro confirmado.`
            : ""}
        </Txt>
      </View>

      {scheduleChanged && (
        <View
          accessibilityRole="radiogroup"
          accessibilityLabel="Cómo cambiar el calendario"
          style={{ gap: space.xs }}
        >
          <Txt variant="secondary" weight="600">
            ¿Cómo debe cambiar el calendario?
          </Txt>
          <RadioCard
            ref={reg("scope")}
            title={`Mover el calendario desde el vencimiento del ${fullDate(previous!.nextDate)}`}
            selected={app.dateAction === "reschedule"}
            onPress={() => app.setDateAction("reschedule")}
            description={
              moved?.ok
                ? `${previous!.nextDate !== f.date ? `Ese vencimiento pasa al ${fullDate(f.date)} y las fechas siguientes cambian a partir de él` : "El calendario cambia a partir de ese vencimiento"}: ${moved.upcoming.map(fullDate).join(" · ")}.${moved.kept.length ? ` Siguen pendientes: ${moved.kept.map((o) => fullDate(o.date)).join(", ")}.` : ""}`
                : "Completa nombre, importe y fecha para ver el resultado."
            }
            disabledReason={moved && !moved.ok ? moved.error : undefined}
          />
          <RadioCard
            title="Conservar pendientes y cambiar los cobros futuros"
            selected={app.dateAction === "future"}
            onPress={() => app.setDateAction("future")}
            description={
              kept?.ok
                ? `${kept.kept.length ? `Siguen pendientes, con su importe original: ${kept.kept.map((o) => `${fullDate(o.date)} (${formatMoney(o.r.amount, o.r.currency)})`).join(", ")}. ` : ""}Cobros nuevos: ${kept.upcoming.map(fullDate).join(" · ")}.`
                : "Completa nombre, importe y fecha para ver el resultado."
            }
            disabledReason={
              kept && !kept.ok
                ? /después del vencimiento/.test(kept.error)
                  ? `Para esta opción, elige una fecha posterior al ${fullDate(previous!.nextDate)}.`
                  : kept.error
                : undefined
            }
          />
          <FieldMessages id="rec-scope" error={fe("scope")} />
        </View>
      )}

      {financialChange && overdue.length > 0 && (
        <Notice>
          {`${overdue.length === 1 ? "El vencimiento" : `Los ${overdue.length} vencimientos`} anterior${overdue.length === 1 ? "" : "es"} a hoy sin confirmar (${overdue.map((o) => fullDate(o.date)).join(", ")}) conserva${overdue.length === 1 ? "" : "n"} su importe y condiciones originales.`}
        </Notice>
      )}
      {previous && state !== "Activo" && !resuming && (
        <Notice>{`Estado: ${state}. Puedes editar nombre, nota y otros datos sin crear cobros nuevos.`}</Notice>
      )}

      <View style={{ gap: space.xs }}>
        <Txt variant="secondary" weight="500">
          Categoría
        </Txt>
        <ChipGroup
          label="Categoría"
          value={f.category}
          onChange={(category) => set({ category })}
          options={categories.map((c) => ({ value: c, label: c }))}
        />
      </View>

      <View style={{ gap: space.md }}>
        <Disclosure
          label={`Detalles: forma de pago, ${f.kind === "subscription" ? "prueba, " : f.kind === "debt" ? "última cuota, " : ""}cancelación y nota`}
          expanded={app.extras}
          onToggle={() => app.setExtras(!app.extras)}
        />
        {app.extras && (
          <>
            <Field
              ref={reg("method")}
              id="rec-method"
              label="Forma de pago o alias de tarjeta"
              value={f.method === "Sin especificar" ? "" : f.method}
              onChangeText={(method) =>
                set({ method: method || "Sin especificar" })
              }
              placeholder="Sin especificar"
              help="Un alias basta. No escribas números de tarjeta."
            />
            {f.kind === "subscription" && (
              <DateField
                ref={reg("trialEnd")}
                id="rec-trial"
                label="Fin de la prueba gratuita"
                value={f.trialEnd}
                onChange={(trialEnd) => set({ trialEnd })}
                optional
                error={fe("trialEnd")}
                help="No es un cobro: el primer cobro va en «Próximo cobro»."
              />
            )}
            {f.kind === "debt" && (
              <DateField
                ref={reg("endDate")}
                id="rec-end"
                label="Última cuota"
                value={f.endDate}
                onChange={(endDate) => set({ endDate })}
                optional
                error={fe("endDate")}
                help="Incluye esa fecha. Si no la conoces, déjala sin fecha; Mes no infiere saldo ni intereses."
              />
            )}
            <DateField
              ref={reg("cancelDate")}
              id="rec-cancel"
              label="Cancelar desde"
              value={f.cancelDate}
              onChange={(cancelDate) => set({ cancelDate })}
              optional
              error={fe("cancelDate")}
              help="Ese día y los siguientes ya no se cobran. Cancélalo también con el proveedor."
            />
            <Field
              ref={reg("note")}
              id="rec-note"
              label="Nota (opcional)"
              value={f.note}
              onChangeText={(note) => set({ note })}
              multiline
            />
          </>
        )}
      </View>
    </>
  );
}

export function RecurringFooter() {
  const app = useApp();
  const resuming = !!app.resumeId && app.resumeId === app.editId;
  return (
    <Button
      testID="save-recurring"
      fullWidth
      label={
        resuming
          ? "Reanudar y guardar"
          : app.editId
            ? "Guardar cambios"
            : "Agregar recurrente"
      }
      onPress={app.saveRecurring}
    />
  );
}
