import type { Space } from "@reno/shared";
import { LayoutGrid, Plus, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSpacesForProject } from "@/mocks/project-overview";
import { useProjectSession } from "@/stores/project-session";

export function SpacesPage({ spaces, empty = false }: { spaces?: Space[]; empty?: boolean }) {
  const projectId = useProjectSession((s) => s.currentProjectId);
  const list = empty ? [] : (spaces ?? getSpacesForProject(projectId));

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.02em]">空间</h1>
          <p className="mt-1 text-sm text-muted-foreground">按房间整理尺寸、建材与装修注意事项</p>
        </div>
        {list.length > 0 ? (
          <Button type="button" className="hidden gap-2 sm:inline-flex">
            <Plus aria-hidden="true" className="size-4" />
            添加空间
          </Button>
        ) : null}
      </header>
      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-strong bg-card px-6 py-12 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-primary">
            <LayoutGrid aria-hidden="true" className="size-6" />
          </span>
          <p className="mt-4 font-semibold">还没有空间</p>
          <p className="mt-1 text-sm text-muted-foreground">先从客厅、卧室或厨房开始整理吧</p>
          <Button type="button" className="mt-5 gap-2">
            <Plus aria-hidden="true" className="size-4" />
            添加空间
          </Button>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-testid="space-list">
          {list.map((s) => (
            <li
              key={s.id}
              className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-border-strong"
              data-project-id={s.projectId}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{s.name}</p>
                <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-semibold text-muted-foreground">
                  空间
                </span>
              </div>
              {s.areaSqm != null ? (
                <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Ruler aria-hidden="true" className="size-4" />
                  <span className="tabular-nums">{s.areaSqm} ㎡</span>
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
