---
version: alpha
name: Nest
description: 暖巢 — 面向业主装修管家的温暖、清晰、可信界面；纸质家居感 + 专业工具效率。
colors:
  primary: "#1C1917"
  secondary: "#78716C"
  tertiary: "#0F766E"
  neutral: "#FAF8F5"
  on-primary: "#FFFFFF"
  on-tertiary: "#FFFFFF"
  surface: "#FFFFFF"
  surface-muted: "#F5F0E8"
  border: "#E7E5E4"
  border-strong: "#D6D3D1"
  link: "#0F766E"
  success: "#15803D"
  success-soft: "#DCFCE7"
  warning: "#B45309"
  warning-soft: "#FEF3C7"
  danger: "#B91C1C"
  danger-soft: "#FEE2E2"
  info: "#1D4ED8"
  info-soft: "#DBEAFE"
  budget-ok: "#15803D"
  budget-warn: "#B45309"
  budget-over: "#B91C1C"
  overlay: "#1C191799"
typography:
  h1:
    fontFamily: '"Plus Jakarta Sans", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif'
    fontSize: 2rem
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  h2:
    fontFamily: '"Plus Jakarta Sans", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif'
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  h3:
    fontFamily: '"Plus Jakarta Sans", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif'
    fontSize: 1.125rem
    fontWeight: 600
    lineHeight: 1.35
  body-md:
    fontFamily: '"Plus Jakarta Sans", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif'
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: '"Plus Jakarta Sans", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif'
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: '"Plus Jakarta Sans", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif'
    fontSize: 0.75rem
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.04em"
  mono:
    fontFamily: '"JetBrains Mono", "SF Mono", ui-monospace, monospace'
    fontSize: 0.875rem
    fontWeight: 500
    lineHeight: 1.5
rounded:
  sm: 6px
  md: 10px
  lg: 16px
  xl: 24px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    rounded: "{rounded.md}"
    padding: 12px
  button-primary-hover:
    backgroundColor: "#0D9488"
    textColor: "{colors.on-tertiary}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: 12px
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: 12px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: 20px
  card-muted:
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: 16px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: 12px
  badge-success:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.success}"
    rounded: "{rounded.full}"
    padding: 6px
  badge-warning:
    backgroundColor: "{colors.warning-soft}"
    textColor: "{colors.warning}"
    rounded: "{rounded.full}"
    padding: 6px
  badge-danger:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
    rounded: "{rounded.full}"
    padding: 6px
  nav-tab-active:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.tertiary}"
    rounded: "{rounded.md}"
    padding: 8px
  todo-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.lg}"
    padding: 16px
---

## Overview

**Nest（暖巢）** 是 Reno 业主装修管家的官方视觉身份。

气质一句话：**像一本干净的家居手帐，而不是冷冰冰的 B 端后台。**

- **温暖**：米纸色背景、石色中性色，避免纯灰冷白。
- **清晰**：信息层级明确；首页待办与预算预警一眼可见（对齐 PRD §9）。
- **可信**：金额、状态、阶段用稳定语义色，不靠花哨渐变。
- **省事**：大触控、少步骤、空状态引导「从模板初始化」。

对标感受：宜家说明书的干净 + 笔记 App 的亲和 + 专业项目管理工具的克制。  
**不是**：炫酷 SaaS 营销站、霓虹 Dashboard、厚重企业灰蓝后台。

技术落地：`shadcn/ui` + **Base UI** + Tailwind 4 CSS variables（见 [TECH_STACK.md](./TECH_STACK.md) §2.2）。本文件是 **视觉单一真相源**；实现时把 token 映射到 `@theme` / CSS 变量。

---

## Colors

### 品牌与中性

| Token                       | Hex                                                | 用途 |
| --------------------------- | -------------------------------------------------- | ---- |
| **primary** `#1C1917`       | 标题、主文案、高强调图标                           |
| **secondary** `#78716C`     | 次要文案、元数据、占位                             |
| **tertiary** `#0F766E`      | **唯一主交互色**：主按钮、链接、选中 Tab、进度强调 |
| **neutral** `#FAF8F5`       | 页面底（暖纸色）                                   |
| **surface** `#FFFFFF`       | 卡片、弹层、输入底                                 |
| **surface-muted** `#F5F0E8` | 弱分区、侧栏、表格斑马底                           |
| **border** `#E7E5E4`        | 默认描边                                           |
| **border-strong** `#D6D3D1` | 强调分割                                           |

