import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { renoApi, type ApiProject } from "@/lib/reno-api";
import { useProjectSession } from "@/stores/project-session";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  planning: "规划中",
  active: "进行中",
  accepting: "完工确认",
  done: "已完成",
  archived: "已归档",
};

const STATUS_CLASS: Record<string, string> = {
  planning: "bg-muted text-muted-foreground",
  active: "bg-warning-soft text-warning",
  accepting: "bg-warning-soft text-warning",
  done: "bg-success-soft text-success",
  archived: "bg-muted text-muted-foreground",
};

function projectName(project: ApiProject): string {
  return project.name || project.scope || `装修项目 ${project.id.slice(0, 8)}`;
}

export function ProjectSwitcher() {
  const currentProjectId = useProjectSession((s) => s.currentProjectId);
  const setCurrentProjectId = useProjectSession((s) => s.setCurrentProjectId);
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void renoApi
      .projects()
      .then((items) => {
        if (!active) return;
        setProjects(items);
        if (!currentProjectId && items[0]) setCurrentProjectId(items[0].id);
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : "项目加载失败");
      });
    return () => {
      active = false;
    };
  }, [currentProjectId, setCurrentProjectId]);

  const current = projects.find((project) => project.id === currentProjectId) ?? projects[0];
  if (!current) return <p className="text-sm text-muted-foreground">{error || "正在加载项目…"}</p>;

  return (
    <section aria-label="当前装修项目" className="flex min-w-0 items-center gap-2 sm:gap-3">
      <div className="relative min-w-0">
        <label htmlFor="project-select" className="sr-only">
          选择装修项目
        </label>
        <select
          id="project-select"
          data-testid="project-select"
          value={currentProjectId || current.id}
          onChange={(event) => setCurrentProjectId(event.target.value)}
          className="min-h-11 max-w-[13rem] appearance-none truncate rounded-[10px] border border-transparent bg-transparent py-1 pl-0 pr-7 text-sm font-bold tracking-tight outline-none transition-colors hover:bg-muted/60 focus-visible:border-border focus-visible:ring-2 focus-visible:ring-ring sm:max-w-[18rem]"
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {projectName(project)}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-1 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
      </div>
      <span
        className={cn(
          "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
          STATUS_CLASS[current.status] || STATUS_CLASS.planning,
        )}
      >
        {STATUS_LABEL[current.status] || current.status}
      </span>
    </section>
  );
}
