# Reno 装修管家 — 技术方案清单

> 版本：v1.3 | 日期：2026-07-17 | 状态：Active
>
> 配套文档：[PRD.md](./PRD.md)（v1.1）、[ARCHITECTURE.md](./ARCHITECTURE.md)、[DESIGN.md](./DESIGN.md)（Nest 暖巢 UI）
>
> v1.3 变更：shadcn/ui **默认底座改为 Base UI**（`@base-ui/react`）；不再以 Radix 为新组件默认依赖。
>
> v1.2 变更：格式化锁定 **Oxfmt**（不用 Prettier）；库打包锁定 **tsdown**（不用 tsup）；与长期去 vp 目标对齐。
>
> v1.1 变更：对齐 PRD v1.1；扩大 catalog 纪律；禁止 `latest`；明确 `@reno/shared` 契约；补上传/日志/测试/部署规范；工具链战略「过渡期可保留 vp → 长期去 vp」。

---

## 0. 技术原则（强制）

| #   | 原则             | 说明                                                             |
| --- | ---------------- | ---------------------------------------------------------------- |
| 1   | **版本可复现**   | 禁止依赖写 `latest`；共享依赖进 pnpm catalog 并钉版本            |
| 2   | **契约优先**     | API / 枚举 / 状态机 / 预算公式以 `@reno/shared` 为单一真相源     |
| 3   | **范围对齐 PRD** | 依赖按 MVP / v1.1 / v1.2 裁剪，不为远期功能预装                  |
| 4   | **工具链可迁移** | 当前允许 Vite+（vp）过渡；**长期目标去掉 vp**，改标准 Vite 生态  |
| 5   | **状态边界清晰** | 服务端状态 → TanStack Query；UI 状态 → Zustand；表单 → RHF + Zod |

---

## 1. 运行时与工具链

### 1.1 目标态（长期，去 vp）

| 技术           | 版本策略                                                | 用途                                                                 |
| -------------- | ------------------------------------------------------- | -------------------------------------------------------------------- |
| **Node.js**    | `24 LTS`（`.nvmrc` + `engines` 钉死）                   | 运行时                                                               |
| **pnpm**       | `11.9.0`（`packageManager` 钉死）                       | 包管理 + catalog                                                     |
| **TypeScript** | catalog 钉死（当前 `5.9.3`）                            | 类型检查                                                             |
| **Vite**       | catalog 钉死**标准包** `vite@^6` 或项目选定的稳定主版本 | dev / build（**不再**重定向到 vite-plus-core）                       |
| **Vitest**     | catalog 钉死                                            | 单测 / 组件测 / API 测                                               |
| **Oxlint**     | catalog 钉死                                            | Lint                                                                 |
| **Oxfmt**      | catalog 钉死                                            | Format（**唯一**格式化工具；不用 Prettier）                          |
| **tsdown**     | catalog 钉死                                            | `@reno/shared` / `@reno/utils` 库打包（**唯一**库打包器；不用 tsup） |
| **tsx**        | 钉死                                                    | server 本地 dev                                                      |

### 1.2 过渡态（当前，仍可用 vp）

| 技术                    | 版本                                                           | 用途                                          | 约束                         |
| ----------------------- | -------------------------------------------------------------- | --------------------------------------------- | ---------------------------- |
| **Vite+ (`vp`)**        | **必须钉死具体版本**（当前文档参考 `0.2.2`，以 lockfile 为准） | 统一 CLI：install / dev / check / test / pack | **禁止 `vite-plus: latest`** |
| **vite catalog 重定向** | `@voidzero-dev/vite-plus-core@<钉死版本>`                      | 兼容现有 `vp` 脚本                            | 去 vp 时**删除**此重定向     |

> **战略结论：** vp 仅作过渡脚手架，**不作为长期架构依赖**。新脚本优先写成标准命令（`vite` / `vitest` / `tsc` / `oxlint` / `oxfmt` / `tsdown`），便于逐步替换 `vp *`。

### 1.3 去 vp 迁移路线图