### 语义色（业务强制）

| 场景                            | Token                      | 用法                   |
| ------------------------------- | -------------------------- | ---------------------- |
| 成功 / 验收通过 / 预算健康      | `success` + `success-soft` | Badge、Toast、进度完成 |
| 接近预算阈值（PRD §2.6 约 80%） | `warning` + `warning-soft` | 首页预警卡片           |
| 超支 / 需整改 / 危险删除        | `danger` + `danger-soft`   | 超支、destructive      |
| 信息 / 中性提醒                 | `info` + `info-soft`       | 次要通知               |
| 遮罩                            | `overlay`                  | Dialog / Sheet         |

**原则：**

1. **页面上同时高亮的强调色尽量只有 tertiary**；成功/警告/危险只用于状态，不用于装饰。
2. 金额数字用 `primary` 字重 600；正负/超支用语义色，不用 tertiary 染色金额。
3. 深色模式 **v1 可不做**；若做，保持同一色相，仅反转 surface/neutral 层级。

### Tailwind / CSS 变量建议名

```css
/* apps/web 全局，与本文件对齐 */
--background: #faf8f5;
--foreground: #1c1917;
--card: #ffffff;
--muted: #f5f0e8;
--muted-foreground: #78716c;
--border: #e7e5e4;
--primary: #0f766e; /* 交互主色 = tertiary */
--primary-foreground: #ffffff;
--destructive: #b91c1c;
--ring: #0f766e;
--radius: 0.625rem; /* ≈ rounded.md */
```

> 注意 shadcn 习惯里 `--primary` 常指「按钮主色」。本设计 **品牌主色 primary（墨色）≠ 交互主色 tertiary（青绿）**；映射到 shadcn 时：**`--primary` = tertiary**，正文用 `--foreground` = primary。

---

## Typography

- **西文 / UI：** Plus Jakarta Sans（友好、略圆，家居感）
- **中文回退：** Noto Sans SC → PingFang SC → Microsoft YaHei → system-ui
- **数字 / 金额可选：** 同 UI 字体 + `tabular-nums`；日志时间可用 mono

| 级别    | 用途                         |
| ------- | ---------------------------- |
| h1      | 页面大标题（项目名、总览）   |
| h2      | 区块标题（空间、成本）       |
| h3      | 卡片标题、列表组头           |
| body-md | 正文、表单说明               |
| body-sm | 辅助说明、列表次行           |
| label   | 表单标签、Tab 小字、状态角标 |

**规则：** 不用花体/衬线；不要整页居中大字报；中文行高 ≥ 1.5。

---

## Layout

### 栅格与边距

- 基准 **4px**；常用 `sm/md/lg` = 8 / 16 / 24。
- 移动端内容左右 **16px**；桌面内容区最大宽 **1200px**，水平居中。
- 卡片内边距 **16–20px**；卡片间距 **12–16px**。

### 信息架构（对齐 PRD §9.3）

**移动端 5 Tab（底栏）：** 总览 · 空间 · 建材 · 进度 · 成本

**桌面：** 左侧窄导航 + 顶栏项目切换；主区同移动信息结构，勿另起两套文案。

### 首页总览（MVP 核心）

自上而下固定节奏：

1. 项目切换 + 状态 Chip
2. **待办 / 预警卡片**（待购、逾期、预算、待验收）
3. 预算摘要（总预算 / 实际 / 剩余）
4. 当前阶段进度
5. 快捷入口（记日志、加建材）

---

## Elevation & Depth

- **默认扁平**：靠边框 `border` + 微对比 surface，不靠重阴影堆层级。
- **浮层**（Dialog / Dropdown / Sheet）：极轻阴影 `0 8px 24px rgba(28,25,23,0.08)` + 边框。
- **拖拽 / 抬起**：阴影略加强一档即可。
- **禁止**：霓虹 glow、厚重 Material 多层 elevation 炫技。

---

## Shapes

| Token | 值   | 用途                   |
| ----- | ---- | ---------------------- |
| sm    | 6px  | Badge、小控件          |
| md    | 10px | Button、Input、Select  |
| lg    | 16px | Card、Sheet 顶角       |
| xl    | 24px | 大图容器、空状态插画底 |
| full  | pill | Chip、状态点           |

触控目标：**最小 44×44px**（移动端主按钮、底栏 Tab）。

---

## Components

