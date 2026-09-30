import { FormEvent, useEffect, useMemo, useState } from "react";
import { Camera, Check, ClipboardList, PackagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  renoApi,
  type ApiDailyLog,
  type ApiExpense,
  type ApiMaterial,
  type ApiPayment,
  type ApiPhase,
  type ApiPhoto,
} from "@/lib/reno-api";
import { useProjectSession } from "@/stores/project-session";

const materialStatusLabel: Record<ApiMaterial["status"], string> = {
  todo: "待采购",
  ordered: "已下单",
  arrived: "已到货",
  installed: "已安装",
  returned: "已退货",
  cancelled: "已取消",
};
const phaseStatusLabel: Record<ApiPhase["status"], string> = {
  pending: "未开始",
  ongoing: "进行中",
  done: "已完成",
};
const statusClass = (status: string) =>
  status === "arrived" || status === "installed" || status === "done"
    ? "bg-success-soft text-success"
    : status === "todo" || status === "pending"
      ? "bg-warning-soft text-warning"
      : status === "returned" || status === "cancelled"
        ? "bg-muted text-muted-foreground"
        : "bg-info-soft text-info";
const money = (amount: string | number) =>
  `¥${Number(amount).toLocaleString("zh-CN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

function LoadState({
  loading,
  error,
  empty,
}: {
  loading: boolean;
  error: string | null;
  empty?: boolean;
}) {
  if (loading)
    return (
      <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        加载中…
      </p>
    );
  if (error)
    return (
      <p
        role="alert"
        className="rounded-2xl border border-danger/30 bg-danger-soft p-4 text-sm text-danger"
      >
        {error}
      </p>
    );
  if (empty)
    return (
      <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        还没有记录，先添加一条吧。
      </p>
    );
  return null;
}

const emptyMaterial = {
  name: "",
  category: "主材",
  unit: "件",
  quantity: "1",
  unitPrice: "0",
  totalPrice: "0",
  spec: "",
  supplier: "",
  status: "todo",
  orderNo: "",
  orderDate: "",
  expectedArrivalDate: "",
  notes: "",
};
export function MaterialsPage() {
  const projectId = useProjectSession((s) => s.currentProjectId);
  const [items, setItems] = useState<ApiMaterial[]>([]);
  const [form, setForm] = useState(emptyMaterial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const load = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      setItems(await renoApi.materials(projectId));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "建材加载失败");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, [projectId]);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingId) await renoApi.updateMaterial(editingId, form);
      else await renoApi.createMaterial(projectId, form);
      setForm(emptyMaterial);
      setEditingId(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };
  const remove = async (id: string) => {
    if (!window.confirm("确定删除这条建材记录吗？")) return;
    await renoApi.deleteMaterial(id);
    await load();
  };
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold tracking-[-0.02em]">建材</h1>
        <p className="mt-1 text-sm text-muted-foreground">采购、到货和供应商信息统一管理</p>
      </header>
      <form
        onSubmit={submit}
        className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="建材表单"
      >
        <label className="grid gap-1.5 text-sm font-semibold lg:col-span-2">
          名称
          <Input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">
          分类
          <Input
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">
          单位
          <Input
            required
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">
          数量
          <Input
            required
            inputMode="decimal"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">
          单价
          <Input
            required
            inputMode="decimal"
            value={form.unitPrice}
            onChange={(e) =>
              setForm({
                ...form,
                unitPrice: e.target.value,
                totalPrice: String(Number(e.target.value || 0) * Number(form.quantity || 0)),
              })
            }
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">
          总价
          <Input
            required
            inputMode="decimal"
            value={form.totalPrice}
            onChange={(e) => setForm({ ...form, totalPrice: e.target.value })}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">
          规格
          <Input value={form.spec} onChange={(e) => setForm({ ...form, spec: e.target.value })} />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">
          采购状态
          <select
            className="min-h-11 rounded-[10px] border border-border bg-background px-3 text-sm"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            {Object.entries(materialStatusLabel).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">
          订单号
          <Input
            value={form.orderNo}
            onChange={(e) => setForm({ ...form, orderNo: e.target.value })}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">
          下单日期
          <Input
            type="date"
            value={form.orderDate}
            onChange={(e) => setForm({ ...form, orderDate: e.target.value })}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">
          预计到货
          <Input
            type="date"
            value={form.expectedArrivalDate}
            onChange={(e) => setForm({ ...form, expectedArrivalDate: e.target.value })}
          />
        </label>
        <div className="flex items-end gap-2 lg:col-span-2">
          <Button type="submit" disabled={saving || !projectId} className="min-h-11 gap-2">
            <PackagePlus className="size-4" />
            {saving ? "保存中…" : editingId ? "保存修改" : "添加建材"}
          </Button>
          {editingId ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingId(null);
                setForm(emptyMaterial);
              }}
            >
              取消
            </Button>
          ) : null}
        </div>
      </form>
      <LoadState loading={loading} error={error} empty={!loading && !error && items.length === 0} />
      <ul className="grid gap-3 md:grid-cols-2" data-testid="material-list">
        {items.map((item) => (
          <li key={item.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.category} · {item.quantity} {item.unit}
                  {item.spec ? ` · ${item.spec}` : ""}
                </p>
                {item.expectedArrivalDate && item.status === "ordered" ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    预计 {item.expectedArrivalDate} 到货
                  </p>
                ) : null}
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(item.status)}`}
              >
                {materialStatusLabel[item.status]}
              </span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">单价</dt>
                <dd className="mt-1 font-semibold tabular-nums">{money(item.unitPrice)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">总价</dt>
                <dd className="mt-1 font-semibold tabular-nums">{money(item.totalPrice)}</dd>
              </div>
            </dl>
            <div className="mt-4 flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => {
                  setEditingId(item.id);
                  setForm({
                    name: item.name,
                    category: item.category,
                    unit: item.unit,
                    quantity: String(item.quantity),
                    unitPrice: String(item.unitPrice),
                    totalPrice: String(item.totalPrice),
                    spec: item.spec || "",
                    supplier: item.supplier || "",
                    status: item.status,
                    orderNo: item.orderNo || "",
                    orderDate: item.orderDate || "",
                    expectedArrivalDate: item.expectedArrivalDate || "",
                    notes: item.notes || "",
                  });
                }}
              >
                <Pencil className="size-3.5" />
                编辑
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="gap-1.5 text-danger"
                onClick={() => void remove(item.id)}
              >
                <Trash2 className="size-3.5" />
                删除
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const emptyExpense = {
  category: "材料",
  amount: "",
  description: "",
  date: new Date().toISOString().slice(0, 10),
  paid: false,
};
const emptyPayment = {
  title: "",
  payee: "",
  payableAmount: "",
  paidAmount: "0",
  dueDate: "",
  paymentCondition: "",
};
export function CostPage() {
  const projectId = useProjectSession((s) => s.currentProjectId);
  const [items, setItems] = useState<ApiExpense[]>([]);
  const [payments, setPayments] = useState<ApiPayment[]>([]);
  const [form, setForm] = useState(emptyExpense);
  const [paymentForm, setPaymentForm] = useState(emptyPayment);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const load = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [expenseData, paymentData] = await Promise.all([
        renoApi.expenses(projectId),
        renoApi.payments(projectId),
      ]);
      setItems(expenseData);
      setPayments(paymentData);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "费用加载失败");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, [projectId]);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const input = {
        category: form.category,
        amount: form.amount,
        description: form.description,
        date: new Date(form.date).toISOString(),
        paid: form.paid ? new Date().toISOString() : null,
      };
      if (editingId) await renoApi.updateExpense(editingId, input);
      else await renoApi.createExpense(projectId, input);
      setForm(emptyExpense);
      setEditingId(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };
  const submitPayment = async (event: FormEvent) => {
    event.preventDefault();
    if (!projectId) return;
    setSaving(true);
    try {
      await renoApi.createPayment(projectId, {
        title: paymentForm.title,
        payee: paymentForm.payee || null,
        payableAmount: Number(paymentForm.payableAmount || 0),
        paidAmount: Number(paymentForm.paidAmount || 0),
        dueDate: paymentForm.dueDate || null,
        paymentCondition: paymentForm.paymentCondition || null,
      });
      setPaymentForm(emptyPayment);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "付款节点保存失败");
    } finally {
      setSaving(false);
    }
  };
  const total = useMemo(
    () =>
      items
        .filter((item) => Boolean(item.paid))
        .reduce((sum, item) => sum + Number(item.amount), 0) +
      payments.reduce((sum, item) => sum + Number(item.paidAmount), 0),
    [items, payments],
  );
  const pendingPayment = useMemo(
    () =>
      payments.reduce((sum, item) => sum + Math.max(item.payableAmount - item.paidAmount, 0), 0),
    [payments],
  );
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold tracking-[-0.02em]">成本</h1>
        <p className="mt-1 text-sm text-muted-foreground">记录每笔实际支出和付款状态</p>
      </header>
      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">累计支出</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{money(total)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">待支付</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">
            {money(
              items
                .filter((item) => !item.paid)
                .reduce((sum, item) => sum + Number(item.amount), pendingPayment),
            )}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">记录数</p>
          <p className="mt-1 text-2xl font-bold">{items.length + payments.length}</p>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">工程款 / 付款节点</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            记录什么时候该付、为什么该付，以及已经付了多少
          </p>
        </div>
        <form
          onSubmit={submitPayment}
          className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="付款节点表单"
        >
          <label className="grid gap-1.5 text-sm font-semibold lg:col-span-2">
            付款节点
            <Input
              required
              placeholder="例如：水电验收通过后支付第二期"
              value={paymentForm.title}
              onChange={(e) => setPaymentForm({ ...paymentForm, title: e.target.value })}
            />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            收款方
            <Input
              value={paymentForm.payee}
              onChange={(e) => setPaymentForm({ ...paymentForm, payee: e.target.value })}
            />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            应付金额
            <Input
              required
              inputMode="decimal"
              value={paymentForm.payableAmount}
              onChange={(e) => setPaymentForm({ ...paymentForm, payableAmount: e.target.value })}
            />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            已付金额
            <Input
              required
              inputMode="decimal"
              value={paymentForm.paidAmount}
              onChange={(e) => setPaymentForm({ ...paymentForm, paidAmount: e.target.value })}
            />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            计划付款日期
            <Input
              type="date"
              value={paymentForm.dueDate}
              onChange={(e) => setPaymentForm({ ...paymentForm, dueDate: e.target.value })}
            />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold lg:col-span-2">
            付款条件
            <Input
              placeholder="例如：水电验收通过"
              value={paymentForm.paymentCondition}
              onChange={(e) => setPaymentForm({ ...paymentForm, paymentCondition: e.target.value })}
            />
          </label>
          <div className="flex items-end">
            <Button type="submit" disabled={saving || !projectId} className="min-h-11 w-full">
              添加付款节点
            </Button>
          </div>
        </form>
        <ul className="space-y-2" data-testid="payment-plan-list">
          {payments.map((payment) => (
            <li key={payment.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{payment.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {payment.payee || "未填写收款方"}
                    {payment.dueDate ? ` · 计划 ${payment.dueDate}` : ""}
                  </p>
                  {payment.paymentCondition ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      付款条件：{payment.paymentCondition} ·{" "}
                      {payment.conditionStatus === "met"
                        ? "已有满足依据"
                        : payment.conditionStatus === "unmet"
                          ? "尚未满足"
                          : "需人工确认"}
                    </p>
                  ) : null}
                </div>
                <div className="text-right">
                  <p className="font-semibold tabular-nums">
                    {money(payment.paidAmount)} / {money(payment.payableAmount)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {payment.status === "paid"
                      ? "已付清"
                      : payment.status === "partial"
                        ? "部分支付"
                        : "待付"}
                  </p>
                </div>
              </div>
              {payment.status !== "paid" ? (
                <div className="mt-3 flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (!projectId || !window.confirm("确认将该付款节点标记为已付清？")) return;
                      void renoApi
                        .updatePayment(projectId, payment.id, {
                          paidAmount: payment.payableAmount,
                          paidAt: new Date().toISOString(),
                        })
                        .then(load);
                    }}
                  >
                    标记已付清
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <div>
        <h2 className="text-lg font-semibold">其他费用</h2>
        <p className="mt-1 text-sm text-muted-foreground">记录不属于工程款或建材采购的实际费用</p>
      </div>
      <form
        onSubmit={submit}
        className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5"
        aria-label="费用表单"
      >
        <label className="grid gap-1.5 text-sm font-semibold">
          分类
          <Input
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">
          金额
          <Input
            required
            inputMode="decimal"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold lg:col-span-2">
          说明
          <Input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={form.paid}
            onChange={(e) => setForm({ ...form, paid: e.target.checked })}
          />
          已支付
        </label>
        <div className="flex gap-2 lg:col-span-5">
          <Button type="submit" disabled={saving || !projectId} className="gap-2">
            <Plus className="size-4" />
            {saving ? "保存中…" : editingId ? "保存修改" : "添加费用"}
          </Button>
          {editingId ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingId(null);
                setForm(emptyExpense);
              }}
            >
              取消
            </Button>
          ) : null}
        </div>
      </form>
      <LoadState loading={loading} error={error} empty={!loading && !error && items.length === 0} />
      <ul
        className="overflow-hidden rounded-2xl border border-border bg-card px-4"
        data-testid="payment-list"
      >
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-4 last:border-b-0"
          >
            <div className="min-w-0">
              <p className="font-semibold">{item.description || item.category}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(item.date).toLocaleDateString("zh-CN")} ·{" "}
                {item.paid ? "已支付" : "待支付"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <p className="font-semibold tabular-nums">{money(item.amount)}</p>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditingId(item.id);
                  setForm({
                    category: item.category,
                    amount: String(item.amount),
                    description: item.description || "",
                    date: new Date(item.date).toISOString().slice(0, 10),
                    paid: Boolean(item.paid),
                  });
                }}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-danger"
                onClick={() => void renoApi.deleteExpense(item.id).then(load)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProgressPage() {
  const projectId = useProjectSession((s) => s.currentProjectId);
  const [phases, setPhases] = useState<ApiPhase[]>([]);
  const [logs, setLogs] = useState<ApiDailyLog[]>([]);
  const [photos, setPhotos] = useState<ApiPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState({
    phaseId: "",
    content: "",
    materials: "",
    workers: "",
    tomorrowPlan: "",
  });
  const [photo, setPhoto] = useState({ phaseId: "", url: "", caption: "" });
  const load = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [phaseData, logData, photoData] = await Promise.all([
        renoApi.phases(projectId),
        renoApi.logs(projectId),
        renoApi.photos(projectId),
      ]);
      setPhases(phaseData);
      setLogs(logData);
      setPhotos(photoData);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "进度加载失败");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, [projectId]);
  const updatePhase = async (phase: ApiPhase, status: ApiPhase["status"]) => {
    await renoApi.updatePhase(phase.id, status, status === "done" ? 100 : phase.progressPercent);
    await load();
  };
  const submitLog = async (event: FormEvent) => {
    event.preventDefault();
    await renoApi.createLog(projectId, log);
    setLog({ phaseId: "", content: "", materials: "", workers: "", tomorrowPlan: "" });
    await load();
  };
  const submitPhoto = async (event: FormEvent) => {
    event.preventDefault();
    await renoApi.createPhoto(projectId, { ...photo, type: "progress" });
    setPhoto({ phaseId: "", url: "", caption: "" });
    await load();
  };
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold tracking-[-0.02em]">进度</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          阶段、施工日志和现场照片在同一条时间线上
        </p>
      </header>
      <LoadState
        loading={loading}
        error={error}
        empty={!loading && !error && phases.length === 0}
      />
      <ul className="space-y-3" data-testid="stage-list">
        {phases.map((phase) => (
          <li key={phase.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {phase.phaseName}
                  {phase.isPrimaryCurrent ? (
                    <span className="ml-2 text-xs font-semibold text-primary">当前主阶段</span>
                  ) : null}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  计划 {phase.plannedStart || "未定"} 至 {phase.plannedEnd || "未定"}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(phase.status)}`}
              >
                {phaseStatusLabel[phase.status]}
              </span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${phase.progressPercent}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{phase.progressPercent}%</span>
              <span className="flex items-center gap-2">
                {phase.status === "ongoing" && !phase.isPrimaryCurrent ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => void renoApi.setPrimaryPhase(projectId, phase.id).then(load)}
                  >
                    设为主阶段
                  </Button>
                ) : null}
                {phase.status === "pending" ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => void updatePhase(phase, "ongoing")}
                  >
                    开始施工
                  </Button>
                ) : phase.status === "ongoing" ? (
                  <Button type="button" size="sm" onClick={() => void updatePhase(phase, "done")}>
                    <Check className="mr-1 size-3.5" />
                    标记完工
                  </Button>
                ) : null}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <div className="grid gap-4 lg:grid-cols-2">
        <form
          onSubmit={submitLog}
          className="space-y-3 rounded-2xl border border-border bg-card p-4"
          aria-label="施工日志表单"
        >
          <h2 className="flex items-center gap-2 font-semibold">
            <ClipboardList className="size-4 text-primary" />
            记施工日志
          </h2>
          <select
            className="min-h-11 w-full rounded-[10px] border border-border bg-background px-3 text-sm"
            value={log.phaseId}
            onChange={(e) => setLog({ ...log, phaseId: e.target.value })}
          >
            <option value="">关联阶段（可选）</option>
            {phases.map((phase) => (
              <option key={phase.id} value={phase.id}>
                {phase.phaseName}
              </option>
            ))}
          </select>
          <textarea
            required
            className="min-h-24 w-full rounded-[10px] border border-border bg-background p-3 text-sm"
            placeholder="今天完成了什么？"
            value={log.content}
            onChange={(e) => setLog({ ...log, content: e.target.value })}
          />
          <Input
            placeholder="材料使用"
            value={log.materials}
            onChange={(e) => setLog({ ...log, materials: e.target.value })}
          />
          <Input
            placeholder="工人/班组"
            value={log.workers}
            onChange={(e) => setLog({ ...log, workers: e.target.value })}
          />
          <Input
            placeholder="明日计划"
            value={log.tomorrowPlan}
            onChange={(e) => setLog({ ...log, tomorrowPlan: e.target.value })}
          />
          <Button type="submit" className="min-h-11 w-full">
            保存日志
          </Button>
        </form>
        <form
          onSubmit={submitPhoto}
          className="space-y-3 rounded-2xl border border-border bg-card p-4"
          aria-label="现场照片表单"
        >
          <h2 className="flex items-center gap-2 font-semibold">
            <Camera className="size-4 text-primary" />
            关联现场照片
          </h2>
          <select
            className="min-h-11 w-full rounded-[10px] border border-border bg-background px-3 text-sm"
            value={photo.phaseId}
            onChange={(e) => setPhoto({ ...photo, phaseId: e.target.value })}
          >
            <option value="">关联阶段（可选）</option>
            {phases.map((phase) => (
              <option key={phase.id} value={phase.id}>
                {phase.phaseName}
              </option>
            ))}
          </select>
          <Input
            required
            type="url"
            placeholder="照片 URL"
            value={photo.url}
            onChange={(e) => setPhoto({ ...photo, url: e.target.value })}
          />
          <Input
            placeholder="照片说明"
            value={photo.caption}
            onChange={(e) => setPhoto({ ...photo, caption: e.target.value })}
          />
          <Button type="submit" className="min-h-11 w-full">
            保存照片
          </Button>
        </form>
      </div>
      <section>
        <h2 className="mb-3 text-lg font-semibold">最近施工日志</h2>
        <ul className="space-y-2">
          {logs.map((item) => (
            <li key={item.id} className="rounded-xl border border-border bg-card p-4">
              <p className="font-medium">{item.content}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(item.createdAt).toLocaleString("zh-CN")}
                {item.materials ? ` · 材料：${item.materials}` : ""}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">已关联照片 {photos.length} 张</p>
      </section>
    </div>
  );
}
