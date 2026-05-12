# shop-fe 视觉与组件体系重做 · 设计规范

**日期**：2026-05-12
**项目**：app/shop/shop-fe（活禽现杀门店管理系统）
**性质**：仅视觉与组件层重做，业务功能与路由保持不变

---

## 1. 背景与目标

### 1.1 当前状态

- 技术栈：React 18 + Vite + TypeScript + AntD 6 + React Router 7 + TanStack Query + Zustand
- 视觉：AntD 默认主题 + 单一红色（`#d4380d`）主色，整体偏"模板感"
- 模块：工作台、POS 开单、销售订单/加工工单、活禽品类/存栏/损耗、采购入库/供应商、价格、会员、门店/员工、报表（共 9 个一级模块、约 15 个页面）

### 1.2 问题

- 视觉气质平庸，缺乏专业感与品牌识别度
- AntD 默认组件密度、圆角、阴影、表格、按钮气质明显，与"工业级生鲜门店"的业务气质不匹配
- 主色与业务（生鲜/活禽）关联弱

### 1.3 目标

打造一套**面向严肃使用、视觉接近 Linear / Stripe / Vercel Dashboard 水准**的门店管理系统设计语言：

- **专业克制**：信息密度高、可长时间使用、不喧宾夺主
- **生鲜温度**：通过绿色主调与琥珀点缀传递"新鲜、安全、专业"
- **现代简洁**：圆角、阴影、留白、彩色徽章按 SaaS Clean 范式

业务功能与 API 调用保持不变。

---

## 2. 设计语言

### 2.1 色板（Bright Forest + Amber）

| 角色 | Token | 值 | 用途 |
|---|---|---|---|
| 主色 | `--primary` | `#16A34A` | 主按钮、激活态、链接、强调 |
| 主色 hover | `--primary-600` | `#15803D` | 主按钮 hover、深一档 |
| 主色 50 | `--primary-50` | `#ECFDF3` | 选中底色、淡背景 |
| 主色 100 | `--primary-100` | `#D1FADF` | 标签底、进度条底 |
| 强调（警示） | `--accent` | `#F59E0B` | 加工中、需关注、提示 |
| 强调 50 | `--accent-50` | `#FEF6E0` | 警示标签底 |
| 导轨深色 | `--rail` | `#0F2B1F` | 左侧 60px 图标导轨背景 |
| 导轨次深 | `--rail-2` | `#1B4D36` | 导轨 hover 态 |
| 页面底 | `--bg` | `#F7F8F5` | 内容区背景 |
| 卡片面 | `--surface` | `#FFFFFF` | 卡片、面板 |
| 边线 | `--border` | `#E7E9E2` | 卡片/分割线（默认） |
| 边线强 | `--border-strong` | `#D9DCD3` | 强分割 |
| 文本主 | `--text` | `#1B1F1A` | 标题、关键数字 |
| 文本次 | `--text-2` | `#5B6B5F` | 正文、描述 |
| 文本弱 | `--text-3` | `#8A958D` | 标签、辅助说明 |
| 成功 | `--success` | `#15803D` | "完成"徽章文字 |
| 警告 | `--warning` | `#B45309` | "加工中"徽章文字 |
| 危险 | `--danger` | `#B42318` | "异常/低库存"徽章文字 |
| 信息 | `--info` | `#1D4ED8` | "退款/通知"徽章文字 |

### 2.2 字体

- **正文**：`Inter, -apple-system, "PingFang SC", "Microsoft YaHei", system-ui, sans-serif`
- **数字 / 编号 / 时间**：`"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace`，启用 `font-feature-settings: 'tnum'` 让数字等宽对齐
- **基准字号**：14px，行高 1.5
- **字号阶梯**：11 / 12 / 13 / 14 / 16 / 20 / 24 / 28（page-title 24，KPI 数值 28）

### 2.3 间距 / 圆角 / 阴影

- **间距**：4 / 8 / 12 / 14 / 16 / 18 / 20 / 24 / 28（基于 4px 网格）
- **圆角**：徽章 999px、按钮 8px、卡片 12px、输入 8px
- **阴影**：
  - `--shadow-sm`：`0 1px 2px rgba(15,30,20,.04)`
  - `--shadow-md`：`0 1px 3px rgba(15,30,20,.06), 0 4px 12px rgba(15,30,20,.04)`