实现载体：**shadcn/ui（Base UI）**。下列为风格约束，不是另起组件库。

### 按钮

| 类型        | 样式                                        |
| ----------- | ------------------------------------------- |
| Primary     | 实心 `tertiary`，白字；一页主 CTA 尽量 1 个 |
| Secondary   | 白底 + `border`；次要操作                   |
| Ghost       | 无边框，hover 用 `surface-muted`            |
| Destructive | `danger` 实心或描边；删除/归档需确认        |

圆角 `md`；高度默认 **40px**，大按钮 **48px**（移动主操作）。

### 卡片

- 白底、`lg` 圆角、1px `border`；**待办卡**左侧可 3px `tertiary` 或语义色竖条表示类型。
- 预算预警卡：背景用 soft 语义色，勿整卡大红大绿刺眼。

### 表单

- Label 用 `label` 样式，必填 `*` 用 `danger`。
- 错误文案 `body-sm` + `danger`，贴在控件下。
- 校验与 Zod 一致（前后端同一 schema）。

### 状态 Chip

建材/阶段/项目状态统一 Chip：`badge-*` soft 底 + 深色字；文案用 PRD 状态机中文（如「待购」「施工中」），**不要**直接暴露英文 enum。

### 导航

- 底栏：图标 + 短文案；选中 = `tertiary` 图标/字重 600。
- 侧栏：当前项 `surface-muted` 底 + 左侧 2px `tertiary` 条。

### 空状态

插画/图标弱对比 + 一句人话 + **一个主按钮**（如「从模板初始化空间」）。禁止空白页只有「暂无数据」。

### 数据与金额

- 列表主数字右对齐、`tabular-nums`。
- 超支：`budget-over`；接近阈值：`budget-warn`；健康：`budget-ok` 或默认字色。

---

## Do's and Don'ts

### Do

- 用暖纸色底 + 白卡片建立「家居手帐」感。
- 交互色统一青绿 `tertiary`，状态用语义色。
- 首页优先待办与风险，而不是功能入口墙。
- 移动优先：大按钮、底栏 5 Tab、表单一列。
- 组件只从 **Base UI 版 shadcn** 添加与扩展。
- 文案简短、业主口语（「还差多少预算」优于「预算执行率」）。

### Don't

- 不要用纯 `#1677ff` 企业蓝当主色（PRD 曾举例，本风格已收敛为 Nest 青绿）。
- 不要同时使用 Radix 与 Base UI 两套同名组件。
- 不要彩虹标签、重渐变、玻璃拟态堆砌。
- 不要在同一屏放多个同等视觉重量的实心主按钮。
- 不要用低对比灰字展示关键金额或错误（需满足可读对比）。
- 不要为装饰引入第二套图标库（统一 **lucide-react**）。

---

## 与产品文档的关系

| 文档                                 | 职责                                 |
| ------------------------------------ | ------------------------------------ |
| **本文件 DESIGN.md**                 | 视觉 token、组件风格、Do/Don't       |
| [PRD.md](./PRD.md) §9                | 信息架构、页面清单、交互原则         |
| [TECH_STACK.md](./TECH_STACK.md)     | shadcn + Base UI、Tailwind 4、工具链 |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 目录与模块结构                       |

---

## 落地检查清单（实现时）

- [ ] 全局 CSS 变量与上表一致
- [ ] `components.json` / shadcn 使用 **Base UI**
- [ ] 字体：Plus Jakarta Sans + 中文回退已接入
- [ ] 底栏 5 Tab 与 PRD 一致
- [ ] 预算三态色与 PRD §2.6 阈值文案一致
- [ ] 主按钮 / 链接 / 焦点环均为 `tertiary` 色相

## 参考图

| 资源               | 路径                                                                              |
| ------------------ | --------------------------------------------------------------------------------- |
| 可交互 HTML 参考稿 | [`docs/design-refs/nest-ui-reference.html`](./design-refs/nest-ui-reference.html) |
| 整页截图 PNG       | [`docs/design-refs/nest-ui-reference.png`](./design-refs/nest-ui-reference.png)   |

内容包含：色板、字体与按钮/Chip/Input、**移动端首页总览**（5 Tab）、**桌面端侧栏总览**。用浏览器打开 HTML 即可预览；实现以本文件 token 为准。

---

_Reno · Nest（暖巢）UI 风格 v1.0 · 2026-07-17 · 状态 Active_
