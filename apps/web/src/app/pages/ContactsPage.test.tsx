import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vite-plus/test";
import { renoApi, type ApiParty } from "@/lib/reno-api";
import { useProjectSession } from "@/stores/project-session";
import { ContactsPage } from "./ContactsPage";

const PROJECT_ID = "11111111-1111-4111-8111-111111111111";
const party: ApiParty = {
  id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  projectId: PROJECT_ID,
  type: "foreman",
  name: "张工",
  company: "安心施工队",
  phone: "13800000000",
  wechat: null,
  responsibility: "现场施工协调",
  notes: null,
  active: true,
  createdAt: "2026-09-03T00:00:00.000Z",
  updatedAt: "2026-09-03T00:00:00.000Z",
};

beforeEach(() => {
  vi.restoreAllMocks();
  useProjectSession.setState({ currentProjectId: PROJECT_ID });
  vi.spyOn(renoApi, "parties").mockResolvedValue([party]);
  vi.spyOn(renoApi, "createParty").mockResolvedValue(party);
  vi.spyOn(renoApi, "deleteParty").mockResolvedValue(null);
});

test("展示项目联系人及负责范围", async () => {
  render(<ContactsPage />);
  expect(await screen.findByText("张工")).toBeInTheDocument();
  expect(screen.getByText(/现场施工协调/)).toBeInTheDocument();
});

test("可以新增联系人", async () => {
  const user = userEvent.setup();
  render(<ContactsPage />);
  await screen.findByText("张工");

  await user.type(screen.getByLabelText("姓名 / 名称"), "李师傅");
  await user.click(screen.getByRole("button", { name: "添加联系人" }));

  expect(renoApi.createParty).toHaveBeenCalledWith(
    PROJECT_ID,
    expect.objectContaining({ name: "李师傅", type: "supplier" }),
  );
});
