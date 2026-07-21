import { NOTE_STATUS_LABEL, type NoteStatus } from "@reno/shared";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Filter,
  ShieldCheck,
} from "lucide-react";
import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  RENOVATION_PHASES,
  getRenovationNotesForProject,
  type RenovationNote,
  type RenovationRiskLevel,
} from "@/mocks/renovation-notes";
import { useProjectSession } from "@/stores/project-session";
import { cn } from "@/lib/utils";

const RISK_LABEL: Record<RenovationRiskLevel, string> = {
  low: "低风险",
  medium: "中风险",
  high: "高风险",
};

const RISK_CLASS: Record<RenovationRiskLevel, string> = {
  low: "bg-info-soft text-info",
  medium: "bg-warning-soft text-warning",
  high: "bg-danger-soft text-danger",
};

function updateFilter(
  searchParams: URLSearchParams,
  setSearchParams: ReturnType<typeof useSearchParams>[1],
  key: string,
  value: string,
) {
  const next = new URLSearchParams(searchParams);
  if (value === "all") next.delete(key);
  else next.set(key, value);
  setSearchParams(next, { replace: true });
}

function NoteCard({ note }: { note: RenovationNote }) {
  return (
    <li className="rounded-2xl border border-border bg-card p-4 md:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
          {note.space}
        </span>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
          {note.category}
        </span>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold",
            RISK_CLASS[note.riskLevel],
          )}
        >
          {RISK_LABEL[note.riskLevel]}
        </span>
        {note.isAcceptanceRequired ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">
            <ShieldCheck aria-hidden="true" className="size-3.5" />
            必验
          </span>
        ) : null}
        <span className="ml-auto text-xs font-medium text-muted-foreground">
          {NOTE_STATUS_LABEL[note.status]}
        </span>
      </div>

      <h3 className="mt-3 text-base font-bold leading-6">{note.title}</h3>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl bg-warning-soft/70 p-3">
          <p className="flex items-center gap-1.5 text-xs font-bold text-warning">
            <AlertTriangle aria-hidden="true" className="size-4" />
            避坑提醒
          </p>
          <p className="mt-1.5 text-sm leading-6 text-foreground/80">{note.pitfallTip}</p>
        </div>
        <div className="rounded-xl bg-success-soft/70 p-3">
          <p className="flex items-center gap-1.5 text-xs font-bold text-success">
            <CheckCircle2 aria-hidden="true" className="size-4" />
            怎么确认
          </p>
          <p className="mt-1.5 text-sm leading-6 text-foreground/80">{note.verificationMethod}</p>
        </div>
      </div>
    </li>
  );
}

