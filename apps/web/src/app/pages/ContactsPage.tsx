import { type FormEvent, useEffect, useState } from "react";
import { Pencil, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { renoApi, type ApiParty } from "@/lib/reno-api";
import { useProjectSession } from "@/stores/project-session";

const typeLabel: Record<ApiParty["type"], string> = {
  contractor: "施工方",
  foreman: "工长",
  worker: "工人",
  designer: "设计师",
  supplier: "供应商",
  installer: "安装人员",
  other: "其他",
};

const emptyForm = {
  type: "supplier",
  name: "",
  company: "",
  phone: "",
  wechat: "",
  responsibility: "",
  notes: "",
};

export function ContactsPage() {
  const projectId = useProjectSession((s) => s.currentProjectId);
  const [items, setItems] = useState<ApiParty[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      setItems(await renoApi.parties(projectId));
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "联系人加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [projectId]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!projectId) return;
    const input = {
      ...form,
      company: form.company || null,
      phone: form.phone || null,
      wechat: form.wechat || null,
      responsibility: form.responsibility || null,
      notes: form.notes || null,
    };
    try {
      if (editingId) await renoApi.updateParty(projectId, editingId, input);
      else await renoApi.createParty(projectId, input);
      setEditingId(null);
      setForm(emptyForm);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "联系人保存失败");
    }
  };

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Users className="size-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.02em]">项目联系人</h1>
          <p className="mt-1 text-sm text-muted-foreground">联系人只是业务档案，不创建系统账号</p>
        </div>
      </header>

      {error ? (
        <p role="alert" className="rounded-2xl bg-danger-soft p-4 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <form
        onSubmit={submit}
        className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <label className="grid gap-1.5 text-sm font-semibold">
          类型
          <select
            className="min-h-11 rounded-[10px] border border-border bg-background px-3 text-sm"
            value={form.type}
            onChange={(event) => setForm({ ...form, type: event.target.value })}
          >
            {Object.entries(typeLabel).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">
          姓名 / 名称
          <Input
            required
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">
          公司
          <Input
            value={form.company}
            onChange={(event) => setForm({ ...form, company: event.target.value })}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">
          手机
          <Input
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">
          微信
          <Input
            value={form.wechat}
            onChange={(event) => setForm({ ...form, wechat: event.target.value })}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold lg:col-span-2">
          负责范围
          <Input
            placeholder="例如：水电施工、瓷砖供货、橱柜安装"
            value={form.responsibility}
            onChange={(event) => setForm({ ...form, responsibility: event.target.value })}
          />
        </label>
        <div className="flex items-end gap-2">
          <Button type="submit" className="min-h-11 flex-1">
            {editingId ? "保存修改" : "添加联系人"}
          </Button>
          {editingId ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              取消
            </Button>
          ) : null}
        </div>
      </form>

      {loading ? <p className="p-8 text-center text-sm text-muted-foreground">加载中…</p> : null}
      {!loading ? (
        <ul className="grid gap-3 md:grid-cols-2" data-testid="contact-list">
          {items.map((item) => (
            <li key={item.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {typeLabel[item.type]}
                    {item.company ? ` · ${item.company}` : ""}
                  </p>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
                  {typeLabel[item.type]}
                </span>
              </div>
              <dl className="mt-4 space-y-1 text-sm text-muted-foreground">
                {item.phone ? (
                  <div>
                    <dt className="inline">电话：</dt>
                    <dd className="inline">{item.phone}</dd>
                  </div>
                ) : null}
                {item.wechat ? (
                  <div>
                    <dt className="inline">微信：</dt>
                    <dd className="inline">{item.wechat}</dd>
                  </div>
                ) : null}
                {item.responsibility ? (
                  <div>
                    <dt className="inline">负责：</dt>
                    <dd className="inline">{item.responsibility}</dd>
                  </div>
                ) : null}
              </dl>
              <div className="mt-4 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingId(item.id);
                    setForm({
                      type: item.type,
                      name: item.name,
                      company: item.company || "",
                      phone: item.phone || "",
                      wechat: item.wechat || "",
                      responsibility: item.responsibility || "",
                      notes: item.notes || "",
                    });
                  }}
                >
                  <Pencil className="mr-1 size-3.5" /> 编辑
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-danger"
                  onClick={() => {
                    if (!projectId || !window.confirm("停用该联系人？历史业务关联会保留。")) return;
                    void renoApi.deleteParty(projectId, item.id).then(load);
                  }}
                >
                  <Trash2 className="mr-1 size-3.5" /> 停用
                </Button>
              </div>
            </li>
          ))}
          {items.length === 0 ? (
            <li className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground md:col-span-2">
              还没有联系人
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
