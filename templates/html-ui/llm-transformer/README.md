# LLM Transformer 风格模板

> 来源：Muse 作品《LLM Transformer 底层数学原理》（动态讲义页），2026-10-26 由该作品原样导出，
> 本文件未改动一字。沉淀目的：以后做同类“大白话动态讲义”时直接复用这套版式与交互，不用从零搭。

## 预览

直接用浏览器打开 `llm-transformer.html` 即可。唯一外部依赖是 Google Fonts（见下），
无网时自动回退系统字体，页面与交互不受影响。

## 这一页长什么样

- 一页讲一件事，分 10 个 `.slide` 卡片页：文字先变数字 → 注意力 → Q、K、V →
  Softmax → 多头 → 位置 → 整层流程 → 残差/归一化 → 训练。
- 顶部固定进度条 + 品牌胶囊 + 页码胶囊；底部固定导航：上一页 / 圆点 / 下一页。
- 交互件（全部原生 JS，无框架）：
  - 注意力条形图：点词看“它在关注谁”，条形按百分比填充；
  - 热力图：5×5 注意力矩阵，颜色深浅按数值算；
  - Softmax 演示：温度滑杆实时改分布，附一句人话解读；
  - 向量条、token 胶囊、流程箭头、多头网格等静态图解组件。

## 设计要素（可直接抄）

### CSS 变量（`:root`，深色模式用 `prefers-color-scheme: dark` 换一套）

| 变量 | 浅色 | 用途 |
| --- | --- | --- |
| `--bg` | `#f7f5f0` | 页面底色（暖纸色） |
| `--bg2` / `--card` | `#ffffff` | 胶囊、卡片底 |
| `--ink` / `--ink2` / `--ink3` | `#16130e` / `#5a554b` / `#8a8478` | 正文 / 次要 / 最弱三级文字 |
| `--line` | `#e6e0d3` | 边框、进度条轨道 |
| `--accent` | `#e4571d` | 主强调（橙）：进度条、条形填充、kicker |
| `--accent2` | `#0f766e` | 链接、次强调（青） |
| `--accent3` | `#d97706` | 第三强调（琥珀） |
| `--soft` / `--soft2` | `#fff7ed` / `#f0fdfa` | 橙/青 callout 底 |
| `--shadow` | `0 10px 30px rgba(22,19,14,.08)` | 卡片阴影 |
| `--radius` | `18px` | 卡片圆角 |

### 字体

- 标题（`h1`/`h2`）：Noto Serif SC，900，`letter-spacing: -.02em`，`clamp()` 响应字号；
- 中文正文：Noto Sans SC，`line-height: 1.7`；
- 数字、公式、代码：JetBrains Mono（公式块为深底白字，关键字两色高亮）。

### 版式

- 内容列 `.deck`：`max-width: 980px`，上下留白给固定顶栏与底栏；
- 两栏 `.grid2`、三栏 `.grid3`，760px 以下自动单栏；多头网格 600px 以下两栏；
- 动效：切页淡入上浮 0.45s，`prefers-reduced-motion` 时全部关掉。

### 组件 class 清单

`.card` `.pill` `.formula` `.callout`（`.orange` / `.teal`） `.tokens` `.token`
`.vec` / `.vecn` `.heatmap` `.wordbtn` `.bars` / `.bar-row` / `.bar-track` / `.bar-fill`
`.flow` / `.step` / `.arr` `.heads` / `.head` `.btn`（`.primary`） `.dots` / `.dot`
`.topbar` / `.brand` / `.count` `.progress` `.footer-nav` / `.footer-inner`

## 复用方法

1. 复制 `llm-transformer.html` 为新文件，只改 `.slide` 里的文案与演示数据；
2. 新增一节 = 新增一个 `.slide` 元素，圆点、进度条、页码由 JS 按 `.slide` 数量自动生成，不用手动改导航；
3. 换主题只改 `:root` 里的变量，不用动组件；
4. 交互演示的数据都在页面底部 `<script>` 里以字面量给出（如 `attnData`、`scores`），照葫芦画瓢改数字即可；
5. 键盘支持已内置：`←` / `→` / 空格翻页，`Home` / `End` 跳首末页；触屏左右滑 50px 以上翻页。

## 约束

- 本模板是“讲义页”专用：长文 + 图解 + 小演示，不适合仪表盘、表单、后台管理页；
- 保持单文件、零框架：不要为一个小演示引入构建步骤或组件库；
- 新模板进 `templates/html-ui/` 时，同样做到：一个目录 = 一个模板，目录内必有原文件 + 本 README 式说明。