export function NotesPage() {
  const projectId = useProjectSession((state) => state.currentProjectId);
  const [searchParams, setSearchParams] = useSearchParams();
  const notes = getRenovationNotesForProject(projectId);
  const phase = searchParams.get("phase") ?? "all";
  const space = searchParams.get("space") ?? "all";
  const risk = searchParams.get("risk") ?? "all";
  const status = searchParams.get("status") ?? "all";

  const spaces = useMemo(
    () => [...new Set(notes.map((note) => note.space))].sort((a, b) => a.localeCompare(b, "zh-CN")),
    [notes],
  );

  const filteredNotes = useMemo(
    () =>
      notes.filter(
        (note) =>
          (phase === "all" || note.phase === phase) &&
          (space === "all" || note.space === space) &&
          (risk === "all" || note.riskLevel === risk) &&
          (status === "all" || note.status === status),
      ),
    [notes, phase, risk, space, status],
  );

  const groupedNotes = RENOVATION_PHASES.map((item) => ({
    ...item,
    notes: filteredNotes.filter((note) => note.phase === item.key),
  })).filter((item) => item.notes.length > 0);

  const highRiskCount = notes.filter((note) => note.riskLevel === "high").length;
  const acceptanceCount = notes.filter((note) => note.isAcceptanceRequired).length;

  return (
    <div className="space-y-5">
      <header>
        <Link
          to="/spaces"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg pr-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          返回空间
        </Link>
        <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-bold tracking-[-0.02em]">装修注意事项</h1>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              按施工阶段查漏补缺；具体做法以设计方案、产品说明和当地现行规范为准
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-muted px-3 py-1.5">共 {notes.length} 项</span>
            <span className="rounded-full bg-danger-soft px-3 py-1.5 text-danger">
              高风险 {highRiskCount}
            </span>
            <span className="rounded-full bg-primary-soft px-3 py-1.5 text-primary">
              必验 {acceptanceCount}
            </span>
          </div>
        </div>
      </header>

      <section aria-labelledby="phase-filter-heading">
        <div className="mb-2 flex items-center gap-2">
          <Filter aria-hidden="true" className="size-4 text-primary" />
          <h2 id="phase-filter-heading" className="text-sm font-bold">
            按施工阶段筛选
          </h2>
        </div>
        <div className="-mx-4 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
          <div className="flex min-w-max gap-2" role="group" aria-label="施工阶段">
            <button
              type="button"
              aria-pressed={phase === "all"}
              onClick={() => updateFilter(searchParams, setSearchParams, "phase", "all")}
              className={cn(
                "min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                phase === "all"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-border-strong hover:text-foreground",
              )}
            >
              全部阶段
            </button>
            {RENOVATION_PHASES.map((item) => (
              <button
                key={item.key}
                type="button"
                aria-pressed={phase === item.key}
                onClick={() => updateFilter(searchParams, setSearchParams, "phase", item.key)}
                className={cn(
                  "min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  phase === item.key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-border-strong hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section
        className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-3"
        aria-label="更多筛选"
      >
        <label className="grid gap-1.5 text-sm font-semibold">
          空间
          <select
            value={space}
            onChange={(event) =>
              updateFilter(searchParams, setSearchParams, "space", event.target.value)
            }
            className="min-h-11 rounded-[10px] border border-border bg-background px-3 text-base font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
          >
            <option value="all">全部空间</option>
            {spaces.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">
          风险等级
          <select
            value={risk}
            onChange={(event) =>
              updateFilter(searchParams, setSearchParams, "risk", event.target.value)
            }
            className="min-h-11 rounded-[10px] border border-border bg-background px-3 text-base font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
          >
            <option value="all">全部风险</option>
            <option value="high">高风险</option>
            <option value="medium">中风险</option>
            <option value="low">低风险</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">
          当前状态
          <select
            value={status}
            onChange={(event) =>
              updateFilter(searchParams, setSearchParams, "status", event.target.value)
            }
            className="min-h-11 rounded-[10px] border border-border bg-background px-3 text-base font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
          >
            <option value="all">全部状态</option>
            {(Object.entries(NOTE_STATUS_LABEL) as [NoteStatus, string][]).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <p
        className="text-sm text-muted-foreground"
        aria-live="polite"
        data-testid="filtered-note-count"
      >
        当前显示 <span className="font-bold text-foreground">{filteredNotes.length}</span> 项
      </p>

      {groupedNotes.length > 0 ? (
        <div className="space-y-7" data-testid="renovation-note-list">
          {groupedNotes.map((group) => (
            <section key={group.key} aria-labelledby={`phase-${group.key}`}>
              <div className="mb-3 flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <ClipboardCheck aria-hidden="true" className="size-4" />
                </span>
                <h2 id={`phase-${group.key}`} className="text-lg font-bold">
                  {group.label}
                </h2>
                <span className="text-sm text-muted-foreground">{group.notes.length} 项</span>
              </div>
              <ul className="grid gap-3 xl:grid-cols-2">
                {group.notes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border-strong bg-card px-6 py-12 text-center">
          <Filter aria-hidden="true" className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 font-semibold">没有符合条件的注意事项</p>
          <p className="mt-1 text-sm text-muted-foreground">试试切换施工阶段或放宽风险、空间筛选</p>
          <button
            type="button"
            onClick={() => setSearchParams({}, { replace: true })}
            className="mt-4 min-h-11 rounded-[10px] border border-border bg-card px-4 text-sm font-semibold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            清除筛选
          </button>
        </div>
      )}
    </div>
  );
}
