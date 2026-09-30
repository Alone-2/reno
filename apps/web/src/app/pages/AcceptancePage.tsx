import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, ClipboardCheck, RotateCcw, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { renoApi, type ApiAcceptance, type ApiPhase, type ApiViolation } from "@/lib/reno-api";
import { useProjectSession } from "@/stores/project-session";

const acceptanceLabel: Record<ApiAcceptance["result"], string> = {
  passed: "已通过",
  rectification: "待整改",
  rejected: "已驳回",
};
const violationLabel: Record<ApiViolation["status"], string> = {
  pending: "待整改",
  resolved: "待复查",
  rechecked: "已复查",
};
export function AcceptancePage() {
  const projectId = useProjectSession((s) => s.currentProjectId);
  const [acceptances, setAcceptances] = useState<ApiAcceptance[]>([]);
  const [violations, setViolations] = useState<ApiViolation[]>([]);
  const [phases, setPhases] = useState<ApiPhase[]>([]);
  const [form, setForm] = useState({ type: "phase", phaseId: "", checklist: "", notes: "" });
  const [violation, setViolation] = useState({ type: "质量问题", description: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [a, v, p] = await Promise.all([
        renoApi.acceptances(projectId),
        renoApi.violations(projectId),
        renoApi.phases(projectId),
      ]);
      setAcceptances(a);
      setViolations(v);
      setPhases(p);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "验收数据加载失败");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, [projectId]);
  const createAcceptance = async (event: FormEvent) => {
    event.preventDefault();
    await renoApi.createAcceptance({ ...form, projectId, phaseId: form.phaseId || undefined });
    setForm({ type: "phase", phaseId: "", checklist: "", notes: "" });
    await load();
  };
  const createViolation = async (event: FormEvent) => {
    event.preventDefault();
    await renoApi.createViolation({ ...violation, projectId });
    setViolation({ type: "质量问题", description: "" });
    await load();
  };
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold tracking-[-0.02em]">验收与整改</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          验收发现问题后，按整改、复查顺序闭环处理
        </p>
      </header>
      {loading ? (
        <p className="p-8 text-center text-sm text-muted-foreground">加载中…</p>
      ) : error ? (
        <p role="alert" className="rounded-2xl bg-danger-soft p-4 text-sm text-danger">
          {error}
        </p>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <form
          onSubmit={createAcceptance}
          className="space-y-3 rounded-2xl border border-border bg-card p-4"
          aria-label="发起验收"
        >
          <h2 className="flex items-center gap-2 font-semibold">
            <ClipboardCheck className="size-4 text-primary" />
            发起验收
          </h2>
          <select
            className="min-h-11 w-full rounded-[10px] border border-border bg-background px-3 text-sm"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="phase">阶段验收</option>
            <option value="final">整体验收</option>
          </select>
          {form.type === "phase" ? (
            <select
              className="min-h-11 w-full rounded-[10px] border border-border bg-background px-3 text-sm"
              value={form.phaseId}
              onChange={(e) => setForm({ ...form, phaseId: e.target.value })}
            >
              <option value="">选择阶段</option>
              {phases.map((phase) => (
                <option key={phase.id} value={phase.id}>
                  {phase.phaseName}
                </option>
              ))}
            </select>
          ) : null}
          <Input
            placeholder="检查清单"
            value={form.checklist}
            onChange={(e) => setForm({ ...form, checklist: e.target.value })}
          />
          <textarea
            className="min-h-20 w-full rounded-[10px] border border-border bg-background p-3 text-sm"
            placeholder="验收备注"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <Button type="submit" className="min-h-11 w-full">
            提交验收
          </Button>
        </form>
        <form
          onSubmit={createViolation}
          className="space-y-3 rounded-2xl border border-border bg-card p-4"
          aria-label="登记整改问题"
        >
          <h2 className="flex items-center gap-2 font-semibold">
            <ShieldAlert className="size-4 text-warning" />
            登记整改问题
          </h2>
          <Input
            required
            value={violation.type}
            onChange={(e) => setViolation({ ...violation, type: e.target.value })}
          />
          <textarea
            required
            className="min-h-20 w-full rounded-[10px] border border-border bg-background p-3 text-sm"
            placeholder="问题描述"
            value={violation.description}
            onChange={(e) => setViolation({ ...violation, description: e.target.value })}
          />
          <Button type="submit" className="min-h-11 w-full">
            创建整改项
          </Button>
        </form>
      </div>
      <section>
        <h2 className="mb-3 text-lg font-semibold">整改闭环</h2>
        <ul className="space-y-3">
          {violations.map((item) => (
            <li key={item.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{item.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.type} · {violationLabel[item.status]}
                  </p>
                </div>
                {item.status === "pending" ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => void renoApi.updateViolation(item.id, "resolved").then(load)}
                  >
                    <RotateCcw className="mr-1 size-3.5" />
                    标记已整改
                  </Button>
                ) : item.status === "resolved" ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => void renoApi.updateViolation(item.id, "rechecked").then(load)}
                  >
                    <CheckCircle2 className="mr-1 size-3.5" />
                    确认复查
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold">验收记录</h2>
        <ul className="space-y-3">
          {acceptances.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <div>
                <p className="font-semibold">{item.type === "final" ? "整体验收" : "阶段验收"}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.notes || item.checklist || "无备注"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-info-soft px-2.5 py-1 text-xs font-semibold text-info">
                  {acceptanceLabel[item.result]}
                </span>
                {item.result === "rectification" ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => void renoApi.updateAcceptance(item.id, "passed").then(load)}
                  >
                    复查通过
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
