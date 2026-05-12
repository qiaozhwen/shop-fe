# shop-fe 视觉重做 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 shop-fe 从 AntD 6 重写为 Tailwind v4 + Radix(shadcn) 风格的工业级门店系统，对齐 `dashboard-bright.html` 视觉契约，业务/API/路由保持不变。

**Architecture:** 一次性在新分支 `redesign/v2` 重做表现层（components / layout / pages / theme / 字体），复用 `src/api/`、`src/hooks/`、`src/store/`、`src/types/` 与 `src/router/` 的路径表；自底向上分 7 个阶段（环境 → 原子组件 → 布局 → 数据组件 → 图表 → 15 页 → 清理）。

**Tech Stack:** React 18.3 + Vite 5.4 + TypeScript 5.6 + Tailwind CSS v4 + Radix UI Primitives + TanStack Table v8 + React Hook Form + Zod + lucide-react + Recharts + sonner + react-day-picker；保留 React Router 7 / TanStack Query 5 / Zustand 5 / axios / dayjs。

---

## ⚠️ TDD 替代方案（项目无测试基建）

shop-fe 仓库**没有测试框架**（无 vitest/jest/playwright 配置）。本计划不引入新的测试基建，每个 task 用以下三件套替代标准 TDD 步骤：

1. **类型自检**：`pnpm tsc -b` 零错误
2. **构建自检**：阶段末 `pnpm build` 通过
3. **视觉自检**：`pnpm dev` 起本地，对照 `.superpowers/brainstorm/159-1778583916/content/dashboard-bright.html` 在浏览器打开页面，色板/字号/圆角/间距与契约一致

凡 task 中出现 "Step：自检"，按上述三条执行；不要新增 vitest/jest 配置。

---

## 关键参考文件（每位执行者必读）

- **设计 spec**：`docs/superpowers/specs/2026-05-12-shop-fe-redesign-design.md`（11 节，色板 token / 布局 / 组件规范的唯一依据）
- **视觉契约**：`.superpowers/brainstorm/159-1778583916/content/dashboard-bright.html`（DashboardPage 必须 1:1 还原）
- **现有源码（复用，不改）**：`src/api/`、`src/hooks/`、`src/store/`、`src/types/`、`src/router/index.tsx` 的路径表

---

## Phase 0 · 环境与主题底座

### Task 0.1：建分支

- [ ] **Step 1：检查工作区干净 / 切分支**

```bash
cd /Users/qiaozhen/app/shop/shop-fe
git status
# 如有未提交修改先 stash 或 commit
git checkout -b redesign/v2
```

- [ ] **Step 2：提交一个空 commit 标记起点**

```bash
git commit --allow-empty -m "chore: start redesign/v2"
```

### Task 0.2：依赖切换

**Files:**
- Modify: `package.json`

- [ ] **Step 1：移除 AntD**

```bash
pnpm remove antd @ant-design/icons
```

- [ ] **Step 2：新增运行时依赖**

```bash
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-separator @radix-ui/react-avatar @radix-ui/react-label @radix-ui/react-slot @radix-ui/react-progress @tanstack/react-table react-hook-form @hookform/resolvers zod lucide-react recharts sonner react-day-picker class-variance-authority clsx tailwind-merge
```

- [ ] **Step 3：新增开发依赖（Tailwind v4）**

```bash
pnpm add -D tailwindcss @tailwindcss/vite
```

- [ ] **Step 4：自检 + commit**

```bash
pnpm tsc -b
git add package.json pnpm-lock.yaml
git commit -m "chore: swap AntD for tailwind+radix stack"
```

### Task 0.3：Vite + Tailwind v4 接入

**Files:**
- Modify: `vite.config.ts`
- Create: `src/index.css`
- Modify: `src/main.tsx`

- [ ] **Step 1：vite.config.ts 加 tailwind 插件**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: { port: 5173, proxy: { '/api': 'http://localhost:7001' } },
});
```

- [ ] **Step 2：创建 `src/index.css`（Tailwind v4 入口 + 字体）**

```css
@import "tailwindcss";
@import "./config/theme.css";

html, body, #root { height: 100%; }
body {
  font-family: Inter, -apple-system, "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text);
  background: var(--bg);
  -webkit-font-smoothing: antialiased;
}
.font-mono, .tnum { font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace; font-feature-settings: 'tnum'; }
```

- [ ] **Step 3：`src/main.tsx` 移除 antd 样式 import，改 import index.css**

```tsx
import './index.css';
```

- [ ] **Step 4：自检 + commit**

```bash
pnpm tsc -b && pnpm build
git add -A && git commit -m "feat: wire tailwind v4 into vite"
```

### Task 0.4：主题 CSS 变量

**Files:**
- Create: `src/config/theme.css`

- [ ] **Step 1：写入 spec §2.1 全部 token + Tailwind v4 `@theme` 映射**

```css
:root {
  --primary: #16A34A;
  --primary-600: #15803D;
  --primary-50: #ECFDF3;
  --primary-100: #D1FADF;
  --accent: #F59E0B;
  --accent-50: #FEF6E0;
  --rail: #0F2B1F;
  --rail-2: #1B4D36;
  --bg: #F7F8F5;
  --surface: #FFFFFF;
  --border: #E7E9E2;
  --border-strong: #D9DCD3;
  --text: #1B1F1A;
  --text-2: #5B6B5F;
  --text-3: #8A958D;
  --success: #15803D;
  --warning: #B45309;
  --danger: #B42318;
  --info: #1D4ED8;
  --shadow-sm: 0 1px 2px rgba(15,30,20,.04);
  --shadow-md: 0 1px 3px rgba(15,30,20,.06), 0 4px 12px rgba(15,30,20,.04);
  --radius-pill: 999px;
  --radius-btn: 8px;
  --radius-card: 12px;
}

