# 博客前端重设计 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 mimo-blog 前端从 shadcn 默认中性灰模板重设计为「编辑式技术杂志 + 滚动驱动叙事」风格，落地首页 + 博客列表页 + 文章详情页（第一期）。

**Architecture:** 沿用现有 FSD 分层（widgets/features/routes/shared）。底层先重写 design tokens（配色/字体/圆角），建立 client-only 隔离基础设施；再逐页重写（首页 → 列表 → 详情）。每个 react-bits 动效组件以源码 vendor 方式引入并 client-only 隔离，统一 honor `prefers-reduced-motion`。SSR 用 loader 预取 + dehydrate 模式（现有惯例）。

**Tech Stack:** React 19, TanStack Start (SSR) + TanStack Router + Query, Tailwind v4 (`@tailwindcss/vite`), Motion (`motion/react`), ogl (WebGL), react-markdown + remark-gfm + rehype-highlight, Geist 字体（@fontsource-variable）, shadcn/ui 基础件。

**Spec:** `docs/superpowers/specs/2026-06-23-blog-redesign.md`

---

## 关键约束（所有任务都遵守）

1. **client-only 隔离**：任何用 `window`/`canvas`/WebGL/`motion` 的 `useXxx`/`rAF`/鼠标坐标的组件，必须 `'use client'` 顶部声明，且通过 `ClientOnly` 包裹（Task 3 建立）或 SSR 返回 null。
2. **reduced-motion**：所有动效组件必须 honor `prefers-reduced-motion`（motion 的 `useReducedMotion()` hook）。
3. **一个 accent 锁全站**：电光蓝 `--accent: hsl(217 91% 60%)`，不出现第二个 accent。
4. **Biome + tsc**：每个任务结束前 `cd web && npx biome check . && npx tsc --noEmit` 必须通过。

---

## Task 1: 安装新依赖 + 建立字体加载

**Files:**
- Modify: `web/package.json`
- Create: `web/src/styles/fonts.css`

- [ ] **Step 1: 安装依赖**

```bash
cd web
pnpm add @fontsource-variable/geist @fontsource-variable/geist-mono react-markdown remark-gfm rehype-highlight highlight.js
```

> 若 pnpm 不可用，用 `npm install`。这些都是新增到 dependencies。

- [ ] **Step 2: 创建字体 CSS**

```css
/* web/src/styles/fonts.css */
@import "@fontsource-variable/geist";
@import "@fontsource-variable/geist-mono";
```

- [ ] **Step 3: 在 styles.css 顶部引入字体**

修改 `web/src/styles.css`，在 `@import "tailwindcss";` 之后追加：

```css
@import "./styles/fonts.css";
```

- [ ] **Step 4: 更新 --font-sans token**

修改 `web/src/styles.css` 的 `@theme` 块，把 `--font-sans` 改为：

```css
--font-sans: "Geist Variable", system-ui, -apple-system, sans-serif;
--font-mono: "Geist Mono Variable", ui-monospace, monospace;
```

- [ ] **Step 5: 验证字体加载**

Run: `cd web && pnpm dev`
打开 http://localhost:3000，DevTools Network 面板确认 `GeistVariable` woff2 加载（200 OK），页面字体变化。
Expected: 无构建错误，字体文件加载成功。

- [ ] **Step 6: 验证 lint/tsc**

Run: `cd web && npx biome check . && npx tsc --noEmit`
Expected: 通过（styles.css 不参与 tsc，biome 不报错）。

- [ ] **Step 7: Commit**

```bash
git add web/package.json web/pnpm-lock.yaml web/src/styles.css web/src/styles/fonts.css
git commit -m "feat(web): 引入 Geist 字体 + markdown 渲染依赖

- @fontsource-variable/geist + geist-mono 自托管
- react-markdown + remark-gfm + rehype-highlight + highlight.js（详情页正文）
- --font-sans 切换为 Geist Variable"
```

---

## Task 2: 重写 design tokens（配色/圆角/主题）

**Files:**
- Modify: `web/src/styles.css`

- [ ] **Step 1: 重写 :root 与 .dark token 块**

把 `web/src/styles.css` 的 `@layer base` 中的 `:root { ... }` 整块替换为：

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222 47% 8%;
  --card: 0 0% 100%;
  --card-foreground: 222 47% 8%;
  --primary: 222 47% 11%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222 47% 11%;
  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 47%;
  --accent: 217 91% 60%;
  --accent-foreground: 0 0% 100%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 210 40% 98%;
  --border: 214 32% 91%;
  --input: 214 32% 91%;
  --ring: 217 91% 60%;
}
```

把 `.dark { ... }` 整块替换为：

```css
.dark {
  --background: 222 47% 6%;
  --foreground: 210 40% 96%;
  --card: 222 40% 9%;
  --card-foreground: 210 40% 96%;
  --primary: 210 40% 98%;
  --primary-foreground: 222 47% 11%;
  --secondary: 217 28% 14%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217 28% 14%;
  --muted-foreground: 215 20% 62%;
  --accent: 217 91% 60%;
  --accent-foreground: 0 0% 100%;
  --destructive: 0 62% 40%;
  --destructive-foreground: 210 40% 98%;
  --border: 217 28% 18%;
  --input: 217 28% 18%;
  --ring: 217 91% 60%;
}
```

> 关键变化：`--accent` 统一为电光蓝（双模式同值），`--ring` 跟随 accent。暗色底改为石墨 `222 47% 6%`，非纯黑。

- [ ] **Step 2: 更新 @theme 圆角 token**

在 `@theme` 块中把 `--radius: 0.5rem;` 改为：

```css
--radius: 0.75rem;
```

并在 `@theme` 块末尾追加圆角刻度（用于全站锁定）：

```css
--radius-card: 0.75rem;
--radius-pill: 9999px;
--radius-image: 0px;
```

- [ ] **Step 3: 在 body 加 font-family mono fallback + selection 配色**

在 `@layer base` 的 `body { ... }` 后追加：

```css
::selection {
  background-color: hsl(var(--accent) / 0.3);
  color: hsl(var(--foreground));
}
```

- [ ] **Step 4: 视觉验证**

Run: `cd web && pnpm dev`
打开首页，切换主题（Header 主题按钮）。
Expected: 暗色为石墨深蓝底（非纯黑），accent 相关元素（链接 hover）呈电光蓝；亮色底白、文字深；selection 高亮为半透明蓝。

- [ ] **Step 5: 验证 lint/tsc**

Run: `cd web && npx biome check . && npx tsc --noEmit`
Expected: 通过。

- [ ] **Step 6: Commit**

```bash
git add web/src/styles.css
git commit -m "feat(web): 重写 design tokens（石墨暗色 + 单一电光蓝 accent）

- --accent 锁定为电光蓝 hsl(217 91% 60%)，双模式同值，全站唯一 accent
- 暗色 --background 改石墨 222 47% 6%（非纯黑），--ring 跟随 accent
- --radius 提至 0.75rem，新增 card/pill/image 三档圆角刻度
- ::selection 用半透明电光蓝"
```

---

## Task 3: 建立 client-only 隔离基础设施（ClientOnly + useReducedMotion）

**Files:**
- Create: `web/src/shared/lib/client-only.tsx`
- Create: `web/src/shared/lib/use-reduced-motion.ts`

- [ ] **Step 1: 写 ClientOnly 组件测试**

Create `web/src/shared/lib/client-only.test.tsx`:

```tsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ClientOnly from "./client-only";

