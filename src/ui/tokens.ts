// Tokens semánticos de Mes 0.1.3. Valores documentados en docs/DESIGN.md con sus
// contrastes medidos. La interfaz es monocroma: los estados se expresan con
// palabras, iconos y forma, nunca solo con color.
import { Platform } from "react-native";

export const themes = {
  light: {
    bg: "#FFFFFF", // página
    raised: "#FFFFFF", // hoja/modal
    surface: "#F5F5F5", // agrupación sutil, pista de barras, pulsado
    ink: "#171717", // texto principal (17.93:1 sobre bg)
    muted: "#686868", // texto secundario y de ayuda (5.57:1 bg · 5.11:1 surface)
    control: "#858585", // borde necesario para reconocer un control (3.69:1 bg)
    divider: "#E7E7E7", // separador decorativo (no transmite información)
    strong: "#171717", // relleno de acción primaria y selección
    onStrong: "#FFFFFF",
    focus: "#171717", // anillo de foco (17.93:1 bg)
    scrim: "rgba(0,0,0,0.40)",
    shadow: "#000000",
  },
  dark: {
    bg: "#111111",
    raised: "#191919",
    surface: "#202020",
    ink: "#F5F5F5", // 17.32:1 bg · 16.13:1 raised
    muted: "#ABABAB", // 8.22:1 bg · 7.66:1 raised · 7.10:1 surface
    control: "#777777", // 4.22:1 bg · 3.93:1 raised · 3.64:1 surface
    divider: "#333333",
    strong: "#F5F5F5",
    onStrong: "#111111",
    focus: "#F5F5F5",
    scrim: "rgba(0,0,0,0.62)",
    shadow: "#000000",
  },
};
export type Theme = typeof themes.light;

/** Escala de espacio. Las excepciones ópticas se documentan en DESIGN.md. */
export const space = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/** Escala tipográfica. 12 solo para información prescindible. */
export const type = {
  display: { fontSize: 40, lineHeight: 46 },
  displayWide: { fontSize: 52, lineHeight: 58 },
  title: { fontSize: 28, lineHeight: 34 },
  titleWide: { fontSize: 36, lineHeight: 42 },
  amount: { fontSize: 30, lineHeight: 36 },
  heading: { fontSize: 20, lineHeight: 26 },
  body: { fontSize: 16, lineHeight: 22 },
  bodySm: { fontSize: 15, lineHeight: 21 },
  secondary: { fontSize: 14, lineHeight: 20 },
  meta: { fontSize: 13, lineHeight: 18 },
  caption: { fontSize: 12, lineHeight: 16 },
} as const;
export type TypeVariant = keyof typeof type;

export const radius = { sm: 8, md: 12, lg: 20, pill: 999 } as const;

export const size = {
  /** Objetivo táctil de producto en todas las plataformas. */
  touch: 48,
  icon: 20,
  iconSm: 16,
  iconLg: 24,
  sidebar: 240,
  readable: 720,
  content: 1080,
} as const;

/** Duraciones de partida, sujetas a prueba. Con movimiento reducido: 0. */
export const motion = { fast: 160, base: 200 } as const;

/** Puntos de quiebre sobre el ancho efectivo (ancho / escala de texto). */
export const breakpoints = {
  narrow: 380,
  tablet: 600,
  desktop: 960,
  wide: 1200,
} as const;

export const fontFamily =
  Platform.OS === "web"
    ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    : undefined;