| 阶段        | 动作                                                                                                           | 完成标准                                    |
| ----------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| **T0 现在** | 钉死 `vite-plus` / core 版本；文档标明过渡；新代码不新增 vp 专有配置字段（`pack`/`lint`/`fmt` 以外的扩展慎用） | lockfile 无 `latest`                        |
| **T1**      | catalog 改为标准 `vite`；根脚本 `dev/build/test/check` 双轨（`vp` 与标准命令并存）                             | `pnpm dev` / `pnpm build` 可不依赖全局 `vp` |
| **T2**      | 各包 `package.json` scripts 全部改为标准 CLI；`vite.config` 改为 `import { defineConfig } from "vite"`         | CI 只跑标准命令                             |
| **T3**      | 移除 `vite-plus` 依赖、catalog 重定向、`vp config` prepare 钩子、VoidZero 扩展推荐                             | 仓库内无 `vite-plus` / `vp ` 引用           |
| **T4**      | 库打包统一 **tsdown**；lint/format 独立配置（**Oxlint + Oxfmt**）                                              | `ARCHITECTURE` / `TECH_STACK` 删除过渡说明  |

**命令映射（迁移对照）**

| 过渡（vp）                | 目标（标准）                                                   |
| ------------------------- | -------------------------------------------------------------- |
| `vp install`              | `pnpm install`                                                 |
| `vp dev` / `vite`         | `vite`                                                         |
| `vp build` / `vite build` | `vite build`                                                   |
| `vp test`                 | `vitest run`                                                   |
| `vp check`                | `oxlint . && oxfmt --check . && tsc -b --pretty false`（可调） |
| `vp pack`                 | **`tsdown`**（仅库包：`@reno/shared` / `@reno/utils`）         |
| `vp run -r <script>`      | `pnpm -r run <script>`                                         |
| `vp config`               | 删除；改用仓库内静态配置                                       |

### 1.4 格式化与库打包约定（锁定）

#### Oxfmt（Format）

| 项         | 约定                                                              |
| ---------- | ----------------------------------------------------------------- |
| 工具       | **仅 Oxfmt**；禁止引入 Prettier / Biome format 作为第二套         |
| 范围       | JS/TS/TSX、JSON、CSS、Markdown 等（以 Oxfmt 语言支持为准）        |
| 脚本       | `format` → `oxfmt .`；`format:check` → `oxfmt --check .`          |
| CI         | `check` 流水线必须包含 `oxfmt --check`                            |
| 编辑器     | 保存时用 Oxfmt；与仓库配置一致                                    |
| 与 TS 关系 | 只做格式化，**不替代** `tsc`；可与 TypeScript 5.x / 未来 7.x 并存 |

#### tsdown（库打包）

| 项       | 约定                                                                |
| -------- | ------------------------------------------------------------------- |
| 工具     | **仅 tsdown**（Rolldown + Oxc）；禁止再引入 tsup / unbuild 打同类库 |
| 用途     | `@reno/shared`、`@reno/utils` 等**库包**产出 ESM + d.ts             |
| 不用     | `apps/web`（用 Vite）；`apps/server`（用 `tsc` / `tsx`）            |
| 默认取向 | ESM 优先；`package.json` 声明 `types` 时开启 dts                    |
| monorepo | 可用 tsdown workspace / 各包独立 `tsdown` script                    |
| 迁移     | 若历史有 tsup 配置，用 `npx tsdown-migrate` 后删除 tsup             |

---

## 2. 前端

### 2.1 核心（MVP 即装）

