export type AcceptanceResult = "passed" | "rectification" | "rejected";

export function canTransitionAcceptance(from: AcceptanceResult, to: AcceptanceResult): boolean {
  if (from === "rectification") return to === "passed" || to === "rejected";
  return false;
}
