export const themes = {
  light: {
    bg: "#FFFFFF",
    surface: "#F5F5F5",
    inset: "#FAFAFA",
    ink: "#171717",
    muted: "#686868",
    faint: "#686868",
    line: "#E7E7E7",
    control: "#858585",
    strong: "#171717",
    onStrong: "#FFFFFF",
  },
  dark: {
    bg: "#111111",
    surface: "#202020",
    inset: "#191919",
    ink: "#F5F5F5",
    muted: "#ABABAB",
    faint: "#ABABAB",
    line: "#333333",
    control: "#777777",
    strong: "#F5F5F5",
    onStrong: "#111111",
  },
};
export type Theme = typeof themes.light;
