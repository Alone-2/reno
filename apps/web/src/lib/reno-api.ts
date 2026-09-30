import type {
  ActionItemPriority,
  ActionItemStatus,
  ActionItemType,
  IssueSeverity,
  IssueSourceType,
  IssueStatus,
  MaterialStatus,
  PartyType,
  PaymentConditionStatus,
  PaymentStatus,
  ProjectStatus,
  StageStatus,
} from "@reno/shared";
import { apiRequest } from "./api-client";

export interface ApiUser {
  id: string;
  username: string;
  name?: string | null;
  displayName?: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiProject {
  id: string;
  ownerId: string;
  type: string;
  status: ProjectStatus;
  plannedStart: string | null;
  plannedEnd: string | null;
  actualStart: string | null;
  actualEnd: string | null;
  scope: string | null;
  propertyId: string;
  depositAmount: string | null;
  depositStatus: string;
  createdAt: string;
  updatedAt: string;
  name?: string;
  address?: string | null;
}

export interface ApiSpace {
  id: string;
  projectId: string;
  name: string;
  area: string | number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiMaterial {
  id: string;
  projectId: string;
  name: string;
  category: string;
  spec: string | null;
  unit: string;
  quantity: string | number;
  unitPrice: string | number;
  totalPrice: string | number;
  supplier: string | null;
  supplierContact: string | null;
  supplierPartyId: string | null;
  orderNo: string | null;
  orderDate: string | null;
  expectedArrivalDate: string | null;
  actualArrivalDate: string | null;
  status: MaterialStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiExpense {
  id: string;
  projectId: string;
  category: string;
  amount: string | number;
  description: string | null;
  date: string;
  paid: string | null;
  invoice: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiPhase {
  id: string;
  projectId: string;
  phaseName: string;
  sortOrder: number;
  status: StageStatus;
  standardPhaseKey: string | null;
  isPrimaryCurrent: boolean;
  isAcceptanceRequired: boolean;
  progressPercent: number;
  plannedStart: string | null;
  plannedEnd: string | null;
  actualStart: string | null;
  actualEnd: string | null;
}

export interface ApiDailyLog {
  id: string;
  projectId: string;
  phaseId: string | null;
  content: string;
  materials: string | null;
  workers: string | null;
  tomorrowPlan: string | null;
  createdAt: string;
}

export interface ApiPhoto {
  id: string;
  projectId: string;
  phaseId: string | null;
  inspectionId: string | null;
  violationId: string | null;
  acceptanceId: string | null;
  type: string;
  url: string;
  caption: string | null;
  tags: string | null;
  takenAt: string;
}

export interface ApiViolation {
  id: string;
  projectId: string;
  inspectionId: string | null;
  type: string;
  description: string;
  status: "pending" | "resolved" | "rechecked";
  fine: string | null;
  resolvedAt: string | null;
}

export interface ApiAcceptance {
  id: string;
  projectId: string;
  phaseId: string | null;
  type: "phase" | "final";
  result: "passed" | "rectification" | "rejected";
  checklist: string | null;
  notes: string | null;
  createdAt: string;
}

export interface ApiTodo {
  id: string;
  projectId: string;
  kind: "action" | "issue" | "material" | "delivery" | "payment" | "phase" | "acceptance";
  title: string;
  subtitle: string;
  severity: "info" | "warn" | "urgent";
  href: string;
  status: string;
  dueDate?: string | null;
}

export interface ApiActionItem {
  id: string;
  projectId: string;
  type: ActionItemType;
  priority: ActionItemPriority;
  status: ActionItemStatus;
  title: string;
  notes: string | null;
  decisionResult: string | null;
  dueDate: string | null;
  spaceId: string | null;
  stageId: string | null;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  responsiblePartyId: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiIssue {
  id: string;
  projectId: string;
  title: string;
  description: string;
  severity: IssueSeverity;
  status: IssueStatus;
  sourceType: IssueSourceType;
  sourceEntityId: string | null;
  spaceId: string | null;
  stageId: string | null;
  responsiblePartyId: string | null;
  dueDate: string | null;
  resolutionNotes: string | null;
  resolvedAt: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiParty {
  id: string;
  projectId: string;
  type: PartyType;
  name: string;
  company: string | null;
  phone: string | null;
  wechat: string | null;
  responsibility: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiPayment {
  id: string;
  projectId: string;
  title: string;
  payee: string | null;
  payeePartyId: string | null;
  payableAmount: number;
  paidAmount: number;
  status: PaymentStatus;
  dueDate: string | null;
  paidAt: string | null;
  phaseId: string | null;
  acceptanceId: string | null;
  paymentCondition: string | null;
  conditionStatus: PaymentConditionStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

const list = <T>(data: T[] | { list: T[] }) => (Array.isArray(data) ? data : data.list);

export const renoApi = {
  login: (username: string, password: string) =>
    apiRequest<{ user: ApiUser; accessToken: string; refreshToken: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  projects: async () => list(await apiRequest<ApiProject[] | { list: ApiProject[] }>("/projects")),
  project: (id: string) => apiRequest<ApiProject>(`/projects/${id}`),
  updateProjectStatus: (id: string, status: ProjectStatus, reason?: string) =>
    apiRequest<ApiProject>(`/projects/${id}/status`, {
      method: "POST",
      body: JSON.stringify({ status, reason }),
    }),
  spaces: async (projectId: string) =>
    list(await apiRequest<ApiSpace[]>(`/projects/${projectId}/spaces`)),
  createSpace: (projectId: string, input: Record<string, unknown>) =>
    apiRequest<ApiSpace>(`/projects/${projectId}/spaces`, {
      method: "POST",
      body: JSON.stringify({ ...input, projectId }),
    }),
  checklist: async (spaceId: string) =>
    list(await apiRequest<any[]>(`/spaces/${spaceId}/checklist`)),
  materials: async (projectId: string) =>
    list(await apiRequest<ApiMaterial[]>(`/projects/${projectId}/materials`)),
  createMaterial: (projectId: string, input: Record<string, unknown>) =>
    apiRequest<ApiMaterial>(`/projects/${projectId}/materials`, {
      method: "POST",
      body: JSON.stringify({ ...input, projectId }),
    }),
  updateMaterial: (id: string, input: Record<string, unknown>) =>
    apiRequest<ApiMaterial>(`/materials/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  deleteMaterial: (id: string) => apiRequest<null>(`/materials/${id}`, { method: "DELETE" }),
  expenses: async (projectId: string) =>
    list(await apiRequest<ApiExpense[]>(`/projects/${projectId}/expenses`)),
  createExpense: (projectId: string, input: Record<string, unknown>) =>
    apiRequest<ApiExpense>(`/projects/${projectId}/expenses`, {
      method: "POST",
      body: JSON.stringify({ ...input, projectId }),
    }),
  updateExpense: (id: string, input: Record<string, unknown>) =>
    apiRequest<ApiExpense>(`/expenses/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  deleteExpense: (id: string) => apiRequest<null>(`/expenses/${id}`, { method: "DELETE" }),
  phases: (projectId: string) => apiRequest<ApiPhase[]>(`/projects/${projectId}/phases`),
  updatePhase: (id: string, status: ApiPhase["status"], progressPercent?: number) =>
    apiRequest<ApiPhase>(`/phases/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, progressPercent }),
    }),
  setPrimaryPhase: (projectId: string, phaseId: string) =>
    apiRequest<ApiPhase>(`/projects/${projectId}/phases/${phaseId}/primary`, { method: "PUT" }),
  logs: (projectId: string) => apiRequest<ApiDailyLog[]>(`/projects/${projectId}/logs`),
  createLog: (projectId: string, input: Record<string, unknown>) =>
    apiRequest<ApiDailyLog>(`/projects/${projectId}/logs`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  photos: (projectId: string) => apiRequest<ApiPhoto[]>(`/projects/${projectId}/photos`),
  createPhoto: (projectId: string, input: Record<string, unknown>) =>
    apiRequest<ApiPhoto>(`/projects/${projectId}/photos`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  violations: (projectId: string) =>
    apiRequest<ApiViolation[]>(`/projects/${projectId}/violations`),
  createViolation: (input: Record<string, unknown>) =>
    apiRequest<ApiViolation>("/violations", { method: "POST", body: JSON.stringify(input) }),
  updateViolation: (id: string, status: ApiViolation["status"]) =>
    apiRequest<ApiViolation>(`/violations/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
  acceptances: (projectId: string) =>
    apiRequest<ApiAcceptance[]>(`/projects/${projectId}/acceptances`),
  createAcceptance: (input: Record<string, unknown>) =>
    apiRequest<ApiAcceptance>("/acceptances", { method: "POST", body: JSON.stringify(input) }),
  updateAcceptance: (id: string, result: ApiAcceptance["result"], notes?: string) =>
    apiRequest<ApiAcceptance>(`/acceptances/${id}/approve`, {
      method: "POST",
      body: JSON.stringify({ result, notes }),
    }),
  todos: (projectId: string) => apiRequest<ApiTodo[]>(`/projects/${projectId}/todos`),
  actionItems: (projectId: string, includeDone = false) =>
    apiRequest<ApiActionItem[]>(`/projects/${projectId}/action-items?includeDone=${includeDone}`),
  createActionItem: (projectId: string, input: Record<string, unknown>) =>
    apiRequest<ApiActionItem>(`/projects/${projectId}/action-items`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateActionItem: (projectId: string, id: string, input: Record<string, unknown>) =>
    apiRequest<ApiActionItem>(`/projects/${projectId}/action-items/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  updateActionItemStatus: (projectId: string, id: string, status: ActionItemStatus) =>
    apiRequest<ApiActionItem>(`/projects/${projectId}/action-items/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
  deleteActionItem: (projectId: string, id: string) =>
    apiRequest<null>(`/projects/${projectId}/action-items/${id}`, { method: "DELETE" }),
  issues: (projectId: string, includeVerified = false) =>
    apiRequest<ApiIssue[]>(`/projects/${projectId}/issues?includeVerified=${includeVerified}`),
  createIssue: (projectId: string, input: Record<string, unknown>) =>
    apiRequest<ApiIssue>(`/projects/${projectId}/issues`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateIssueStatus: (
    projectId: string,
    id: string,
    status: IssueStatus,
    resolutionNotes?: string,
  ) =>
    apiRequest<ApiIssue>(`/projects/${projectId}/issues/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, resolutionNotes }),
    }),
  parties: (projectId: string) => apiRequest<ApiParty[]>(`/projects/${projectId}/parties`),
  createParty: (projectId: string, input: Record<string, unknown>) =>
    apiRequest<ApiParty>(`/projects/${projectId}/parties`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateParty: (projectId: string, id: string, input: Record<string, unknown>) =>
    apiRequest<ApiParty>(`/projects/${projectId}/parties/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  deleteParty: (projectId: string, id: string) =>
    apiRequest<null>(`/projects/${projectId}/parties/${id}`, { method: "DELETE" }),
  payments: (projectId: string) => apiRequest<ApiPayment[]>(`/projects/${projectId}/payments`),
  createPayment: (projectId: string, input: Record<string, unknown>) =>
    apiRequest<ApiPayment>(`/projects/${projectId}/payments`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updatePayment: (projectId: string, id: string, input: Record<string, unknown>) =>
    apiRequest<ApiPayment>(`/projects/${projectId}/payments/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
};
