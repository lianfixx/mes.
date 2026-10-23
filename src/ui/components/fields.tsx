import React, { forwardRef, useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Platform,
  Pressable,
  TextInput,
  View,
  findNodeHandle,
} from "react-native";
import {
  assertDate,
  changeMonth,
  endOfMonth,
  todayLocal,
} from "../../domain/model";
import { daysBetween } from "../../domain/derive";
import { dayMonth, fullDate, longDate, monthName } from "../format";
import { Icon } from "../icons";
import { fontFamily, radius, size, space, type } from "../tokens";
import { Button, IconButton } from "./controls";
import { useUI, webAria } from "./theme";
import { Txt } from "./Txt";

/** Lleva el foco (web) o el foco de accesibilidad (nativo) a un elemento. */
export function focusElement(node: unknown) {
  if (!node) return;
  const target = node as { focus?: () => void };
  const isInput =
    typeof (node as { isFocused?: unknown }).isFocused === "function";
  if (Platform.OS === "web" || isInput) {
    target.focus?.();
    return;
  }
  const handle = findNodeHandle(node as never);
  if (handle) AccessibilityInfo.setAccessibilityFocus(handle);
}

export function FieldMessages({
  id,
  error,
  help,
}: {
  id: string;
  error?: string;
  help?: string;
}) {
  const { t } = useUI();
  return (
    <>
      {error ? (
        <View
          style={{ flexDirection: "row", gap: 6, alignItems: "flex-start" }}
        >
          <View style={{ marginTop: 1 }}>
            <Icon name="alert" size={16} color={t.ink} />
          </View>
          <Txt nativeID={`${id}-error`} variant="meta" weight="600">
            {error}
          </Txt>
        </View>
      ) : null}
      {help ? (
        <Txt nativeID={`${id}-help`} variant="meta" tone="muted">
          {help}
        </Txt>
      ) : null}
    </>
  );
}

const describedBy = (id: string, error?: string, help?: string) =>
  [error ? `${id}-error` : "", help ? `${id}-help` : ""]
    .filter(Boolean)
    .join(" ") || undefined;

export const Field = forwardRef<
  TextInput,
  {
    id: string;
    label: string;
    value: string;
    onChangeText: (v: string) => void;
    placeholder?: string;
    number?: boolean;
    multiline?: boolean;
    error?: string;
    help?: string;
    maxLength?: number;
    autoFocus?: boolean;
  }
>(function Field(
  {
    id,
    label,
    value,
    onChangeText,
    placeholder,
    number,
    multiline,
    error,
    help,
    maxLength,
    autoFocus,
  },
  ref,
) {
  const { t } = useUI();
  return (
    <View style={{ gap: space.xs }}>
      <Txt nativeID={`${id}-label`} variant="secondary" weight="500">
        {label}
      </Txt>
      <TextInput
        ref={ref}
        nativeID={id}
        accessibilityLabel={label}
        {...webAria({
          "aria-invalid": error ? true : undefined,
          "aria-describedby": describedBy(id, error, help),
        })}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.muted}
        keyboardType={number ? "decimal-pad" : "default"}
        inputMode={number ? "decimal" : "text"}
        multiline={multiline}
        autoFocus={autoFocus}
        maxLength={maxLength ?? (multiline ? 500 : 120)}
        style={{
          fontFamily,
          ...type.body,
          color: t.ink,
          minHeight: multiline ? 88 : 52,
          paddingHorizontal: 14,
          paddingVertical: 14,
          borderWidth: error ? 2 : 1,
          borderColor: error ? t.ink : t.control,
          borderRadius: radius.md,
          backgroundColor: t.raised,
          textAlignVertical: multiline ? "top" : "center",
        }}
      />
      <FieldMessages id={id} error={error} help={help} />
    </View>
  );
});

const validDate = (v: string) => {
  try {
    assertDate(v);
    return true;
  } catch {
    return false;
  }
};

/** Fecha con selector secuencial de cinco columnas (no es un calendario por
 * semanas: a 320 px siete columnas quedarían por debajo de 48 px por día) y
 * escritura manual AAAA-MM-DD. Lee fecha humana; guarda AAAA-MM-DD. */
