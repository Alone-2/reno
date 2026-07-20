import { getProjectOverview } from "@/mocks/project-overview";
import { useProjectSession } from "@/stores/project-session";
import { ProjectSwitcher } from "../components/ProjectSwitcher";
import { OverviewPage } from "./OverviewPage";

export function OverviewRoute() {
  const projectId = useProjectSession((s) => s.currentProjectId);
  const overview = getProjectOverview(projectId);

  return (
    <div className="space-y-8">
      <ProjectSwitcher />
      <OverviewPage overview={overview} />
    </div>
  );
}
