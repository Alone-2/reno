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
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">建材</h1>
      <ul className="space-y-2" data-testid="material-list">
        {list.map((m) => (
          <li key={m.id} className="rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="font-medium">{m.name}</p>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {MATERIAL_STATUS_LABEL[m.status]}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              预估 {formatYuan(m.estimatedUnitPrice)}
              {m.actualUnitPrice != null ? ` · 实际 ${formatYuan(m.actualUnitPrice)}` : ""}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProgressPage({ stages }: { stages?: Stage[] }) {
  const projectId = useProjectSession((s) => s.currentProjectId);
  const list = stages ?? getStagesForProject(projectId);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">进度</h1>
      <ul className="space-y-2" data-testid="stage-list">
        {list.map((s) => (
          <li
            key={s.id}
            className="rounded-2xl border border-border bg-card p-4"
            data-status={s.status}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{s.name}</p>
              <span className="text-sm text-muted-foreground">{STAGE_STATUS_LABEL[s.status]}</span>
            </div>
            {s.status === "ongoing" ? (
              <p className="mt-1 text-sm text-primary">进度 {s.progressPercent}%</p>
            ) : null}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        记施工日志
      </button>
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
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">成本</h1>
      <section className="rounded-2xl border border-border bg-card p-4 space-y-2">
        <p className="text-sm text-muted-foreground">预算健康度</p>
        <p className="font-semibold" data-testid="budget-health">
          {healthLabel}
        </p>
        <p className="text-sm tabular-nums">花费率 {(data.budget.spendRatio * 100).toFixed(1)}%</p>
        <p className="text-sm tabular-nums">实际花费 {formatYuan(data.budget.actualSpent)}</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-base font-semibold">款项</h2>
        <ul className="space-y-2" data-testid="payment-list">
          {list.map((p) => (
            <li key={p.id} className="rounded-2xl border border-border bg-card p-4">
              <p className="font-medium">{p.title}</p>
              <p className="mt-1 text-sm text-muted-foreground tabular-nums">
                应付 {formatYuan(p.payableAmount)} · 已付 {formatYuan(p.paidAmount)}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
