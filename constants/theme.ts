/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, Nativewind, Tamagui, unistyles, etc.
 */

import { Platform } from "react-native";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export type ThemeMode = "light" | "dark";

export type AppTheme = {
  mode: ThemeMode;

  // Surfaces
  background: string;
  card: string;
  inputBg: string;

  // Text
  text: string;
  textMuted: string;
  label: string;
  placeholder: string;

  // Borders
  border: string;

  // Primary
  primary: string;
  primaryText: string;

  // States
  success: string;
  danger: string;

  // Overlays / modals
  overlay: string;

  // Accents (outlined buttons)
  accentGreen: string;
  accentGreenText: string;

  accentBlue: string;
  accentBlueText: string;

  accentOrange: string;
  accentOrangeText: string;

  accentSky: string;
  accentSkyText: string;

  accentPurple: string;
  accentPurpleText: string;

  accentRed: string;
  accentRedText: string;

  // Dropdown selected bg
  dropdownSelectedBg: string;
};

export const AppThemes: Record<ThemeMode, AppTheme> = {
  dark: {
    mode: "dark",

    background: "#050816",
    card: "#020617",
    inputBg: "#0b1120",

    text: "#f9fafb",
    textMuted: "#9ca3af",
    label: "#9ca3af",
    placeholder: "#6b7280",

    border: "#1f2937",

    primary: "#10b981",
    primaryText: "#ecfeff",

    success: "#4ade80",
    danger: "#f97373",

    overlay: "rgba(0,0,0,0.7)",

    accentGreen: "#10b981",
    accentGreenText: "#10b981",

    accentBlue: "#3b82f6",
    accentBlueText: "#bfdbfe",

    accentOrange: "#f97316",
    accentOrangeText: "#fed7aa",

    accentSky: "#38bdf8",
    accentSkyText: "#e0f2fe",

    accentPurple: "#a855f7",
    accentPurpleText: "#f3e8ff",

    accentRed: "#ef4444",
    accentRedText: "#fecaca",

    dropdownSelectedBg: "#065f46",
  },

  light: {
    mode: "light",

    background: "#f6f7fb",
    card: "#ffffff",
    inputBg: "#f1f5f9",

    text: "#0f172a",
    textMuted: "#475569",
    label: "#334155",
    placeholder: "#94a3b8",

    border: "#cbd5e1",

    primary: "#10b981",
    primaryText: "#ffffff",

    success: "#16a34a",
    danger: "#dc2626",

    overlay: "rgba(15, 23, 42, 0.35)",

    accentGreen: "#059669",
    accentGreenText: "#047857",

    accentBlue: "#2563eb",
    accentBlueText: "#1d4ed8",

    accentOrange: "#ea580c",
    accentOrangeText: "#c2410c",

    accentSky: "#0284c7",
    accentSkyText: "#0369a1",

    accentPurple: "#7c3aed",
    accentPurpleText: "#6d28d9",

    accentRed: "#dc2626",
    accentRedText: "#b91c1c",

    dropdownSelectedBg: "#d1fae5",
  },
};

export function getAppTheme(mode: ThemeMode): AppTheme {
  return AppThemes[mode] ?? AppThemes.dark;
}