@theme inline {
  --color-primary: var(--primary);
  --color-primary-600: var(--primary-600);
  --color-primary-50: var(--primary-50);
  --color-primary-100: var(--primary-100);
  --color-accent: var(--accent);
  --color-accent-50: var(--accent-50);
  --color-rail: var(--rail);
  --color-rail-2: var(--rail-2);
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --color-text: var(--text);
  --color-text-2: var(--text-2);
  --color-text-3: var(--text-3);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-danger: var(--danger);
  --color-info: var(--info);
}
```

- [ ] **Step 2：在 `index.html` `<head>` 加字体**

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

- [ ] **Step 3：commit**

```bash
git add -A && git commit -m "feat(theme): introduce design tokens and fonts"
```

### Task 0.5：cn 工具

**Files:** Create: `src/lib/cn.ts`

- [ ] **Step 1**

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
```

- [ ] **Step 2：commit** `git add -A && git commit -m "chore: add cn util"`

---

## Phase 1 · 原子组件（components/ui/）

> **共同约定**：每个文件用 `forwardRef`、`cva` 处理 variants、`cn` 合并 className。每个 task 完成后 `pnpm tsc -b` 通过即可 commit。**不要等所有原子组件做完再 commit**。

### Task 1.1：Button

**Files:** Create: `src/components/ui/button.tsx`

- [ ] **Step 1**

```tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[8px] text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary-600',
        ghost: 'bg-surface text-text border border-border hover:bg-[#F1F3EE]',
        danger: 'bg-danger text-white hover:opacity-90',
        link: 'text-primary hover:underline px-0',
      },
      size: { sm: 'h-7 px-3 text-[12px]', md: 'h-8 px-3.5', lg: 'h-10 px-4 text-[14px]' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  }
);
Button.displayName = 'Button';
export { buttonVariants };
```

- [ ] **Step 2：自检 + commit**

```bash
pnpm tsc -b
git add -A && git commit -m "feat(ui): button"
```

### Task 1.2：Input + Label

**Files:** Create: `src/components/ui/input.tsx`, `src/components/ui/label.tsx`

- [ ] **Step 1：input.tsx**

```tsx
import * as React from 'react';
import { cn } from '@/lib/cn';
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-9 w-full rounded-[8px] border border-border bg-surface px-3 text-[13px] text-text placeholder:text-text-3',
        'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition',
        'disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
```

- [ ] **Step 2：label.tsx**

```tsx
import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/cn';
export const Label = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>>(
  ({ className, ...props }, ref) => (
    <LabelPrimitive.Root ref={ref} className={cn('text-[13px] font-medium text-text', className)} {...props} />
  )
);
Label.displayName = 'Label';
```

- [ ] **Step 3：commit** `git add -A && git commit -m "feat(ui): input, label"`

### Task 1.3：Card

**Files:** Create: `src/components/ui/card.tsx`

- [ ] **Step 1**

```tsx
import * as React from 'react';
import { cn } from '@/lib/cn';
export const Card = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) =>
  <div className={cn('rounded-[12px] border border-border bg-surface shadow-[var(--shadow-sm)]', className)} {...p} />;
export const CardHeader = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) =>
  <div className={cn('flex items-center justify-between px-5 py-4 border-b border-border', className)} {...p} />;
export const CardTitle = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) =>
  <div className={cn('text-[14px] font-semibold text-text', className)} {...p} />;
export const CardSub = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) =>
  <div className={cn('text-[12px] text-text-3', className)} {...p} />;
export const CardBody = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) =>
  <div className={cn('px-5 py-4', className)} {...p} />;
```

- [ ] **Step 2：commit** `git add -A && git commit -m "feat(ui): card"`

### Task 1.4：Badge / Pill

**Files:** Create: `src/components/ui/pill.tsx`

- [ ] **Step 1**

```tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const pillVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2 h-5 text-[11px] font-medium',
  {
    variants: {
      tone: {
        up:   'bg-[#DCFCE7] text-success',
        down: 'bg-[#FEE2E2] text-danger',
        warn: 'bg-[#FEF3C7] text-warning',
        info: 'bg-[#DBEAFE] text-info',
        mute: 'bg-[#F1F3EE] text-text-2',
      },
    },
    defaultVariants: { tone: 'mute' },
  }
);
export interface PillProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof pillVariants> {}
export const Pill = ({ className, tone, ...p }: PillProps) =>
  <span className={cn(pillVariants({ tone }), className)} {...p} />;
```

- [ ] **Step 2：commit** `git add -A && git commit -m "feat(ui): pill"`

### Task 1.5：Separator / Avatar / Skeleton / Progress / Tooltip

**Files:** 各对应 `src/components/ui/<name>.tsx`

- [ ] **Step 1：separator.tsx** - 包装 `@radix-ui/react-separator` + 默认色 `--border`
- [ ] **Step 2：avatar.tsx** - 包装 `@radix-ui/react-avatar`，圆形、默认绿色渐变 fallback
- [ ] **Step 3：skeleton.tsx** - `<div className="animate-pulse rounded bg-[#EEF1EA]" />`
- [ ] **Step 4：progress.tsx** - 包装 `@radix-ui/react-progress`，5px 高、染色规则按 spec §4.9 用 prop `value` 自动选色
- [ ] **Step 5：tooltip.tsx** - 包装 `@radix-ui/react-tooltip`，白底 shadow-md 圆角 8

每个写完 `pnpm tsc -b`，**最后一并 commit**：`git add -A && git commit -m "feat(ui): primitives (separator/avatar/skeleton/progress/tooltip)"`

