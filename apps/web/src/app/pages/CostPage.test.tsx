import { render, screen } from "@testing-library/react";
import { BUDGET_HEALTH_LABEL } from "@reno/shared";
import { beforeEach, expect, test } from "vite-plus/test";
import { MOCK_PROJECT_A_ID, getProjectOverview } from "@/mocks/project-overview";
import { useProjectSession } from "@/stores/project-session";
import { CostPage } from "./domain-pages";

beforeEach(() => {
  useProjectSession.setState({ currentProjectId: MOCK_PROJECT_A_ID });
});

test("花费率/健康度文案正确", () => {
  const overview = getProjectOverview(MOCK_PROJECT_A_ID);
  render(<CostPage />);
  expect(screen.getByTestId("budget-health")).toHaveTextContent(
    BUDGET_HEALTH_LABEL[overview.budgetHealth],
  );
  expect(screen.getByText(/花费率/)).toBeInTheDocument();
});

test("款项标题可见", () => {
  render(<CostPage />);
  expect(screen.getByText("施工定金")).toBeInTheDocument();
  expect(screen.getByText("中期款（木作）")).toBeInTheDocument();
});

test("金额格式化为元", () => {
  render(<CostPage />);
  expect(screen.getAllByText(/¥/).length).toBeGreaterThanOrEqual(1);
});
