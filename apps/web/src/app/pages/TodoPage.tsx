import { type FormEvent, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, ListTodo, Plus, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { renoApi, type ApiActionItem, type ApiIssue, type ApiTodo } from "@/lib/reno-api";
import { useProjectSession } from "@/stores/project-session";

const actionTypeLabel = {
  task: "任务",
  decision: "决策",
  follow_up: "催办",
  purchase: "采购",
  payment: "付款",
  recheck: "复核",
} as const;
const actionPriorityLabel = { low: "低", normal: "普通", high: "高", urgent: "紧急" } as const;
const issueStatusLabel = {
  open: "待处理",
  fixing: "整改中",
  resolved: "待复核",
  verified: "已闭环",
} as const;
const issueSeverityLabel = { low: "低", medium: "中", high: "高", critical: "严重" } as const;

const emptyAction = {
  title: "",
  type: "task",
  priority: "normal",
  dueDate: "",
  notes: "",
};
const emptyIssue = {
  title: "",
  description: "",
  severity: "medium",
  dueDate: "",
};

export function TodoPage() {
  const projectId = useProjectSession((s) => s.currentProjectId);
  const [actions, setActions] = useState<ApiActionItem[]>([]);
  const [issues, setIssues] = useState<ApiIssue[]>([]);
  const [derived, setDerived] = useState<ApiTodo[]>([]);
  const [actionForm, setActionForm] = useState(emptyAction);
  const [issueForm, setIssueForm] = useState(emptyIssue);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [actionData, issueData, todoData] = await Promise.all([
        renoApi.actionItems(projectId),
        renoApi.issues(projectId),
        renoApi.todos(projectId),
      ]);
      setActions(actionData);
      setIssues(issueData);
      setDerived(todoData.filter((item) => item.kind !== "action" && item.kind !== "issue"));
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "待办加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [projectId]);

  const submitAction = async (event: FormEvent) => {
    event.preventDefault();
    if (!projectId) return;
    setSaving(true);
    try {
      await renoApi.createActionItem(projectId, {
        ...actionForm,
        dueDate: actionForm.dueDate || null,
        notes: actionForm.notes || null,
      });
      setActionForm(emptyAction);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "行动项保存失败");
    } finally {
      setSaving(false);
    }
  };

  const submitIssue = async (event: FormEvent) => {
    event.preventDefault();
    if (!projectId) return;
    setSaving(true);
    try {
      await renoApi.createIssue(projectId, {
        ...issueForm,
        dueDate: issueForm.dueDate || null,
      });
      setIssueForm(emptyIssue);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "问题保存失败");
    } finally {
      setSaving(false);
    }
  };

  const completeAction = async (item: ApiActionItem) => {
    if (!projectId) return;
    if (item.type === "decision") {
      const decisionResult = window.prompt("记录最终决定：", item.decisionResult || "");
      if (decisionResult === null || !decisionResult.trim()) return;
      await renoApi.updateActionItem(projectId, item.id, {
        decisionResult: decisionResult.trim(),
        status: "done",
      });
    } else {
      await renoApi.updateActionItemStatus(projectId, item.id, "done");
    }
    await load();
  };

  const advanceIssue = async (item: ApiIssue) => {
    if (!projectId) return;
    if (item.status === "open") {
      await renoApi.updateIssueStatus(projectId, item.id, "fixing");
    } else if (item.status === "fixing") {
      const notes = window.prompt("填写整改完成说明：", item.resolutionNotes || "");
      if (notes === null || !notes.trim()) return;
      await renoApi.updateIssueStatus(projectId, item.id, "resolved", notes.trim());
    } else if (item.status === "resolved") {
      await renoApi.updateIssueStatus(
        projectId,
        item.id,
        "verified",
        item.resolutionNotes || undefined,
      );
    }
    await load();
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <ListTodo className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-[-0.02em]">待办与问题</h1>
            <p className="mt-1 text-sm text-muted-foreground">今天要做什么、什么问题还没闭环</p>
          </div>
        </div>
        <Link
          to="/contacts"
          className="inline-flex min-h-11 items-center gap-2 rounded-[10px] border border-border bg-card px-4 text-sm font-semibold hover:bg-muted"
        >
          <Users className="size-4" />
          项目联系人
        </Link>
      </header>

      {error ? (
        <p role="alert" className="rounded-2xl bg-danger-soft p-4 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <form
          onSubmit={submitAction}
          className="space-y-3 rounded-2xl border border-border bg-card p-4"
        >
          <h2 className="flex items-center gap-2 font-semibold">
            <Plus className="size-4 text-primary" /> 新建行动 / 决策
          </h2>
          <Input
            required
            placeholder="例如：周五前确认厨房插座位置"
            value={actionForm.title}
            onChange={(event) => setActionForm({ ...actionForm, title: event.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              aria-label="行动类型"
              className="min-h-11 rounded-[10px] border border-border bg-background px-3 text-sm"
              value={actionForm.type}
              onChange={(event) => setActionForm({ ...actionForm, type: event.target.value })}
            >
              {Object.entries(actionTypeLabel).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              aria-label="优先级"
              className="min-h-11 rounded-[10px] border border-border bg-background px-3 text-sm"
              value={actionForm.priority}
              onChange={(event) => setActionForm({ ...actionForm, priority: event.target.value })}
            >
              {Object.entries(actionPriorityLabel).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}优先级
                </option>
              ))}
            </select>
          </div>
          <Input
            type="date"
            aria-label="截止日期"
            value={actionForm.dueDate}
            onChange={(event) => setActionForm({ ...actionForm, dueDate: event.target.value })}
          />
          <Input
            placeholder="备注（可选）"
            value={actionForm.notes}
            onChange={(event) => setActionForm({ ...actionForm, notes: event.target.value })}
          />
          <Button type="submit" disabled={saving || !projectId} className="min-h-11 w-full">
            保存行动项
          </Button>
        </form>

        <form
          onSubmit={submitIssue}
          className="space-y-3 rounded-2xl border border-border bg-card p-4"
        >
          <h2 className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="size-4 text-warning" /> 记录现场问题
          </h2>
          <Input
            required
            placeholder="例如：卫生间墙砖发现空鼓"
            value={issueForm.title}
            onChange={(event) => setIssueForm({ ...issueForm, title: event.target.value })}
          />
          <textarea
            required
            className="min-h-20 w-full rounded-[10px] border border-border bg-background p-3 text-sm"
            placeholder="问题现象、位置和需要处理的内容"
            value={issueForm.description}
            onChange={(event) => setIssueForm({ ...issueForm, description: event.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              aria-label="问题严重程度"
              className="min-h-11 rounded-[10px] border border-border bg-background px-3 text-sm"
              value={issueForm.severity}
              onChange={(event) => setIssueForm({ ...issueForm, severity: event.target.value })}
            >
              {Object.entries(issueSeverityLabel).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}风险
                </option>
              ))}
            </select>
            <Input
              type="date"
              aria-label="问题处理期限"
              value={issueForm.dueDate}
              onChange={(event) => setIssueForm({ ...issueForm, dueDate: event.target.value })}
            />
          </div>
          <Button
            type="submit"
            disabled={saving || !projectId}
            variant="outline"
            className="min-h-11 w-full"
          >
            保存问题
          </Button>
        </form>
      </div>

      {loading ? <p className="p-8 text-center text-sm text-muted-foreground">加载中…</p> : null}

      {!loading ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">我的行动</h2>
              <span className="text-xs text-muted-foreground">{actions.length} 项</span>
            </div>
            <ul className="space-y-2" data-testid="action-list">
              {actions.map((item) => (
                <li key={item.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{item.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {actionTypeLabel[item.type]} · {actionPriorityLabel[item.priority]}优先级
                        {item.dueDate ? ` · ${item.dueDate}` : ""}
                      </p>
                      {item.notes ? (
                        <p className="mt-2 text-sm text-muted-foreground">{item.notes}</p>
                      ) : null}
                    </div>
                    <Button size="sm" type="button" onClick={() => void completeAction(item)}>
                      <CheckCircle2 className="mr-1 size-3.5" /> 完成
                    </Button>
                  </div>
                </li>
              ))}
              {actions.length === 0 ? (
                <li className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  当前没有手工行动项
                </li>
              ) : null}
            </ul>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">现场问题</h2>
              <span className="text-xs text-muted-foreground">{issues.length} 项未闭环</span>
            </div>
            <ul className="space-y-2" data-testid="issue-list">
              {issues.map((item) => (
                <li key={item.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{item.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {issueSeverityLabel[item.severity]}风险 · {issueStatusLabel[item.status]}
                        {item.dueDate ? ` · ${item.dueDate}` : ""}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Button
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={() => void advanceIssue(item)}
                    >
                      {item.status === "open"
                        ? "开始整改"
                        : item.status === "fixing"
                          ? "整改完成"
                          : "确认复核"}
                    </Button>
                  </div>
                </li>
              ))}
              {issues.length === 0 ? (
                <li className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  当前没有未闭环现场问题
                </li>
              ) : null}
            </ul>
          </section>
        </div>
      ) : null}

      {!loading && derived.length ? (
        <section>
          <h2 className="mb-3 text-lg font-semibold">系统提醒</h2>
          <ul
            className="overflow-hidden rounded-2xl border border-border bg-card px-4"
            data-testid="todo-list"
          >
            {derived.map((item) => (
              <li key={item.id} className="border-b border-border py-4 last:border-b-0">
                <Link to={item.href} className="flex min-h-11 items-center justify-between gap-3">
                  <span>
                    <span className="block font-semibold">{item.title}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {item.subtitle}
                    </span>
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.severity === "urgent" ? "bg-danger-soft text-danger" : item.severity === "warn" ? "bg-warning-soft text-warning" : "bg-info-soft text-info"}`}
                  >
                    {item.severity === "urgent"
                      ? "紧急"
                      : item.severity === "warn"
                        ? "留意"
                        : "提醒"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
