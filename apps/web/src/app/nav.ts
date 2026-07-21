import {
  ChartNoAxesColumnIncreasing,
  CircleDollarSign,
  House,
  LayoutGrid,
  PackageOpen,
} from "lucide-react";

export const APP_NAV = [
  { to: "/", label: "总览", end: true, icon: House },
  { to: "/spaces", label: "空间", end: false, icon: LayoutGrid },
  { to: "/materials", label: "建材", end: false, icon: PackageOpen },
  { to: "/progress", label: "进度", end: false, icon: ChartNoAxesColumnIncreasing },
  { to: "/cost", label: "成本", end: false, icon: CircleDollarSign },
] as const;

export type AppNavItem = (typeof APP_NAV)[number];