| 技术                            | 版本                                             | 用途                                                                    |
| ------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------- |
| **React**                       | `19.2.7`                                         | UI（catalog 统一）                                                      |
| **React DOM**                   | `19.2.7`                                         | 渲染（catalog 统一）                                                    |
| **@types/react**                | `19.2.x`                                         | 类型（catalog）                                                         |
| **@types/react-dom**            | `19.2.x`                                         | 类型（catalog）                                                         |
| **Vite**                        | 见 §1（过渡期可为 plus-core；目标为标准 vite）   | 构建                                                                    |
| **@vitejs/plugin-react**        | `6.0.3`                                          | JSX / Fast Refresh + **React Compiler**                                 |
| **babel-plugin-react-compiler** | `1.0.0`                                          | 自动 memoization                                                        |
| **Tailwind CSS**                | `4.3.2`                                          | 样式（CSS-first `@theme`）                                              |
| **@tailwindcss/vite**           | `4.3.2`                                          | Tailwind Vite 插件                                                      |
| **shadcn/ui**                   | 组件源码拷贝进 `apps/web`（**不锁 npm latest**） | UI 层；**底座 = Base UI**（`@base-ui/react`）+ CVA + Tailwind 4 / OKLCH |
| **@base-ui/react**              | 钉死具体版本（catalog 或 web）                   | shadcn 无样式原语；**新组件默认只加 Base UI 版**                        |
| **class-variance-authority**    | `0.7.1`                                          | 组件变体                                                                |
| **React Router**                | `7.18.1`                                         | 路由                                                                    |
| **TanStack Query**              | `5.101.2`                                        | 服务端状态                                                              |
| **TanStack Table**              | `8.21.3`                                         | 表格（建材/款项列表）                                                   |
| **Zustand**                     | `5.0.14`                                         | 客户端 UI 状态（当前项目、侧栏等）                                      |
| **React Hook Form**             | `7.80.0`                                         | 表单                                                                    |
| **@hookform/resolvers**         | `5.4.0`                                          | RHF ↔ Zod                                                               |
| **Zod**                         | `4.4.3`                                          | 校验（catalog，与后端同一版本）                                         |
| **lucide-react**                | 钉死小版本                                       | 图标                                                                    |
| **clsx** + **tailwind-merge**   | 钉死                                             | className 工具                                                          |
| 原生 `fetch`                    | —                                                | HTTP（经 Query）；**不引入 axios**                                      |

### 2.2 shadcn/ui + Base UI 约定（锁定）

