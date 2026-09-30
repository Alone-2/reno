import { useEffect, useState } from "react";
import { Home, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { renoApi, type ApiSpace } from "@/lib/reno-api";
import { useProjectSession } from "@/stores/project-session";

export function SpacesPage() {
  const projectId = useProjectSession((s) => s.currentProjectId);
  const [spaces, setSpaces] = useState<ApiSpace[]>([]);
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!projectId) return;
    let active = true;
    setLoading(true);
    void renoApi
      .spaces(projectId)
      .then((items) => {
        if (active) {
          setSpaces(items);
          setError(null);
        }
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : "空间加载失败");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [projectId]);
  const add = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    try {
      await renoApi.createSpace(projectId, { name, area: area ? Number(area) : undefined });
      setName("");
      setArea("");
      setSpaces(await renoApi.spaces(projectId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    }
  };
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold tracking-[-0.02em]">空间</h1>
        <p className="mt-1 text-sm text-muted-foreground">按房间管理面积、注意事项和施工内容</p>
      </header>
      <form
        onSubmit={add}
        className="flex flex-wrap gap-3 rounded-2xl border border-border bg-card p-4"
        aria-label="新增空间"
      >
        <Input
          required
          placeholder="例如：客厅"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-w-[12rem] flex-1"
        />
        <Input
          inputMode="decimal"
          placeholder="面积（㎡）"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="w-36"
        />
        <Button type="submit" className="min-h-11 gap-2">
          <Plus className="size-4" />
          添加空间
        </Button>
      </form>
      {loading ? (
        <p className="p-8 text-center text-sm text-muted-foreground">加载中…</p>
      ) : error ? (
        <p role="alert" className="rounded-2xl bg-danger-soft p-4 text-sm text-danger">
          {error}
        </p>
      ) : spaces.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          暂无空间
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-testid="space-list">
          {spaces.map((space) => (
            <li key={space.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Home className="size-5" />
              </div>
              <h2 className="mt-4 font-semibold">{space.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {space.area ? `${space.area} ㎡` : "面积待补充"}
              </p>
              {space.notes ? (
                <p className="mt-3 border-t border-border pt-3 text-sm text-muted-foreground">
                  {space.notes}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
