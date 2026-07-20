# 🏠 Reno 装修管家 — 架构设计文档

> 版本：v1.0 | 日期：2026-07-06 | 状态：Active
>
> 本文是 [`PRD.md`](./PRD.md) 的**技术实现架构**。产品需求以 PRD 为准；**依赖版本与工具链纪律以 [`TECH_STACK.md`](./TECH_STACK.md) v1.3 为准**（含长期去 vp、**Oxfmt**、**tsdown**、**shadcn + Base UI**）；**UI 视觉以 [`DESIGN.md`](./DESIGN.md)（Nest 暖巢）为准**。
>
> 本文聚焦结构、数据模型、API 契约引用、部署拓扑；完整版本锁定表见 TECH_STACK §8。

## 1. 项目概述

Reno 是面向**业主本人**的装修管理工具,覆盖从空间规划、装修注意事项、建材采购、成本预算到施工进度与验收的完整装修生命周期。系统为业主个人工具,非物业公司 SaaS 平台,无物业审批、巡检、违规等管理环节。详细业务流程与功能模块见 PRD §2-§3。

本文档目标:

1. 给出一套**最新且最快**的技术栈(2026 年视角),并锁定关键版本。
2. 与 PRD 保持一致,显式记录技术偏差(见 §2)。
3. 使部署架构与**真实 CI/CD** 对齐,而非虚构方案。

---

## 2. 与 PRD 的关系及偏差

PRD §6.2 已明确技术选型,本文档与之**完全对齐**,无技术偏差。核心选型如下:

| 技术点   | PRD §6.2                          | 本架构                                                  | 状态    |
| -------- | --------------------------------- | ------------------------------------------------------- | ------- |
| 前端框架 | React 19 + shadcn/ui + Tailwind 4 | **React 19.2.7 + shadcn/ui（Base UI）+ Tailwind 4.3.2** | ✅ 一致 |
| 后端框架 | Hono + TypeScript                 | **Hono 4.12.27**                                        | ✅ 一致 |
| 数据库   | PostgreSQL 17                     | **PostgreSQL 17.6**                                     | ✅ 一致 |
| ORM      | Drizzle ORM                       | **Drizzle ORM 0.36.4**                                  | ✅ 一致 |
| 校验     | Zod(前后端共享 schema)            | **Zod(前端 4.x / 后端 3.x)**                            | ✅ 一致 |
| 认证     | JWT(用户名+密码,argon2id)         | **jose + @node-rs/argon2**                              | ✅ 一致 |
| 部署     | Docker + 1Panel                   | **1Panel + GitHub Actions**                             | ✅ 一致 |

业务范围、用户角色(业主+可选协作者)、数据模型、API 设计均**对齐 PRD v1.0**。

---

## 3. 技术栈

### 3.1 运行时与工具链

| 技术             | 版本                 | 用途                                                             |
| ---------------- | -------------------- | ---------------------------------------------------------------- |
| **Node.js**      | **24 LTS**           | JS 运行时(原生 `--watch`、`fetch`、`glob`、TS 剥离)              |
| **pnpm**         | **11.9.0**           | 包管理(corepack 启用)                                            |
| **Vite+ (`vp`)** | **0.2.2**（过渡）    | 统一 CLI；**长期移除**，见 [TECH_STACK.md](./TECH_STACK.md) §1.3 |
| **Oxfmt**        | catalog 钉死（目标） | **唯一**格式化（不用 Prettier）                                  |
| **tsdown**       | catalog 钉死（目标） | **唯一**库打包（`@reno/shared` 等；不用 tsup）                   |
| **TypeScript**   | **5.9.3**            | 类型安全(catalog 统一)                                           |

> Node 22 LTS 为保守回退;若部署环境受限可降至 22,但需全链路一致(见 §13)。
>
> 格式化 / 库打包 / 去 vp 纪律以 **TECH_STACK v1.2** 为准：长期 **Vite + Vitest + Oxlint + Oxfmt + tsdown**。

### 3.2 前端

