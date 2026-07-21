import { getProjectOverview } from "@/mocks/project-overview";
import { useProjectSession } from "@/stores/project-session";
import { OverviewPage } from "./OverviewPage";

export function OverviewRoute() {
  const projectId = useProjectSession((s) => s.currentProjectId);
  const overview = getProjectOverview(projectId);

  return <OverviewPage overview={overview} />;
}
