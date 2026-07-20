/**
 * 前端 mock — 类型全部来自 @reno/shared
 * 预算数字由 computeBudgetSummary 生成，禁止手写矛盾 actualSpent。
 */
import {
  budgetHealth,
  computeBudgetSummary,
  type Material,
  type Payment,
  type Project,
  type ProjectOverview,
  type Space,
  type Stage,
  type TodoCard,
  yuanToFen,
} from "@reno/shared";

const now = "2026-07-18T10:00:00.000Z";
const ts = { createdAt: now, updatedAt: now };

export const MOCK_PROJECT_A_ID = "11111111-1111-4111-8111-111111111111";
export const MOCK_PROJECT_B_ID = "22222222-2222-4222-8222-222222222222";
export const MOCK_OWNER_ID = "00000000-0000-4000-8000-000000000001";

export const mockProjects: Project[] = [
  {
    ...ts,
    id: MOCK_PROJECT_A_ID,
    ownerId: MOCK_OWNER_ID,
    name: "望京自住装修",
    address: "北京市朝阳区望京 SOHO",
    type: "half",
    style: "原木暖色",
    status: "constructing",
    totalBudget: yuanToFen(300_000),
    plannedStartDate: "2026-06-01",
    plannedEndDate: "2026-12-31",
    actualStartDate: "2026-06-15",
    actualEndDate: null,
    remark: null,
  },
  {
    ...ts,
    id: MOCK_PROJECT_B_ID,
    ownerId: MOCK_OWNER_ID,
    name: "昌平新房规划",
    address: "北京市昌平区",
    type: "full",
    style: null,
    status: "planning",
    totalBudget: yuanToFen(500_000),
    plannedStartDate: null,
    plannedEndDate: null,
    actualStartDate: null,
    actualEndDate: null,
    remark: "尚未开工",
  },
];

export const mockSpaces: Space[] = [
  {
    ...ts,
    id: "s-living",
    projectId: MOCK_PROJECT_A_ID,
    name: "客厅",
    sortOrder: 1,
    areaSqm: 28,
    remark: null,
  },
  {
    ...ts,
    id: "s-master",
    projectId: MOCK_PROJECT_A_ID,
    name: "主卧",
    sortOrder: 2,
    areaSqm: 16,
    remark: null,
  },
  {
    ...ts,
    id: "s-kitchen",
    projectId: MOCK_PROJECT_A_ID,
    name: "厨房",
    sortOrder: 3,
    areaSqm: 8,
    remark: null,
  },
];

export const mockMaterials: Material[] = [
  {
    ...ts,
    id: "m-tile",
    projectId: MOCK_PROJECT_A_ID,
    categoryId: null,
    name: "客厅地砖 600×600",
    brand: "东鹏",
    spec: "600×600 哑光",
    unit: "箱",
    plannedQty: 40,
    estimatedUnitPrice: yuanToFen(120),
    actualUnitPrice: yuanToFen(115),
    status: "bought",
    channel: "居然之家",
    purchaseUrl: null,
    remark: null,
  },
  {
    ...ts,
    id: "m-paint",
    projectId: MOCK_PROJECT_A_ID,
    categoryId: null,
    name: "乳胶漆 套装",
    brand: "立邦",
    spec: "18L",
    unit: "套",
    plannedQty: 3,
    estimatedUnitPrice: yuanToFen(800),
    actualUnitPrice: null,
    status: "todo",
    channel: null,
    purchaseUrl: null,
    remark: null,
  },
  {
    ...ts,
    id: "m-cabinet",
    projectId: MOCK_PROJECT_A_ID,
    categoryId: null,
    name: "橱柜定制",
    brand: "欧派",
    spec: "L 型",
    unit: "延米",
    plannedQty: 6,
    estimatedUnitPrice: yuanToFen(2_500),
    actualUnitPrice: yuanToFen(2_600),
    status: "arrived",
    channel: "厂家直签",
    purchaseUrl: null,
    remark: null,
  },
];