| 技术                            | 版本                | 用途                                                          |
| ------------------------------- | ------------------- | ------------------------------------------------------------- |
| **React**                       | **19.2.7**          | UI 框架(Actions / `useOptimistic` / `use()` / ref-as-prop)    |
| **React DOM**                   | **19.2.7**          | React DOM 渲染                                                |
| **Vite (Rolldown)**             | **catalog → 8.1.0** | 构建(catalog 重定向到 `@voidzero-dev/vite-plus-core`)         |
| **@vitejs/plugin-react**        | **6.0.3**           | React Fast Refresh / JSX(集成 React Compiler)                 |
| **babel-plugin-react-compiler** | **1.0.0**           | React Compiler(自动 memoization,无需手动 useMemo/useCallback) |
| **Tailwind CSS**                | **4.3.2**           | 样式(Oxide 引擎,CSS-first `@theme`,删 `tailwind.config.js`)   |
| **@tailwindcss/vite**           | **4.3.2**           | Tailwind 4 Vite 插件(替代 postcss/autoprefixer)               |
| **shadcn/ui**                   | 源码进仓            | UI 组件（**Base UI** + CVA + Tailwind 4 / OKLCH）             |
| **@base-ui/react**              | 钉死（≥1.6）        | shadcn 无样式底座；**新组件不用 Radix**                       |
| **React Router**                | **7.18.1**          | 路由                                                          |
| **TanStack Query**              | **5.101.2**         | 服务端状态                                                    |
| **TanStack Table**              | **8.21.3**          | 表格                                                          |
| **Zustand**                     | **5.0.14**          | 客户端状态                                                    |
| **React Hook Form**             | **7.80.0**          | 表单                                                          |
| **@hookform/resolvers**         | **5.4.0**           | RHF + Zod 适配                                                |
| **Zod**                         | **4.4.3**           | 校验(与后端共享 schema)                                       |
| **Recharts**                    | **3.9.1**           | 图表                                                          |
| **lucide-react**                | **1.23.0**          | 图标                                                          |
| **class-variance-authority**    | **0.7.1**           | 组件变体                                                      |
| **clsx**                        | **2.1.1**           | className 合并                                                |
| **tailwind-merge**              | **3.6.0**           | Tailwind class 去重                                           |
| 原生 `fetch`                    | —                   | 网络请求(配合 TanStack Query)                                 |

### 3.3 后端

| 技术                  | 版本         | 用途                                        |
| --------------------- | ------------ | ------------------------------------------- |
| **Hono**              | **4.12.27**  | Web 框架(超轻量、edge-ready)                |
| **@hono/node-server** | **1.19.14**  | Node 适配                                   |
| **Drizzle ORM**       | **0.36.4**   | ORM(SQL-first,替换 Prisma)                  |
| **postgres.js**       | **3.4.9**    | PostgreSQL 驱动                             |
| **Drizzle Kit**       | **0.30.6**   | 迁移与 schema 推导                          |
| **PostgreSQL**        | **17.6**     | 数据库(服务器容器 `1Panel-postgresql-Bfcg`) |
| **jose**              | **5.9.6**    | JWT(HS256,access 2h + refresh 7d)           |
| **@hono/zod-openapi** | **1.4.0**    | Zod 校验 + 自动 OpenAPI 文档(支持 Zod v4)   |
| **@node-rs/argon2**   | **2.0.2**    | 密码哈希(argon2id,替换 bcrypt)              |
| **Zod**               | **4.4.3**    | 校验(前后端共享同一版本,catalog 统一管理)   |
| **sharp**             | latest(待装) | 图片压缩                                    |
| **pino**              | latest(待装) | 结构化日志                                  |

> 移除项:`prisma`、`multer`(改用 Hono 原生 `c.req.parseBody()`)、`bcrypt`、`jsonwebtoken`(改 `jose`)、`axios`。

### 3.4 共享包

| 包               | 内容                                                           |
| ---------------- | -------------------------------------------------------------- |
| `@reno/shared`   | Zod schema + Drizzle 推断类型 + 枚举/常量(单一真相源,契约优先) |
| `@reno/db`       | Drizzle schema + 迁移(对齐 PRD §10)                            |
| `@reno/utils`    | 通用工具函数                                                   |
| `@reno/ui`(可选) | 跨端共享 UI 组件                                               |

