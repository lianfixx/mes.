import React, { createContext, useContext } from "react";
import { Platform } from "react-native";
import { Theme, themes } from "../tokens";

export interface UI {
  t: Theme;
  dark: boolean;
  reduceMotion: boolean;
  /** Ancho efectivo: ancho de ventana / escala de texto. */
  width: number;
  height: number;
  narrow: boolean; // < 380
  tablet: boolean; // ≥ 600
  desktop: boolean; // ≥ 960
  wide: boolean; // ≥ 1200
}

export const UIContext = createContext<UI>({
  t: themes.light,
  dark: false,
  reduceMotion: false,
  width: 390,
  height: 844,
  narrow: false,
  tablet: false,
  desktop: false,
  wide: false,
});
export const useUI = () => useContext(UIContext);

/** Atributos ARIA que React Native no tipa pero react-native-web sí aplica. */
export function webAria(attrs: Record<string, string | boolean | undefined>) {
  if (Platform.OS !== "web") return {};
  const out: Record<string, string | boolean> = {};
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined) out[k] = v;
  return out as object;
}
