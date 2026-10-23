// Captura rápida: importe → favoritos → fecha → categoría → Guardar (zona fija).
// Lo complementario queda en Detalles. El destino se lee en el título de la hoja
// y en el botón final.
import React, { useEffect, useRef } from "react";
import { TextInput, View } from "react-native";
import { EntryKind, categories, parseMoney } from "../../domain/model";
import { useApp } from "../../app/context";
import { entryLabel, entryNoun, favorites, methods } from "../../app/useMesApp";
import {
  Button,
  Checkbox,
  ChipGroup,
  Disclosure,
  Field,
  FieldMessages,
  Notice,
  QuickDate,
  Txt,
  focusElement,
  useUI,
  webAria,
} from "../components";
import { currencyPrefix, formatMoney, fullDate, monthLower } from "../format";
import { fontFamily, space, type } from "../tokens";
import { CurrencyPicker, useFieldError, useFieldRefs } from "./shared";

const detailFields = new Set(["title", "kind", "method", "note"]);

export function entrySheetTitle(app: ReturnType<typeof useApp>) {
  const noun = entryNoun[app.entryForm.kind];
  return app.editId ? `Editar ${noun}` : `Registrar ${noun}`;
}

export function EntryBody() {
  const app = useApp();
  const { t, narrow } = useUI();
  const f = app.entryForm;
  const set = (patch: Partial<typeof f>) =>
    app.setEntryForm((x) => ({ ...x, ...patch }));
  const reg = useFieldRefs((field) => {
    if (detailFields.has(field)) app.setExtras(true);
  });
  const fe = useFieldError();
  const previous = app.data.entries.find((e) => e.id === app.editId);
  const linked = !!previous?.occurrenceId;
  const parsed = (() => {
    try {
      return parseMoney(f.amount);
    } catch {
      return null;
    }
  })();
  const suggested =
    f.category === "Sin clasificar" ? entryLabel[f.kind] : f.category;
  const selectedFav =
    favorites.find((x) => x.name === f.title && x.category === f.category)
      ?.name ?? "";
  const amountError = fe("amount");
  const retire = useRef<View>(null);
  useEffect(() => {
    if (app.confirm !== "delete") return;
    app.sheetScroll.current?.scrollToEnd({ animated: !app.reduceMotion });
    const id = setTimeout(() => focusElement(retire.current), 120);
    return () => clearTimeout(id);
  }, [app.confirm]);
  return (
    <>
      <View style={{ gap: space.xs }}>
        <Txt variant="secondary" weight="500">
          Importe
        </Txt>
        <View
          style={{ flexDirection: "row", alignItems: "center", gap: space.xs }}
        >
          <Txt variant={narrow ? "heading" : "title"} tone="muted">
            {currencyPrefix(f.currency)}
          </Txt>
          <TextInput
            ref={reg("amount")}
            nativeID="entry-amount"
            accessibilityLabel={`Importe en ${f.currency}`}
            {...webAria({
              "aria-invalid": amountError ? true : undefined,
              "aria-describedby": amountError
                ? "entry-amount-error"
                : undefined,
            })}
            autoFocus={!app.editId}
            value={f.amount}
            onChangeText={(amount) => set({ amount })}
            placeholder="0.00"
            placeholderTextColor={t.muted}
            keyboardType="decimal-pad"
            inputMode="decimal"
            maxLength={13}
            style={{
              flex: 1,
              minWidth: 0,
              fontFamily,
              fontSize: narrow ? 32 : 40,
              lineHeight: narrow ? 38 : 46,
              color: t.ink,
              paddingVertical: space.xs,
              paddingHorizontal: space.xs,
              borderBottomWidth: amountError ? 2 : 1,
              borderColor: amountError ? t.ink : t.control,
            }}
          />
          {linked ? (
            <Txt variant="secondary" weight="600">
              {f.currency}
            </Txt>
          ) : (
            <CurrencyPicker
              value={f.currency}
              onChange={(currency) => set({ currency })}
            />
          )}
        </View>
        <FieldMessages id="entry-amount" error={amountError} />
      </View>

      {!app.editId && (
        <View style={{ gap: space.xs }}>
          <Txt variant="secondary" weight="500">
            Favoritos
          </Txt>
          <ChipGroup
            label="Favoritos"
            value={selectedFav}
            onChange={(name) => {
              const fav = favorites.find((x) => x.name === name)!;
              app.setEntryForm((x) => ({
                ...x,
                title: fav.name,
                category: fav.category,
                kind: "expense",
                amount: x.amount || (x.currency === "MXN" ? fav.amount : ""),
              }));
            }}
            options={favorites.map((fav) => ({
              value: fav.name,
              label: fav.name,
              detail:
                f.currency === "MXN"
                  ? `${formatMoney(parseMoney(fav.amount), "MXN")} · ${fav.category}`
                  : fav.category,
            }))}
          />
          <Txt variant="meta" tone="muted">
            {f.currency === "MXN"
              ? "Completan nombre y categoría; el importe solo si está vacío, y puedes editarlo."
              : `Los importes sugeridos están en MXN y no se convierten: escribe el importe en ${f.currency}.`}
          </Txt>
        </View>
      )}

      <QuickDate
        id="entry-date"
        label="Fecha"
        value={f.date}
        onChange={(date) => set({ date })}
        error={fe("date")}
      />

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
          label="Detalles: nombre, tipo, forma de pago y nota"
          expanded={app.extras}
          onToggle={() => app.setExtras(!app.extras)}
        />
        {app.extras && (
          <>
            <Field
              ref={reg("title")}
              id="entry-title"
              label="Nombre"
              value={f.title}
              onChangeText={(title) => set({ title })}
              placeholder={`Si lo dejas vacío: «${suggested}»`}
              error={fe("title")}
            />
            <View style={{ gap: space.xs }}>
              <Txt variant="secondary" weight="500">
                Tipo
              </Txt>
              <ChipGroup
                label="Tipo de movimiento"
                value={f.kind}
                refFor={(v) => (v === f.kind ? reg("kind") : undefined)}
                onChange={(kind: EntryKind) => set({ kind })}
                options={(Object.keys(entryLabel) as EntryKind[]).map((k) => ({
                  value: k,
                  label: entryLabel[k],
                  disabled: linked && k !== previous?.kind,
                }))}
              />
              <FieldMessages id="entry-kind" error={fe("kind")} />
              {linked ? (
                <Txt variant="meta" tone="muted">
                  Pago vinculado: el tipo y la moneda se conservan.
                </Txt>
              ) : null}
            </View>
            <View style={{ gap: space.xs }}>
              <Txt variant="secondary" weight="500">
                Forma de pago
              </Txt>
              <ChipGroup
                label="Forma de pago"
                value={methods.includes(f.method) ? f.method : ""}
                onChange={(method) => set({ method })}
                options={methods.map((m) => ({ value: m, label: m }))}
              />
            </View>
            <Field
              ref={reg("note")}
              id="entry-note"
              label="Nota (opcional)"
              value={f.note}
              onChangeText={(note) => set({ note })}
              multiline
            />
          </>
        )}
      </View>

      {f.kind === "debt_payment" && !linked && (
        <Notice>
          Se registra como pago de deuda, aparte de tu gasto de consumo.
        </Notice>
      )}

      {linked && previous?.recurringSnapshot && (
        <Notice title={`Pago de ${previous.recurringSnapshot.name}`}>
          {`Vinculado al vencimiento del ${fullDate(previous.occurrenceId!.slice(-10))}.`}
        </Notice>
      )}
      {linked &&
        previous?.recurringSnapshot &&
        !previous.recurringSnapshot.variable &&
        parsed !== null &&
        parsed !== previous.amount && (
          <View style={{ gap: space.xs }}>
            <Checkbox
              ref={reg("differentTotal")}
              checked={app.differentTotal}
              onChange={app.setDifferentTotal}
              label={`El total de ese vencimiento fue ${formatMoney(parsed, f.currency)}, no ${formatMoney(previous.amount, f.currency)}`}
              help="Corrige el total completo del vencimiento; Mes aún no registra abonos parciales ni saldo pendiente."
            />
            <FieldMessages id="entry-different" error={fe("differentTotal")} />
          </View>
        )}

      {app.editId &&
        (app.confirm === "delete" ? (
          <Notice
            icon="alert"
            title="¿Retirar este movimiento?"
            actions={
              <>
                <Button
                  ref={retire}
                  label="Retirar"
                  onPress={app.retireEntry}
                  compact
                />
                <Button
                  variant="secondary"
                  label="Cancelar"
                  compact
                  onPress={() => app.setConfirm(null)}
                />
              </>
            }
          >
            {linked
              ? `Se quitará de ${monthLower(f.date.slice(0, 7))} y el vencimiento del ${fullDate(previous!.occurrenceId!.slice(-10))} volverá a quedar por confirmar con sus condiciones originales. Podrás deshacerlo justo después.`
              : `Se quitará de ${monthLower(f.date.slice(0, 7))}. Podrás deshacerlo justo después.`}
          </Notice>
        ) : (
          <Button
            variant="secondary"
            compact
            label="Retirar movimiento"
            onPress={() => app.setConfirm("delete")}
          />
        ))}
    </>
  );
}

export function EntryFooter() {
  const app = useApp();
  const noun = entryNoun[app.entryForm.kind];
  return (
    <Button
      testID="save-entry"
      fullWidth
      label={
        app.editId ? "Guardar cambios" : `Guardar ${noun} en ${app.spaceName}`
      }
      onPress={app.saveEntry}
    />
  );
}
