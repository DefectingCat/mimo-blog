# 博客前端重设计 Spec（第一期）

- **日期**：2026-06-23
- **范围**：第一期 = 首页 + 博客列表页 + 文章详情页
- **第二期**（后续单独 spec）：关于 / 项目 / 个人中心
- **方向**：编辑式技术杂志 + 滚动驱动叙事（方向 B）
- **基线**：技术向为主（冷静、精密、geeky）+ 创意点（实验性版式/动效）

---

## 1. 设计定位

| 维度 | 取值 |
|---|---|
| 页面类型 | 个人博客 + 作品集（技术向为主） |
| 受众 | 开发者、技术读者 |
| 氛围 | 冷静、精密、geeky，带创意点（实验版式/动效） |
| 主题 | 暗色为主，亮色可选（保留切换开关） |
| 配色 | 冷调石墨底 + 单一霓虹电光蓝 accent |
| 字体 | Geist Sans + Geist Mono |
| 动效强度 | 重火力实验（视觉优先），但守住两条工程底线 |
| 导航 | 保持现有结构，只换皮 |

**Design Read**：为开发者技术读者设计的个人博客，以编辑式杂志版式 + 滚动驱动叙事为语言，暗色冷调石墨 + 单一电光蓝为视觉系统，Geist 字族为字体，react-bits 提供重火力动效。Dark-first。

---

## 2. Design Tokens（全站视觉契约）

### 2.1 配色

| Token | 暗色值（主） | 亮色值 | 用途 |
|---|---|---|---|
| `--background` | `hsl(222 47% 6%)` 近黑石墨 | `hsl(0 0% 100%)` | 页面底 |
| `--foreground` | `hsl(210 40% 96%)` | `hsl(222 47% 8%)` | 正文 |
| `--card` | `hsl(222 40% 9%)` 略抬一档 | `hsl(0 0% 100%)` | 卡片/分块 |
| `--muted` | `hsl(217 28% 14%)` | `hsl(210 40% 96%)` | 次级面 |
| `--muted-foreground` | `hsl(215 20% 62%)` | `hsl(215 16% 47%)` | metadata/次要文字 |
| `--accent` | `hsl(217 91% 60%)` 电光蓝 `#3b82f6` 系 | 同 | 唯一 accent，全站锁定 |
| `--border` | `hsl(217 28% 18%)` | `hsl(214 32% 91%)` | 细分割线 |

### 2.2 配色纪律

- **一个 accent 锁全站**：链接 hover、CTA、active route、ScrollProgress 顶条、selection 全部用电光蓝。全站不出现第二个 accent。
- **无纯黑纯白**：暗色用石墨（`hsl(222 47% 6%)`）而非 `#000`；亮色底用近白而非 `#fff`（正文除外）。
- **删除 AI 紫**：当前 Aurora 的 `#5227FF` / `#7cff67` / `#5227FF` 三色全部改为电光蓝单色系（低透明度渐变）。
- **形状一致性**：全站锁一套圆角刻度。

### 2.3 字体

- **Sans**：`Geist`（正文、标题、UI）—— 通过 `@fontsource-variable/geist` 自托管，`font-display: swap`
- **Mono**：`Geist Mono`（日期、编号、标签、metadata、代码、统计数字）—— 通过 `@fontsource-variable/geist-mono` 自托管
- 替换当前 `styles.css` 里的 `--font-sans: "Inter"`

### 2.4 圆角刻度（全站锁定）

| 元素 | 圆角 |
|---|---|
| 卡片 / 容器 | `rounded-xl`（12px） |
| 按钮 / 输入 / pill | `rounded-full` |
| 图片 / 封面 | 直角 `rounded-none`（强化杂志感） |

### 2.5 动效三档位

| 档位 | 值 | 含义 |
|---|---|---|
| `DESIGN_VARIANCE` | 7 | 编辑式不对称，非混沌 |
| `MOTION_INTENSITY` | 8 | 滚动驱动高级编排（首页/列表页）；详情页降到 3 |
| `VISUAL_DENSITY` | 4 | 呼吸感（首页），列表页提至 5 |

---

## 3. 首页设计（/）