export const DateField = forwardRef<
  View,
  {
    id: string;
    label: string;
    value: string;
    onChange: (v: string) => void;
    optional?: boolean;
    max?: string;
    error?: string;
    help?: string;
    startOpen?: boolean;
  }
>(function DateField(
  { id, label, value, onChange, optional, max, error, help, startOpen = false },
  ref,
) {
  const { t } = useUI();
  const today = todayLocal();
  const valid = validDate(value);
  const [open, setOpen] = useState(startOpen);
  const [manual, setManual] = useState(false);
  const [month, setMonth] = useState(
    valid ? value.slice(0, 7) : today.slice(0, 7),
  );
  useEffect(() => {
    if (valid) setMonth(value.slice(0, 7));
  }, [value, valid]);
  const count = Number(endOfMonth(month).slice(-2));
  const shown = valid
    ? fullDate(value)
    : value
      ? "Fecha incompleta"
      : optional
        ? "Sin fecha"
        : "Elegir fecha";
  return (
    <View style={{ gap: space.xs }}>
      <Txt variant="secondary" weight="500">
        {label}
      </Txt>
      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${valid ? longDate(value) : shown.toLowerCase()}. Cambiar fecha`}
        accessibilityState={{ expanded: open }}
        {...webAria({
          "aria-invalid": error ? true : undefined,
          "aria-describedby": describedBy(id, error, help),
        })}
        onPress={() => setOpen(!open)}
        style={({ pressed }) => ({
          minHeight: 52,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: space.sm,
          paddingHorizontal: 14,
          borderRadius: radius.md,
          borderWidth: error ? 2 : 1,
          borderColor: error ? t.ink : t.control,
          backgroundColor: pressed ? t.surface : t.raised,
        })}
      >
        <Txt variant="body" tone={valid ? "primary" : "muted"}>
          {shown}
        </Txt>
        <Icon
          name={open ? "chevronUp" : "calendar"}
          size={size.icon}
          color={t.ink}
        />
      </Pressable>
      <FieldMessages id={id} error={error} help={help} />
      {open && (
        <View style={{ gap: space.sm, paddingTop: space.xxs }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <IconButton
              label="Mes anterior del selector"
              icon="chevronLeft"
              onPress={() => setMonth(changeMonth(month, -1))}
            />
            <Txt
              variant="secondary"
              weight="600"
              align="center"
              accessibilityLiveRegion="polite"
              style={{ flex: 1 }}
            >
              {monthName(month)} {month.slice(0, 4)}
            </Txt>
            <IconButton
              label="Mes siguiente del selector"
              icon="chevronRight"
              onPress={() => setMonth(changeMonth(month, 1))}
            />
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {Array.from({ length: count }, (_, i) => {
              const date = `${month}-${String(i + 1).padStart(2, "0")}`;
              const selected = date === value;
              const disabled = !!max && date > max;
              const isToday = date === today;
              return (
                <View key={date} style={{ width: "20%", padding: 2 }}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${longDate(date)}${isToday ? ", hoy" : ""}`}
                    accessibilityState={{ selected, disabled }}
                    disabled={disabled}
                    onPress={() => {
                      onChange(date);
                      setOpen(false);
                      setManual(false);
                    }}
                    style={({ pressed }) => ({
                      minHeight: size.touch,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: radius.sm,
                      borderWidth: isToday && !selected ? 1 : 0,
                      borderColor: t.control,
                      backgroundColor: selected
                        ? t.strong
                        : pressed
                          ? t.surface
                          : "transparent",
                      opacity: disabled ? 0.35 : 1,
                    })}
                  >
                    <Txt
                      variant="secondary"
                      weight={selected || isToday ? "600" : "400"}
                      tone={selected ? "inverse" : "primary"}
                    >
                      {i + 1}
                    </Txt>
                  </Pressable>
                </View>
              );
            })}
          </View>
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", gap: space.xs }}
          >
            {(!max || today <= max) && (
              <Button
                compact
                variant="secondary"
                label="Hoy"
                onPress={() => {
                  onChange(today);
                  setOpen(false);
                }}
              />
            )}
            {optional && (
              <Button
                compact
                variant="secondary"
                label="Sin fecha"
                onPress={() => {
                  onChange("");
                  setOpen(false);
                }}
              />
            )}
            <Button
              compact
              variant="secondary"
              label="Escribir fecha"
              expanded={manual}
              onPress={() => setManual(!manual)}
            />
          </View>
          {manual && (
            <View style={{ gap: space.xs }}>
              <TextInput
                accessibilityLabel={`${label}, formato año-mes-día`}
                value={value}
                onChangeText={onChange}
                placeholder="AAAA-MM-DD"
                placeholderTextColor={t.muted}
                maxLength={10}
                inputMode="numeric"
                style={{
                  fontFamily,
                  ...type.body,
                  color: t.ink,
                  minHeight: 52,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: t.control,
                  borderRadius: radius.md,
                }}
              />
              <Txt variant="meta" tone="muted">
                {valid
                  ? `Se leerá como ${longDate(value)}.`
                  : "Formato AAAA-MM-DD, entre 1900 y 2100."}
              </Txt>
            </View>
          )}
        </View>
      )}
    </View>
  );
});