describe("ClientOnly", () => {
  it("mount 后渲染 children（jsdom 同步 effect，render 完成即 mounted）", () => {
    const { container, getByTestId } = render(
      <ClientOnly fallback={<div data-testid="fb">loading</div>}>
        <div data-testid="real">content</div>
      </ClientOnly>,
    );
    // jsdom 中 render 后 useEffect 已执行，mounted=true，渲染 children
    expect(getByTestId("real")).toBeTruthy();
    expect(container.querySelector('[data-testid="fb"]')).toBeNull();
  });

  it("未传 fallback 时渲染 children（mount 后）", () => {
    const { container, getByTestId } = render(
      <ClientOnly>
        <div data-testid="real">content</div>
      </ClientOnly>,
    );
    expect(getByTestId("real")).toBeTruthy();
    expect(container.firstChild).not.toBeNull();
  });
});
```

> 注：jsdom 不是真实 SSR 环境，`render` 后 `useEffect` 同步执行，`mounted` 已为 true。此测试验证「客户端 mount 后正确渲染 children」契约。SSR 隔离的正确性由 Task 15 的 hydration 检查（DevTools 无 warning）覆盖。

- [ ] **Step 2: 运行测试确认失败**

Run: `cd web && npx vitest run src/shared/lib/client-only.test.tsx`
Expected: FAIL（`client-only.tsx` 不存在，模块解析失败）。

- [ ] **Step 3: 实现 ClientOnly**

Create `web/src/shared/lib/client-only.tsx`:

```tsx
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

/**
 * ClientOnlyProps - 仅客户端渲染包装器属性
 */
export interface ClientOnlyProps {
  /** 仅客户端时渲染的子节点 */
  children: ReactNode;
  /** 服务端/首帧（mount 前）渲染的 fallback */
  fallback?: ReactNode;
}

/**
 * ClientOnly - SSR 安全包装器
 *
 * SSR 与首帧渲染 fallback（默认 null），客户端 mount 后才渲染 children。
 * 用于隔离依赖 window/canvas/WebGL/mouse 的组件，避免 hydration mismatch。
 *
 * 原理：useState 初值 false，useEffect 仅在客户端执行置 true。
 */
const ClientOnly = ({ children, fallback = null }: ClientOnlyProps) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return <>{mounted ? children : fallback}</>;
};

export default ClientOnly;
```

- [ ] **Step 4: 运行测试确认通过**

Run: `cd web && npx vitest run src/shared/lib/client-only.test.tsx`
Expected: PASS（2 tests）。

- [ ] **Step 5: 创建 useReducedMotion 适配 hook**

Create `web/src/shared/lib/use-reduced-motion.ts`:

```ts
import { useReducedMotion } from "motion/react";

export { useReducedMotion };
```

> 说明：motion 已自带 `useReducedMotion`，这里仅做项目内别名 re-export，集中 import 入口，便于后续统一替换/扩展。

- [ ] **Step 6: 验证 lint/tsc**

Run: `cd web && npx biome check . && npx tsc --noEmit`
Expected: 通过。

- [ ] **Step 7: Commit**

```bash
git add web/src/shared/lib/client-only.tsx web/src/shared/lib/client-only.test.tsx web/src/shared/lib/use-reduced-motion.ts
git commit -m "feat(web): 新增 ClientOnly + useReducedMotion 基础设施

- ClientOnly：SSR 安全包装器，mount 前渲染 fallback，隔离 window/canvas/WebGL 组件
- useReducedMotion：re-export motion 自带 hook，统一动效降级入口"
```

---

## Task 4: 引入全局 ScrollProgress 顶条

**Files:**
- Create: `web/src/widgets/ScrollProgress/ScrollProgress.tsx`
- Create: `web/src/widgets/ScrollProgress/index.ts`
- Modify: `web/src/routes/__root.tsx`

- [ ] **Step 1: 创建 ScrollProgress 组件**

Create `web/src/widgets/ScrollProgress/ScrollProgress.tsx`:

```tsx
"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

/**
 * ScrollProgress - 顶部固定滚动进度条
 *
 * 2px 电光蓝进度条，固定在视口顶部（z-50），全站统一。
 * scaleX 驱动，transform-origin 左侧。
 * reduced-motion 下不渲染（静态页不需要进度反馈）。
 */
const ScrollProgress = () => {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  if (reduce) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-accent"
    />
  );
};

export default ScrollProgress;
```

- [ ] **Step 2: 创建 barrel**

Create `web/src/widgets/ScrollProgress/index.ts`:

```ts
export { default } from "./ScrollProgress";
```

- [ ] **Step 3: 挂载到 __root**

修改 `web/src/routes/__root.tsx`：在 import 区追加

```tsx
import ScrollProgress from "@widgets/ScrollProgress";
```

在 `RootComponent` 的 `<AppProvider>` 内、`<AnnouncementBar />` 之前插入：

```tsx
<ScrollProgress />
```

- [ ] **Step 4: 视觉验证**

Run: `cd web && pnpm dev`
打开首页，缓慢滚动。
Expected: 顶部出现一条电光蓝细线，随滚动从左向右增长。系统设置「减少动态效果」时不显示。

- [ ] **Step 5: 验证 lint/tsc**

Run: `cd web && npx biome check . && npx tsc --noEmit`
Expected: 通过。

- [ ] **Step 6: Commit**

```bash
git add web/src/widgets/ScrollProgress web/src/routes/__root.tsx
git commit -m "feat(web): 新增全局 ScrollProgress 顶条

- motion useScroll + useSpring 驱动 scaleX
- 电光蓝 2px 顶条，z-50，全站统一
- reduced-motion 下不渲染"
```

---

## Task 5: 重写 Hero（不对称编辑式 + 电光蓝 Aurora）

**Files:**
- Modify: `web/src/widgets/Hero/Hero.tsx`
- Modify: `web/src/shared/vendor/react-bits/Aurora.tsx`

- [ ] **Step 1: 修改 Aurora 默认配色为电光蓝单色系**

修改 `web/src/shared/vendor/react-bits/Aurora.tsx` 第 119 行的默认 `colorStops`：

```tsx
const { colorStops = ['#3b82f6', '#1e40af', '#3b82f6'], amplitude = 1.0, blend = 0.5 } = props;
```

> 去掉 AI 紫 `#5227FF` 和绿 `#7cff67`，改为电光蓝三档（亮蓝/深蓝/亮蓝），低饱和氛围。

- [ ] **Step 2: 重写 Hero 组件**

整体替换 `web/src/widgets/Hero/Hero.tsx` 内容：

```tsx
"use client";

import { useSettings } from "@features/settings/api/queries";
import { Button } from "@shared/ui/button";
import { ClientOnly } from "@shared/lib/client-only";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useReducedMotion } from "motion/react";
import Aurora from "@shared/vendor/react-bits/Aurora";
import DecryptedText from "@shared/vendor/react-bits/DecryptedText";

/**
 * Hero - 首页头部英雄区（不对称编辑式）
 *
 * 左 7 列文字（Mono 站名标签 + 大标题 + tagline + 单一主 CTA），右 5 列留白。
 * 背景电光蓝 Aurora（WebGL，client-only 隔离）。
 * 站名用 DecryptedText（进入视口解密），tagline 静态。
 * reduced-motion 下 Aurora 不渲染动画、文字直接显示。
 */
const Hero = () => {
  const { data } = useSettings();
  const reduce = useReducedMotion();
  const siteName = data?.siteName ?? "Blog";
  const tagline = data?.tagline ?? "Hello World";

  return (
    <section className="relative overflow-hidden min-h-[88dvh] flex items-center">
      <div className="absolute inset-0 -z-10">
        <ClientOnly fallback={null}>
          <Aurora />
        </ClientOnly>
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-6">
            // {siteName.toLowerCase().replace(/\s+/g, "-")}
          </p>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1.05] mb-6 text-foreground">
            <DecryptedText
              text={siteName}
              animateOn="view"
              speed={40}
              className="text-foreground"
              encryptedClassName="text-accent"
            />
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed">
            {tagline}
          </p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Button size="lg" asChild className="rounded-full">
              <Link to="/blog">进入博客</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
```