### 3.1 Section 1: Hero（不对称编辑式 + WebGL 背景）

- **布局**：左 7 列文字（站名大标题 + tagline + 1 主 CTA「进入博客」），右 5 列留白或极简几何 mark。**不居中**。单一主 CTA，不设次级 CTA（首页价值单一，避免重复意图）。
- **背景**：保留 `Aurora`（WebGL，ogl），但**改色**为电光蓝单色系（去掉紫 `#5227FF` / 绿 `#7cff67`）。低透明度，氛围而非主角。client-only 隔离。
- **动效**：
  - 站名：`DecryptedText`（解密动画）。**替换**当前的 `GradientText`（避免 AI 渐变文字 tell），站名用纯 `--foreground` + Mono 副标签。
  - tagline：`SplitText`（逐字入场）或 `ShinyText`（流光扫过，克制使用）。
  - CTA 按钮：`Magnetic`（磁吸 hover）。
- **纪律**：Hero 最多 4 元素（Mono 站名副标签 + 大标题 + tagline + CTA），首屏可见 CTA，不塞 logo wall / trust strip。

### 3.2 Section 2: 最新文章（杂志式不对称网格 + ScrollReveal）

- **布局**：打破当前千篇一律 `grid`。首篇 featured 大卡（占 2 列宽 + 封面大图；无封面则大号 Mono 标题文字驱动），后续 4-5 篇错落网格（不等高、混合有无封面）。
- **无封面 fallback**：纯排版卡（大标题 + Mono metadata + excerpt），与有封面文章形成节奏对比，不补占位图。
- **动效**：卡片 `ScrollReveal` 错峰入场（Motion `whileInView` + `staggerChildren`，非 GSAP 重型）。
- **背景**：此 section 不加 canvas，让阅读区干净。仅电光蓝细分割线 + Mono section label。

### 3.3 Section 3: GitHub 活动（Mono 大字统计 + 横向漂移 + canvas 背景）

- **布局**：贡献图保留但重新框定——左侧/上方 Mono 大字统计（如"今年 N commits"），贡献图放右侧或作为背景层。打破当前孤图。
- **动效**：`ScrollFloat` 或 `ScrollVelocity` 让一段 Mono 大字标题随滚动横向漂移（"Building in public" 类文案）。贡献图静态。这是本页**唯一**的滚动横向动效（跑马灯纪律：横向漂移每页一处）。
- **背景**：可选叠加轻量 `Particles`（canvas，client-only），低密度，呼应"代码粒子"心智。

### 3.4 Section 4: Footer（结构不变，换皮）

- 保持站名 + 社交链接结构，换电光蓝 hover、Geist Mono 字体、细分割线。

### 3.5 滚动驱动全局

- **ScrollProgress**：顶部固定 2px 电光蓝进度条（react-bits 组件或 Motion `useScroll` + `scaleX`）。全站统一，每页都有。
- **reduced-motion**：以上所有动效在 `prefers-reduced-motion: reduce` 下全部降级为静态/即时。

---

## 4. 博客列表页 /blog

### 4.1 定位
当前 `<ComingSoon>` 占位，本期实装。延续首页编辑式杂志语言，但核心是**浏览效率**。密度比首页略高（`VISUAL_DENSITY: 5`），动效比首页克制（列表页是检索场，不是叙事场）。

### 4.2 页头（编辑式 page header）
- 左对齐，不居中。大号 Geist 标题"文章"+ Mono 副标签（文章总数，如 `47 posts`），下方一条电光蓝细分割线。
- **筛选条**（一期跳过，YAGNI）：纯时间倒序列表，无标签筛选/排序。后续若需要再加 pill 式筛选 + active 电光蓝填充。

### 4.3 文章列表
- **布局**：纵向流式列表，`divide-y` 细线分隔，杂志"目录页"质感。不做网格。
- **单条卡片结构**（兼容有无封面）：
  - 左侧：Mono metadata 纵列（日期 `2026.06.23`、阅读时长、标签）
  - 中间/主区：大号 Geist 标题（`text-2xl`）+ excerpt（`text-muted-foreground`，2 行截断）
  - 右侧（有封面时）：小尺寸封面缩略图（固定比例，直角）；无封面则留白，让标题呼吸