前后端**导入同一份 Zod schema** → 端到端类型安全,无契约漂移。库包构建使用 **tsdown**（Rolldown；**不用 tsup**）。格式化使用 **Oxfmt**（**不用 Prettier**）。详见 TECH_STACK §1.4。

---

## 4. 运行时与版本锁定(核心)

为消除"文档说 20、CI 用 22、engines 写 22.18"的不一致,全链路统一锁定如下,**四处必须保持一致**:

| 位置                      | 字段                               | 值                    |
| ------------------------- | ---------------------------------- | --------------------- |
| `.nvmrc`                  | —                                  | `24`                  |
| 根 `package.json`         | `engines.node`                     | `>=24.0.0`            |
| 根 `package.json`         | `packageManager`                   | `pnpm@11.9.0`         |
| 根 `package.json`         | `devEngines.packageManager`        | `pnpm@11.9.0`         |
| `.github/workflows/*.yml` | `setup-node` / `pnpm/action-setup` | Node 24 + pnpm 11.9.0 |

```jsonc
// 根 package.json(节选)
{
  "engines": { "node": ">=24.0.0" },
  "packageManager": "pnpm@11.9.0",
  "devEngines": {
    "packageManager": { "name": "pnpm", "version": "11.9.0", "onFail": "download" },
  },
}
```

```bash
# .nvmrc
24
```

CI 推荐用 corepack + 官方 action,替代 `npm install -g pnpm`:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: "24"
- uses: pnpm/action-setup@v4
  with:
    version: 11.9.0
- run: pnpm install --frozen-lockfile
```

版本统一通过 `pnpm-workspace.yaml` 的 **catalog** 模式管理(`typescript`、`vite`、`vitest`、`@types/node` 等),各 app 仅写 `"typescript": "catalog:"`,避免版本漂移。

---

## 5. 项目结构

```
reno/
├── apps/
│   ├── web/                    # 前端 React 19 应用
│   │   ├── src/
│   │   │   ├── components/     # 组件
│   │   │   │   └── ui/         # shadcn/ui（Base UI 底座）
│   │   │   ├── routes/         # TanStack Router 路由(文件式/代码式)
│   │   │   ├── hooks/          # 自定义 hooks
│   │   │   ├── stores/         # Zustand stores
│   │   │   ├── lib/            # 工具函数(api 封装、cn 等)
│   │   │   ├── api/            # API 调用封装(fetch + TanStack Query)
│   │   │   └── main.tsx        # 入口
│   │   ├── public/
│   │   └── vite.config.ts      # 走 vite-plus(catalog)
│   │
│   └── server/                 # 后端 Hono 应用
│       └── src/
│           ├── routes/         # 路由(@hono/zod-openapi)
│           ├── middleware/     # 鉴权、数据隔离、限流、日志
│           ├── services/       # 业务逻辑
│           ├── uploads/        # 上传文件存储
│           └── main.ts         # 入口
│
├── packages/
│   ├── shared/                 # Zod schema + 类型 + 枚举(单一真相源)
│   ├── db/                     # Drizzle schema + 迁移
│   ├── utils/                  # 通用工具
│   └── ui/                     # 共享 UI(可选)
│
├── benchmark/                  # Hono vs NestJS 基准(独立,见注)
├── docs/                       # 文档
├── pnpm-workspace.yaml         # workspace + catalog
├── vite.config.ts              # 根 Vite+ 配置(fmt/lint/run)
├── .nvmrc                      # Node 版本锁定
└── package.json                # 根配置(engines/packageManager)
```

> `benchmark/` 当前用 npm 且 `typescript: ^6.0.3` 与 catalog 不一致,需纳入 workspace 并统一版本(见 §13)。

---

## 6. 数据模型(Drizzle)

对齐 PRD §4 / §10 的完整领域模型。以下为核心表(Drizzle `pgTable`),完整 schema 置于 `packages/db`。

### 6.1 用户表

```ts
// packages/db/src/schema/user.ts
import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: varchar("username", { length: 50 }).unique().notNull(), // 登录账号
  passwordHash: varchar("password_hash").notNull(), // argon2id
  name: varchar("name", { length: 50 }), // 显示名
  phone: varchar("phone", { length: 20 }), // 可选,不用于登录
  avatar: varchar("avatar", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

> 本系统为业主个人工具,**无多角色 RBAC**。所有登录用户即业主,拥有自己项目的全部权限。无物业、巡检员、装修公司等角色。

### 6.2 装修项目表

```ts
// packages/db/src/schema/project.ts
export const projectTypeEnum = pgEnum("project_type", ["full", "half", "clear"]);
export const projectStatusEnum = pgEnum("project_status", [
  "planning",
  "constructing",
  "accepting",
  "completed",
  "archived",
]);

export const renovationProject = pgTable("renovation_project", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id").notNull(), // 业主 ID
  name: varchar("name", { length: 100 }).notNull(),
  address: varchar("address", { length: 255 }),
  type: projectTypeEnum("type").notNull(), // full / half / clear
  style: varchar("style", { length: 50 }), // 装修风格
  scope: text("scope"), // 装修范围
  totalBudget: decimal("total_budget", { precision: 12, scale: 2 }),
  plannedStart: date("planned_start"),
  plannedEnd: date("planned_end"),
  status: projectStatusEnum("status").default("planning").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### 6.3 空间与分区表

```ts
// packages/db/src/schema/space.ts
export const space = pgTable("space", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull(),
  name: varchar("name", { length: 50 }).notNull(), // 客厅/主卧/厨房/...
  area: decimal("area", { precision: 10, scale: 2 }), // 面积 m²
  styleNotes: text("style_notes"),
  photos: json("photos").$type<string[]>(), // 照片 URL 数组
  designDocs: json("design_docs").$type<string[]>(), // 设计图纸 URL 数组
});

