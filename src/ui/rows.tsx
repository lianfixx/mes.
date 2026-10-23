// Filas de lista. Comparten columnas: fecha · nombre/meta · importe · acción,
// para comparar importes de un vistazo. Por debajo de 380 px efectivos o con
// importes largos, el importe baja bajo el nombre; la acción conserva 48×48.
import React from "react";
import { Pressable, View } from "react-native";
import { Currency, Entry, EntryKind } from "../domain/model";
import {
  IconButton,
  MoneyText,
  StatusKind,
  StatusTag,
  Txt,
  useUI,
} from "./components";
import { formatMoney, longDate, spokenMoney } from "./format";
import { Icon, IconName } from "./icons";
import { size, space } from "./tokens";

export interface Tag {
  kind: StatusKind;
  label: string;
}

function DateColumn({ date, icon }: { date: string | null; icon?: IconName }) {
  const { t } = useUI();
  return (
    <View style={{ width: 44, alignItems: "center", paddingTop: 2 }}>
      {date ? (
        <>
          <Txt variant="heading" weight="500" style={{ lineHeight: 24 }}>
            {String(Number(date.slice(8)))}
          </Txt>
          <Txt variant="meta" tone="muted">
            {new Intl.DateTimeFormat("es-MX", {
              month: "short",
              timeZone: "UTC",
            })
              .format(new Date(date + "T12:00:00Z"))
              .replace(".", "")}
          </Txt>
        </>
      ) : (
        <View style={{ paddingTop: 2 }}>
          <Icon name={icon ?? "pause"} size={size.icon} color={t.muted} />
        </View>
      )}
    </View>
  );
}

export function ScheduleRow({
  name,
  meta,
  date,
  statusIcon,
  tags,
  amount,
  currency,
  estimated,
  onOpen,
  openLabel,
  confirm,
  last,
}: {
  name: string;
  meta: string;
  date: string | null;
  statusIcon?: IconName;
  tags: Tag[];
  amount: number;
  currency: Currency;
  estimated?: boolean;
  onOpen: () => void;
  openLabel: string;
  confirm?: { onPress: () => void; label: string } | "waiting";
  last?: boolean;
}) {
  const { t, narrow } = useUI();
  const stacked = narrow || formatMoney(amount, currency).length > 12;
  const amountBlock = (
    <View style={{ alignItems: stacked ? "flex-start" : "flex-end", gap: 2 }}>
      <MoneyText amount={amount} currency={currency} variant="body" />
      {estimated ? (
        <Txt variant="meta" tone="muted">
          Estimado
        </Txt>
      ) : null}
    </View>
  );
  const label = [
    name,
    spokenMoney(amount, currency) + (estimated ? ", estimado" : ""),
    date ? `vence el ${longDate(date)}` : "",
    meta,
    ...tags.map((g) => g.label),
  ]
    .filter(Boolean)
    .join(", ");
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: space.xs,
        paddingVertical: space.sm,
        borderBottomWidth: last ? 0 : 1,
        borderColor: t.divider,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={openLabel + ". " + label}
        onPress={onOpen}
        style={({ pressed }) => ({
          flex: 1,
          minWidth: 0,
          minHeight: size.touch,
          flexDirection: "row",
          alignItems: "flex-start",
          gap: space.sm,
          paddingVertical: space.xxs,
          borderRadius: 8,
          backgroundColor: pressed ? t.surface : "transparent",
        })}
      >
        <DateColumn date={date} icon={statusIcon} />
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Txt variant="body" weight="500">
            {name}
          </Txt>
          <Txt variant="meta" tone="muted">
            {meta}
          </Txt>
          {tags.length ? (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 6,
                marginTop: 4,
              }}
            >
              {tags.map((g) => (
                <StatusTag key={g.label} kind={g.kind} label={g.label} />
              ))}
            </View>
          ) : null}
          {stacked ? <View style={{ marginTop: 4 }}>{amountBlock}</View> : null}
        </View>
        {!stacked ? amountBlock : null}
      </Pressable>
      {confirm === "waiting" ? (
        <View style={{ width: size.touch }} />
      ) : confirm ? (
        <IconButton
          bordered
          icon="check"
          label={confirm.label}
          onPress={confirm.onPress}
        />
      ) : null}
    </View>
  );
}

export const kindIcon: Record<EntryKind, IconName> = {
  expense: "out",
  income: "in",
  refund: "refund",
  debt_payment: "installment",
};

export function EntryRow({
  entry,
  meta,
  onPress,
  last,
}: {
  entry: Entry;
  meta: string;
  onPress: () => void;
  last?: boolean;
}) {
  const { t, narrow } = useUI();
  const positive = entry.kind === "income" || entry.kind === "refund";
  const text = formatMoney(
    entry.amount,
    entry.currency,
    positive ? "always" : "auto",
  );
  const stacked = narrow || text.length > 13;
  const amount = (
    <MoneyText
      amount={entry.amount}
      currency={entry.currency}
      sign={positive ? "always" : "auto"}
      variant="body"
      align={stacked ? "left" : "right"}
    />
  );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Editar ${entry.title}. ${meta}. ${positive ? "más " : ""}${spokenMoney(entry.amount, entry.currency)}${entry.note ? ". Nota: " + entry.note : ""}`}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "flex-start",
        gap: space.sm,
        minHeight: size.touch,
        paddingVertical: space.sm,
        borderBottomWidth: last ? 0 : 1,
        borderColor: t.divider,
        backgroundColor: pressed ? t.surface : "transparent",
      })}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: t.surface,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={kindIcon[entry.kind]} size={18} color={t.ink} />
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Txt variant="body" weight="500">
          {entry.title}
        </Txt>
        <Txt variant="meta" tone="muted">
          {meta}
        </Txt>
        {entry.note ? (
          <Txt variant="meta" tone="muted">
            {entry.note}
          </Txt>
        ) : null}
        {stacked ? <View style={{ marginTop: 4 }}>{amount}</View> : null}
      </View>
      {!stacked ? <View style={{ paddingTop: 2 }}>{amount}</View> : null}
    </Pressable>
  );
}
