import React, { useState } from "react";
import { Platform, Text, TextProps, View } from "react-native";
import { Currency } from "../../domain/model";
import { fitFontSize, formatMoney, moneyParts, spokenMoney } from "../format";
import { TypeVariant, fontFamily, type } from "../tokens";
import { useUI } from "./theme";

type Weight = "400" | "500" | "600" | "700";
export interface TxtProps extends TextProps {
  variant?: TypeVariant;
  tone?: "primary" | "muted" | "inverse";
  weight?: Weight;
  align?: "left" | "right" | "center";
}

/** Texto con la escala tipográfica y cifras tabulares. */
export function Txt({
  variant = "bodySm",
  tone = "primary",
  weight = "400",
  align,
  style,
  children,
  ...rest
}: TxtProps) {
  const { t } = useUI();
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily,
          ...type[variant],
          fontWeight: weight,
          fontVariant: ["tabular-nums"],
          color:
            tone === "muted"
              ? t.muted
              : tone === "inverse"
                ? t.onStrong
                : t.ink,
          textAlign: align,
          flexShrink: 1,
          minWidth: 0,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

/** Importe con moneda explícita. En modo `fit` mide su contenedor y reduce el
 * tamaño para que la cifra quepa completa en una línea, sin recortarla. */
export function MoneyText({
  amount,
  currency,
  variant = "bodySm",
  weight = "500",
  sign = "auto",
  fit = false,
  minSize = 18,
  smallCents = false,
  tone,
  align,
  style,
}: {
  amount: number;
  currency: Currency;
  variant?: TypeVariant;
  weight?: Weight;
  sign?: "auto" | "always";
  fit?: boolean;
  minSize?: number;
  smallCents?: boolean;
  tone?: TxtProps["tone"];
  align?: TxtProps["align"];
  style?: TextProps["style"];
}) {
  const [available, setAvailable] = useState(0);
  const text = formatMoney(amount, currency, sign);
  const base = type[variant];
  const fontSize = fit
    ? fitFontSize(text, available, base.fontSize, minSize)
    : base.fontSize;
  const lineHeight = Math.round(fontSize * (base.lineHeight / base.fontSize));
  const parts = moneyParts(amount, currency);
  const content = smallCents ? (
    <>
      {sign === "always" && amount > 0 ? "+" : parts.sign}
      {parts.whole}
      <Text style={{ fontSize: Math.round(fontSize * 0.6) }}>
        {parts.cents}
      </Text>
    </>
  ) : (
    text
  );
  const label =
    Platform.OS === "web"
      ? {}
      : { accessibilityLabel: spokenMoney(amount, currency) };
  const node = (
    <Txt
      {...label}
      variant={variant}
      weight={weight}
      tone={tone}
      align={align}
      style={[
        { fontSize, lineHeight, letterSpacing: fontSize > 28 ? -0.8 : 0 },
        style,
      ]}
    >
      {content}
    </Txt>
  );
  if (!fit) return node;
  return (
    <View
      style={{ alignSelf: "stretch", minWidth: 0 }}
      onLayout={(e) => setAvailable(Math.floor(e.nativeEvent.layout.width))}
    >
      {node}
    </View>
  );
}