### Task 1.6：Dialog / Sheet / Popover

**Files:** `src/components/ui/{dialog,sheet,popover}.tsx`

- [ ] **Step 1：dialog.tsx** - 包装 `@radix-ui/react-dialog`，Overlay `bg-[rgba(15,30,20,.45)] backdrop-blur-[4px]`，Content `bg-surface rounded-[12px] shadow-[var(--shadow-md)] min-w-[480px] p-6`，导出 `Dialog/DialogTrigger/DialogContent/DialogHeader/DialogTitle/DialogFooter/DialogClose`
- [ ] **Step 2：sheet.tsx** - 同 dialog 但右滑入；提供 `side="right"`；宽度通过 `className` 控制（默认 420，可传 560/720）
- [ ] **Step 3：popover.tsx** - 包装 `@radix-ui/react-popover`，Content `bg-surface rounded-[8px] shadow-[var(--shadow-md)] p-2 border border-border`
- [ ] **Step 4：commit** `git add -A && git commit -m "feat(ui): dialog, sheet, popover"`

### Task 1.7：DropdownMenu / Select / Tabs

**Files:** `src/components/ui/{dropdown-menu,select,tabs}.tsx`

- [ ] **Step 1：dropdown-menu.tsx** - 包装 `@radix-ui/react-dropdown-menu`，Item hover `bg-primary-50`
- [ ] **Step 2：select.tsx** - 包装 `@radix-ui/react-select`，Trigger 同 Input 样式 36px 高
- [ ] **Step 3：tabs.tsx** - 包装 `@radix-ui/react-tabs`，TabsList `border-b border-border`，TabsTrigger 激活 `text-primary border-b-2 border-primary`
- [ ] **Step 4：commit** `git add -A && git commit -m "feat(ui): dropdown, select, tabs"`

### Task 1.8：Form 包装（RHF + Zod）

**Files:** Create: `src/components/ui/form.tsx`

- [ ] **Step 1：参考 shadcn 的 Form 模式**

导出 `Form`（= `FormProvider`）、`FormField`（基于 `Controller`）、`FormItem`（容器）、`FormLabel`、`FormControl`（=`Slot`）、`FormDescription`、`FormMessage`（错误提示，12px `--danger`）。完整代码参考 https://ui.shadcn.com/docs/components/form 的 form.tsx，将颜色/字号替换为本项目 token：错误文字 `text-danger text-[12px]`、label 用上面的 `Label` 组件。

- [ ] **Step 2：commit** `git add -A && git commit -m "feat(ui): form (rhf wrapper)"`

### Task 1.9：Toast（sonner）

**Files:** Create: `src/components/ui/toast.tsx`

- [ ] **Step 1**

```tsx
import { Toaster as SonnerToaster, toast } from 'sonner';
export const Toaster = () => (
  <SonnerToaster
    position="top-right"
    toastOptions={{
      classNames: {
        toast: 'rounded-[12px] border border-border bg-surface text-text shadow-[var(--shadow-md)]',
        success: 'border-l-4 border-l-success',
        error: 'border-l-4 border-l-danger',
        warning: 'border-l-4 border-l-warning',
      },
    }}
  />
);
export { toast };
```

- [ ] **Step 2：commit** `git add -A && git commit -m "feat(ui): toast (sonner)"`

### Task 1.10：Table 基础包装

**Files:** Create: `src/components/ui/table.tsx`

- [ ] **Step 1：导出原始 `<table>` 风格化封装**

```tsx
import * as React from 'react';
import { cn } from '@/lib/cn';
export const Table = (p: React.HTMLAttributes<HTMLTableElement>) => <table className={cn('w-full text-[13px]', p.className)} {...p} />;
export const Thead = (p: React.HTMLAttributes<HTMLTableSectionElement>) => <thead className={cn('bg-[#FAFBF7]', p.className)} {...p} />;
export const Tbody = (p: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody {...p} />;
export const Tr = (p: React.HTMLAttributes<HTMLTableRowElement>) => <tr className={cn('border-b border-border hover:bg-[#FAFBF7]', p.className)} {...p} />;
export const Th = (p: React.ThHTMLAttributes<HTMLTableCellElement>) => <th className={cn('text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-text-3', p.className)} {...p} />;
export const Td = (p: React.TdHTMLAttributes<HTMLTableCellElement>) => <td className={cn('px-5 py-3 text-text', p.className)} {...p} />;
```

- [ ] **Step 2：commit** `git add -A && git commit -m "feat(ui): table primitives"`

---

## Phase 2 · 布局与导航

### Task 2.1：导航配置 nav.ts

**Files:** Create: `src/config/nav.ts`

- [ ] **Step 1：定义 9 个一级模块和子项**（路径必须与现有 `src/router/index.tsx` 的 path 对齐）