export const spaceZone = pgTable("space_zone", {
  id: uuid("id").defaultRandom().primaryKey(),
  spaceId: uuid("space_id").notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  position: varchar("position", { length: 100 }),
  dimensions: varchar("dimensions", { length: 50 }), // 长×宽×高 cm
  planNotes: text("plan_notes"),
});
```

### 6.4 家具家电规划表

```ts
export const itemStatusEnum = pgEnum("item_status", ["pending", "purchased", "installed"]);

export const plannedItem = pgTable("planned_item", {
  id: uuid("id").defaultRandom().primaryKey(),
  spaceId: uuid("space_id").notNull(),
  zoneId: uuid("zone_id"), // 可选
  name: varchar("name", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }),
  brand: varchar("brand", { length: 100 }),
  model: varchar("model", { length: 100 }),
  dimensions: varchar("dimensions", { length: 50 }),
  budgetPrice: decimal("budget_price", { precision: 10, scale: 2 }),
  status: itemStatusEnum("status").default("pending").notNull(),
  linkedMaterialId: uuid("linked_material_id"), // 关联建材
});
```

### 6.5 装修注意事项表

```ts
export const checklistStatusEnum = pgEnum("checklist_status", [
  "pending",
  "confirmed",
  "completed",
  "rectification",
]);

export const checklistItem = pgTable("checklist_item", {
  id: uuid("id").defaultRandom().primaryKey(),
  spaceId: uuid("space_id").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // 插座/灯光/水路/...
  content: text("content").notNull(),
  pitfallTip: text("pitfall_tip"), // 避坑提醒
  status: checklistStatusEnum("status").default("pending").notNull(),
  linkedMaterialId: uuid("linked_material_id"), // 关联建材
  linkedPhaseId: uuid("linked_phase_id"), // 关联施工阶段
});
```

### 6.6 建材表

```ts
export const purchaseStatusEnum = pgEnum("purchase_status", [
  "pending",
  "purchased",
  "delivered",
  "installed",
]);

