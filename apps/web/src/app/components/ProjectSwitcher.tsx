import { PROJECT_STATUS_LABEL } from "@reno/shared";
import { mockProjects } from "@/mocks/project-overview";
import { useProjectSession } from "@/stores/project-session";
import { cn } from "@/lib/utils";

export function ProjectSwitcher() {
  const currentProjectId = useProjectSession((s) => s.currentProjectId);
  const setCurrentProjectId = useProjectSession((s) => s.setCurrentProjectId);

  return (
    <section aria-labelledby="project-switcher-heading" className="space-y-3">
      <h2 id="project-switcher-heading" className="text-base font-semibold">
        我的项目
      </h2>
      <ul className="space-y-2" data-testid="project-list">
        {mockProjects.map((p) => {
          const active = p.id === currentProjectId;
          return (
            <li key={p.id}>
              <button
                type="button"
                data-testid={`project-item-${p.id}`}
                data-active={active ? "true" : "false"}
                aria-current={active ? "true" : undefined}
                onClick={() => setCurrentProjectId(p.id)}
                className={cn(
                  "w-full rounded-2xl border p-4 text-left transition-colors",
                  active
                    ? "border-primary bg-accent text-accent-foreground"
                    : "border-border bg-card hover:bg-muted/60",
                )}
              >
                <p className="font-medium">{p.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {PROJECT_STATUS_LABEL[p.status]}
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