- **总原则**：大量留白、克制阴影，以"线条+底色"代替"重阴影+渐变"

### 2.4 视觉契约

`/.superpowers/brainstorm/159-1778583916/content/dashboard-bright.html` 是整套设计的视觉锚点。后续所有页面按它的气质（卡片样式、KPI 风格、状态徽章、表格、按钮、间距）产出。

---

## 3. 布局骨架

### 3.1 三段式

```
┌──────┬──────────┬─────────────────────────────┐
│ Rail │ Secondary│  Topbar                     │
│ 60px │  200px   ├─────────────────────────────┤
│      │          │  Page (padding: 24 28)      │
│      │          │                             │
└──────┴──────────┴─────────────────────────────┘
```

### 3.2 一级 · 图标导轨（Rail，60px）

- 背景：`--rail` 深绿，logo 36×36 圆角带渐变光晕
- 9 个图标按业务分组（工作台 / POS / 销售 / 库存 / 采购 / 价格 / 会员 / 门店 / 报表），底部固定"设置"
- 激活态：左侧 3px 绿色竖条 + 半透明绿色底
- 角标：右上角小圆点（红/橙）显示待办/异常数量
- 图标库：**Lucide**（统一 1.8 stroke-width）

### 3.3 二级 · 上下文面板（Secondary，200px）

- 背景：白，1px 右边线
- 顶部 head 区：当前一级模块名 + 一句副标题
- 中部分组导航：每组有 uppercase 小标签 + 若干 nav-item，激活态绿色底 + 左对齐圆角
- nav-item 右侧可挂数字徽章（如"待处理订单 12"）

### 3.4 顶栏（Topbar，56px）

- 左：面包屑（一级 / 二级 当前页粗体）
- 右：门店选择器（绿色脉冲点 + 下拉）、搜索、通知（带红点）、头像（渐变绿）

### 3.5 页面区（Page）

- padding `24px 28px`，背景 `--bg`
- page-head：左侧 page-title (24px 700) + page-sub (13px 弱色)，右侧 actions（次按钮 + 主按钮）
- 内容区按 12 列栅格自由组合（KPI 4 列 / 主辅 2:1 / 三等分等）

---

## 4. 组件规范

### 4.1 卡片（Card）

```
border: 1px solid --border
border-radius: 12px
background: --surface
card-head: padding 16 20, border-bottom, title (14 600) + sub (12 弱) 右对齐
card-body: padding 18 20
```

### 4.2 KPI 卡

- 内容：label（uppercase 12 弱）/ value（28 700 等宽）/ meta（pill + 描述）/ 右下角 sparkline（80×32 SVG）
- 颜色规则：value 默认黑；"在加工" 类用 `--accent`；"预警" 类用 `--danger`

### 4.3 状态徽章（Pill）

| 类型 | 背景 | 文字 | 用途 |
|---|---|---|---|
| `pill-up` | `#DCFCE7` | `--success` | 同比上涨 / 已完成 |
| `pill-down` | `#FEE2E2` | `--danger` | 异常 / 需补货 |
| `pill-warn` | `#FEF3C7` | `--warning` | 需关注 / 加工中 |
| `pill-info` | `#DBEAFE` | `--info` | 退款 / 通知 |
| `pill-mute` | `#F1F3EE` | `--text-2` | 排队 / 中性 |

带"实时活动"语义的状态点（如"宰杀中"）用 1.4s pulse 动画。

### 4.4 按钮

- `btn-primary`：`--primary` 底白字，hover `--primary-600`
- `btn-ghost`：白底 + `--border`，hover `#F1F3EE`
- `btn-danger`：`--danger` 底白字
- 高度 32px（默认）/ 40px（large，用于 POS 等触屏）
- 字号 13、字重 500、圆角 8、内边距 8 14、图标 14×14

### 4.5 表格（TanStack Table v8）

