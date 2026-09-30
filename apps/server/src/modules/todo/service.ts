import { listAcceptances } from "../acceptance/service";
import { listActionItems } from "../action-item/service";
import { listIssues } from "../issue/service";
import { listMaterials } from "../material/service";
import { listPayments } from "../payment/service";
import { listPhases } from "../phase/service";

export type TodoKind =
  | "action"
  | "issue"
  | "material"
  | "delivery"
  | "payment"
  | "phase"
  | "acceptance";
export type TodoSeverity = "info" | "warn" | "urgent";

export interface TodoItem {
  id: string;
  projectId: string;
  kind: TodoKind;
  title: string;
  subtitle: string;
  severity: TodoSeverity;
  href: string;
  status: string;
  dueDate?: string | null;
}

type TodoSources = {
  actions: Array<Record<string, any>>;
  issues: Array<Record<string, any>>;
  materials: Array<Record<string, any>>;
  payments: Array<Record<string, any>>;
  phases: Array<Record<string, any>>;
  acceptances: Array<Record<string, any>>;
};

export function buildTodoItems(
  projectId: string,
  sources: TodoSources,
  now = new Date(),
): TodoItem[] {
  const items: TodoItem[] = [];
  const today = now.toISOString().slice(0, 10);
  const inSevenDays = new Date(now);
  inSevenDays.setDate(inSevenDays.getDate() + 7);
  const sevenDays = inSevenDays.toISOString().slice(0, 10);

  for (const action of sources.actions) {
    if (action.status === "done" || action.status === "cancelled") continue;
    const overdue = Boolean(action.dueDate && action.dueDate < today);
    const urgent = action.priority === "urgent" || overdue;
    items.push({
      id: `action:${action.id}`,
      projectId,
      kind: "action",
      title: action.title,
      subtitle: action.dueDate ? `${action.type} · 截止 ${action.dueDate}` : action.type,
      severity: urgent ? "urgent" : action.priority === "high" ? "warn" : "info",
      href: "/todos",
      status: overdue ? "overdue" : action.status,
      dueDate: action.dueDate ?? null,
    });
  }

  for (const problem of sources.issues) {
    if (problem.status === "verified") continue;
    const overdue = Boolean(problem.dueDate && problem.dueDate < today);
    const needsVerify = problem.status === "resolved";
    items.push({
      id: `issue:${problem.id}`,
      projectId,
      kind: "issue",
      title: needsVerify ? `待复核：${problem.title}` : `问题：${problem.title}`,
      subtitle: `${problem.severity} · ${problem.status}`,
      severity:
        overdue || problem.severity === "critical" || problem.severity === "high"
          ? "urgent"
          : needsVerify
            ? "warn"
            : "info",
      href: "/todos",
      status: overdue ? "overdue" : problem.status,
      dueDate: problem.dueDate ?? null,
    });
  }

  for (const material of sources.materials) {
    if (material.status === "todo") {
      items.push({
        id: `material:${material.id}`,
        projectId,
        kind: "material",
        title: `采购 ${material.name}`,
        subtitle: `${material.quantity} ${material.unit} · ${material.category}`,
        severity: "info",
        href: "/materials",
        status: material.status,
      });
      continue;
    }
    if (material.status === "ordered" && material.expectedArrivalDate) {
      const overdue = material.expectedArrivalDate < today;
      items.push({
        id: `delivery:${material.id}`,
        projectId,
        kind: "delivery",
        title: `${material.name}${overdue ? "到货已逾期" : "等待到货"}`,
        subtitle: `预计 ${material.expectedArrivalDate} 到货`,
        severity: overdue ? "urgent" : material.expectedArrivalDate <= sevenDays ? "warn" : "info",
        href: "/materials",
        status: overdue ? "overdue" : "ordered",
        dueDate: material.expectedArrivalDate,
      });
    }
  }

  for (const payment of sources.payments) {
    if (payment.status === "paid") continue;
    const overdue = Boolean(payment.dueDate && payment.dueDate < today);
    const conditionMet = payment.conditionStatus === "met";
    items.push({
      id: `payment:${payment.id}`,
      projectId,
      kind: "payment",
      title: `付款：${payment.title}`,
      subtitle: `待付 ¥${Math.max(Number(payment.payableAmount) - Number(payment.paidAmount), 0).toLocaleString("zh-CN")} · ${conditionMet ? "付款条件已有依据" : payment.conditionStatus === "unmet" ? "付款条件未满足" : "条件需人工确认"}`,
      severity: overdue
        ? "urgent"
        : conditionMet || (payment.dueDate && payment.dueDate <= sevenDays)
          ? "warn"
          : "info",
      href: "/cost",
      status: overdue ? "overdue" : payment.status,
      dueDate: payment.dueDate ?? null,
    });
  }

  for (const phase of sources.phases) {
    if (phase.status === "done") continue;
    const overdue = Boolean(phase.plannedEnd && phase.plannedEnd < today);
    if (phase.status !== "ongoing" && !overdue) continue;
    items.push({
      id: `phase:${phase.id}`,
      projectId,
      kind: "phase",
      title: `${phase.phaseName}${overdue ? "已逾期" : phase.isPrimaryCurrent ? " · 当前主阶段" : "进行中"}`,
      subtitle: `当前进度 ${phase.progressPercent ?? 0}%`,
      severity: overdue ? "urgent" : "info",
      href: "/progress",
      status: overdue ? "overdue" : phase.status,
      dueDate: phase.plannedEnd ?? null,
    });
  }

  // 迁移期保留旧验收表提醒；新验收失败应同时产生 Issue。
  for (const acceptance of sources.acceptances) {
    if (acceptance.result !== "rectification") continue;
    items.push({
      id: `acceptance:${acceptance.id}`,
      projectId,
      kind: "acceptance",
      title: acceptance.type === "final" ? "整体验收待处理" : "阶段验收待处理",
      subtitle: acceptance.notes || "请处理问题并复验",
      severity: "urgent",
      href: "/acceptance",
      status: acceptance.result,
    });
  }

  const rank = { urgent: 0, warn: 1, info: 2 } as const;
  return items.sort((a, b) => rank[a.severity] - rank[b.severity]);
}

export async function listTodos(projectId: string): Promise<TodoItem[]> {
  const [actions, issues, materials, payments, phases, acceptances] = await Promise.all([
    listActionItems(projectId),
    listIssues(projectId),
    listMaterials(projectId),
    listPayments(projectId),
    listPhases(projectId),
    listAcceptances(projectId),
  ]);
  return buildTodoItems(projectId, {
    actions,
    issues,
    materials: materials.list,
    payments,
    phases: phases.list,
    acceptances,
  });
}
