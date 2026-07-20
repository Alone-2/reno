import type { Space } from "@reno/shared";
import { getSpacesForProject } from "@/mocks/project-overview";
import { useProjectSession } from "@/stores/project-session";

export function SpacesPage({ spaces, empty = false }: { spaces?: Space[]; empty?: boolean }) {
  const projectId = useProjectSession((s) => s.currentProjectId);
  const list = empty ? [] : (spaces ?? getSpacesForProject(projectId));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">空间</h1>
      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">还没有空间，先加一个客厅或卧室吧</p>
          <button
            type="button"
            className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            添加空间
          </button>
        </div>
      ) : (
        <ul className="space-y-2" data-testid="space-list">
          {list.map((s) => (
            <li
              key={s.id}
              className="rounded-2xl border border-border bg-card p-4"
              data-project-id={s.projectId}
            >
              <p className="font-medium">{s.name}</p>
              {s.areaSqm != null ? (
                <p className="mt-1 text-sm text-muted-foreground">{s.areaSqm} ㎡</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