- 表头：`#FAFBF7` 底，11px 600 uppercase 弱色文字
- 单元格：13px，padding 12 20，下边线 1px `--border`
- 数字列右对齐 + 等宽字体
- 行 hover：`#FAFBF7`
- 工具栏：搜索 + 筛选 chip + 列设置 + 导出（在表格上方独立条）
- 分页：右下，"第 1-20 条 / 共 186 条" + 页码按钮

### 4.6 表单（React Hook Form + Zod）

- 标签上方 + 输入框；输入框 36px 高、圆角 8、`--border`、focus 态 2px `--primary` 阴影
- 错误信息 12px `--danger`，挂在输入框下方
- 必填红星紧贴标签后

### 4.7 弹层（Radix Dialog / Sheet / Popover）

- 遮罩 `rgba(15,30,20,.45)` + 4px 模糊
- 弹窗：白底、圆角 12、阴影 lg、最小宽度 480
- 抽屉：从右滑入，宽度按内容（420 / 560 / 720）

### 4.8 图表（Recharts）

- 主线色 `--primary`，对比色 `#B6C2BB`（虚线）
- 网格线 `#EEF1EA`、轴文字 11 弱色
- Tooltip 白底 + shadow-md + 圆角 8

### 4.9 进度条 / 库存条

- 高度 5px，底 `#F1F3EE`，圆角 3
- 染色规则（库存量场景）：`<20%` `--danger`、`20–40%` `--accent`、`>40%` `--primary`

---

## 5. 技术栈与组件层迁移

### 5.1 新栈

| 类型 | 选择 | 替代 |
|---|---|---|
| 样式 | **Tailwind CSS v4**（CSS-first config，主题变量原生） | AntD 样式 |
| 组件底层 | **Radix UI Primitives**（shadcn 思路，源码拥有） | AntD 组件 |
| 表格 | **TanStack Table v8** | AntD Table |
| 表单 | **React Hook Form + Zod** | AntD Form |
| 图标 | **lucide-react** | @ant-design/icons |
| 图表 | **Recharts** | 新增 |
| 日期选择 | **react-day-picker** + dayjs | AntD DatePicker |
| 通知 | **sonner**（toast） | AntD message/notification |

### 5.2 保留依赖

React 18、Vite、TypeScript、React Router 7、TanStack Query、Zustand、Axios、Day.js

### 5.3 移除依赖

`antd`、`@ant-design/icons`

### 5.4 新增内部组件目录

```
src/
  components/
    ui/                    # 原子组件（shadcn 风格，源码可改）
      button.tsx
      input.tsx
      label.tsx
      card.tsx
      dialog.tsx
      sheet.tsx
      popover.tsx
      dropdown-menu.tsx
      select.tsx
      tabs.tsx
      badge.tsx
      pill.tsx
      table.tsx           # TanStack Table 包装
      form.tsx            # RHF 包装
      toast.tsx           # sonner 包装
      tooltip.tsx
      separator.tsx
      progress.tsx
      avatar.tsx
      skeleton.tsx
    layout/
      Rail.tsx            # 60px 图标导轨
      Secondary.tsx       # 200px 二级面板（按当前一级模块渲染不同分组）
      Topbar.tsx
      PageHeader.tsx      # page-title + sub + actions
    data/
      DataTable.tsx       # 通用表格（搜索 + 筛选 + 分页 + 列设置）
      KpiCard.tsx
      StatusPill.tsx
      Sparkline.tsx
      InventoryBar.tsx
    chart/
      LineChart.tsx
      BarChart.tsx
  config/
    nav.ts                # 一级 + 二级导航配置（数据驱动）
    theme.css             # CSS 变量主色板
```

### 5.5 二级导航数据驱动

`config/nav.ts` 定义结构：

```ts
type NavGroup = { label: string; items: NavItem[] };
type NavItem = { key: string; label: string; path: string; badgeKey?: string };
type Module = { key: string; label: string; sub?: string; icon: LucideIcon; groups: NavGroup[]; path: string };
```

Rail 渲染 `modules`，Secondary 根据当前 `module.key` 渲染 `module.groups`。badge 数量从 TanStack Query 缓存或 store 读取（如"待处理订单"、"在加工"）。

---