- **hover**：标题变电光蓝 + 整行微位移（`-translate-x-1`）；封面图 `scale-105`。
- **无封面 fallback**：不补占位图，metadata + 标题撑版式。

### 4.4 动效（列表页克制版）
- 入场：首屏卡片 `ScrollReveal` 错峰。
- 滚动：保留全局 `ScrollProgress` 顶条。列表页**不上** pin stack / 横向漂移（满足"同家族全站一次"纪律）。
- 背景：不加 canvas。纯石墨底 + 细线。

### 4.5 分页
- 传统分页（上一页/下一页 + Mono 页码），不做无限滚动（与 SSR 预取冲突，分享 URL 困难）。每页 10 篇。

---

## 5. 文章详情页 /blog/$slug

### 5.1 定位
当前 `<ComingSoon>` 占位，本期实装。**阅读体验核心**，工作量最大（Markdown 渲染 + 代码高亮）。沉浸式阅读，动效最克制（`MOTION_INTENSITY` 实际 3），与首页/列表页形成节奏对比。

### 5.2 文章头部（article header）
- **布局**：居中单栏窄列（`max-w-[680px]`，阅读最佳栏宽），文字左对齐。
- **结构**：
  1. 返回链接（Mono，`← Back`，电光蓝 hover）
  2. Mono metadata 纵列：日期 `2026.06.23` · 阅读时长 · 标签（pill）
  3. 大号 Geist 标题（`text-4xl md:text-5xl tracking-tight`）
  4. 作者信息：头像 + 用户名 + Mono 副标签
- **封面**：
  - 无封面：头部以纯排版收尾，标题后直接进正文。
  - 有封面：封面图全宽直角，在标题**下方**作为文章开场，不抢标题视觉权重。**禁止**在图上叠加 pill/标签。

### 5.3 正文：Markdown 渲染
- **渲染器**：`react-markdown` + `remark-gfm`（表格/任务列表/删除线）。
- **代码高亮**：`rehype-highlight`（轻量、SSR 友好）。`shiki` 视觉更好但 bundle 重、构建复杂，**留二期**。
- **正文排版**：`@tailwindcss/typography` 的 `prose` + 暗色 `prose-invert` + 项目定制覆盖。
- **Typopgrahy 定制要点**：
  - 段落 `max-w-[65ch]`、`leading-relaxed`、`text-[17px]`
  - 标题用 Geist，`tracking-tight`，与 metadata 的 Mono 形成对比
  - 代码块：终端窗口感（圆角 `rounded-xl` + 顶部 Mono 语言标签 `ts`/`bash`）
  - inline code：Mono + 电光蓝底浅 tint
  - 引用：`border-l-2 border-accent` + 左 padding
  - 图片：直角、`shadow` 染背景色（非纯黑投影）

### 5.4 侧边：目录 + 阅读进度（桌面专属）
- **布局**：桌面（`xl`+）正文左侧固定 sticky 目录，列出 H2/H3，跟随滚动高亮当前章节（IntersectionObserver）。移动端隐藏，折叠到底部。
- **阅读进度**：复用全局 `ScrollProgress` 顶条，不额外加进度环。

### 5.5 文章尾部
- **标签**：再次列出（pill）。一期只做展示，不接筛选逻辑。
- **上下篇导航**：Mono 大字，左上一篇右下一篇，divide 分隔（杂志"继续阅读"质感）。
- **作者卡**：头像 + 简介 + 社交链接。

### 5.6 动效（详情页最克制）
- 标题：静态（阅读页不要解密抖动）。
- 正文段落：**不加** scroll-reveal（逐段浮现打断沉浸）。
- 唯一动效：目录高亮 + 全局进度条 + 链接/按钮 hover。`MOTION_INTENSITY` 实际降到 3。

---

## 6. 技术架构与工程约束

### 6.1 文件结构（沿用现有 FSD 架构）