export const mockPayments: Payment[] = [
  {
    ...ts,
    id: "p-deposit",
    projectId: MOCK_PROJECT_A_ID,
    stageId: null,
    title: "施工定金",
    payeeType: "contractor",
    payableAmount: yuanToFen(50_000),
    paidAmount: yuanToFen(50_000),
    status: "paid",
    dueDate: "2026-06-10",
    paidAt: "2026-06-10",
    remark: null,
  },
  {
    ...ts,
    id: "p-mid",
    projectId: MOCK_PROJECT_A_ID,
    stageId: "st-wood",
    title: "中期款（木作）",
    payeeType: "contractor",
    payableAmount: yuanToFen(80_000),
    paidAmount: yuanToFen(40_000),
    status: "partial",
    dueDate: "2026-08-01",
    paidAt: null,
    remark: null,
  },
];

export const mockStages: Stage[] = [
  {
    ...ts,
    id: "st-demo",
    projectId: MOCK_PROJECT_A_ID,
    name: "拆改",
    sortOrder: 1,
    status: "done",
    progressPercent: 100,
    plannedStartDate: "2026-06-15",
    plannedEndDate: "2026-06-25",
    actualStartDate: "2026-06-15",
    actualEndDate: "2026-06-24",
    remark: null,
  },
  {
    ...ts,
    id: "st-wood",
    projectId: MOCK_PROJECT_A_ID,
    name: "木作安装",
    sortOrder: 2,
    status: "ongoing",
    progressPercent: 45,
    plannedStartDate: "2026-07-01",
    plannedEndDate: "2026-08-15",
    actualStartDate: "2026-07-05",
    actualEndDate: null,
    remark: null,
  },
  {
    ...ts,
    id: "st-finish",
    projectId: MOCK_PROJECT_A_ID,
    name: "软装进场",
    sortOrder: 3,
    status: "pending",
    progressPercent: 0,
    plannedStartDate: "2026-09-01",
    plannedEndDate: "2026-10-01",
    actualStartDate: null,
    actualEndDate: null,
    remark: null,
  },
];

function buildTodos(projectId: string): TodoCard[] {
  return [
    {
      id: "todo-budget",
      kind: "budget",
      title: "预算占用已较高，留意后续大额款项",
      subtitle: "中期款仍有待付",
      severity: "warn",
      href: "/cost",
      projectId,
    },
    {
      id: "todo-paint",
      kind: "material",
      title: "乳胶漆尚未采购",
      subtitle: "待购 · 3 套",
      severity: "info",
      href: "/materials",
      projectId,
    },
    {
      id: "todo-stage",
      kind: "stage_overdue",
      title: "木作安装进行中",
      subtitle: "进度 45%",
      severity: "ok",
      href: "/progress",
      projectId,
    },
  ];
}

export function getMaterialsForProject(projectId: string): Material[] {
  return mockMaterials.filter((m) => m.projectId === projectId);
}

export function getPaymentsForProject(projectId: string): Payment[] {
  return mockPayments.filter((p) => p.projectId === projectId);
}

export function getSpacesForProject(projectId: string): Space[] {
  return mockSpaces.filter((s) => s.projectId === projectId);
}

export function getStagesForProject(projectId: string): Stage[] {
  return mockStages.filter((s) => s.projectId === projectId);
}

export function getProjectOverview(projectId: string = MOCK_PROJECT_A_ID): ProjectOverview {
  const project = mockProjects.find((p) => p.id === projectId);
  if (!project) {
    throw new Error(`mock project not found: ${projectId}`);
  }
  const materials = getMaterialsForProject(projectId);
  const payments = getPaymentsForProject(projectId);
  const budget = computeBudgetSummary(project.totalBudget, materials, payments);
  const health = budgetHealth(budget);
  const stages = getStagesForProject(projectId);
  const currentStage = stages.find((s) => s.status === "ongoing") ?? null;

  const materialCounts = {
    total: materials.length,
    todo: materials.filter((m) => m.status === "todo").length,
    bought: materials.filter((m) => m.status === "bought").length,
    arrived: materials.filter((m) => m.status === "arrived").length,
    installed: materials.filter((m) => m.status === "installed").length,
  };

  return {
    project,
    budget,
    budgetHealth: health,
    materialCounts,
    currentStage,
    todos: projectId === MOCK_PROJECT_A_ID ? buildTodos(projectId) : [],
  };
}

/** 默认总览：望京项目 */
export const mockProjectOverview = getProjectOverview(MOCK_PROJECT_A_ID);
