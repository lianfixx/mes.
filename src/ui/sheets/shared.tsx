import React, { useEffect, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { Currency, currencies } from "../../domain/model";
import { useApp } from "../../app/context";
import { Button, Txt, focusElement, useUI } from "../components";
import { Icon } from "../icons";
import { radius, size, space } from "../tokens";

const currencyName: Record<Currency, string> = {
  MXN: "Peso mexicano",
  USD: "Dólar estadounidense",
  EUR: "Euro",
};

/** Registro de referencias por campo: al aparecer un error con campo, lleva el
 * foco (web) o el foco de accesibilidad (nativo) a ese campo. */
export function useFieldRefs(onDetailsField?: (field: string) => void) {
  const map = useRef<Record<string, unknown>>({});
  const { error } = useApp();
  useEffect(() => {
    if (!error?.field) return;
    onDetailsField?.(error.field);
    const id = setTimeout(() => focusElement(map.current[error.field!]), 80);
    return () => clearTimeout(id);
  }, [error]);
  return (name: string) => (node: unknown) => {
    map.current[name] = node;
  };
}

/** Mensaje de error asociado a un campo, o undefined. */
export function useFieldError() {
  const { error } = useApp();
  return (name: string) => (error?.field === name ? error.message : undefined);
}

/** Selector explícito de moneda. Cambiarla nunca convierte importes. */
export function CurrencyPicker({
  value,
  onChange,
  label = "Moneda",
  plain = false,
}: {
  value: Currency;
  onChange: (c: Currency) => void;
  label?: string;
  plain?: boolean;
}) {
  const { t, reduceMotion } = useUI();
  const [open, setOpen] = useState(false);
  return (
    <View>
      <Button
        variant={plain ? "plain" : "secondary"}
        compact
        label={value}
        iconRight="chevronDown"
        accessibilityLabel={`${label}: ${value}, ${currencyName[value]}. Cambiar`}
        onPress={() => setOpen(true)}
      />
      <Modal
        visible={open}
        transparent
        accessibilityLabel="Elegir moneda"
        animationType={reduceMotion ? "none" : "fade"}
        onRequestClose={() => setOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: t.scrim,
            alignItems: "center",
            justifyContent: "center",
            padding: space.lg,
          }}
        >
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            onStartShouldSetResponder={() => true}
            onResponderRelease={() => setOpen(false)}
          />
          <ScrollView
            style={{
              width: "100%",
              maxWidth: 380,
              maxHeight: "100%",
              flexGrow: 0,
            }}
            contentContainerStyle={{
              backgroundColor: t.raised,
              borderRadius: radius.lg,
              padding: space.lg,
              gap: space.sm,
            }}
          >
            <Txt accessibilityRole="header" variant="heading" weight="600">
              Elegir moneda
            </Txt>
            <Txt variant="secondary" tone="muted">
              Cambiar la moneda no convierte importes. Cada moneda se ve y se
              suma por separado.
            </Txt>
            <View
              accessibilityRole="radiogroup"
              accessibilityLabel="Moneda"
              style={{ gap: space.xs }}
            >
              {currencies.map((c) => {
                const selected = c === value;
                return (
                  <Pressable
                    key={c}
                    accessibilityRole="radio"
                    aria-checked={selected}
                    accessibilityLabel={`${c}, ${currencyName[c]}`}
                    onPress={() => {
                      onChange(c);
                      setOpen(false);
                    }}
                    style={({ pressed }) => ({
                      flexDirection: "row",
                      alignItems: "center",
                      gap: space.sm,
                      minHeight: size.touch,
                      paddingHorizontal: space.md,
                      borderRadius: radius.md,
                      borderWidth: selected ? 2 : 1,
                      borderColor: selected ? t.strong : t.control,
                      backgroundColor: pressed ? t.surface : "transparent",
                    })}
                  >
                    <Txt variant="body" weight="600" style={{ width: 44 }}>
                      {c}
                    </Txt>
                    <Txt variant="secondary" tone="muted" style={{ flex: 1 }}>
                      {currencyName[c]}
                    </Txt>
                    {selected ? (
                      <Icon name="check" size={size.icon} color={t.ink} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
            <Button
              variant="secondary"
              label="Cerrar"
              onPress={() => setOpen(false)}
              fullWidth
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
