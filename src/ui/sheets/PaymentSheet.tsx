// Confirmar un pago: identifica el vencimiento exacto, su fecha e importe real,
// y explica qué queda después. No transfiere dinero ni avisa al proveedor.
import React from "react";
import { View } from "react-native";
import { parseMoney } from "../../domain/model";
import { afterPayment } from "../../domain/derive";
import { useApp } from "../../app/context";
import { freqLower, kindLabel } from "../../app/useMesApp";
import {
  Button,
  Checkbox,
  Field,
  FieldMessages,
  KeyValue,
  MoneyText,
  Notice,
  QuickDate,
  StatusTag,
  Txt,
} from "../components";
import { dayMonth, formatMoney, fullDate } from "../format";
import { space } from "../tokens";
import { useFieldError, useFieldRefs } from "./shared";

export function PaymentBody() {
  const app = useApp();
  const r = app.currentRec;
  const reg = useFieldRefs();
  const fe = useFieldError();
  if (!r)
    return (
      <Notice icon="alert" title="Este vencimiento ya no está pendiente">
        Puede haberse registrado o cambiado. Cierra y revisa la lista de pagos.
      </Notice>
    );
  const due = app.paymentDue;
  const parsed = (() => {
    try {
      return parseMoney(app.paymentAmount);
    } catch {
      return null;
    }
  })();
  const after = afterPayment(app.data, r.id, due);
  const differs = !r.variable && parsed !== null && parsed !== r.amount;
  return (
    <>
      <View style={{ gap: space.xxs }}>
        <Txt variant="heading" weight="600">
          {r.name}
        </Txt>
        <Txt variant="meta" tone="muted">
          {kindLabel[r.kind]} · {freqLower[r.frequency]}
        </Txt>
      </View>
      <View>
        <KeyValue
          label="Vencimiento"
          value={
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: space.xs,
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              {due < app.today ? (
                <StatusTag kind="toConfirm" label="Por confirmar" />
              ) : null}
              <Txt variant="secondary" weight="600">
                {fullDate(due)}
              </Txt>
            </View>
          }
        />
        <KeyValue
          label={r.variable ? "Importe estimado" : "Importe previsto"}
          value={
            <MoneyText
              amount={r.amount}
              currency={r.currency}
              variant="secondary"
            />
          }
        />
      </View>
      <Field
        ref={reg("amount")}
        id="pay-amount"
        label={`Importe pagado (${r.currency})`}
        value={app.paymentAmount}
        onChangeText={app.setPaymentAmount}
        number
        error={fe("amount")}
        help={r.variable ? "Escribe el total real del recibo." : undefined}
      />
      <QuickDate
        id="pay-date"
        label="Fecha en que pagaste"
        value={app.paymentDate}
        onChange={app.setPaymentDate}
        error={fe("paidDate")}
      />
      {differs && (
        <View style={{ gap: space.xs }}>
          <Checkbox
            ref={reg("differentTotal")}
            checked={app.differentTotal}
            onChange={app.setDifferentTotal}
            label={`El total de este vencimiento fue ${formatMoney(parsed!, r.currency)}, no ${formatMoney(r.amount, r.currency)}`}
            help={`Se dará por cubierto completo el vencimiento del ${fullDate(due)}. Mes aún no registra abonos parciales ni saldo pendiente.`}
          />
          <FieldMessages id="pay-different" error={fe("differentTotal")} />
        </View>
      )}
      <View style={{ gap: space.xxs }}>
        <KeyValue
          label="Después de registrarlo"
          value={
            after?.nextDate
              ? `Próximo vencimiento: ${fullDate(after.nextDate)}`
              : "Sin próximos cobros"
          }
        />
        {after && after.otherPending.length > 0 && (
          <Txt variant="meta" tone="muted">
            Siguen por confirmar: {after.otherPending.map(fullDate).join(", ")}.
          </Txt>
        )}
      </View>
      <Txt variant="meta" tone="muted">
        Registra un pago que ya hiciste. Mes no transfiere dinero ni avisa al
        proveedor.
      </Txt>
    </>
  );
}

export function PaymentFooter() {
  const app = useApp();
  return (
    <Button
      testID="confirm-payment"
      fullWidth
      label={`Registrar pago del ${dayMonth(app.paymentDue)}`}
      onPress={app.pay}
      disabled={!app.currentRec}
    />
  );
}