- [ ] **Step 3: 删除 GradientText 引用（去 AI 渐变文字）**

确认 `web/src/widgets/Hero/Hero.tsx` 不再 import `GradientText`（已在上一步整体替换中移除）。`GradientText.tsx` 文件保留（其他地方未用，暂不删，避免误伤）。

- [ ] **Step 4: 视觉验证**

Run: `cd web && pnpm dev`
打开首页。
Expected:
- Hero 左对齐（非居中）
- 背景电光蓝极光（暗色下可见，无紫/绿）
- 站名进入视口时解密动画（乱码 → 正常）
- Mono `// blog` 副标签电光蓝
- 「进入博客」按钮 pill 形
- 系统减少动态效果时：无解密动画、文字直接显示、Aurora 仍渲染但不强制（rAF 由 Aurora 内部，可接受；若需更严谨在 Task 18 统一处理）

- [ ] **Step 5: 验证 lint/tsc**

Run: `cd web && npx biome check . && npx tsc --noEmit`
Expected: 通过。

- [ ] **Step 6: Commit**

```bash
git add web/src/widgets/Hero/Hero.tsx web/src/shared/vendor/react-bits/Aurora.tsx
git commit -m "feat(web): 重写 Hero 为不对称编辑式 + 电光蓝 Aurora

- 布局改为左 7 列文字（非居中），max-w-3xl
- Mono // 副标签 + DecryptedText 站名（去 GradientText AI 渐变）
- Aurora 默认色改为电光蓝单色系（去 #5227FF AI 紫）
- ClientOnly 隔离 Aurora，min-h-[88dvh] 视口稳定
- reduced-motion 下静态显示"
```

---

## Task 6: 重写 PostCard（首页杂志式卡）+ 新增 PostFeatured

**Files:**
- Modify: `web/src/features/posts/ui/PostCard.tsx`
- Create: `web/src/features/posts/ui/PostFeatured.tsx`

- [ ] **Step 1: 重写 PostCard 为杂志式卡**

整体替换 `web/src/features/posts/ui/PostCard.tsx`：

```tsx
"use client";

import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { motion, useReducedMotion } from "motion/react";
import type { Post } from "../model/types";

/**
 * PostCardProps - 文章卡片属性
 */
export interface PostCardProps {
  /** 文章数据 */
  post: Post;
  /** 错峰入场索引 */
  index?: number;
}

/**
 * PostCard - 首页文章卡（杂志式，兼容有无封面）
 *
 * 有封面：封面直角置顶 + 下方标题/meta。
 * 无封面：纯排版卡（Mono 日期 + 大标题 + excerpt），靠排版撑视觉权重。
 * hover：标题变 accent + 封面 scale。
 * whileInView 错峰入场（stagger），reduced-motion 静态。
 */
const PostCard = ({ post, index = 0 }: PostCardProps) => {
  const reduce = useReducedMotion();

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.5,
        delay: reduce ? 0 : Math.min(index * 0.06, 0.3),
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden transition-colors hover:border-accent/50"
    >
      {post.cover_image ? (
        <Link to="/blog/$slug" params={{ slug: post.slug }} className="block overflow-hidden">
          <img
            src={post.cover_image}
            alt={post.title}
            loading="lazy"
            className="w-full aspect-[16/9] object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
      ) : null}

      <div className="flex flex-1 flex-col p-6">
        <time className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
          {new Date(post.published_at).toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).replace(/\//g, ".")}
        </time>

        <h3 className="text-xl font-semibold leading-snug mb-2 transition-colors group-hover:text-accent">
          <Link to="/blog/$slug" params={{ slug: post.slug }}>
            {post.title}
          </Link>
        </h3>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {post.excerpt}
        </p>

        <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
          <span>{post.author.username}</span>
          <span aria-hidden="true">·</span>
          <span>
            {formatDistanceToNow(new Date(post.published_at), {
              addSuffix: true,
              locale: zhCN,
            })}
          </span>
        </div>
      </div>
    </motion.article>
  );
};

export default PostCard;
```

- [ ] **Step 2: 创建 PostFeatured（首页 featured 大卡）**

Create `web/src/features/posts/ui/PostFeatured.tsx`:

```tsx
"use client";

import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import type { Post } from "../model/types";

/**
 * PostFeaturedProps - featured 大卡属性
 */
export interface PostFeaturedProps {
  /** 文章数据 */
  post: Post;
}

/**
 * PostFeatured - 首页最新一篇的 featured 大卡
 *
 * 2 列布局：左封面大图（直角），右标题/excerpt/meta。
 * 无封面时左列改为电光蓝渐变占位 + Mono 标记，保持视觉权重。
 * whileInView 入场，reduced-motion 静态。
 */
const PostFeatured = ({ post }: PostFeaturedProps) => {
  const reduce = useReducedMotion();

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
    >
      <Link
        to="/blog/$slug"
        params={{ slug: post.slug }}
        className="block overflow-hidden rounded-xl aspect-[16/10]"
        aria-label={post.title}
      >
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent/20 via-card to-muted border border-border" />
        )}
      </Link>

      <div className="flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] px-2 py-1 rounded-full border border-accent/40 text-accent">
            最新
          </span>
          <time className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {new Date(post.published_at).toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }).replace(/\//g, ".")}
          </time>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight mb-4 transition-colors group-hover:text-accent">
          <Link to="/blog/$slug" params={{ slug: post.slug }}>
            {post.title}
          </Link>
        </h2>

        <p className="text-base text-muted-foreground leading-relaxed mb-6 line-clamp-3 max-w-[55ch]">
          {post.excerpt}
        </p>

        <div className="flex items-center gap-3 font-mono text-sm text-muted-foreground">
          <span>{post.author.username}</span>
          <span aria-hidden="true">·</span>
          <span>{post.view_count} 次阅读</span>
        </div>
      </div>
    </motion.article>
  );
};

export default PostFeatured;
```

- [ ] **Step 3: 视觉验证（暂通过首页改用，下一步 Task 7 接入）**

Run: `cd web && npx tsc --noEmit`
Expected: 类型通过（PostFeatured 未接入页面，仅编译验证）。

- [ ] **Step 4: 验证 lint/tsc**

Run: `cd web && npx biome check . && npx tsc --noEmit`
Expected: 通过。

- [ ] **Step 5: Commit**

```bash
git add web/src/features/posts/ui/PostCard.tsx web/src/features/posts/ui/PostFeatured.tsx
git commit -m "feat(web): 重写 PostCard 杂志式 + 新增 PostFeatured 大卡

- PostCard：封面直角 + Mono 日期 + whileInView 错峰入场，兼容无封面
- PostFeatured：首页 featured 2 列布局，无封面用电光蓝渐变占位
- 标题 hover 变 accent，reduced-motion 静态"
```

---

## Task 7: 重写首页 Section 2（最新文章：featured + 错落网格）

**Files:**
- Modify: `web/src/features/posts/ui/PostList.tsx`（保留容器，更新渲染逻辑）

