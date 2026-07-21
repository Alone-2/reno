import { ArrowRight, NotebookPen, PackagePlus } from "lucide-react";
import { Link } from "react-router-dom";
import {
  BUDGET_HEALTH_LABEL,
  PROJECT_STATUS_LABEL,
  STAGE_STATUS_LABEL,
  fenToYuan,
  type ProjectOverview,
  type TodoCard,
} from "@reno/shared";
import { mockProjectOverview } from "@/mocks/project-overview";
import { cn } from "@/lib/utils";

function formatYuan(fen: number): string {
  return `¥${fenToYuan(fen).toLocaleString("zh-CN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

const TODO_BAR_CLASS: Record<TodoCard["severity"], string> = {
  info: "bg-primary",
  warn: "bg-warning",
  danger: "bg-danger",
  ok: "bg-success",
};

const TODO_BADGE_CLASS: Record<TodoCard["severity"], string> = {
  info: "bg-info-soft text-info",
  warn: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  ok: "bg-success-soft text-success",
};

export function OverviewPage({ overview = mockProjectOverview }: { overview?: ProjectOverview }) {
  const { project, budget, budgetHealth, currentStage, todos } = overview;
  const spendPercent = Math.min(100, Math.max(0, Math.round(budget.spendRatio * 100)));
  const healthLabel = BUDGET_HEALTH_LABEL[budgetHealth];
  const budgetTone =
    budgetHealth === "over"
      ? "text-danger"
      : budgetHealth === "warn" || budgetHealth === "committed_full"
        ? "text-warning"
        : "text-success";
  const progressTone =
    budgetHealth === "over"
      ? "bg-danger"
      : budgetHealth === "warn" || budgetHealth === "committed_full"
        ? "bg-warning"
        : "bg-primary";

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-5">
      <h1 className="sr-only">{project.name}</h1>
      <span className="sr-only" data-testid="project-status-chip">
        {PROJECT_STATUS_LABEL[project.status]}
      </span>

      <section aria-labelledby="todos-heading" className="order-1 md:order-2">
        <h2 id="todos-heading" className="sr-only mb-3 text-lg font-semibold md:not-sr-only">
          今日待办
        </h2>
        {todos.length > 0 ? (
          <ul className="space-y-2 md:overflow-hidden md:rounded-2xl md:border md:border-border md:bg-card md:px-4 md:space-y-0">
            {todos.map((todo) => {
              const content = (
                <>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "w-[3px] self-stretch rounded-full md:hidden",
                      TODO_BAR_CLASS[todo.severity],
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">
                      {todo.title}
                    </span>
                    {todo.subtitle ? (
                      <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                        {todo.subtitle}
                      </span>
                    ) : null}
                  </span>
                  <span
                    className={cn(
                      "hidden shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold md:inline-flex",
                      TODO_BADGE_CLASS[todo.severity],
                    )}
                  >
                    {todo.severity === "danger"
                      ? "紧急"
                      : todo.severity === "warn"
                        ? "留意"
                        : "待办"}
                  </span>
                  {todo.href ? (
                    <ArrowRight
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-muted-foreground md:hidden"
                    />
                  ) : null}
                </>
              );

              return (
                <li
                  key={todo.id}
                  className="rounded-2xl border border-border bg-card transition-colors last:border-b-0 hover:border-border-strong md:rounded-none md:border-x-0 md:border-t-0 md:bg-transparent"
                >
                  {todo.href ? (
                    <Link
                      to={todo.href}
                      className="flex min-h-[68px] items-start gap-3 p-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:min-h-[58px] md:items-center md:px-0 md:py-3"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div className="flex min-h-[68px] items-start gap-3 p-3.5 md:min-h-[58px] md:items-center md:px-0 md:py-3">
                      {content}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-border-strong bg-card p-8 text-center">
            <p className="font-medium">今天没有待办</p>
            <p className="mt-1 text-sm text-muted-foreground">可以安心推进当前装修阶段</p>
          </div>
        )}
      </section>

      <section aria-labelledby="budget-heading" className="order-2 md:order-1 md:col-span-2">
        <div className="mb-3 flex items-center justify-between md:hidden">
          <h2 id="budget-heading" className="text-base font-semibold">
            预算概览
          </h2>
          <span className={cn("text-xs font-semibold", budgetTone)}>{healthLabel}</span>
        </div>
        <h2 id="budget-heading-desktop" className="sr-only">
          预算概览
        </h2>
        <div className="grid gap-2 rounded-2xl border border-border bg-card p-4 md:grid-cols-3 md:gap-3 md:border-0 md:bg-transparent md:p-0">
          <div className="flex items-center justify-between md:block md:rounded-2xl md:border md:border-border md:bg-card md:p-5">
            <p className="text-xs text-muted-foreground">总预算</p>
            <p className="font-semibold tabular-nums md:mt-2 md:text-2xl md:font-bold">
              {formatYuan(budget.totalBudget)}
            </p>
          </div>
          <div className="flex items-center justify-between md:block md:rounded-2xl md:border md:border-border md:bg-card md:p-5">
            <p className="text-xs text-muted-foreground">实际花费</p>
            <p
              className={cn(
                "font-semibold tabular-nums md:mt-2 md:text-2xl md:font-bold",
                budgetTone,
              )}
            >
              {formatYuan(budget.actualSpent)}
            </p>
          </div>
          <div className="flex items-center justify-between md:block md:rounded-2xl md:border md:border-border md:bg-card md:p-5">
            <p className="text-xs text-muted-foreground">剩余 / 健康度</p>
            <div className="flex items-baseline gap-2 md:mt-2">
              <p className="font-semibold tabular-nums md:text-2xl md:font-bold">
                {formatYuan(budget.budgetRemaining)}
              </p>
              <span className={cn("hidden text-xs font-semibold md:inline", budgetTone)}>
                {healthLabel}
              </span>
            </div>
          </div>
          <div className="mt-2 md:col-span-3 md:hidden">
            <div
              className="h-2 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-label="预算使用进度"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={spendPercent}
            >
              <div
                className={cn("h-full rounded-full transition-[width] duration-300", progressTone)}
                style={{ width: `${spendPercent}%` }}
              />
            </div>
            <p className="mt-2 text-right text-xs text-muted-foreground">已使用 {spendPercent}%</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="stage-heading" className="order-3">
        <h2 id="stage-heading" className="mb-3 text-lg font-semibold md:text-lg">
          当前阶段
        </h2>
        {currentStage ? (
          <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">{currentStage.name}</p>
              <span className="rounded-full bg-warning-soft px-2.5 py-1 text-xs font-semibold text-warning">
                {STAGE_STATUS_LABEL[currentStage.status]}
              </span>
            </div>
            <div
              className="mt-4 h-2 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-label="施工阶段进度"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={currentStage.progressPercent}
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${currentStage.progressPercent}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>进度 {currentStage.progressPercent}%</span>
              <span>
                {currentStage.plannedEndDate
                  ? `计划 ${currentStage.plannedEndDate} 完成`
                  : "待定计划"}
              </span>
            </div>
            <Link
              to="/progress"
              className="mt-4 hidden min-h-10 w-full items-center justify-center rounded-[10px] border border-border bg-card text-sm font-semibold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:inline-flex"
            >
              查看阶段详情
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border-strong bg-card p-8 text-center">
            <p className="font-medium">暂无进行中的阶段</p>
            <p className="mt-1 text-sm text-muted-foreground">设置阶段计划后会在这里显示进度</p>
          </div>
        )}
      </section>

      <div className="order-4 grid grid-cols-2 gap-2 md:hidden">
        <Link
          to="/progress"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-primary px-3 text-sm font-semibold text-primary-foreground transition-colors active:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <NotebookPen aria-hidden="true" className="size-4" />
          记施工日志
        </Link>
        <Link
          to="/materials"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] border border-border bg-card px-3 text-sm font-semibold transition-colors active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <PackagePlus aria-hidden="true" className="size-4" />
          添加建材
        </Link>
      </div>
    </div>
  );
}
