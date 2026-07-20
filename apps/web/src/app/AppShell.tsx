import { NavLink, Outlet } from "react-router-dom";
import { APP_NAV } from "./nav";
import { cn } from "@/lib/utils";

const SIDEBAR_W = "w-56"; // 14rem — 与 md:pl-56 同步

function navClassName({ isActive }: { isActive: boolean }) {
  return cn(
    "rounded-xl px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
  );
}

export function AppShell() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* PC：左侧固定导航，不随主内容滚动 */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden border-r border-border bg-background p-4 md:flex md:flex-col",
          SIDEBAR_W,
        )}
        data-testid="desktop-sidebar"
      >
        <div className="mb-6 shrink-0 px-2">
          <p className="text-lg font-semibold tracking-tight">暖巢 Reno</p>
          <p className="text-xs text-muted-foreground">业主装修管家</p>
        </div>
        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto" aria-label="主导航">
          {APP_NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navClassName}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* 主内容：md 起为侧栏留白；仅此区域随页面滚动 */}
      <div className={cn("min-h-screen min-w-0 pb-20 md:pb-0 md:pl-56")}>
        <main className="mx-auto max-w-4xl p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* 移动：底栏固定 */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur md:hidden"
        aria-label="底部导航"
        data-testid="mobile-tabbar"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5 gap-1 px-2 py-2">
          {APP_NAV.map((item) => (
            <li key={item.to} className="min-w-0">
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center justify-center rounded-lg px-1 py-2 text-xs font-medium",
                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                  )
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
