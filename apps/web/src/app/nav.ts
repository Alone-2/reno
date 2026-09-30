import {
  ChartNoAxesColumnIncreasing,
  CircleDollarSign,
  House,
  LayoutGrid,
  ListTodo,
  PackageOpen,
} from "lucide-react";

export const APP_NAV = [
  { to: "/", label: "总览", end: true, icon: House, mobile: true },
  { to: "/todos", label: "待办", end: false, icon: ListTodo, mobile: true },
  { to: "/spaces", label: "空间", end: false, icon: LayoutGrid, mobile: false },
  { to: "/materials", label: "建材", end: false, icon: PackageOpen, mobile: true },
  { to: "/progress", label: "进度", end: false, icon: ChartNoAxesColumnIncreasing, mobile: true },
  { to: "/cost", label: "成本", end: false, icon: CircleDollarSign, mobile: true },
] as const;

export type AppNavItem = (typeof APP_NAV)[number];