| 项             | 约定                                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **UI 层**      | shadcn/ui：**组件源码拷贝**进 `apps/web/components/ui`，不是从 npm 整包依赖 `shadcn`                                     |
| **无样式底座** | **Base UI**（`@base-ui/react`，≥1.6 稳定线；版本钉死）                                                                   |
| **样式**       | Tailwind CSS 4 + CVA + `cn()`（clsx + tailwind-merge）；主题 OKLCH / CSS variables                                       |
| **初始化**     | 新项目 / 重装：`pnpm dlx shadcn@latest init` 默认即为 Base UI；**禁止**无理由使用 `-b radix`                             |
| **新增组件**   | `pnpm dlx shadcn@latest add <name>`，只加 **Base UI** 变体；文档以 [ui.shadcn.com](https://ui.shadcn.com) Base UI 页为准 |
| **Radix**      | **不为新功能引入** `@radix-ui/*`。若仓库历史残留 Radix 组件：可并存过渡，但应逐步替换；新增页面只用 Base UI 版           |
| **迁移**       | 需要迁存量时：优先官方 skill（`pnpm dlx skills add shadcn/ui`）按组件渐进迁移；**不做**整库盲 codemod                    |
| **API 差异**   | 注意 Base UI 与 Radix 差异（如 `asChild` → `render` 等）；以 shadcn Base UI 文档与迁移报告为准                           |
| **不单独做**   | MVP 不做 `@reno/ui` 包；组件放 `apps/web`                                                                                |

### 2.3 延后安装（对齐 PRD 版本规划）

| 技术              | 版本窗口  | 说明                                 |
| ----------------- | --------- | ------------------------------------ |
| **Recharts**      | v1.1 再装 | 成本图表；**MVP 不装、不进默认依赖** |
| 浏览器推送相关    | v1.1      | 非 MVP                               |
| 导出 PDF/Excel 库 | v1.1      | 如 `exceljs` / 服务端 PDF，届时再定  |

### 2.4 前端状态边界

| 数据                                      | 方案                            | 禁止                            |
| ----------------------------------------- | ------------------------------- | ------------------------------- |
| 服务端资源（项目/建材/阶段…）             | TanStack Query                  | 禁止再抄一份进 Zustand 当源数据 |
| UI 会话（当前 projectId、侧栏折叠、主题） | Zustand                         | —                               |
| 表单草稿 / 校验                           | RHF + `@reno/shared` Zod schema | 前后端各写一套 schema           |

---

## 3. 后端

| 技术                  | 版本                                  | 用途                               |
| --------------------- | ------------------------------------- | ---------------------------------- |
| **Hono**              | `4.12.27`（建议 catalog）             | HTTP 框架                          |
| **@hono/node-server** | `1.19.14`                             | Node 适配（生产主路径；不上 edge） |
| **@hono/zod-openapi** | `1.4.0`（catalog）                    | 路由校验 + OpenAPI（Zod v4）       |
| **Drizzle ORM**       | `0.36.4`（catalog）                   | SQL-first ORM                      |
| **postgres.js**       | `3.4.9`（catalog）                    | PG 驱动                            |
| **Drizzle Kit**       | `0.30.6`（catalog）                   | 迁移                               |
| **PostgreSQL**        | `17.x`（部署实例钉补丁版本）          | 数据库                             |
| **jose**              | `5.9.6`                               | JWT                                |
| **@node-rs/argon2**   | `2.0.2`                               | 密码 argon2id                      |
| **Zod**               | `4.4.3`（catalog）                    | 校验                               |
| **sharp**             | **钉死具体版本后安装**（如 `0.33.x`） | 图片转 webp / 压缩                 |
| **pino**              | **钉死具体版本后安装**                | 结构化日志                         |

> **已移除且不再引入：** `prisma`、`multer`（用 Hono `parseBody`）、`bcrypt`、`jsonwebtoken`、`axios`。

### 3.1 认证（v1）

| 项            | 决策                                                          |
| ------------- | ------------------------------------------------------------- |
| Access Token  | JWT **HS256**，有效期 2h（密钥仅服务端，`JWT_SECRET` 足够长） |
| Refresh Token | 7d，**轮换**；重放检测（存 jti 或 token 版本）                |
| 密码          | argon2id                                                      |
| 权限          | v1 **仅业主**；协作者 v1.2                                    |
| 演进          | 文档预留 RS256/EdDSA + JWKS；多实例或网关拆分时再迁           |

### 3.2 上传与媒体（MVP 最小）

| 项   | 决策                                                                       |
| ---- | -------------------------------------------------------------------------- |
| 存储 | v1：**本地磁盘**或单机挂载目录（由 env `UPLOAD_DIR`）；对象存储 v1.1+ 可选 |
| 处理 | `sharp` → webp；最长边限制（建议 1920）；质量可配置                        |
| 限制 | 类型白名单 `jpg/jpeg/png/webp`；单文件 ≤ 20MB（压缩前）                    |
| 引用 | DB 存相对路径或 URL；删除业务实体时清理孤儿文件（尽力而为）                |

### 3.3 日志与观测（MVP 最小）

| 项       | 决策                                                             |
| -------- | ---------------------------------------------------------------- |
| 日志库   | `pino`（JSON）                                                   |
| 必带字段 | `requestId`、`userId?`、`method`、`path`、`status`、`durationMs` |
| 级别     | dev=`debug`，prod=`info`                                         |
| 健康检查 | `GET /api/health`（进程存活 + 可选 DB ping）                     |

---

## 4. 共享包（Monorepo）

| 包                 | 职责                                  | MVP                             |
| ------------------ | ------------------------------------- | ------------------------------- |
| **`@reno/shared`** | 契约与纯函数（见下）                  | **必做**                        |
| **`@reno/db`**     | Drizzle schema + 迁移（对齐 PRD §10） | **必做**                        |
| **`@reno/utils`**  | 与业务无关的通用工具                  | 可选精简                        |
| **`@reno/ui`**     | 跨端 UI                               | **MVP 不做**；组件放 `apps/web` |

### 4.1 `@reno/shared` 必含模块（技术强制）

| 模块             | 内容                                                                       |
| ---------------- | -------------------------------------------------------------------------- |
| `enums`          | 项目/建材/阶段/验收/款项等状态枚举（与 PRD §2.5 一致）                     |
| `state-machines` | 合法迁移表 + `canTransition(from, to)`                                     |
| `budget`         | `totalBudget` / `budgetCommitted` / `actualSpent` / 阈值（PRD §2.6）纯函数 |
| `schemas`        | Zod：登录、项目、空间、建材、阶段、验收等；供 OpenAPI 与前端表单共用       |
| `errors`         | 统一错误码（如 `INVALID_STATE`、`BUDGET_OVERFLOW`、`HAS_DEPENDENTS`）      |
| `api`            | 统一响应类型 `{ code, message, data }`                                     |

> 前后端 **禁止** 各自复制状态字符串或预算公式；改 shared 必须跑 shared 单测。

---

## 5. pnpm Catalog 纪律

### 5.1 必须进 catalog 的依赖

- `typescript`、`zod`、`@hono/zod-openapi`
- `drizzle-orm`、`postgres`、`drizzle-kit`
- `react`、`react-dom`、`@types/react`、`@types/react-dom`（去 vp 后）
- `hono`、`@hono/node-server`（建议）
- `vite`、`vitest`（目标态为**标准 npm 包**；过渡态可暂指 plus-core，但版本钉死）
- **`oxlint`、`oxfmt`、`tsdown`**（去 vp 后必须进 catalog 并钉版本）

### 5.2 规则

1. 子包引用共享库一律 `"catalog:"`，禁止再写 `^x.y.z` 分叉
2. 禁止 `latest`、`*`
3. 升级共享依赖只改 `pnpm-workspace.yaml` catalog + lockfile
4. `overrides` 仅用于临时对齐 peer；去 vp 后删除对 vite-plus-core 的强制覆盖

---

## 6. 测试策略

| 层级     | 范围                                      | 工具                        | 最低要求           |
| -------- | ----------------------------------------- | --------------------------- | ------------------ |
| **Unit** | `@reno/shared` 状态机、预算公式、Zod 边界 | Vitest                      | 纯函数变更必须有测 |
| **API**  | Hono 路由（鉴权、状态迁移、级联删除拒绝） | Vitest + 测试 DB 或事务回滚 | 核心写路径覆盖     |
| **UI**   | 关键表单 / 待办卡片展示                   | Vitest + Testing Library    | 冒烟即可           |
| **E2E**  | 主流程                                    | 延后 v1.1+（Playwright 等） | 非 MVP 门槛        |

环境：测试用独立 `DATABASE_URL`；CI 注入 `JWT_SECRET` 等必填 env，禁止依赖开发者本机隐式配置。

---

## 7. 部署与环境

| 技术               | 用途                                              |
| ------------------ | ------------------------------------------------- |
| **1Panel**         | 静态站 + OpenResty/Nginx 反代 + PostgreSQL        |
| **GitHub Actions** | CI：`install → check → test → build`；master 部署 |
| **PM2 / systemd**  | 后端进程                                          |
| **Docker**（可选） | 本地/隔离 `postgres:17-alpine`                    |

### 7.1 环境分层

| 环境          | 用途        |
| ------------- | ----------- |
| `development` | 本地        |
| `test`        | CI / vitest |
| `production`  | 线上        |

### 7.2 迁移与发布

1. 合并前：shared 单测 + server API 测通过
2. 发布：先 `drizzle-kit migrate`（或等价），再切后端流量
3. 健康检查通过后再切前端静态资源
4. 保留上一版静态资源 / 容器以便回滚

---

## 8. 版本锁定总表（目标 + 过渡）

| 项                           | 版本                 | 锁定位置                  | 备注                                     |
| ---------------------------- | -------------------- | ------------------------- | ---------------------------------------- |
| Node.js                      | `24 LTS`             | `.nvmrc` / `engines` / CI | —                                        |
| pnpm                         | `11.9.0`             | `packageManager` / CI     | —                                        |
| TypeScript                   | `5.9.3`              | catalog                   | —                                        |
| Zod                          | `4.4.3`              | catalog                   | 前后端统一                               |
| @hono/zod-openapi            | `1.4.0`              | catalog                   | Zod v4                                   |
| React / React DOM            | `19.2.7`             | catalog（目标）           | —                                        |
| babel-plugin-react-compiler  | `1.0.0`              | `apps/web`                | —                                        |
| @vitejs/plugin-react         | `6.0.3`              | `apps/web`                | 集成 Compiler                            |
| Tailwind / @tailwindcss/vite | `4.3.2`              | `apps/web`                | —                                        |
| **shadcn/ui**                | 源码进仓             | `apps/web/components/ui`  | 非 npm 整包；**Base UI 变体**            |
| **@base-ui/react**           | 钉死（≥1.6 线）      | `apps/web` / catalog      | shadcn 默认底座；**不用 Radix 做新组件** |
| Hono                         | `4.12.27`            | catalog（建议）           | Node 部署                                |
| Drizzle ORM                  | `0.36.4`             | catalog                   | 季度评估升级                             |
| Drizzle Kit                  | `0.30.6`             | catalog                   | —                                        |
| postgres.js                  | `3.4.9`              | catalog                   | —                                        |
| jose                         | `5.9.6`              | `apps/server`             | HS256（v1）                              |
| @node-rs/argon2              | `2.0.2`              | `apps/server`             | —                                        |
| PostgreSQL                   | `17.x`               | 部署实例                  | 补丁版本钉死                             |
| Vite+ / vite-plus            | **钉死，勿 latest**  | catalog（**过渡**）       | **T3 移除**                              |
| 标准 Vite                    | 去 vp 时写入 catalog | catalog（**目标**）       | 替换 plus-core                           |
| Vitest                       | `4.1.9` 或后续钉死   | catalog                   | —                                        |
| **Oxfmt**                    | 安装/去 vp 时钉死    | catalog（目标）           | **唯一** formatter；不用 Prettier        |
| **Oxlint**                   | 安装/去 vp 时钉死    | catalog（目标）           | Lint                                     |
| **tsdown**                   | 安装/去 vp 时钉死    | catalog（目标）           | **唯一**库打包；不用 tsup；仅 packages   |
| sharp                        | 安装时钉死           | `apps/server`             | 待装 → 钉版本                            |
| pino                         | 安装时钉死           | `apps/server`             | 待装 → 钉版本                            |
| Recharts                     | —                    | —                         | **v1.1 再引入**                          |

---

## 9. 与 PRD / 架构的边界

| 文档                   | 写什么                                         | 不写什么                             |
| ---------------------- | ---------------------------------------------- | ------------------------------------ |
| **PRD**                | 产品行为、状态机、预算业务规则、版本范围       | 具体 npm 包版本                      |
| **TECH_STACK（本文）** | 选型、版本、catalog、去 vp 路线、测试/部署纪律 | 页面文案、字段级交互细节             |
| **ARCHITECTURE**       | 目录结构、模块划分、数据流、部署拓扑           | 重复抄一份完整依赖表（引用本文即可） |
| **DESIGN**             | Nest 暖巢视觉 token、组件风格、Do/Don't        | 业务规则、包版本                     |

---

## 10. 已知技术债（文档层跟踪）

| 项                           | 处理                                                        |
| ---------------------------- | ----------------------------------------------------------- |
| 强依赖 vp                    | 按 §1.3 T0→T3 拆除                                          |
| catalog 未覆盖 React/Hono 等 | 扩大 catalog                                                |
| sharp / pino 未装            | 钉版本后安装并写 env                                        |
| Recharts 若已在 web 依赖中   | MVP 前可保留但不做图表页；或移出 dependencies 至 v1.1       |
| JWT 仅 HS256                 | v1 接受；密钥轮换与长度写入运维清单                         |
| `@reno/ui`                   | MVP 不做                                                    |
| 过渡期 vp 内置 fmt/pack      | 去 vp 后改为独立 **Oxfmt** + **tsdown** 脚本与 catalog 版本 |
| 历史 Radix 组件（若有）      | 新功能只用 Base UI；存量按组件渐进迁移                      |

---

_本文档由 Reno 项目团队维护。版本 v1.3（2026-07-17）。长期工具链：**标准 Vite + Vitest + Oxlint + Oxfmt + tsdown**，去除 Vite+（vp）；UI：**shadcn/ui + Base UI**（不用 Prettier / tsup / 新 Radix）。_
