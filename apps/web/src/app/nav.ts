export const APP_NAV = [
  { to: "/", label: "总览", end: true },
  { to: "/spaces", label: "空间", end: false },
  { to: "/materials", label: "建材", end: false },
  { to: "/progress", label: "进度", end: false },
  { to: "/cost", label: "成本", end: false },
] as const;

export type AppNavItem = (typeof APP_NAV)[number];
