import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vite-plus/test";
import { renoApi, type ApiMaterial } from "@/lib/reno-api";
import { useProjectSession } from "@/stores/project-session";
import { MaterialsPage } from "./domain-pages";

const PROJECT_ID = "project-a";
const materials: ApiMaterial[] = [
  {
    id: "material-1",
    projectId: PROJECT_ID,
    name: "客厅地砖 600×600",
    category: "主材",
    spec: "灰色哑光",
    unit: "箱",
    quantity: "20",
    unitPrice: "168",
    totalPrice: "3360",
    supplier: "建材城",
    supplierContact: null,
    supplierPartyId: null,
    orderNo: null,
    orderDate: null,
    expectedArrivalDate: null,
    actualArrivalDate: null,
    status: "todo",
    notes: null,
    createdAt: "2026-07-18T00:00:00.000Z",
    updatedAt: "2026-07-18T00:00:00.000Z",
  },
  {
    id: "material-2",
    projectId: PROJECT_ID,
    name: "卧室木地板",
    category: "主材",
    spec: null,
    unit: "㎡",
    quantity: 35,
    unitPrice: 230,
    totalPrice: 8050,
    supplier: null,
    supplierContact: null,
    supplierPartyId: null,
    orderNo: "ORDER-2",
    orderDate: "2026-07-18",
    expectedArrivalDate: "2026-07-25",
    actualArrivalDate: null,
    status: "ordered",
    notes: null,
    createdAt: "2026-07-18T00:00:00.000Z",
    updatedAt: "2026-07-18T00:00:00.000Z",
  },
];

beforeEach(() => {
  vi.restoreAllMocks();
  useProjectSession.setState({ currentProjectId: PROJECT_ID });
  vi.spyOn(renoApi, "materials").mockResolvedValue(materials);
  vi.spyOn(renoApi, "createMaterial").mockResolvedValue(materials[0]!);
});

test("从 API 渲染建材和中文状态", async () => {
  render(<MaterialsPage />);

  expect(await screen.findByText("客厅地砖 600×600")).toBeInTheDocument();
  expect(screen.getAllByText("待采购").length).toBeGreaterThanOrEqual(1);
  expect(screen.getAllByText("已下单").length).toBeGreaterThanOrEqual(1);
  expect(renoApi.materials).toHaveBeenCalledWith(PROJECT_ID);
});

test("金额按元展示", async () => {
  render(<MaterialsPage />);

  await screen.findByText("卧室木地板");
  expect(screen.getAllByText(/¥/).length).toBeGreaterThanOrEqual(2);
});

test("提交新增建材后调用真实 API 契约并刷新列表", async () => {
  const user = userEvent.setup();
  render(<MaterialsPage />);
  await screen.findByText("客厅地砖 600×600");

  await user.type(screen.getByLabelText("名称"), "厨房墙砖");
  await user.click(screen.getByRole("button", { name: "添加建材" }));

  expect(renoApi.createMaterial).toHaveBeenCalledWith(
    PROJECT_ID,
    expect.objectContaining({ name: "厨房墙砖", category: "主材" }),
  );
  expect(renoApi.materials).toHaveBeenCalledTimes(2);
});
