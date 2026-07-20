import {
  BUDGET_HEALTH_LABEL,
  PROJECT_STATUS_LABEL,
  fenToYuan,
  type ProjectOverview,
} from "@reno/shared";
import { mockProjectOverview } from "@/mocks/project-overview";

function formatYuan(fen: number): string {
  return `¥${fenToYuan(fen).toLocaleString("zh-CN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function OverviewPage({ overview = mockProjectOverview }: { overview?: ProjectOverview }) {
  const { project, budget, budgetHealth, currentStage, todos } = overview;
  const statusLabel = PROJECT_STATUS_LABEL[project.status];
  const healthLabel = BUDGET_HEALTH_LABEL[budgetHealth];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{project.address ?? "未填写地址"}</p>
        </div>
        <span
          className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground"
          data-testid="project-status-chip"
        >
          {statusLabel}
        </span>
      </header>

      <section aria-labelledby="todos-heading" className="space-y-3">
        <h2 id="todos-heading" className="text-base font-semibold">
          今日待办
        </h2>
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li key={todo.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <p className="font-medium">{todo.title}</p>
              {todo.subtitle ? (
                <p className="mt-1 text-sm text-muted-foreground">{todo.subtitle}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="budget-heading" className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 id="budget-heading" className="text-base font-semibold">
            预算
          </h2>
          <span className="text-sm text-muted-foreground">{healthLabel}</span>
        </div>
        <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">总预算</p>
            <p className="mt-1 font-semibold tabular-nums">{formatYuan(budget.totalBudget)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">实际花费</p>
            <p className="mt-1 font-semibold tabular-nums">{formatYuan(budget.actualSpent)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">剩余预算</p>
            <p className="mt-1 font-semibold tabular-nums">{formatYuan(budget.budgetRemaining)}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="stage-heading" className="space-y-3">
        <h2 id="stage-heading" className="text-base font-semibold">
          当前阶段
        </h2>
        {currentStage ? (
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="font-medium">{currentStage.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              进度 {currentStage.progressPercent}%
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">暂无进行中阶段</p>
        )}
      </section>
    </div>
  );
}