```
web/src/
├─ widgets/
│  ├─ Hero/              # 重写（去 GradientText，改 DecryptedText）
│  ├─ ScrollProgress/    # 新增（全局顶条）
│  └─ ...
├─ features/posts/ui/
│  ├─ PostList.tsx       # 现有容器，保留（首页用，内部渲染逻辑更新）
│  ├─ PostCard.tsx       # 重写（首页杂志式不对称卡，非首页列表页用）
│  ├─ PostFeatured.tsx   # 新增（首页 featured 大卡）
│  ├─ PostListItem.tsx   # 新增（列表页流式条目，区别于首页卡）
│  └─ MarkdownContent.tsx# 新增（详情页正文渲染）
├─ shared/
│  ├─ vendor/react-bits/ # 扩充：ScrollProgress/ScrollFloat/Particles/Magnetic/SplitText 等
│  └─ ui/                # button 等已有，按需加
└─ styles.css            # 重写 tokens（Geist + 电光蓝 + 圆角刻度）
```

### 6.2 SSR + WebGL/Canvas 隔离纪律（关键，否则 hydration 崩溃）

所有用到 `window`/`canvas`/WebGL/`motion` 客户端 API 的组件：
- **必须** `'use client'` 顶部声明（TanStack Start 支持）。
- **必须** 动态导入或用 `ClientOnly` 包裹（项目已有的 isomorphic 模式）。
- **SSR 阶段返回 null 或骨架**，避免服务端/客户端输出不一致。
- `Aurora`/`Particles`/`ScrollVelocity` 等 canvas 类**禁止**出现在服务端渲染输出里。

**client-only 组件清单**（实现时逐个确认隔离方式）：
- `Aurora`（ogl WebGL）
- `Particles`（canvas）
- `ScrollVelocity` / `ScrollFloat`（依赖 `useScroll`，客户端）
- `DecryptedText` / `SplitText` / `ShinyText`（依赖 `rAF`）
- `Magnetic`（依赖鼠标坐标）
- `ScrollProgress`（依赖 `useScroll`）

### 6.3 prefers-reduced-motion 降级（硬底线，非可选）

- 封装统一的 `useReducedMotion`（motion 自带 `useReducedMotion` hook）。
- 所有滚动驱动动效（pin/漂移/scroll-reveal）在 reduced-motion 下**全部降级为静态/即时显示**。
- WebGL 背景在 reduced-motion 下**停止 `rAF` 动画循环**或直接不渲染。
- 这不是性能优化，是 accessibility 合规底线。

### 6.4 新增依赖

```
@fontsource-variable/geist        # Geist Sans 自托管
@fontsource-variable/geist-mono   # Geist Mono 自托管
react-markdown                    # 详情页正文
remark-gfm                        # GFM 支持
rehype-highlight                  # 代码高亮
highlight.js                      # 高亮 CSS 主题
```

所有均需先确认 `package.json` 无（已确认）。安装命令在实现 plan 里给出。

### 6.5 性能取舍记录（视觉优先）

明确记录，避免后续争议：
- **接受**：Lighthouse LCP 可能 > 2.5s、移动端多 canvas FPS 下降（用户已选"视觉优先"）。
- **不妥协**：reduced-motion 降级、SSR client-only 隔离（崩溃/白屏级风险，不是性能分数）。
- 图片/字体仍走常规优化（`loading="lazy"`、`font-display: swap`、cover 图预留宽高比防 CLS）。

### 6.6 测试与验收标准

- `cd web && npx biome check .` 通过
- `cd web && npx tsc --noEmit` 通过
- 亮色/暗色双模式肉眼检查（首页 + 列表 + 详情各一遍）
- reduced-motion 下页面不崩、内容完整可读
- SSR 首屏无 hydration warning

---

## 7. 范围边界（YAGNI）

**本期内**：
- 首页 4 个 section 重设计
- 博客列表页实装（传统分页）
- 文章详情页实装（Markdown + 目录 + 上下篇）
- 全局 tokens / 字体 / 配色重写
- react-bits 扩充（client-only 隔离 + reduced-motion 降级）

**不在本期内**（二期或更晚）：
- 关于 / 项目 / 个人中心页（二期 spec）
- 列表页标签筛选/排序
- 列表页文章列表若需搜索
- shiki 代码高亮（二期）
- 无限滚动分页
- 文章正文 scroll-reveal 动效
- 评论系统、Emoji 系统（后端能力已存在，前端实装更晚）