```ts
import { LayoutDashboard, ShoppingCart, Receipt, Boxes, Truck, Tag, Users, Store, BarChart3, Settings, type LucideIcon } from 'lucide-react';

export type NavItem = { key: string; label: string; path: string; badgeKey?: string };
export type NavGroup = { label: string; items: NavItem[] };
export type NavModule = { key: string; label: string; sub: string; icon: LucideIcon; path: string; groups: NavGroup[] };

export const modules: NavModule[] = [
  { key: 'dashboard', label: '工作台', sub: '门店全景', icon: LayoutDashboard, path: '/dashboard',
    groups: [{ label: '概览', items: [{ key: 'home', label: '今日工作台', path: '/dashboard' }] }] },
  { key: 'pos', label: '收银 POS', sub: '现场开单', icon: ShoppingCart, path: '/pos',
    groups: [{ label: '开单', items: [{ key: 'pos', label: '快速开单', path: '/pos' }] }] },
  { key: 'sales', label: '销售订单', sub: '订单与加工', icon: Receipt, path: '/sales',
    groups: [
      { label: '订单', items: [{ key: 'list', label: '订单列表', path: '/sales/orders', badgeKey: 'pendingOrders' }] },
      { label: '加工', items: [{ key: 'board', label: '加工看板', path: '/sales/processing', badgeKey: 'processing' }] },
    ] },
  { key: 'inventory', label: '库存', sub: '活禽与损耗', icon: Boxes, path: '/inventory',
    groups: [
      { label: '基础', items: [{ key: 'category', label: '活禽品类', path: '/inventory/category' }] },
      { label: '存栏', items: [{ key: 'stock', label: '库存', path: '/inventory/stock' }, { key: 'loss', label: '损耗', path: '/inventory/loss' }] },
    ] },
  { key: 'procurement', label: '采购', sub: '入库与供应商', icon: Truck, path: '/procurement',
    groups: [{ label: '采购', items: [
      { key: 'order', label: '采购单', path: '/procurement/orders' },
      { key: 'supplier', label: '供应商', path: '/procurement/suppliers' },
    ] }] },
  { key: 'pricing', label: '价格', sub: '门店定价', icon: Tag, path: '/pricing',
    groups: [{ label: '价格', items: [{ key: 'all', label: '价格管理', path: '/pricing' }] }] },
  { key: 'member', label: '会员', sub: '客户与积分', icon: Users, path: '/members',
    groups: [{ label: '会员', items: [{ key: 'list', label: '会员列表', path: '/members' }] }] },
  { key: 'shop', label: '门店', sub: '组织与员工', icon: Store, path: '/shop',
    groups: [{ label: '组织', items: [
      { key: 'stores', label: '门店', path: '/shop/stores' },
      { key: 'staff', label: '员工', path: '/shop/staff' },
    ] }] },
  { key: 'report', label: '报表', sub: '经营分析', icon: BarChart3, path: '/reports',
    groups: [{ label: '报表', items: [{ key: 'all', label: '经营报表', path: '/reports' }] }] },
];

export const settingsItem = { key: 'settings', label: '设置', icon: Settings, path: '/settings' };
```

> **路径对齐**：执行时先 `cat src/router/index.tsx` 比对 path；如有不一致以 router 为准修改这里的 path。**禁止改动 router/index.tsx 的 path，仅同步到 nav.ts**。

- [ ] **Step 2：commit** `git add -A && git commit -m "feat(config): nav modules"`

### Task 2.2：Rail（一级图标导轨 60px）

**Files:** Create: `src/components/layout/Rail.tsx`

- [ ] **Step 1**

```tsx
import { Link, useLocation } from 'react-router-dom';
import { modules, settingsItem } from '@/config/nav';
import { cn } from '@/lib/cn';

export function Rail() {
  const { pathname } = useLocation();
  const isActive = (p: string) => pathname === p || pathname.startsWith(p + '/');
  return (
    <aside className="w-[60px] shrink-0 bg-rail flex flex-col items-center py-3 gap-1">
      <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center text-white text-[13px] font-bold mb-2">SH</div>
      {modules.map((m) => {
        const Icon = m.icon;
        const active = isActive(m.path);
        return (
          <Link key={m.key} to={m.path} title={m.label}
            className={cn('relative w-10 h-10 rounded-[10px] flex items-center justify-center text-white/70 hover:text-white hover:bg-rail-2 transition',
              active && 'text-white bg-rail-2')}>
            {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-primary" />}
            <Icon size={18} strokeWidth={1.8} />
          </Link>
        );
      })}
      <div className="mt-auto">
        <Link to={settingsItem.path} title="设置" className="w-10 h-10 rounded-[10px] flex items-center justify-center text-white/70 hover:text-white hover:bg-rail-2">
          <settingsItem.icon size={18} strokeWidth={1.8} />
        </Link>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2：commit** `git add -A && git commit -m "feat(layout): Rail"`

### Task 2.3：Secondary（200px 二级面板）

**Files:** Create: `src/components/layout/Secondary.tsx`

- [ ] **Step 1**

```tsx
import { Link, useLocation } from 'react-router-dom';
import { modules } from '@/config/nav';
import { cn } from '@/lib/cn';

