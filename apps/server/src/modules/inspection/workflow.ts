export type ViolationStatus = "pending" | "resolved" | "rechecked";

const NEXT_STATUS: Record<ViolationStatus, ViolationStatus | null> = {
  pending: "resolved",
  resolved: "rechecked",
  rechecked: null,
};

export function canTransitionViolation(from: ViolationStatus, to: ViolationStatus): boolean {
  return NEXT_STATUS[from] === to;
}

export function violationActionLabel(status: ViolationStatus): string | null {
  if (status === "pending") return "标记已整改";
  if (status === "resolved") return "确认复查通过";
  return null;
}
