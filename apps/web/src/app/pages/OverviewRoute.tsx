import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CircleDollarSign, ClipboardCheck, PackageOpen } from "lucide-react";
import { Link } from "react-router-dom";
import {
  renoApi,
  type ApiExpense,
  type ApiMaterial,
  type ApiPayment,
  type ApiPhase,
  type ApiProject,
  type ApiTodo,
} from "@/lib/reno-api";
import { useProjectSession } from "@/stores/project-session";

export function OverviewRoute() {
  const projectId = useProjectSession((s) => s.currentProjectId);
  const [data, setData] = useState<{
    project: ApiProject;
    materials: ApiMaterial[];
    expenses: ApiExpense[];
    payments: ApiPayment[];
    phases: ApiPhase[];
    todos: ApiTodo[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!projectId) return;
    let active = true;
    void Promise.all([
      renoApi.project(projectId),
      renoApi.materials(projectId),
      renoApi.expenses(projectId),
      renoApi.payments(projectId),
      renoApi.phases(projectId),
      renoApi.todos(projectId),
    ])
      .then(([project, materials, expenses, payments, phases, todos]) => {
        if (active) {
          setData({ project, materials, expenses, payments, phases, todos });
          setError(null);
        }
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : "总览加载失败");
      });
    return () => {
      active = false;
    };
  }, [projectId]);
  const spent = useMemo(() => {
    if (!data) return 0;
    const materialSpent = data.materials
      .filter(
        (item) =>
          item.status === "ordered" || item.status === "arrived" || item.status === "installed",
      )
      .reduce((sum, item) => sum + Number(item.totalPrice), 0);
    const paymentSpent = data.payments.reduce((sum, item) => sum + item.paidAmount, 0);
    const otherSpent = data.expenses
      .filter((item) => Boolean(item.paid))
      .reduce((sum, item) => sum + Number(item.amount), 0);
    return materialSpent + paymentSpent + otherSpent;
  }, [data]);
  if (!projectId || !data)
    return (
      <p
        role={error ? "alert" : undefined}
        className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground"
      >
        {error || "正在加载项目总览…"}
      </p>
    );
  const projectName =
    data.project.name || data.project.scope || `装修项目 ${data.project.id.slice(0, 8)}`;
  const currentPhase =
    data.phases.find((item) => item.status === "ongoing" && item.isPrimaryCurrent) ??
    data.phases.find((item) => item.status === "ongoing");
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold tracking-[-0.02em]">{projectName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">所有关键进度、支出和待办一眼掌握</p>
      </header>
      <section className="grid gap-3 sm:grid-cols-3">
        <Link
          to="/materials"
          className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-border-strong"
        >
          <PackageOpen className="size-5 text-primary" />
          <p className="mt-3 text-xs text-muted-foreground">待采购建材</p>
          <p className="mt-1 text-2xl font-bold">
            {data.materials.filter((item) => item.status === "todo").length}
          </p>
        </Link>
        <Link
          to="/progress"
          className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-border-strong"
        >
          <ClipboardCheck className="size-5 text-primary" />
          <p className="mt-3 text-xs text-muted-foreground">当前阶段</p>
          <p className="mt-1 font-bold">{currentPhase?.phaseName || "暂无进行中阶段"}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {currentPhase ? `${currentPhase.progressPercent}%` : "—"}
          </p>
        </Link>
        <Link
          to="/cost"
          className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-border-strong"
        >
          <CircleDollarSign className="size-5 text-primary" />
          <p className="mt-3 text-xs text-muted-foreground">累计支出</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">¥{spent.toLocaleString("zh-CN")}</p>
        </Link>
      </section>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">优先待办</h2>
          <Link
            to="/todos"
            className="flex min-h-11 items-center gap-1 text-sm font-semibold text-primary"
          >
            查看全部
            <ArrowRight className="size-4" />
          </Link>
        </div>
        {data.todos.length ? (
          <ul className="overflow-hidden rounded-2xl border border-border bg-card px-4">
            {data.todos.slice(0, 5).map((todo) => (
              <li key={todo.id} className="border-b border-border py-4 last:border-b-0">
                <Link to={todo.href} className="flex min-h-11 items-center justify-between gap-3">
                  <span>
                    <span className="block font-semibold">{todo.title}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {todo.subtitle}
                    </span>
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${todo.severity === "urgent" ? "bg-danger-soft text-danger" : todo.severity === "warn" ? "bg-warning-soft text-warning" : "bg-info-soft text-info"}`}
                  >
                    {todo.severity === "urgent"
                      ? "紧急"
                      : todo.severity === "warn"
                        ? "留意"
                        : "待办"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            当前没有待处理事项
          </p>
        )}
      </section>
    </div>
  );
}
