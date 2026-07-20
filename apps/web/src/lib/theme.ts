/**
 * Nest（暖巢）主题 token — 与 docs/DESIGN.md 对齐
 * 单源：测试断言 + 文档；CSS @theme 须同步同色值。
 */
export const nestTokens = {
  /** 米纸底 */
  background: "#FAF8F5",
  /** 正文墨色 */
  foreground: "#1C1917",
  /** 主交互青绿 */
  primary: "#0F766E",
  primaryForeground: "#FFFFFF",
  /** 卡片白 */
  card: "#FFFFFF",
  cardForeground: "#1C1917",
  /** 次要 / 说明 */
  muted: "#F5F0E8",
  mutedForeground: "#78716C",
  /** 边框浅石 */
  border: "#E7E5E4",
  input: "#E7E5E4",
  ring: "#0F766E",
  secondary: "#F5F0E8",
  secondaryForeground: "#1C1917",
  accent: "#ECFDF5",
  accentForeground: "#0F766E",
  destructive: "#DC2626",
  destructiveForeground: "#FFFFFF",
  /** 语义 */
  success: "#15803D",
  warning: "#D97706",
  danger: "#DC2626",
  /** 圆角 */
  radius: "0.75rem",
} as const;

export type NestTokenKey = keyof typeof nestTokens;