/** Atajos Hoy/Ayer/Otra fecha para fechas de pago y gasto. */
export function QuickDate({
  id,
  label,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const today = todayLocal();
  const yesterday = (() => {
    const d = new Date(today + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  })();
  const [other, setOther] = useState(value !== today && value !== yesterday);
  const choice = other
    ? "other"
    : value === today
      ? "today"
      : value === yesterday
        ? "yesterday"
        : "other";
  const { t } = useUI();
  return (
    <View style={{ gap: space.xs }}>
      <Txt variant="secondary" weight="500">
        {label}
      </Txt>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={label}
        style={{ flexDirection: "row", flexWrap: "wrap", gap: space.xs }}
      >
        {(
          [
            ["today", `Hoy · ${dayMonth(today)}`, `Hoy, ${longDate(today)}`],
            [
              "yesterday",
              `Ayer · ${dayMonth(yesterday)}`,
              `Ayer, ${longDate(yesterday)}`,
            ],
            [
              "other",
              choice === "other" &&
              validDate(value) &&
              daysBetween(value, today) > 1
                ? fullDate(value)
                : "Otra fecha",
              "Otra fecha",
            ],
          ] as const
        ).map(([key, text, a11y]) => {
          const selected = choice === key;
          return (
            <Pressable
              key={key}
              accessibilityRole="radio"
              accessibilityLabel={a11y}
              accessibilityState={{ checked: selected }}
              onPress={() => {
                if (key === "today") {
                  setOther(false);
                  onChange(today);
                } else if (key === "yesterday") {
                  setOther(false);
                  onChange(yesterday);
                } else setOther(true);
              }}
              style={({ pressed }) => ({
                minHeight: size.touch,
                justifyContent: "center",
                paddingHorizontal: 14,
                borderRadius: radius.pill,
                borderWidth: 1,
                borderColor: selected ? t.strong : t.control,
                backgroundColor: selected
                  ? t.strong
                  : pressed
                    ? t.surface
                    : "transparent",
              })}
            >
              <Txt
                variant="secondary"
                weight={selected ? "600" : "400"}
                tone={selected ? "inverse" : "primary"}
              >
                {text}
              </Txt>
            </Pressable>
          );
        })}
      </View>
      {other && (
        <DateField
          id={id}
          label="Fecha"
          value={value}
          onChange={onChange}
          max={today}
          startOpen
          error={error}
        />
      )}
      {!other && error ? <FieldMessages id={id} error={error} /> : null}
    </View>
  );
}

/** Búsqueda con etiqueta visible para lectores y botón para limpiar. */
export function SearchField({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
}) {
  const { t } = useUI();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: space.xs,
        minHeight: size.touch,
        paddingLeft: space.sm,
        borderWidth: 1,
        borderColor: t.control,
        borderRadius: radius.pill,
      }}
    >
      <Icon name="search" size={size.icon} color={t.muted} />
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.muted}
        inputMode="search"
        style={{
          flex: 1,
          minWidth: 0,
          fontFamily,
          ...type.bodySm,
          color: t.ink,
          paddingVertical: 12,
        }}
      />
      {value ? (
        <IconButton
          label="Limpiar búsqueda"
          icon="close"
          onPress={() => onChangeText("")}
        />
      ) : null}
    </View>
  );
}
