# KnowWhy | 知其所以然

用一个「为什么」探索世界——知其然,更要知其所以然。

KnowWhy 是一个以「追问」为核心的内容站点:把日常、科技、自然、社会、心智与元问题背后的原理,整理成一篇篇读得懂、讲得清的答案。

## 内容线

- **WHY · 为什么** —— 深度文章,覆盖六大分类(日常 / 科技 / 自然 / 社会 / 心智 / 元),每篇附参考来源
- **Know · 你知道吗** —— 轻量知识点,短平快回答一个小问题
- **News · 站点新闻** —— 站点的建设进展与内容动态

## 技术栈

- **框架**:Astro(内容集合 + MDX)
- **交互**:React islands(仅按需水合)+ 原生 TypeScript 脚本
- **样式**:原生 CSS(全局 design tokens)
- **字体**:Noto Sans SC(Fontsource 自托管,全局启用)
- **部署**:Cloudflare Pages(静态托管)

## 本地开发

```sh
npm install
npm run dev        # 本地开发(默认 http://localhost:4321)
npm run build      # 构建产物输出到 dist/
npm run preview    # 预览构建产物
```

要求 Node.js >= 22.12。

## 构建与部署(Cloudflare Pages)

| 项目 | 值 |
| --- | --- |
| 构建命令 | `npm run build` |
| 输出目录 | `dist/client` |
| Node 版本 | 22(环境变量 `NODE_VERSION=22`) |

> 说明:项目使用 `@astrojs/cloudflare` 适配器,构建产物中的静态资源位于 `dist/client`。
> 部署到 Cloudflare Pages 时,输出目录请选择 `dist/client`。
> 将来引入服务端能力(如 Supabase 数据接口)后,可切换为 Wrangler / Workers 的部署方式。

## 目录结构

```text
src/
├── components/   # 通用组件(卡片、目录、页头页脚等)
├── content/      # 内容集合(why / know / news)
├── layouts/      # 布局(BaseLayout:SEO、字体、全局样式)
├── pages/        # 路由页面
├── scripts/      # 原生交互脚本(发现区、目录、搜索结果等)
├── styles/       # 全局样式与 design tokens
└── consts.ts     # 站点信息、分类、作者注册表
public/           # 静态资源(图标、字体、吉祥物等)
play/             # 迭代计划与记录
work.md           # 迭代日志
```
