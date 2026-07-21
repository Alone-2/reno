import { NotebookPen } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { ProjectSwitcher } from "./components/ProjectSwitcher";
import { APP_NAV } from "./nav";
import { cn } from "@/lib/utils";

const SIDEBAR_W = "w-52";

function navClassName({ isActive }: { isActive: boolean }) {
  return cn(
    "relative flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    isActive
      ? "bg-card text-primary shadow-[inset_2px_0_0_var(--color-primary)]"
      : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
  );
}

export function AppShell() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        跳到主要内容
      </a>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden border-r border-border bg-secondary px-3 py-4 md:flex md:flex-col",
          SIDEBAR_W,
        )}
        data-testid="desktop-sidebar"
      >
        <div className="mb-5 shrink-0 px-3 py-2">
          <p className="text-base font-bold tracking-tight">
            Reno <span className="text-primary">Nest</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">暖巢 · 装修管家</p>
        </div>
        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto" aria-label="主导航">
          {APP_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.end} className={navClassName}>
                <Icon aria-hidden="true" className="size-[18px] shrink-0" strokeWidth={1.8} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="min-h-dvh min-w-0 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0 md:pl-52">
        <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur-md">
          <div className="mx-auto flex min-h-16 max-w-[1200px] items-center justify-between gap-3 px-4 md:px-6">
            <ProjectSwitcher />
            <Link
              to="/progress"
              className="hidden min-h-10 shrink-0 items-center gap-2 rounded-[10px] bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:inline-flex"
            >
              <NotebookPen aria-hidden="true" className="size-4" />
              记施工日志
            </Link>
          </div>
        </header>

        <main id="main-content" className="mx-auto max-w-[1200px] p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
        aria-label="底部导航"
        data-testid="mobile-tabbar"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5 gap-1 px-2 py-1.5">
          {APP_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to} className="min-w-0">
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive
                        ? "font-semibold text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )
                  }
                >
                  <Icon aria-hidden="true" className="size-[19px]" strokeWidth={1.8} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