- [ ] **Step 1: 重写 PostList 支持 featured + 网格**

整体替换 `web/src/features/posts/ui/PostList.tsx`：

```tsx
import { Skeleton } from "@shared/ui/skeleton";

import { usePosts } from "../api/queries";
import type { PostListQuery } from "../model/types";
import PostCard from "./PostCard";
import PostFeatured from "./PostFeatured";

/**
 * PostListProps - 首页文章列表属性
 */
export interface PostListProps {
  /** 分页与标签筛选 */
  query?: PostListQuery;
  /** 是否显示加载骨架 */
  showSkeleton?: boolean;
}

/**
 * PostList - 首页文章列表（featured + 错落网格）
 *
 * 第一篇 featured（PostFeatured），其余 PostCard 错落网格。
 * 加载中渲染骨架，错误/空态有降级。
 */
const PostList = ({ query = {}, showSkeleton = true }: PostListProps) => {
  const { data, isLoading, isError, error } = usePosts(query);

  if (isLoading && showSkeleton) {
    return (
      <div className="space-y-12">
        <Skeleton className="h-80 rounded-xl" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: (query.limit ?? 6) - 1 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: 静态骨架，顺序固定
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-center text-muted-foreground py-12">
        加载失败：{error instanceof Error ? error.message : "未知错误"}
      </p>
    );
  }

  if (!data?.data?.length) {
    return <p className="text-center text-muted-foreground py-12">暂无文章</p>;
  }

  const [featured, ...rest] = data.data;

  return (
    <div className="space-y-16">
      {featured ? <PostFeatured post={featured} /> : null}

      {rest.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default PostList;
```

- [ ] **Step 2: 更新首页 Section 2 标题区**

修改 `web/src/routes/index.tsx` 的 `HomePage`，把 `<section className="container mx-auto px-4 py-16">` 块中的「最新文章」section 替换为：

```tsx
<section className="container mx-auto px-4 py-24">
  <div className="mb-12 flex items-end justify-between">
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-3">
        // latest
      </p>
      <h2 className="text-3xl md:text-4xl font-bold tracking-tight">最新文章</h2>
    </div>
  </div>
  <PostList query={{ page: 1, limit: 7 }} />
</section>
```

> limit 改为 7（1 featured + 6 卡）。

- [ ] **Step 3: 视觉验证**

Run: `cd web && pnpm dev`
打开首页滚动到文章区。
Expected:
- 第一篇 featured 大卡（2 列布局，无封面时电光蓝渐变占位）
- 其余 6 篇 3 列网格，错峰 scroll-reveal 入场
- Mono `// latest` 副标签 + 「最新文章」标题
- hover 标题变 accent

- [ ] **Step 4: 验证 lint/tsc**

Run: `cd web && npx biome check . && npx tsc --noEmit`
Expected: 通过。

- [ ] **Step 5: Commit**

```bash
git add web/src/features/posts/ui/PostList.tsx web/src/routes/index.tsx
git commit -m "feat(web): 首页最新文章区改为 featured + 错落网格

- PostList 支持 featured（首篇）+ 网格（其余）
- 首页 section 标题加 Mono // latest 副标签，limit 提至 7
- 骨架适配新布局"
```

---

## Task 8: 新增 ScrollVelocity + 重写首页 GitHub 区（横向漂移）

**Files:**
- Create: `web/src/shared/vendor/react-bits/ScrollVelocity.tsx`
- Modify: `web/src/features/github/ui/Contributions.tsx`
- Modify: `web/src/routes/index.tsx`

> react-bits 的 ScrollVelocity 组件源码较长，从官方仓库获取。以下为实现（client-only + reduced-motion 内建）。已内联 wrap 逻辑，避免依赖 motion 的 `wrap` 导出是否存在。

- [ ] **Step 1: 创建 ScrollVelocity 组件**

Create `web/src/shared/vendor/react-bits/ScrollVelocity.tsx`:

```tsx
"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";

interface ScrollVelocityProps {
  children: React.ReactNode;
  baseVelocity?: number;
  className?: string;
}

/**
 * ScrollVelocity - 随滚动横向漂移的文字
 *
 * react-bits 移植。滚动速度驱动文字横向位移，wrap 实现无缝循环。
 * reduced-motion 下静态渲染（无位移）。
 */
export default function ScrollVelocity({
  children,
  baseVelocity = 2,
  className = "",
}: ScrollVelocityProps) {
  const reduce = useReducedMotion();
  const baseX = useRef(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });

  const x = useTransform(() => {
    if (reduce) return "0%";
    const moveBy = baseVelocity * (1 + velocityFactor.get());
    baseX.current += moveBy;
    // 内联 wrap(-50, 50, value)，避免依赖 motion 的 wrap 导出是否存在
    const wrapped = (((baseX.current + 50) % 100) + 100) % 100 - 50;
    return `${wrapped}%`;
  });

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={`flex flex-nowrap whitespace-nowrap ${className}`} style={{ x }}>
      {children}
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: 重写 Contributions 区（Mono 大字统计 + 横向漂移）**

整体替换 `web/src/features/github/ui/Contributions.tsx`:

```tsx
"use client";

import { ClientOnly } from "@shared/lib/client-only";
import ScrollVelocity from "@shared/vendor/react-bits/ScrollVelocity";
import { useContributions } from "../api/queries";

/** 贡献强度对应色阶（电光蓝由淡到浓） */
const LEVEL_COLORS = [
  "bg-muted",
  "bg-accent/30",
  "bg-accent/50",
  "bg-accent/70",
  "bg-accent",
];

/**
 * Contributions - GitHub 贡献区（Mono 大字统计 + 横向漂移标题 + 热力图）
 *
 * 上方：ScrollVelocity 横向漂移的 Mono 大字（"Building in public"）。
 * 下方左：Mono 大字统计（总贡献数），右：热力图。
 * ScrollVelocity 通过 ClientOnly 隔离（依赖 useScroll）。
 */