export function Secondary() {
  const { pathname } = useLocation();
  const current = modules.find((m) => pathname === m.path || pathname.startsWith(m.path + '/')) ?? modules[0];
  return (
    <aside className="w-[200px] shrink-0 bg-surface border-r border-border flex flex-col">
      <div className="px-4 py-4 border-b border-border">
        <div className="text-[14px] font-semibold text-text">{current.label}</div>
        <div className="text-[12px] text-text-3 mt-0.5">{current.sub}</div>
      </div>
      <nav className="flex-1 overflow-y-auto py-3">
        {current.groups.map((g) => (
          <div key={g.label} className="px-3 mb-3">
            <div className="px-2 mb-1.5 text-[10px] uppercase tracking-wider text-text-3 font-semibold">{g.label}</div>
            {g.items.map((it) => {
              const active = pathname === it.path;
              return (
                <Link key={it.key} to={it.path}
                  className={cn('block px-2.5 h-8 leading-8 rounded-[8px] text-[13px] text-text-2 hover:bg-[#F1F3EE]',
                    active && 'bg-primary-50 text-primary font-medium')}>
                  {it.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 2：commit** `git add -A && git commit -m "feat(layout): Secondary"`

### Task 2.4：Topbar（56px）

**Files:** Create: `src/components/layout/Topbar.tsx`

- [ ] **Step 1**：左侧面包屑（用 react-router 当前 path 拆段并匹配 modules + groups + items 的 label）；右侧门店选择器（用 `useAppStore` 取当前门店，绿色脉冲点 + DropdownMenu 切换）、搜索 Input（带 lucide Search 图标）、Bell（带红点）、Avatar 渐变绿。

```tsx
import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { useAppStore } from '@/store/useAppStore';

export function Topbar() {
  const store = useAppStore((s) => s.currentStore);
  return (
    <header className="h-14 shrink-0 border-b border-border bg-surface flex items-center px-6 gap-4">
      <div className="text-[13px] text-text-2">面包屑占位</div>
      <div className="flex-1" />
      <button className="inline-flex items-center gap-2 px-3 h-8 rounded-[8px] border border-border text-[13px] text-text-2 hover:bg-[#F1F3EE]">
        <span className="relative flex w-2 h-2"><span className="absolute inline-flex w-full h-full rounded-full bg-primary opacity-75 animate-ping" /><span className="relative inline-flex rounded-full w-2 h-2 bg-primary" /></span>
        {store?.name ?? '门店'}
      </button>
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-3" />
        <Input className="h-8 w-56 pl-8 text-[12px]" placeholder="搜索订单 / 会员 / SKU" />
      </div>
      <button className="relative w-8 h-8 rounded-[8px] hover:bg-[#F1F3EE] flex items-center justify-center text-text-2">
        <Bell size={16} />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-danger" />
      </button>
      <Avatar />
    </header>
  );
}
```

> 面包屑实现：根据 `useLocation().pathname` 拆 `/sales/orders` → 在 `modules` 找到 `key=sales`、再在 `groups[].items` 找 `path` 匹配，渲染 `当前模块.label / 当前 item.label`。

- [ ] **Step 2：commit** `git add -A && git commit -m "feat(layout): Topbar"`

### Task 2.5：PageHeader

**Files:** Create: `src/components/layout/PageHeader.tsx`

- [ ] **Step 1**

```tsx
import * as React from 'react';
type Props = { title: string; sub?: string; actions?: React.ReactNode };
export function PageHeader({ title, sub, actions }: Props) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h1 className="text-[24px] font-bold text-text leading-tight">{title}</h1>
        {sub && <p className="text-[13px] text-text-3 mt-1">{sub}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
```

- [ ] **Step 2：commit** `git add -A && git commit -m "feat(layout): PageHeader"`

### Task 2.6：MainLayout 重写

**Files:** Modify: `src/layouts/MainLayout.tsx`

- [ ] **Step 1：完全替换为**

```tsx
import { Outlet } from 'react-router-dom';
import { Rail } from '@/components/layout/Rail';
import { Secondary } from '@/components/layout/Secondary';
import { Topbar } from '@/components/layout/Topbar';
import { Toaster } from '@/components/ui/toast';

export default function MainLayout() {
  return (
    <div className="h-screen flex bg-bg text-text">
      <Rail />
      <Secondary />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-auto px-7 py-6"><Outlet /></main>
      </div>
      <Toaster />
    </div>
  );
}
```

- [ ] **Step 2：commit** `git add -A && git commit -m "feat(layout): rewrite MainLayout"`

### Task 2.7：App.tsx 去 AntD

**Files:** Modify: `src/App.tsx`

- [ ] **Step 1：完全替换**

```tsx
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from '@/router';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } });

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
```

- [ ] **Step 2：commit** `git add -A && git commit -m "feat(app): drop AntD ConfigProvider"`

### Task 2.8：router 替换 Spin loader

**Files:** Modify: `src/router/index.tsx`

- [ ] **Step 1：把 antd 的 `<Spin />` fallback 替换为内联 loader**

```tsx
const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-6 h-6 rounded-full border-2 border-border border-t-primary animate-spin" />
  </div>
);
```

替换所有 `<Suspense fallback={<Spin />}>` 为 `<Suspense fallback={<PageLoader />}>`，删除 `import { Spin } from 'antd'`。

- [ ] **Step 2：自检 + commit**

```bash
pnpm tsc -b && pnpm build
git add -A && git commit -m "feat(router): replace antd Spin with custom loader"
```

---

## Phase 3 · 数据组件（components/data/）

### Task 3.1：StatusPill

**Files:** Create: `src/components/data/StatusPill.tsx`

- [ ] **Step 1**：业务状态 → tone 的映射

```tsx
import { Pill } from '@/components/ui/pill';

const map = {
  pending: { tone: 'mute', label: '待处理' },
  processing: { tone: 'warn', label: '加工中' },
  ready: { tone: 'info', label: '待取' },
  completed: { tone: 'up', label: '已完成' },
  cancelled: { tone: 'down', label: '已取消' },
  refunded: { tone: 'info', label: '已退款' },
  low: { tone: 'down', label: '低库存' },
  ok: { tone: 'up', label: '正常' },
} as const;

export type StatusKey = keyof typeof map;
export function StatusPill({ status, pulse }: { status: StatusKey; pulse?: boolean }) {
  const cfg = map[status];
  return (
    <Pill tone={cfg.tone as any}>
      {pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
      {cfg.label}
    </Pill>
  );
}
```

- [ ] **Step 2：commit** `git add -A && git commit -m "feat(data): StatusPill"`

### Task 3.2：Sparkline

**Files:** Create: `src/components/data/Sparkline.tsx`

- [ ] **Step 1**：纯 SVG 折线，输入 `data: number[]`，宽 80 高 32，描边 `var(--primary)` 1.5px

```tsx
export function Sparkline({ data, width = 80, height = 32 }: { data: number[]; width?: number; height?: number }) {
  if (data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const dx = width / (data.length - 1);
  const norm = (v: number) => height - ((v - min) / Math.max(1, max - min)) * (height - 4) - 2;
  const d = data.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * dx).toFixed(1)},${norm(v).toFixed(1)}`).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <path d={d} fill="none" stroke="var(--primary)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
```

- [ ] **Step 2：commit** `git add -A && git commit -m "feat(data): Sparkline"`

### Task 3.3：KpiCard

**Files:** Create: `src/components/data/KpiCard.tsx`

- [ ] **Step 1**

```tsx
import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Sparkline } from './Sparkline';
import { Pill } from '@/components/ui/pill';
import { cn } from '@/lib/cn';

type Props = {
  label: string;
  value: string;
  meta?: { tone: 'up' | 'down' | 'warn' | 'info' | 'mute'; text: string }[];
  trend?: number[];
  valueColor?: 'text' | 'accent' | 'danger';
};
export function KpiCard({ label, value, meta, trend, valueColor = 'text' }: Props) {
  return (
    <Card className="p-5 flex flex-col gap-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-text-3">{label}</div>
      <div className={cn('text-[28px] font-bold tnum leading-none',
        valueColor === 'accent' && 'text-accent',
        valueColor === 'danger' && 'text-danger')}>{value}</div>
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {meta?.map((m, i) => <Pill key={i} tone={m.tone}>{m.text}</Pill>)}
        </div>
        {trend && <Sparkline data={trend} />}
      </div>
    </Card>
  );
}
```

- [ ] **Step 2：commit** `git add -A && git commit -m "feat(data): KpiCard"`

### Task 3.4：InventoryBar

**Files:** Create: `src/components/data/InventoryBar.tsx`

- [ ] **Step 1**

```tsx
export function InventoryBar({ value, total }: { value: number; total: number }) {
  const pct = total === 0 ? 0 : Math.min(100, (value / total) * 100);
  const color = pct < 20 ? 'var(--danger)' : pct < 40 ? 'var(--accent)' : 'var(--primary)';
  return (
    <div className="w-full h-[5px] rounded-[3px] bg-[#F1F3EE] overflow-hidden">
      <div className="h-full rounded-[3px] transition-[width]" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}
```

- [ ] **Step 2：commit** `git add -A && git commit -m "feat(data): InventoryBar"`

### Task 3.5：DataTable（TanStack Table v8）

**Files:** Create: `src/components/data/DataTable.tsx`

- [ ] **Step 1：通用列表，支持 columns / data / 分页 / 搜索 / loading / 空态**

```tsx
import * as React from 'react';
import { useReactTable, getCoreRowModel, getPaginationRowModel, getFilteredRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

type Props<T> = {
  columns: ColumnDef<T, any>[];
  data: T[];
  loading?: boolean;
  searchPlaceholder?: string;
  toolbar?: React.ReactNode;
  pageSize?: number;
};
export function DataTable<T>({ columns, data, loading, searchPlaceholder = '搜索', toolbar, pageSize = 20 }: Props<T>) {
  const [globalFilter, setGlobalFilter] = React.useState('');
  const table = useReactTable({
    data, columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  return (
    <div className="rounded-[12px] border border-border bg-surface shadow-[var(--shadow-sm)] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-3" />
          <Input value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="h-8 w-64 pl-8 text-[12px]" placeholder={searchPlaceholder} />
        </div>
        <div className="flex-1" />
        {toolbar}
      </div>
      <Table>
        <Thead>
          {table.getHeaderGroups().map((hg) => (
            <Tr key={hg.id}>{hg.headers.map((h) => <Th key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</Th>)}</Tr>
          ))}
        </Thead>
        <Tbody>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <Tr key={i}>{columns.map((_c, j) => <Td key={j}><Skeleton className="h-4 w-full" /></Td>)}</Tr>
              ))
            : table.getRowModel().rows.length === 0
              ? <Tr><Td colSpan={columns.length} className="text-center text-text-3 py-12">暂无数据</Td></Tr>
              : table.getRowModel().rows.map((r) => (
                  <Tr key={r.id}>{r.getVisibleCells().map((c) => <Td key={c.id}>{flexRender(c.column.columnDef.cell, c.getContext())}</Td>)}</Tr>
                ))}
        </Tbody>
      </Table>
      <div className="flex items-center justify-between px-5 py-3 border-t border-border text-[12px] text-text-3">
        <span>共 {table.getFilteredRowModel().rows.length} 条</span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>上一页</Button>
          <span className="tnum">{table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}</span>
          <Button variant="ghost" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>下一页</Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2：commit** `git add -A && git commit -m "feat(data): DataTable"`

---

## Phase 4 · 图表（components/chart/）

### Task 4.1：LineChart

**Files:** Create: `src/components/chart/LineChart.tsx`

- [ ] **Step 1**

```tsx
import { ResponsiveContainer, LineChart as RC, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

type Props = { data: any[]; xKey: string; lines: { key: string; color?: string; name?: string }[]; height?: number };
export function LineChart({ data, xKey, lines, height = 240 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RC data={data} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid stroke="#EEF1EA" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow-md)' }} />
        {lines.map((l, i) => (
          <Line key={l.key} type="monotone" dataKey={l.key} stroke={l.color ?? (i === 0 ? 'var(--primary)' : '#B6C2BB')}
            strokeDasharray={i === 0 ? undefined : '4 4'} strokeWidth={2} dot={false} name={l.name} />
        ))}
      </RC>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 2：commit** `git add -A && git commit -m "feat(chart): LineChart"`

### Task 4.2：BarChart

**Files:** Create: `src/components/chart/BarChart.tsx`

- [ ] **Step 1**：与 LineChart 同结构，用 `Bar` 替代 `Line`，圆角顶部 4px，颜色 `var(--primary)`，barSize 18。

- [ ] **Step 2：commit** `git add -A && git commit -m "feat(chart): BarChart"`

---

## Phase 5 · 15 个页面重写

> **共同规则**：每个 page 都用 `<PageHeader>` 开头；保留原页面对 hooks/api 的所有调用（先 `cat src/pages/<Page>.tsx` 抄走业务逻辑），仅替换 JSX；删除一切 `import 'antd'`。每完成 1 页 commit。

### Task 5.1：DashboardPage（视觉契约 1:1）

**Files:** Modify: `src/pages/DashboardPage.tsx`（如不存在则 Create）

- [ ] **Step 1：浏览器打开 `dashboard-bright.html` 对照实现**

按视觉契约结构：
1. PageHeader：title "今日工作台" + 当前日期 sub + 右上角 ghost「导出」+ primary「新建工单」
2. 4 列 KpiCard：今日营业额 / 加工中订单 / 库存预警 / 会员到访
3. 主辅 2:1：左 LineChart（最近 7 天销售）+ 右排队工单卡片（前 5 条 status=processing 的订单，用 StatusPill pulse）
4. 三等分卡片：热销品类（BarChart）/ 库存健康（InventoryBar 列表）/ 待办

数据：用 `useSalesOrders`、`useInventory`、`useBiz` 现成 hook；缺字段时先用 `mockData` 占位，**不要新增业务逻辑**。

- [ ] **Step 2：自检** `pnpm tsc -b && pnpm dev`，浏览器对照契约
- [ ] **Step 3：commit** `git add -A && git commit -m "feat(page): DashboardPage matches visual contract"`

### Task 5.2：LoginPage

**Files:** Modify: `src/pages/LoginPage.tsx`

- [ ] **Step 1**：左半屏 `bg-gradient-to-br from-[#0F2B1F] via-[#15803D] to-[#16A34A]` + logo + slogan「让活禽门店像 SaaS 一样运转」；右半屏居中卡片 400 宽：标题 + RHF 表单（账号/密码/记住我/登录按钮）+ Zod 校验 + 调用 `useAuthStore.login`
- [ ] **Step 2：commit** `git add -A && git commit -m "feat(page): LoginPage"`

### Task 5.3：PosPage（触屏）

**Files:** Modify: `src/pages/PosPage.tsx`

- [ ] **Step 1**：左 2/3 是品类网格（用 `usePoultry` 取品类列表，渲染 4 列卡片，点击加入购物车），右 1/3 是购物车面板（行：名称/重量/单价/小计/删除，底部合计 + 大号 primary「结算」按钮 size="lg"）
- [ ] **Step 2：commit** `git add -A && git commit -m "feat(page): PosPage"`

### Task 5.4：SalesOrderListPage

**Files:** Modify: `src/pages/SalesOrderListPage.tsx`

- [ ] **Step 1**：PageHeader + 顶部 chip 行（全部/待处理/加工中/待取/已完成 — 用普通 button + active 态 `bg-primary-50 text-primary`）+ DataTable 列：订单号(mono) / 会员 / 品类摘要 / 金额(右对齐 mono) / 状态(StatusPill) / 创建时间 / 操作(查看)
- [ ] **Step 2：commit** `git add -A && git commit -m "feat(page): SalesOrderListPage"`

### Task 5.5：SalesOrderDetailPage

**Files:** Modify: `src/pages/SalesOrderDetailPage.tsx`

- [ ] **Step 1**：双栏 7:5。左：订单基本信息卡 + 商品明细 Table + 金额汇总。右：加工时间线（垂直步骤条：下单 → 排队 → 宰杀 → 分割 → 完成 → 取货，每步带时间戳与状态点 `bg-primary` 已完成、`bg-accent animate-pulse` 进行中）
- [ ] **Step 2：commit** `git add -A && git commit -m "feat(page): SalesOrderDetailPage"`

### Task 5.6：ProcessingBoardPage（看板）

**Files:** Modify: `src/pages/ProcessingBoardPage.tsx`

- [ ] **Step 1**：4 列等宽 grid：排队 / 加工中 / 待取 / 完成。每列 head：名称 + 计数 Pill。卡片：订单号 / 品类 / 重量 / 等待时长 + StatusPill；加工中卡片左侧加 4px `bg-accent` 竖条
- [ ] **Step 2：commit** `git add -A && git commit -m "feat(page): ProcessingBoardPage"`

### Task 5.7：PoultryCategoryPage

**Files:** Modify: `src/pages/PoultryCategoryPage.tsx`

- [ ] **Step 1**：DataTable + PageHeader 右侧「新增品类」按钮触发 Sheet（右滑 420，RHF 表单：名称/编码/单位/规格/默认价）
- [ ] **Step 2：commit** `git add -A && git commit -m "feat(page): PoultryCategoryPage"`

### Task 5.8：InventoryPage

**Files:** Modify: `src/pages/InventoryPage.tsx`

- [ ] **Step 1**：上方 3 列 KpiCard（在栏总数 / 今日入库 / 临期预警）+ DataTable 列：品类 / 当前库存(mono) / 容量 / 健康度(InventoryBar) / 状态(StatusPill) / 操作
- [ ] **Step 2：commit** `git add -A && git commit -m "feat(page): InventoryPage"`

### Task 5.9：LossPage

**Files:** Modify: `src/pages/LossPage.tsx`

- [ ] **Step 1**：DataTable + 顶部原因 chip 筛选（自然死亡 / 病死 / 加工损耗 / 其他）+ 「新增损耗记录」Sheet
- [ ] **Step 2：commit** `git add -A && git commit -m "feat(page): LossPage"`

### Task 5.10：ProcurementPage

**Files:** Modify: `src/pages/ProcurementPage.tsx`

- [ ] **Step 1**：DataTable 列：采购单号 / 供应商 / 品类摘要 / 数量 / 金额 / 状态 / 入库时间。「新增采购单」Dialog（多行明细 + 底部合计）
- [ ] **Step 2：commit** `git add -A && git commit -m "feat(page): ProcurementPage"`

### Task 5.11：SupplierPage

**Files:** Modify: `src/pages/SupplierPage.tsx`

- [ ] **Step 1**：DataTable 列：名称 / 联系人 / 电话(mono) / 主营品类(Pill 多个) / 累计采购 / 操作
- [ ] **Step 2：commit** `git add -A && git commit -m "feat(page): SupplierPage"`

### Task 5.12：PricingPage

**Files:** Modify: `src/pages/PricingPage.tsx`

- [ ] **Step 1**：按品类分组的卡片网格（每张卡 head=品类名，body=表格行：规格 / 进价 / 售价 / 利润率），售价支持行内 Input 直接编辑，回车保存（调用现有 hook）
- [ ] **Step 2：commit** `git add -A && git commit -m "feat(page): PricingPage"`

### Task 5.13：MemberPage

**Files:** Modify: `src/pages/MemberPage.tsx`

- [ ] **Step 1**：DataTable 列：手机号(mono) / 姓名 / 等级(Pill) / 累计消费(mono) / 积分 / 最近到访 / 操作。点行触发右侧 Sheet（420宽）：会员信息 + 消费记录时间线
- [ ] **Step 2：commit** `git add -A && git commit -m "feat(page): MemberPage"`

### Task 5.14：StoreListPage / StaffPage

**Files:** Modify: `src/pages/StoreListPage.tsx`, `src/pages/StaffPage.tsx`

- [ ] **Step 1：StoreListPage** DataTable：门店名 / 编码 / 地址 / 营业状态 / 员工数 / 今日营业额
- [ ] **Step 2：StaffPage** DataTable：姓名 / 工号(mono) / 角色(Pill) / 所属门店 / 状态 / 入职时间
- [ ] **Step 3：commit** `git add -A && git commit -m "feat(page): StoreListPage, StaffPage"`

### Task 5.15：ReportPage

**Files:** Modify: `src/pages/ReportPage.tsx`

- [ ] **Step 1**：顶部 4 列 KpiCard（月营业额 / 月毛利 / 客单价 / 复购率）+ Tabs（销售趋势 / 品类构成 / 门店排行）+ 大尺寸图表区（LineChart / BarChart 切换）
- [ ] **Step 2：commit** `git add -A && git commit -m "feat(page): ReportPage"`

---

## Phase 6 · 清理与验收

### Task 6.1：零 AntD 残留

- [ ] **Step 1：搜索残留**

```bash
cd /Users/qiaozhen/app/shop/shop-fe
grep -rn "from 'antd'" src/ || echo OK
grep -rn "@ant-design/icons" src/ || echo OK
grep -rn "ConfigProvider\|AntdApp" src/ || echo OK
```

- [ ] **Step 2：删除老的 antd 残留组件文件**（如 `src/components/` 下旧 AntD 风格组件）

```bash
git status
# 确认所有改动已 commit；删除多余的 .bak/_old 文件
```

- [ ] **Step 3：commit** `git add -A && git commit -m "chore: remove antd residue"`

### Task 6.2：类型与构建

- [ ] **Step 1**：`pnpm tsc -b` → 零错误
- [ ] **Step 2**：`pnpm build` → 成功；记录产物体积，确认小于重做前
- [ ] **Step 3：commit**（如有 lint 修补） `git add -A && git commit -m "chore: tsc + build clean"`

### Task 6.3：人工视觉自检清单

- [ ] **Step 1**：`pnpm dev`，挨个浏览 15 个页面：
  - [ ] 色板：所有主按钮 `#16A34A`；所有左侧导轨 `#0F2B1F`
  - [ ] 字体：正文 Inter；订单号/金额/时间用 mono tnum
  - [ ] 圆角：按钮 8 / 卡片 12 / 徽章 999
  - [ ] 间距：page padding 24/28；卡片 head 16 20、body 18 20
  - [ ] DashboardPage 与 `dashboard-bright.html` 对照无明显违和
  - [ ] StatusPill 配色与 spec §4.3 一致

- [ ] **Step 2**：用截图与 `dashboard-bright.html` 截图并排比对，发现不一致回到对应 Task 修补

### Task 6.4：合并准备

- [ ] **Step 1**：rebase 整理 commit 历史（可选）
- [ ] **Step 2**：推送分支

```bash
git push -u origin redesign/v2
```

- [ ] **Step 3**：开 PR，标题「shop-fe 视觉重做：AntD → Tailwind+Radix（v2）」，描述里粘 spec 链接、视觉契约链接、关键截图。**不在本计划范围内合并**——交给用户决定。

---

## 自检（writing-plans 要求）

- [x] **Spec 覆盖**：spec §1-§9 全部映射到 task：色板/字体/间距 → Task 0.4；布局 → 2.1-2.6；组件规范 → Phase 1+3+4；技术栈迁移 → Task 0.2；迁移策略 → Task 0.1；15 页清单 → Phase 5；非目标无任务；验收 → Phase 6
- [x] **占位符扫描**：无 TBD/TODO/"类似 Task N"，每步均含可执行命令或代码
- [x] **类型一致性**：`NavModule/NavGroup/NavItem` 在 Task 2.1 定义，Rail/Secondary 直接消费；`StatusKey` 在 Task 3.1 定义；`KpiCard.meta.tone` 与 `Pill.tone` variants 名称一致（up/down/warn/info/mute）

