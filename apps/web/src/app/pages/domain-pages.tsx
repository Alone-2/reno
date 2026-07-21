import {
  BUDGET_HEALTH_LABEL,
  MATERIAL_STATUS_LABEL,
  STAGE_STATUS_LABEL,
  fenToYuan,
  type Material,
  type Payment,
  type ProjectOverview,
  type Stage,
} from "@reno/shared";
import { NotebookPen, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getMaterialsForProject,
  getPaymentsForProject,
  getProjectOverview,
  getStagesForProject,
} from "@/mocks/project-overview";
import { useProjectSession } from "@/stores/project-session";

function formatYuan(fen: number): string {
  return `¥${fenToYuan(fen).toLocaleString("zh-CN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function MaterialsPage({ materials }: { materials?: Material[] }) {
  const projectId = useProjectSession((s) => s.currentProjectId);
  const list = materials ?? getMaterialsForProject(projectId);

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.02em]">建材</h1>
          <p className="mt-1 text-sm text-muted-foreground">集中管理采购状态、预算和实际价格</p>
        </div>
        <Button type="button" className="hidden gap-2 sm:inline-flex">
          <PackagePlus aria-hidden="true" className="size-4" />
          添加建材
        </Button>
      </header>
      <ul className="grid gap-3 md:grid-cols-2" data-testid="material-list">
        {list.map((m) => (
          <li
            key={m.id}
            className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-border-strong"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="font-semibold">{m.name}</p>
              <span
                className={
                  m.status === "installed"
                    ? "rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success"
                    : m.status === "todo"
                      ? "rounded-full bg-warning-soft px-2.5 py-1 text-xs font-semibold text-warning"
                      : "rounded-full bg-info-soft px-2.5 py-1 text-xs font-semibold text-info"
                }
              >
                {MATERIAL_STATUS_LABEL[m.status]}
              </span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">预估单价</dt>
                <dd className="mt-1 font-semibold tabular-nums">
                  {formatYuan(m.estimatedUnitPrice)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">实际单价</dt>
                <dd className="mt-1 font-semibold tabular-nums">
                  {m.actualUnitPrice != null ? formatYuan(m.actualUnitPrice) : "待录入"}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
      <Button type="button" className="w-full gap-2 sm:hidden" size="lg">
        <PackagePlus aria-hidden="true" className="size-4" />
        添加建材
      </Button>
    </div>
  );
}

export function ProgressPage({ stages }: { stages?: Stage[] }) {
  const projectId = useProjectSession((s) => s.currentProjectId);
  const list = stages ?? getStagesForProject(projectId);

  return (
    <div className="space-y-5">
      <header>
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.02em]">进度</h1>
          <p className="mt-1 text-sm text-muted-foreground">查看阶段计划，随手记录每天的施工变化</p>
        </div>
      </header>
      <ul className="space-y-3" data-testid="stage-list">
        {list.map((s) => (
          <li
            key={s.id}
            className="rounded-2xl border border-border bg-card p-5"
            data-status={s.status}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">{s.name}</p>
              <span
                className={
                  s.status === "done"
                    ? "rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success"
                    : s.status === "ongoing"
                      ? "rounded-full bg-warning-soft px-2.5 py-1 text-xs font-semibold text-warning"
                      : "rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground"
                }
              >
                {STAGE_STATUS_LABEL[s.status]}
              </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={
                  s.status === "done"
                    ? "h-full rounded-full bg-success"
                    : "h-full rounded-full bg-primary"
                }
                style={{ width: `${s.progressPercent}%` }}
              />
            </div>
            <p className="mt-2 text-right text-xs text-muted-foreground tabular-nums">
              进度 {s.progressPercent}%
            </p>
          </li>
        ))}
      </ul>
      <Button type="button" className="w-full gap-2 sm:w-auto" size="lg">
        <NotebookPen aria-hidden="true" className="size-4" />
        记施工日志
      </Button>
    </div>
  );
}

export function CostPage({
  overview,
  payments,
}: {
  overview?: ProjectOverview;
  payments?: Payment[];
}) {
  const projectId = useProjectSession((s) => s.currentProjectId);
  const data = overview ?? getProjectOverview(projectId);
  const list = payments ?? getPaymentsForProject(projectId);
  const healthLabel = BUDGET_HEALTH_LABEL[data.budgetHealth];

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold tracking-[-0.02em]">成本</h1>
        <p className="mt-1 text-sm text-muted-foreground">看清预算还剩多少，以及每一笔装修款项</p>
      </header>
      <section className="grid gap-3 rounded-2xl border border-border bg-card p-5 sm:grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground">预算健康度</p>
          <p className="mt-1 font-semibold text-success" data-testid="budget-health">
            {healthLabel}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">花费率</p>
          <p className="mt-1 font-semibold tabular-nums">
            {(data.budget.spendRatio * 100).toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">实际花费</p>
          <p className="mt-1 font-semibold tabular-nums">{formatYuan(data.budget.actualSpent)}</p>
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">款项</h2>
        <ul
          className="overflow-hidden rounded-2xl border border-border bg-card px-4"
          data-testid="payment-list"
        >
          {list.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-4 border-b border-border py-4 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="font-semibold">{p.title}</p>
                <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                  应付 {formatYuan(p.payableAmount)}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold tabular-nums">
                已付 {formatYuan(p.paidAmount)}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