const Contributions = () => {
  const { data, isLoading, isError } = useContributions();

  return (
    <div className="space-y-8">
      <ClientOnly fallback={<div className="font-mono text-4xl md:text-6xl font-bold text-muted/30">Building in public</div>}>
        <ScrollVelocity baseVelocity={2} className="font-mono text-4xl md:text-6xl font-bold text-muted/30">
          Building in public ·
        </ScrollVelocity>
      </ClientOnly>

      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 items-center">
        <div>
          {isLoading ? (
            <div className="h-20 w-32 rounded-xl bg-muted animate-pulse" />
          ) : isError || !data ? (
            <p className="text-sm text-muted-foreground">贡献图加载失败</p>
          ) : (
            <>
              <p className="font-mono text-5xl md:text-6xl font-bold text-foreground tabular-nums">
                {data.total}
              </p>
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mt-2">
                contributions · past year
              </p>
            </>
          )}
        </div>

        {!isLoading && !isError && data ? (
          <div className="overflow-x-auto">
            <div className="grid grid-flow-col grid-rows-7 gap-1 min-w-max">
              {data.contributions.map((c) => (
                <div
                  key={c.date}
                  title={`${c.date}: ${c.count} 次`}
                  className={`w-2.5 h-2.5 rounded-sm ${LEVEL_COLORS[c.level]}`}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Contributions;
```

- [ ] **Step 3: 更新首页 GitHub 区标题**

修改 `web/src/routes/index.tsx` 的 `HomePage` 中「GitHub 活动」section：

```tsx
<section className="container mx-auto px-4 py-24">
  <div className="mb-12">
    <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-3">
      // open-source
    </p>
    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">GitHub 活动</h2>
  </div>
  <Contributions />
</section>
```

- [ ] **Step 4: 视觉验证**

Run: `cd web && pnpm dev`
打开首页滚动到 GitHub 区。
Expected:
- "Building in public ·" Mono 大字随滚动横向漂移
- 左侧大数字总贡献数（tabular-nums）
- 右侧热力图（电光蓝色阶，非 primary）
- reduced-motion 下大字静态

- [ ] **Step 5: 验证 lint/tsc**

Run: `cd web && npx biome check . && npx tsc --noEmit`
Expected: 通过。

- [ ] **Step 6: Commit**

```bash
git add web/src/shared/vendor/react-bits/ScrollVelocity.tsx web/src/features/github/ui/Contributions.tsx web/src/routes/index.tsx
git commit -m "feat(web): GitHub 区改为 Mono 大字统计 + ScrollVelocity 横向漂移

- 新增 react-bits ScrollVelocity（client-only + reduced-motion）
- Contributions：横向漂移标题 + 大数字统计 + 热力图（电光蓝色阶）
- 首页 GitHub section 加 // open-source Mono 副标签"
```

---

## Task 9: Footer 换皮（Mono + 电光蓝 hover）

**Files:**
- Modify: `web/src/widgets/Footer/Footer.tsx`

- [ ] **Step 1: 重写 Footer**

整体替换 `web/src/widgets/Footer/Footer.tsx`:

```tsx
import { useSettings } from "@features/settings/api/queries";

/**
 * Footer - 页脚（结构不变，换皮）
 *
 * Mono 字体 + 电光蓝 hover + 细分割线。
 */
const Footer = () => {
  const { data } = useSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border mt-24">
      <div className="container mx-auto px-4 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-mono text-sm text-muted-foreground">
          © {year} {data?.siteName ?? "Blog"}
        </p>
        {data?.socials ? (
          <div className="flex gap-6 font-mono text-sm">
            {data.socials.github ? (
              <a
                href={data.socials.github}
                className="text-muted-foreground transition-colors hover:text-accent"
              >
                GitHub
              </a>
            ) : null}
            {data.socials.twitter ? (
              <a
                href={data.socials.twitter}
                className="text-muted-foreground transition-colors hover:text-accent"
              >
                Twitter
              </a>
            ) : null}
            {data.socials.email ? (
              <a
                href={`mailto:${data.socials.email}`}
                className="text-muted-foreground transition-colors hover:text-accent"
              >
                Email
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </footer>
  );
};

export default Footer;
```

- [ ] **Step 2: 视觉验证**

Run: `cd web && pnpm dev`
打开首页滚到底部。
Expected: Mono 字体，社交链接 hover 变电光蓝，细分割线。

- [ ] **Step 3: 验证 lint/tsc**

Run: `cd web && npx biome check . && npx tsc --noEmit`
Expected: 通过。

- [ ] **Step 4: Commit**

```bash
git add web/src/widgets/Footer/Footer.tsx
git commit -m "feat(web): Footer 换皮（Mono + 电光蓝 hover）"
```

---

## Task 10: 文章详情数据层（PostDetail 类型 + fetchPost）

**Files:**
- Modify: `web/src/features/posts/model/types.ts`
- Modify: `web/src/features/posts/api/queries.ts`

- [ ] **Step 1: 新增 PostDetail 类型**

在 `web/src/features/posts/model/types.ts` 末尾追加：

```ts
/**
 * PostDetail - 文章详情（详情页用）
 *
 * 对接后端 GET /api/v1/posts/{slug} 返回的完整 PostDTO。
 * 比列表摘要多 content_md / content_html / view_count 等。
 */
export interface PostDetail {
  /** 文章 ID */
  id: string;
  /** 标题 */
  title: string;
  /** slug */
  slug: string;
  /** Markdown 原文（前端渲染） */
  content_md: string;
  /** 后端预渲染 HTML（备用，本期不用） */
  content_html: string;
  /** 摘要 */
  excerpt: string;
  /** 封面图 URL */
  cover_image: string;
  /** 浏览量 */
  view_count: number;
  /** 是否精选 */
  is_featured: boolean;
  /** 发布时间（RFC3339） */
  published_at: string;
  /** 标签 */
  tags: string[];
  /** 作者 */
  author: {
    username: string;
    avatar_url: string;
  };
}
```

- [ ] **Step 2: 写 fetchPost 测试**

Create `web/src/features/posts/api/queries.test.ts`:

```ts
import { describe, expect, it, vi, beforeEach } from "vitest";

const getMock = vi.fn();
vi.mock("@shared/api/http", () => ({
  httpClient: { get: getMock },
}));

import { fetchPost } from "./queries";

describe("fetchPost", () => {
  beforeEach(() => getMock.mockReset());

  it("按 slug 拉取详情，返回 data 字段", async () => {
    getMock.mockResolvedValue({
      data: { id: "1", title: "t", slug: "s", content_md: "# hi" },
    });
    const res = await fetchPost("s");
    expect(getMock).toHaveBeenCalledWith("/posts/s");
    expect(res.title).toBe("t");
    expect(res.content_md).toBe("# hi");
  });
});
```

- [ ] **Step 3: 运行测试确认失败**

Run: `cd web && npx vitest run src/features/posts/api/queries.test.ts`
Expected: FAIL（`fetchPost` 未导出）。

- [ ] **Step 4: 实现 fetchPost + usePost**

在 `web/src/features/posts/api/queries.ts` 末尾追加：

```ts
import type { PostDetail } from "../model/types";

/**
 * fetchPost - 调后端 GET /api/v1/posts/{slug} 拉取文章详情
 *
 * 详情接口返回单个 PostDTO（非分页 envelope，但 httpClient 仍拆为 { data }）。
 *
 * @param slug 文章 slug
 * @returns 解包后的文章详情
 */
export const fetchPost = async (slug: string): Promise<PostDetail> => {
  const res = await httpClient.get<PostDetail>(`/posts/${slug}`);
  return res.data;
};

/**
 * usePost - 文章详情 hook
 *
 * 自动缓存（key 含 slug），网络错误重试 2 次。
 *
 * @param slug 文章 slug
 */
export const usePost = (slug: string) =>
  useQuery({
    queryKey: postKeys.detail(slug),
    queryFn: () => fetchPost(slug),
  });
```

- [ ] **Step 5: 运行测试确认通过**

Run: `cd web && npx vitest run src/features/posts/api/queries.test.ts`
Expected: PASS。

- [ ] **Step 6: 验证 lint/tsc**

Run: `cd web && npx biome check . && npx tsc --noEmit`
Expected: 通过。

- [ ] **Step 7: Commit**

```bash
git add web/src/features/posts/model/types.ts web/src/features/posts/api/queries.ts web/src/features/posts/api/queries.test.ts
git commit -m "feat(web): 文章详情数据层（PostDetail 类型 + fetchPost/usePost）

- PostDetail 对接后端 GET /posts/{slug} 完整 PostDTO
- fetchPost 按 slug 拉取，httpClient 解 envelope
- usePost hook + postKeys.detail 复用
- 单测覆盖 fetchPost"
```

---

## Task 11: MarkdownContent（react-markdown + 代码高亮）

**Files:**
- Create: `web/src/features/posts/ui/MarkdownContent.tsx`
- Modify: `web/src/styles.css`

- [ ] **Step 1: 在 styles.css 引入 highlight.js 暗色主题 + 自定义 prose 覆盖**

在 `web/src/styles.css` 末尾追加：

```css
@import "highlight.js/styles/github-dark.css";

/* 详情页正文 prose 定制（配合 @tailwindcss/typography） */
.prose-editorial {
  --tw-prose-body: hsl(var(--muted-foreground));
  --tw-prose-headings: hsl(var(--foreground));
  --tw-prose-links: hsl(var(--accent));
  --tw-prose-bold: hsl(var(--foreground));
  --tw-prose-code: hsl(var(--foreground));
  --tw-prose-quotes: hsl(var(--foreground));
  --tw-prose-quote-borders: hsl(var(--accent));
  font-size: 1.0625rem;
  line-height: 1.75;
  max-width: 65ch;
}

.prose-editorial :where(h1, h2, h3, h4) {
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-top: 2em;
  margin-bottom: 0.6em;
}

.prose-editorial :where(a) {
  text-decoration: none;
  border-bottom: 1px solid hsl(var(--accent) / 0.4);
  transition: border-color 0.2s;
}

.prose-editorial :where(a):hover {
  border-bottom-color: hsl(var(--accent));
}

.prose-editorial :where(code):not(pre code) {
  font-family: var(--font-mono);
  background-color: hsl(var(--accent) / 0.12);
  padding: 0.15em 0.4em;
  border-radius: 0.25rem;
  font-size: 0.875em;
  border: 0;
  font-weight: 500;
}

.prose-editorial :where(pre) {
  background-color: hsl(222 40% 7%);
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-card);
  padding: 0;
  overflow-x: auto;
}

.prose-editorial :where(pre) :where(code) {
  display: block;
  padding: 1.25rem 1.5rem;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.7;
  background: transparent;
}

.prose-editorial :where(blockquote) {
  font-style: normal;
  border-left-width: 2px;
  padding-left: 1.25rem;
  color: hsl(var(--muted-foreground));
}

.prose-editorial :where(img) {
  border-radius: var(--radius-image);
}

.prose-editorial :where(table) {
  font-size: 0.9375rem;
}

.prose-editorial :where(th, td) {
  border-color: hsl(var(--border));
}
```

- [ ] **Step 2: 创建 MarkdownContent 组件**

Create `web/src/features/posts/ui/MarkdownContent.tsx`:

```tsx
import "highlight.js/styles/github-dark.css";

import RemarkGfm from "remark-gfm";
import RehypeHighlight from "rehype-highlight";
import ReactMarkdown from "react-markdown";

/**
 * MarkdownContentProps - 正文渲染属性
 */
export interface MarkdownContentProps {
  /** Markdown 原文 */
  content: string;
}

/**
 * MarkdownContent - 文章正文 Markdown 渲染
 *
 * react-markdown + remark-gfm（表格/任务列表/删除线）+ rehype-highlight（代码高亮）。
 * 样式由 styles.css 的 .prose-editorial 覆盖。
 * SSR 安全（无客户端 API）。
 */
const MarkdownContent = ({ content }: MarkdownContentProps) => {
  return (
    <div className="prose-editorial">
      <ReactMarkdown remarkPlugins={[RemarkGfm]} rehypePlugins={[RehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownContent;
```

- [ ] **Step 3: 视觉验证（临时挂载验证）**

Run: `cd web && pnpm dev`
临时在首页底部加 `<MarkdownContent content="# 标题\n\n正文 **粗** \`code\`\n\n```ts\nconst x = 1;\n```" />`，刷新。
Expected: 标题/粗体/inline code（电光蓝 tint）/代码块（暗底 + 高亮）正常渲染。
验证后移除临时挂载。

- [ ] **Step 4: 验证 lint/tsc**

Run: `cd web && npx biome check . && npx tsc --noEmit`
Expected: 通过。

- [ ] **Step 5: Commit**

```bash
git add web/src/features/posts/ui/MarkdownContent.tsx web/src/styles.css
git commit -m "feat(web): MarkdownContent 正文渲染 + prose-editorial 样式

- react-markdown + remark-gfm + rehype-highlight
- .prose-editorial 定制：电光蓝链接/inline code tint/终端感代码块/引用左边框
- max-w-65ch 阅读栏宽，SSR 安全"
```

---

## Task 12: 文章详情页布局 + 目录（TableOfContents）

**Files:**
- Create: `web/src/features/posts/ui/TableOfContents.tsx`
- Modify: `web/src/routes/blog/$slug.tsx`

- [ ] **Step 1: 创建 TableOfContents 组件**

Create `web/src/features/posts/ui/TableOfContents.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";

/**
 * TocItem - 目录条目
 */
interface TocItem {
  /** 锚点 id */
  id: string;
  /** 文本 */
  text: string;
  /** 层级（2 或 3） */
  level: number;
}

/**
 * TableOfContentsProps - 目录属性
 */
export interface TableOfContentsProps {
  /** 目录容器（正文）的选择器，默认 main */
  containerSelector?: string;
}

/**
 * TableOfContents - 文章详情页侧栏目录（桌面 sticky）
 *
 * 从正文 H2/H3 提取目录，IntersectionObserver 跟踪当前章节高亮。
 * 移动端隐藏（由调用方 xl:block 控制）。
 * SSR 安全：mounted 后才扫描 DOM。
 */
const TableOfContents = ({ containerSelector = "article" }: TableOfContentsProps) => {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    const headings = Array.from(container.querySelectorAll("h2, h3"));
    const tocItems: TocItem[] = headings.map((h, i) => {
      const text = h.textContent ?? "";
      const id = h.id || `heading-${i}`;
      h.id = id;
      return { id, text, level: h.tagName === "H2" ? 2 : 3 };
    });
    setItems(tocItems);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px" },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [containerSelector]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="目录" className="space-y-1">
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
        目录
      </p>
      <ul className="space-y-1 border-l border-border">
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? "ml-4" : ""}>
            <a
              href={`#${item.id}`}
              className={`block py-1.5 pr-2 text-sm transition-colors -ml-px border-l ${
                activeId === item.id
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TableOfContents;
```

- [ ] **Step 2: 重写文章详情页**

整体替换 `web/src/routes/blog/$slug.tsx`:

```tsx
import MarkdownContent from "@features/posts/ui/MarkdownContent";
import TableOfContents from "@features/posts/ui/TableOfContents";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";

/**
 * BlogDetailPage - 文章详情页
 *
 * loader SSR 预取文章详情，dehydrate。
 * 布局：左 sticky 目录（桌面 xl+）+ 中央窄列正文。
 * 动效最克制：仅目录高亮 + 全局 ScrollProgress。
 */
function BlogDetailPage() {
  const { post } = Route.useLoaderData();

  return (
    <article className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 xl:grid-cols-[220px_minmax(0,680px)] gap-12 xl:justify-center">
        {/* 桌面 sticky 目录 */}
        <aside className="hidden xl:block">
          <div className="sticky top-24">
            <TableOfContents containerSelector="article" />
          </div>
        </aside>

        {/* 正文窄列 */}
        <div className="mx-auto xl:mx-0 w-full max-w-[680px]">
          <Link
            to="/blog"
            className="font-mono text-sm text-muted-foreground hover:text-accent transition-colors inline-flex items-center gap-1 mb-8"
          >
            <span aria-hidden="true">←</span> Back
          </Link>

          {/* Meta */}
          <div className="mb-6 space-y-3">
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              <time>{format(new Date(post.published_at), "yyyy.MM.dd")}</time>
              <span aria-hidden="true">·</span>
              <span>{post.view_count} 次阅读</span>
            </div>
            {post.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
            {post.title}
          </h1>

          <div className="flex items-center gap-3 mb-10">
            {post.author.avatar_url ? (
              <img
                src={post.author.avatar_url}
                alt={post.author.username}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : null}
            <span className="font-mono text-sm text-muted-foreground">
              {post.author.username}
            </span>
          </div>

          {post.cover_image ? (
            <img
              src={post.cover_image}
              alt={post.title}
              style={{ borderRadius: "0px" }}
              className="w-full mb-10 object-cover max-h-[480px]"
            />
          ) : null}

          <MarkdownContent content={post.content_md} />

          {/* 尾部标签 */}
          {post.tags.length > 0 ? (
            <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params, context }) => {
    const post = await context.queryClient.ensureQueryData({
      queryKey: ["posts", "detail", params.slug],
      queryFn: () => fetchPost(params.slug),
    });
    return { post };
  },
  component: BlogDetailPage,
});
```

> 注：`fetchPost` 需在文件顶部 import：`import { fetchPost } from "@features/posts/api/queries";`。封面图用内联 `style={{ borderRadius: "0px" }}`（直角，强化杂志感），不依赖 Tailwind 自动生成 `rounded-image`。

- [ ] **Step 3: 补 import**

在 `web/src/routes/blog/$slug.tsx` 顶部 import 区追加：

```tsx
import { fetchPost } from "@features/posts/api/queries";
```

（封面图已在 Step 2 用内联 `style={{ borderRadius: "0px" }}` 直角处理，无需额外修正。）

- [ ] **Step 4: 验证 lint/tsc**

Run: `cd web && npx biome check . && npx tsc --noEmit`
Expected: 通过。

- [ ] **Step 5: Commit**

```bash
git add web/src/features/posts/ui/TableOfContents.tsx "web/src/routes/blog/\$slug.tsx"
git commit -m "feat(web): 文章详情页实装（窄列正文 + sticky 目录）

- TableOfContents：IntersectionObserver 提取 H2/H3 并高亮当前章节
- 详情页：左 sticky 目录（xl+）+ 右 680px 窄列正文
- loader SSR 预取 fetchPost，dehydrate
- meta 用 Mono 日期/阅读量/标签，封面直角
- 动效最克制（仅目录高亮 + 全局进度条）"
```

---

## Task 13: 博客列表页实装（纵向流式 + 分页）

**Files:**
- Create: `web/src/features/posts/ui/PostListItem.tsx`
- Create: `web/src/features/posts/ui/PostListView.tsx`
- Modify: `web/src/routes/blog/index.tsx`

- [ ] **Step 1: 创建 PostListItem（列表页流式条目）**

Create `web/src/features/posts/ui/PostListItem.tsx`:

```tsx
"use client";

import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import type { Post } from "../model/types";

/**
 * PostListItemProps - 列表页条目属性
 */
export interface PostListItemProps {
  post: Post;
  index?: number;
}

/**
 * PostListItem - 博客列表页单条（流式，兼容有无封面）
 *
 * 左 Mono metadata（日期/阅读时长占位/标签）+ 中标题/excerpt + 右封面缩略（有则）。
 * hover 标题变 accent + 整行微位移。whileInView 错峰入场。
 */
const PostListItem = ({ post, index = 0 }: PostListItemProps) => {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.5,
        delay: reduce ? 0 : Math.min(index * 0.05, 0.25),
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group grid grid-cols-1 md:grid-cols-[140px_1fr_auto] gap-6 py-8 transition-transform hover:-translate-x-1"
    >
      {/* Mono metadata */}
      <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground space-y-1">
        <time>
          {new Date(post.published_at).toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).replace(/\//g, ".")}
        </time>
        {post.tags[0] ? <div className="text-accent">{post.tags[0]}</div> : null}
      </div>

      {/* 主区 */}
      <div>
        <h3 className="text-2xl font-semibold leading-snug mb-2 transition-colors group-hover:text-accent">
          <Link to="/blog/$slug" params={{ slug: post.slug }}>
            {post.title}
          </Link>
        </h3>
        <p className="text-muted-foreground line-clamp-2 max-w-[60ch]">
          {post.excerpt}
        </p>
      </div>

      {/* 封面缩略（有则） */}
      {post.cover_image ? (
        <Link
          to="/blog/$slug"
          params={{ slug: post.slug }}
          className="hidden md:block overflow-hidden"
          aria-label={post.title}
        >
          <img
            src={post.cover_image}
            alt={post.title}
            loading="lazy"
            className="w-32 h-20 object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
      ) : null}
    </motion.div>
  );
};

export default PostListItem;
```

- [ ] **Step 2: 创建 PostListView（列表容器 + 分页）**

Create `web/src/features/posts/ui/PostListView.tsx`:

```tsx
"use client";

import { Link } from "@tanstack/react-router";
import { usePosts } from "../api/queries";
import type { PostListQuery } from "../model/types";
import PostListItem from "./PostListItem";

/**
 * PostListViewProps - 列表视图属性
 */
export interface PostListViewProps {
  query: PostListQuery;
}

/**
 * PostListView - 博客列表页视图（流式 + 传统分页）
 *
 * 纵向 divide-y 流式列表，每页 10 篇。
 * 分页：上一页/下一页 + Mono 页码，URL search param 驱动。
 */
const PostListView = ({ query }: PostListViewProps) => {
  const page = query.page ?? 1;
  const { data, isLoading, isError, error } = usePosts({ ...query, limit: 10 });

  if (isLoading) {
    return (
      <div className="divide-y divide-border">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="py-8 animate-pulse">
            <div className="h-6 w-24 rounded bg-muted mb-3" />
            <div className="h-7 w-3/4 rounded bg-muted mb-2" />
            <div className="h-4 w-1/2 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-center text-muted-foreground py-12">
        加载失败：{error instanceof Error ? error.message : "未知错误"}
      </p>
    );
  }

  if (!data?.data?.length) {
    return <p className="text-center text-muted-foreground py-12">暂无文章</p>;
  }

  const totalPages = data.pagination.total_pages ?? 1;

  return (
    <div>
      <div className="divide-y divide-border">
        {data.data.map((post, i) => (
          <PostListItem key={post.id} post={post} index={i} />
        ))}
      </div>

      {/* 分页 */}
      {totalPages > 1 ? (
        <nav className="mt-16 flex items-center justify-center gap-6 font-mono text-sm">
          {page > 1 ? (
            <Link
              to="/blog"
              search={{ page: page - 1 }}
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              ← 上一页
            </Link>
          ) : (
            <span className="text-muted-foreground/40">← 上一页</span>
          )}

          <span className="text-muted-foreground tabular-nums">
            {page} / {totalPages}
          </span>

          {page < totalPages ? (
            <Link
              to="/blog"
              search={{ page: page + 1 }}
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              下一页 →
            </Link>
          ) : (
            <span className="text-muted-foreground/40">下一页 →</span>
          )}
        </nav>
      ) : null}
    </div>
  );
};

export default PostListView;
```

- [ ] **Step 3: 重写博客列表路由**

整体替换 `web/src/routes/blog/index.tsx`（删除原 ComingSoon import，新 import 区如下）:

```tsx
import PostListView from "@features/posts/ui/PostListView";
import { fetchPosts } from "@features/posts/api/queries";
import { createFileRoute } from "@tanstack/react-router";

/**
 * /blog - 博客列表页
 *
 * URL search param `page` 驱动分页，默认 1。
 * loader SSR 预取当前页数据。
 */
function BlogPage() {
  const { page } = Route.useSearch();
  return (
    <div className="container mx-auto px-4 py-16">
      <header className="mb-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-3">
          // archive
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">文章</h1>
        <div className="mt-6 h-px bg-accent/40" />
      </header>

      <PostListView query={{ page }} />
    </div>
  );
}

export const Route = createFileRoute("/blog/")({
  validateSearch: (search: Record<string, unknown>) => ({
    page: typeof search.page === "number" ? search.page : 1,
  }),
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: async ({ context, deps }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["posts", "list", { page: deps.page, limit: 10 }],
      queryFn: () => fetchPosts({ page: deps.page, limit: 10 }),
    });
  },
  component: BlogPage,
});
```

> 注：queryKey 与 `postKeys.list` 不完全一致（list 含 `[...all, "list", query]`）。这里手写 `["posts", "list", {...}]` 是为了让 loader 预取与 `usePosts` 的缓存命中一致——`usePosts` 内部用 `postKeys.list(query)` = `["posts","list",query]`，而 `query` 是 `{page, limit}` 对象。`deps.page` + `limit:10` 组成的对象，与 `PostListView` 里 `usePosts({ page, limit: 10 })` 的 key 一致，故命中。✓

- [ ] **Step 4: 视觉验证**

Run: `cd web && pnpm dev`
打开 http://localhost:3000/blog
Expected:
- `// archive` Mono 副标签 + 「文章」大标题 + 电光蓝细线
- 文章纵向流式列表，divide-y 分隔
- 每条左 Mono 日期/标签，中标题/excerpt，右封面缩略（有则）
- hover 标题变 accent + 整行左移
- 超过 1 页时底部 Mono 分页
- 点下一页 URL 变 `/blog?page=2`

- [ ] **Step 5: 验证 lint/tsc**

Run: `cd web && npx biome check . && npx tsc --noEmit`
Expected: 通过。

- [ ] **Step 6: Commit**

```bash
git add web/src/features/posts/ui/PostListItem.tsx web/src/features/posts/ui/PostListView.tsx "web/src/routes/blog/index.tsx"
git commit -m "feat(web): 博客列表页实装（纵向流式 + 传统分页）

- PostListItem：3 列网格（Mono metadata/主区/缩略），hover 左移 + accent
- PostListView：divide-y 流式列表 + Mono 分页（URL search param 驱动）
- /blog 路由：validateSearch page，loader SSR 预取
- // archive Mono 副标签 + 电光蓝细线 header"
```

---

## Task 14: AnnouncementBar 适配新 tokens（可选微调）

**Files:**
- Modify: `web/src/widgets/AnnouncementBar/AnnouncementBar.tsx`（仅当视觉不协调时）

- [ ] **Step 1: 检查 AnnouncementBar 视觉**

Run: `cd web && pnpm dev`
观察首页顶部公告条（若后端有公告数据）。
- 若已用电光蓝/muted token 且协调 → 跳过本任务，直接 Step 3。
- 若有硬编码旧色 → 进 Step 2。

- [ ] **Step 2: 仅在需要时调整（条件性）**

读取 `web/src/widgets/AnnouncementBar/AnnouncementBar.tsx`，把任何硬编码颜色（如 `bg-blue-500`）替换为 token（`bg-accent`）。具体改动视当前内容而定，原则：用 `--accent`/`--muted`/`--border`，不引入新色。

- [ ] **Step 3: 验证 lint/tsc**

Run: `cd web && npx biome check . && npx tsc --noEmit`
Expected: 通过。

- [ ] **Step 4: Commit（仅当有改动）**

```bash
git add web/src/widgets/AnnouncementBar/AnnouncementBar.tsx
git commit -m "style(web): AnnouncementBar 适配新 tokens"
```

---

## Task 15: 全站验收（双主题 + reduced-motion + SSR）

**Files:** 无（纯验证任务）

- [ ] **Step 1: 亮/暗双模式肉眼检查**

Run: `cd web && pnpm dev`
逐页检查（每页都看暗色 + 亮色）：
- 首页 `/`：Hero（不对称 + Aurora 电光蓝 + 解密）/ 文章区（featured + 网格）/ GitHub 区（横向漂移 + 大数字）
- 列表 `/blog`：流式列表 + 分页
- 详情 `/blog/<某篇>`：目录高亮 + 正文代码高亮 + 封面

确认：无纯黑/纯白、accent 全用电光蓝、无残留 AI 紫、Mono/Sans 区分清晰、文字对比度足够。

- [ ] **Step 2: reduced-motion 检查**

系统设置开启「减少动态效果」（macOS: 系统设置 → 辅助功能 → 显示 → 减少动态效果）。
刷新各页，确认：
- ScrollProgress 顶条消失
- ScrollVelocity 大字静态
- DecryptedText 直接显示
- PostCard/ListItem 无入场动画
- 内容完整可读，不崩

- [ ] **Step 3: SSR hydration 检查**

Run: `cd web && pnpm dev`
打开 DevTools Console，刷新各页。
Expected: 无 hydration warning / error（特别关注 client-only 组件）。

- [ ] **Step 4: 构建检查**

Run: `cd web && pnpm build`
Expected: 构建成功，无类型错误。

- [ ] **Step 5: 全量 lint/tsc/单测**

Run: `cd web && npx biome check . && npx tsc --noEmit && npx vitest run`
Expected: 全部通过。

- [ ] **Step 6: Commit（若有验收中修复的小问题）**

若验收中发现并修复了小问题，按问题分别 commit。若全通过则跳过。

---

## Task 16: 更新文档与 PR

**Files:**
- Modify: `web/AGENTS.md`（若有 design tokens 相关章节需要同步）
- 无代码改动

- [ ] **Step 1: 同步文档（可选）**

若 `web/AGENTS.md` 中有「设计系统/配色」相关描述需更新为新 tokens，更新之。否则跳过。

- [ ] **Step 2: 推送分支 + 开 PR**

```bash
git push -u origin feat/blog-redesign-v2
gh pr create --base release/2.0 --title "feat(web): 博客前端重设计第一期（首页+博客系统）" --body "依据 spec docs/superpowers/specs/2026-06-23-blog-redesign.md 实现。方向 B：编辑式技术杂志 + 滚动驱动叙事。暗色石墨 + 单一电光蓝 + Geist + react-bits 重火力（client-only 隔离 + reduced-motion 降级）。"
```

> 推送/开 PR 前与用户确认（外向操作）。

---

## Spec 覆盖自检

| Spec 要求 | 对应 Task |
|---|---|
| §2 Design Tokens（配色/字体/圆角） | Task 1（字体）+ Task 2（配色/圆角） |
| §3.1 Hero 不对称 + Aurora 电光蓝 + DecryptedText | Task 5 |
| §3.2 最新文章 featured + 错落网格 | Task 6 + Task 7 |
| §3.3 GitHub 区 Mono 大字 + 横向漂移 | Task 8 |
| §3.4 Footer 换皮 | Task 9 |
| §3.5 全局 ScrollProgress | Task 4 |
| §4 博客列表页（流式 + 分页） | Task 13 |
| §5 文章详情页（窄列正文 + 目录） | Task 10（数据）+ Task 11（Markdown）+ Task 12（布局/目录） |
| §6.1 文件结构（FSD） | 贯穿各 Task |
| §6.2 client-only 隔离 | Task 3（基础设施）+ 各组件 `'use client'` + ClientOnly |
| §6.3 reduced-motion | Task 3（hook）+ 各组件 useReducedMotion |
| §6.4 新依赖 | Task 1 |
| §6.6 测试与验收 | Task 15 |

无遗漏。