export const material = pgTable("material", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }), // 瓷砖/涂料/板材/...
  brand: varchar("brand", { length: 100 }),
  spec: varchar("spec", { length: 100 }),
  unit: varchar("unit", { length: 20 }),
  plannedQuantity: decimal("planned_quantity", { precision: 10, scale: 2 }),
  estimatedPrice: decimal("estimated_price", { precision: 10, scale: 2 }),
  estimatedTotal: decimal("estimated_total", { precision: 12, scale: 2 }),
  actualPrice: decimal("actual_price", { precision: 10, scale: 2 }),
  actualTotal: decimal("actual_total", { precision: 12, scale: 2 }),
  purchaseStatus: purchaseStatusEnum("purchase_status").default("pending").notNull(),
  purchaseChannel: varchar("purchase_channel", { length: 100 }),
  purchaseLink: varchar("purchase_link", { length: 500 }),
  notes: text("notes"),
});

export const materialPlacement = pgTable("material_placement", {
  id: uuid("id").defaultRandom().primaryKey(),
  materialId: uuid("material_id").notNull(),
  spaceId: uuid("space_id").notNull(),
  zoneId: uuid("zone_id"), // 可选
  locationDesc: varchar("location_desc", { length: 200 }), // 如"厨房台面"
  usageQuantity: decimal("usage_quantity", { precision: 10, scale: 2 }),
  purpose: varchar("purpose", { length: 100 }), // 地面铺贴/墙面/台面/...
});
```

### 6.7 施工阶段与日志表

```ts
export const phaseStatusEnum = pgEnum("phase_status", [
  "pending",
  "in_progress",
  "completed",
  "accepted",
]);

export const projectPhase = pgTable("project_phase", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull(),
  phaseName: varchar("phase_name", { length: 50 }).notNull(), // 拆改/水电/泥木/...
  sortOrder: integer("sort_order").notNull(),
  status: phaseStatusEnum("status").default("pending").notNull(),
  plannedStart: date("planned_start"),
  plannedEnd: date("planned_end"),
  actualStart: date("actual_start"),
  actualEnd: date("actual_end"),
  progressPercent: integer("progress_percent").default(0).notNull(),
});

