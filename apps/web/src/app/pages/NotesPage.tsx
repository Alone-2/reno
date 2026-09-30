import { useEffect, useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { renoApi } from "@/lib/reno-api";
import { useProjectSession } from "@/stores/project-session";

type Note = { id: string; spaceId: string; category: string; content: string; status: string };
export function NotesPage() {
  const projectId = useProjectSession((s) => s.currentProjectId);
  const [notes, setNotes] = useState<Note[]>([]);
  const [spaceNames, setSpaceNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!projectId) return;
    let active = true;
    void renoApi
      .spaces(projectId)
      .then(async (spaces) => {
        const entries = await Promise.all(
          spaces.map(async (space) => [space.id, await renoApi.checklist(space.id)] as const),
        );
        if (!active) return;
        setSpaceNames(Object.fromEntries(spaces.map((space) => [space.id, space.name])));
        setNotes(entries.flatMap(([, items]) => items as Note[]));
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : "注意事项加载失败");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [projectId]);
  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold tracking-[-0.02em]">注意事项</h1>
        <p className="mt-1 text-sm text-muted-foreground">来自各空间清单的施工提醒</p>
      </header>
      {loading ? (
        <p className="p-8 text-center text-sm text-muted-foreground">加载中…</p>
      ) : error ? (
        <p role="alert" className="rounded-2xl bg-danger-soft p-4 text-sm text-danger">
          {error}
        </p>
      ) : notes.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          暂无注意事项
        </p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2" data-testid="renovation-note-list">
          {notes.map((note) => (
            <li key={note.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <ClipboardCheck className="size-4" />
                </span>
                <div>
                  <p className="font-semibold">{note.content}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {spaceNames[note.spaceId] || "空间"} · {note.category} ·{" "}
                    {note.status === "pending" ? "待处理" : note.status}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
