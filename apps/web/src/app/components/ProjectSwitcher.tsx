import { PROJECT_STATUS_LABEL } from "@reno/shared";
import { ChevronDown } from "lucide-react";
import { mockProjects } from "@/mocks/project-overview";
import { useProjectSession } from "@/stores/project-session";
import { cn } from "@/lib/utils";

const STATUS_CLASS = {
  planning: "bg-muted text-muted-foreground",
  purchasing: "bg-info-soft text-info",
  constructing: "bg-warning-soft text-warning",
  accepting: "bg-warning-soft text-warning",
  done: "bg-success-soft text-success",
  archived: "bg-muted text-muted-foreground",
} as const;

export function ProjectSwitcher() {
  const currentProjectId = useProjectSession((s) => s.currentProjectId);
  const setCurrentProjectId = useProjectSession((s) => s.setCurrentProjectId);
  const current =
    mockProjects.find((project) => project.id === currentProjectId) ?? mockProjects[0]!;

  return (
    <section aria-label="当前装修项目" className="flex min-w-0 items-center gap-2 sm:gap-3">
      <div className="relative min-w-0">
        <label htmlFor="project-select" className="sr-only">
          切换装修项目
        </label>
        <select
          id="project-select"
          data-testid="project-select"
          value={currentProjectId}
          onChange={(event) => setCurrentProjectId(event.target.value)}
          className="h-10 max-w-[210px] cursor-pointer appearance-none truncate rounded-[10px] border border-border bg-card py-0 pl-3 pr-9 text-sm font-semibold text-foreground outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:max-w-[280px]"
        >
          {mockProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
      </div>
      <span
        className={cn(
          "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold",
          STATUS_CLASS[current.status],
        )}
      >
        {PROJECT_STATUS_LABEL[current.status]}
      </span>
    </section>
  );
}