export const dailyLog = pgTable("daily_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull(),
  phaseId: uuid("phase_id"),
  authorId: uuid("author_id").notNull(),
  content: text("content"),
  materials: json("materials").$type<Record<string, unknown>>(),
  workers: varchar("workers", { length: 200 }),
  photos: json("photos").$type<string[]>(),
  tomorrowPlan: text("tomorrow_plan"),
  issues: text("issues"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### 6.8 验收表

```ts
export const acceptanceResultEnum = pgEnum("acceptance_result", ["passed", "rectification"]);

export const acceptance = pgTable("acceptance", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull(),
  phaseId: uuid("phase_id"),
  type: varchar("type", { length: 20 }).notNull(), // 阶段 / 竣工
  checklist: json("checklist").$type<Record<string, unknown>>(),
  result: acceptanceResultEnum("result"),
  notes: text("notes"),
  photos: json("photos").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### 6.9 费用与款项表

```ts
export const expenseTypeEnum = pgEnum("expense_type", [
  "material",
  "labor",
  "design",
  "furniture",
  "softfit",
  "other",
]);

export const expense = pgTable("expense", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  type: expenseTypeEnum("type").notNull(),
  spaceId: uuid("space_id"), // 可选
  materialId: uuid("material_id"), // 可选,自动带入金额
  phaseId: uuid("phase_id"), // 可选
  payDate: date("pay_date"),
  payMethod: varchar("pay_method", { length: 50 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid"]);

export const payment = pgTable("payment", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull(),
  nodeName: varchar("node_name", { length: 100 }).notNull(), // 付款节点名称
  sequence: integer("sequence").notNull(), // 期次排序
  dueAmount: decimal("due_amount", { precision: 12, scale: 2 }),
  paidAmount: decimal("paid_amount", { precision: 12, scale: 2 }),
  paidDate: date("paid_date"),
  status: paymentStatusEnum("status").default("pending").notNull(),
});
```

### 6.10 ER 关系

ER 关系见 PRD §10.1 的 mermaid 图。核心链路:

```
User → RenovationProject → Space → SpaceZone / PlannedItem / ChecklistItem
                          → Material → MaterialPlacement → Space/Zone
                          → ProjectPhase → DailyLog / Acceptance
                          → Expense / Payment
```

### 敏感字段

| 字段                               | 所属表             | 处理                      |
| ---------------------------------- | ------------------ | ------------------------- |
| `phone`                            | user               | 脱敏显示(中间四位 `****`) |
| `estimated_total` / `actual_total` | material           | 仅登录可见                |
| `amount`                           | expense            | 仅登录可见                |
| `total_budget`                     | renovation_project | 仅登录可见                |

---

## 7. API 设计

接口清单见 PRD §5(5.1-5.10),本节定义**契约格式与统一响应**。

### 统一响应

```ts
interface ApiResponse<T> {
  code: number; // 0=成功, 非0=错误码
  message: string;
  data: T;
}

interface PaginatedData<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

### 契约即代码(Zod + @hono/zod-openapi)

前后端共享同一 schema,后端自动生成 OpenAPI:

```ts
// packages/shared/src/schemas/project.ts
import { z } from "zod";

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(100),
  address: z.string().max(255).optional(),
  type: z.enum(["full", "half", "clear"]),
  style: z.string().max(50).optional(),
  scope: z.string().optional(),
  totalBudget: z.number().nonnegative().optional(),
  plannedStart: z.string().date().optional(),
  plannedEnd: z.string().date().optional(),
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
```

```ts
// apps/server/src/routes/projects.ts
import { createRoute } from "@hono/zod-openapi";
import { CreateProjectSchema } from "@reno/shared";

export const createProject = createRoute({
  method: "post",
  path: "/api/projects",
  request: { body: { content: { "application/json": { schema: CreateProjectSchema } } } },
  responses: { 201: { content: { "application/json": { schema: ProjectSchema } } } },
  middleware: [auth], // 仅需登录,业主拥有自己项目全部权限
});
```

前端用同一 `CreateProjectSchema` 做表单校验,请求/响应类型由 schema 推断,**零漂移**。

---

## 8. 认证与权限

### 认证流程

```
用户名 + 密码登录 → argon2id 校验 → 签发 Access(2h) + Refresh(7d)
→ 请求携带 Access → jose 验证(HS256) → 注入 c.var.user
→ Refresh 过期前刷新(含轮换:旧 refresh 失效)
```

> 不使用短信验证码服务。用户系统基于用户名+密码,密码使用 argon2id 哈希存储。

### 权限模型

本系统为业主个人工具,**无多角色 RBAC**。权限模型如下:

| 规则              | 说明                                                                    |
| ----------------- | ----------------------------------------------------------------------- |
| 登录即业主        | 所有登录用户拥有自己创建的项目及其子资源的全部 CRUD 权限                |
| 数据隔离          | 业主只能访问自己 `ownerId` 的项目和关联数据,后端按 `c.var.user.id` 过滤 |
| 协作者(可选,v1.2) | 业主可邀请家人/设计师,授权只读或编辑权限                                |

```ts
// apps/server/src/middleware/auth.ts
// 仅校验登录,不校验角色
export const auth = createMiddleware(async (c, next) => {
  const token = c.req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return c.json({ code: 401, message: "未登录", data: null }, 401);
  try {
    const payload = await jose.jwtVerify(token, secret);
    c.set("user", { id: payload.sub! });
    await next();
  } catch {
    return c.json({ code: 401, message: "Token 无效", data: null }, 401);
  }
});

// 数据隔离:查询时强制带 ownerId
app.get("/api/projects", auth, async (c) => {
  const userId = c.var.user.id;
  const projects = await db
    .select()
    .from(renovationProject)
    .where(eq(renovationProject.ownerId, userId));
  return c.json({ code: 0, message: "ok", data: projects });
});
```

---

## 9. 敏感数据处理

```ts
// 仅登录用户可见金额相关字段(本系统所有接口均需登录,此处为防御性处理)
function filterSensitive<T>(data: T, isAuthenticated: boolean): T {
  if (isAuthenticated) return data;
  const SENSITIVE = ["estimatedTotal", "actualTotal", "amount", "totalBudget"];
  return Array.isArray(data)
    ? (data.map((d) => omit(d, SENSITIVE)) as T)
    : (omit(data, SENSITIVE) as T);
}
```

```jsonc
// 建材列表响应(已登录业主)
{
  "code": 0,
  "message": "ok",
  "data": [
    {
      "id": "1",
      "name": "石英石板材",
      "category": "板材",
      "unit": "㎡",
      "plannedQuantity": 8,
      "estimatedTotal": "3200.00",
      "purchaseStatus": "pending",
    },
  ],
}
```

---

## 10. 文件 / 照片存储

### 存储结构

```
apps/server/uploads/
├── projects/<projectId>/<YYYY-MM-DD>_<seq>.webp
└── avatars/<userId>.webp
```

### 上传处理

- 单文件最大:**20MB**(对齐 PRD §7)
- 支持格式:jpg / jpeg / png / webp
- 压缩:**sharp** 转码为 webp,超过 1920px 宽度等比缩放
- 解析:Hono 原生 `c.req.parseBody()`(无需 multer)
- 生产建议:对象存储(阿里云 OSS / MinIO),本地存储为开发期方案

---

## 11. 状态管理(前端)

```ts
// 认证 Store(Zustand)
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

// UI Store
interface UIStore {
  sidebarOpen: boolean;
  theme: "light" | "dark";
  toggleSidebar: () => void;
  setTheme: (t: "light" | "dark") => void;
}
```

服务端状态统一交由 **TanStack Query**;客户端 UI 状态用 **Zustand**;URL 状态(筛选/分页/排序)用 **TanStack Router** 的类型安全 search params。

---

## 12. 部署架构(对齐真实 CI)

> 旧版文档的 `docker-compose` + `nginx` 段与实际不符,已移除。真实部署如下。

### Web(前端)

```
GitHub Actions(master push)
  → setup Node 24 + pnpm 11.9.0(pnpm/action-setup)
  → pnpm install --frozen-lockfile
  → pnpm --filter @reno/web build      # Vite+/Rolldown 产物
  → tar -cf reno-web-dist.tar -C dist .
  → scp 上传到 1Panel 服务器
  → 远程解压到 /opt/1panel/www/sites/reno.lijiakai.com/index
  → 1Panel 静态站点托管(https://reno.lijiakai.com/)
```

详见 `.github/workflows/deploy-web.yml` 与 `apps/web/deploy.sh`。

### Server(后端)

```
Node 24 + @hono/node-server(v2)
  → pnpm --filter @reno/shared build   # tsdown
  → pnpm --filter @reno/server build   # tsc
  → pnpm --filter @reno/web build      # vite build
  → 进程管理:PM2 或 systemd
  → 反向代理:1Panel OpenResty/Nginx → http://127.0.0.1:3000
  → 数据库:PostgreSQL 17(独立实例或托管)
```

### 可选:自托管 Docker(开发/隔离环境)

```yaml
# docker-compose.yml(可选,非默认部署)
services:
  postgres:
    image: postgres:17-alpine
    environment: { POSTGRES_DB: reno, POSTGRES_USER: reno, POSTGRES_PASSWORD: ${DB_PASSWORD} }
    volumes: [postgres_data:/var/lib/postgresql/data]
    ports: ["5432:5432"]
  server:
    build: ./apps/server
    environment:
      DATABASE_URL: postgresql://reno:${DB_PASSWORD}@postgres:5432/reno
      JWT_SECRET: ${JWT_SECRET}
    ports: ["3000:3000"]
    depends_on: [postgres]
volumes: { postgres_data: {} }
```

---

## 13. 版本锁定总表

| 项                          | 版本        | 锁定位置                                |
| --------------------------- | ----------- | --------------------------------------- |
| **Node.js**                 | **24 LTS**  | `.nvmrc` / `engines` / CI               |
| **pnpm**                    | **11.9.0**  | `packageManager` / `devEngines` / CI    |
| TypeScript                  | **5.9.3**   | catalog                                 |
| Vite+ (Rolldown)            | **0.2.2**   | catalog(`@voidzero-dev/vite-plus-core`) |
| Vite (实际)                 | **8.1.0**   | catalog 重定向                          |
| Vitest                      | **4.1.9**   | catalog                                 |
| React                       | **19.2.7**  | `apps/web`                              |
| React DOM                   | **19.2.7**  | `apps/web`                              |
| @types/react                | **19.2.17** | `apps/web`                              |
| @vitejs/plugin-react        | **6.0.3**   | `apps/web`(集成 React Compiler)         |
| babel-plugin-react-compiler | **1.0.0**   | `apps/web`(React Compiler)              |
| Tailwind CSS                | **4.3.2**   | `apps/web`(CSS-first,无 config)         |
| @tailwindcss/vite           | **4.3.2**   | `apps/web`                              |
| Hono                        | **4.12.27** | `apps/server`                           |
| @hono/node-server           | **1.19.14** | `apps/server`                           |
| Drizzle ORM                 | **0.36.4**  | `packages/db` / `apps/server`           |
| Drizzle Kit                 | **0.30.6**  | `packages/db`                           |
| postgres.js                 | **3.4.9**   | `packages/db`                           |
| jose                        | **5.9.6**   | `apps/server`                           |
| @node-rs/argon2             | **2.0.2**   | `apps/server`                           |
| @hono/zod-openapi           | **1.4.0**   | `apps/server`(支持 Zod v4)              |
| Zod                         | **4.4.3**   | catalog(前后端统一)                     |
| PostgreSQL                  | **17.6**    | 服务器 `1Panel-postgresql-Bfcg`         |

### 待办(版本一致性)

- [ ] `benchmark/` 纳入 pnpm workspace,`typescript` 改 `catalog:`,移除 `package-lock.json`
- [x] ~~`apps/web` 的 `vite` / `tailwindcss` / `postcss` 改用 catalog~~ → 已完成(vite: catalog, tailwind: 4.3.2, 删 postcss)
- [ ] `apps/server` 的 `@types/node` 升至 catalog 的 `^24`
- [x] ~~`apps/web` 修正 `lucide-react` 版本号~~ → 已完成(1.23.0)
- [ ] 新增 `.nvmrc`、根 `packageManager` 字段
- [ ] CI 统一 Node 24 + `pnpm/action-setup@v4`

---

## 14. 工程化规范

### Vite+ 命令

```bash
vp install          # 安装依赖
vp check            # 格式化 + lint + 类型检查
vp test             # 单元测试(Vitest 4)
vp run -r build     # 构建所有包/应用
vp run ready        # check + test + build 全流程
vp run dev          # 启动前端
vp run dev:server   # 启动后端
vp env doctor       # 环境诊断
```

### 命名规范

- 组件:PascalCase
- 工具函数:camelCase
- API 路径:kebab-case
- 数据库表:snake_case(Drizzle `pgTable` 第一参数)
- Zod schema:PascalCase + `Schema` 后缀

### 错误处理

- API 统一返回 `{ code, message, data }`(`code: 0` 为成功)
- 前端统一 Toast 提示
- 表单校验错误内联显示(Zod + React Hook Form)

### 代码组织

- 类型与 schema 集中在 `packages/shared`(`types/`、`schemas/`、`enums/`)
- API 调用封装在 `apps/web/src/api/`
- 路由级数据获取用 TanStack Router loader + TanStack Query

---

## 15. 环境变量

### 后端 `.env`

```env
DATABASE_URL=postgresql://reno:password@localhost:5432/reno
JWT_SECRET=your-super-secret-key-change-this
JWT_ACCESS_TTL=2h
JWT_REFRESH_TTL=7d
ENABLE_REGISTRATION=false
PORT=3000
MAX_FILE_SIZE=20971520
```

### 前端 `.env`

```env
VITE_API_BASE_URL=http://localhost:3000
```

---

_本文档由 Reno 项目团队维护,与 PRD v1.0 配套使用。技术选型以本文 §2-§3 为准。_