## 6. 迁移策略

**一次性重写，新分支推倒重做。**

- 新分支 `redesign/v2`
- 老代码保留作参考但不再维护，新代码从空白 `src/` 起步
- 复用：API 层（`src/api/`）、Hooks（`src/hooks/`）、Store（`src/store/`）、类型（`src/types/`）、路由结构（`src/router/`，仅替换 `MainLayout`）
- 重写：`App.tsx`（去掉 `ConfigProvider`/`AntdApp`）、`MainLayout.tsx`、所有 `pages/`、`components/`
- 中途不发布，完成后整体替换 `main`

---

## 7. 页面重做清单

15 个页面，全部按新设计语言重写。**业务逻辑保持，只替换视觉与组件**。

| # | 页面 | 重点 |
|---|---|---|
| 1 | `LoginPage` | 极简单页，左侧品牌区（绿色渐变 + logo + 一句话），右侧表单卡 |
| 2 | `DashboardPage` | **视觉契约页**，按 dashboard-bright.html 1:1 实现 |
| 3 | `PosPage` | 触屏友好，左侧品类网格 + 右侧购物车，主操作按钮 large |
| 4 | `SalesOrderListPage` | DataTable + 状态筛选 chip + 日期范围 |
| 5 | `SalesOrderDetailPage` | 双栏：左侧订单信息，右侧加工进度时间线 |
| 6 | `ProcessingBoardPage` | 看板视图（排队 / 加工中 / 待取 / 完成）四列卡片 |
| 7 | `PoultryCategoryPage` | DataTable + 新增 Sheet（侧滑表单） |
| 8 | `InventoryPage` | KPI 概览 + DataTable，库存条染色 |
| 9 | `LossPage` | DataTable + 原因筛选 |
| 10 | `ProcurementPage` | DataTable + 新增弹窗 |
| 11 | `SupplierPage` | DataTable |
| 12 | `PricingPage` | 按品类网格分组的卡片，行内编辑 |
| 13 | `MemberPage` | DataTable + 详情 Sheet（消费记录时间线） |
| 14 | `StoreListPage` / `StaffPage` | DataTable |
| 15 | `ReportPage` | 多 KPI + 多图表（趋势/构成/排行） |

每页交付前对照视觉契约自检：色板、字号、间距、圆角、徽章风格。

---

## 8. 非目标（明确不做）

- 不改业务功能，不改 API 形状
- 不改路由结构（路径不变）
- 不做国际化扩展（仍仅 zh-CN）
- 不做暗色模式（v1 暂不做，但 CSS 变量结构已为后续预留）
- 不做移动端响应式适配（按桌面 1280+ 设计；POS 页面单独考虑触屏）
- 不引入状态管理新方案（继续 Zustand + TanStack Query）

---

## 9. 验收标准

1. **视觉一致性**：所有页面色板、字号、间距、组件气质完全统一，对照 `dashboard-bright.html` 无明显违和
2. **零 AntD 残留**：`package.json` 中无 `antd`/`@ant-design/icons`，代码中无 `import 'antd'`
3. **功能等价**：每页业务功能、API 调用、交互流程与重做前完全一致
4. **类型完整**：`tsc -b` 零错误
5. **构建通过**：`pnpm build` 成功，产物体积应小于重做前（去掉 AntD 后）

---

## 10. 风险与缓解

| 风险 | 缓解 |
|---|---|
| 表格功能 AntD Table → TanStack Table 工程量大 | 先封装 `DataTable` 通用组件，所有列表页复用 |
| Form 校验从 AntD Form → RHF+Zod 改写多 | 先封装 `<Form>` 系列组件，定义统一的 `<FormField>` API |
| 弹窗/抽屉/下拉等交互组件需自己组合 Radix | 一次性把 `components/ui/` 跑通，后续页面是消费方 |
| 重写期间老版本不更新 | 重写控制在合理周期内；如有线上紧急修复，单独从 `main` 切热修分支 |

---

## 11. 后续阶段提示（非本 spec 范围）

- 暗色模式（CSS 变量已预留）
- 移动端 POS 适配
- 多语言（i18n）
- 主题可定制（不同门店换色）
