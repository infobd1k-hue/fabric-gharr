const palette = {
  bg: "#0f0f13",
  surface: "#1a1a22",
  surface2: "#22222e",
  border: "#2e2e3e",
  accent: "#f5a623",
  accent2: "#e85d75",
  green: "#2ecc71",
  red: "#e74c3c",
  blue: "#3498db",
  text: "#f0f0f5",
  text2: "#9090aa",
};

const shared = {
  text: palette.text,
  tint: palette.accent,

  background: palette.bg,
  foreground: palette.text,

  card: palette.surface,
  cardForeground: palette.text,
  cardElevated: palette.surface2,

  primary: palette.accent,
  primaryForeground: "#000000",

  secondary: palette.surface2,
  secondaryForeground: palette.text,

  muted: palette.surface2,
  mutedForeground: palette.text2,

  accent: palette.accent,
  accentForeground: "#000000",
  accent2: palette.accent2,

  destructive: palette.red,
  destructiveForeground: "#ffffff",

  success: palette.green,
  warning: palette.accent,
  info: palette.blue,

  border: palette.border,
  input: palette.surface2,
};

const colors = {
  light: shared,
  dark: shared,
  radius: 12,
};

export default colors;
