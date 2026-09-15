<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/kw-logo-白色.svg">
    <source media="(prefers-color-scheme: light)" srcset="public/kw-logo-彩色.svg">
    <img src="public/kw-logo-彩色.svg" alt="KnowWhy | 知其所以然" width="160">
  </picture>
</p>

<h1 align="center">KnowWhy · 知其所以然</h1>

<p align="center"><strong>用一个「为什么」探索世界——知其然,更要知其所以然。</strong></p>

<p align="center">
  <a href="https://knowwhy.zyhorg.cn"><img src="https://img.shields.io/badge/website-knowwhy.zyhorg.cn-0060FE" alt="官网"></a>
  <img src="https://img.shields.io/badge/Astro-7-BC52EE?logo=astro&logoColor=white" alt="Astro 7">
  <img src="https://img.shields.io/badge/Node-%E2%89%A522.12-5FA04E?logo=nodedotjs&logoColor=white" alt="Node >= 22.12">
  <img src="https://img.shields.io/badge/Cloudflare%20Pages-%E9%9D%99%E6%80%81%E9%83%A8%E7%BD%B2-F38020?logo=cloudflare&logoColor=white" alt="Cloudflare Pages">
</p>

## 这是什么

KnowWhy(知其所以然)是一个以「追问」为核心的中文知识内容站点:把日常、科技、自然、社会、心智与元问题背后的原理,整理成一篇篇读得懂、讲得清、有来源的答案。

本仓库是站点的**完整源代码与全部内容源文件**——文章如何组织、页面如何渲染、风格如何统一,都可以在这里逐行查看。

## 内容线

- **WHY · 为什么** —— 深度文章,覆盖六大分类,每篇附参考来源;
- **Know · 你知道吗** —— 轻量知识点,短平快讲清一个小问题;
- **News · 站点新闻** —— 站点建设进展与内容动态。

六大分类:**日常 / 科技 / 自然 / 社会 / 心智 / 元**(定义见 [`src/consts.ts`](src/consts.ts),与内容 schema 严格对齐)。

## 站点功能

- **全站搜索**:构建期生成本地索引,支持关键词 + 类型 / 分类 / 年份筛选,搜索条件同步到 URL,可直接分享;
- **阅读体验**:侧边目录(点击定位,自动避让吸顶导航)、正文字号切换、上一篇 / 下一篇、相关阅读、回到顶部;
- **文章分享**:复制链接、二维码(运行时生成)、微信 / QQ / 微博 / X / Instagram / Reddit;
- **代码与图表**:代码块语言标签 + 一键复制 + 行号,Mermaid 流程图按需渲染,KaTeX 数学公式,脚注双向跳转;
- **浏览与聚合**:/categories/ 分类视图、/tags/ 标签聚合、/sources/ 来源汇总;
- **视觉与动效**:响应式布局(小屏汉堡菜单)、GSAP 入场动效、吉祥物「小问」的 404 / 草稿页;
- **工程化**:SEO(meta / JSON-LD / sitemap)、OG 分享图、Cloudflare Pages 纯静态部署。

## 技术栈

- **框架**:Astro 7(内容集合 + MDX 内容管线)
- **交互**:React 19 islands(仅按需水合)+ 按职责拆分的原生 TypeScript 脚本
- **样式**:原生 CSS + design tokens(全局变量),不依赖 UI 框架
- **内容**:Markdown / MDX;remark-math + rehype-katex 处理公式,Mermaid 客户端按需渲染,Shiki 负责代码高亮
- **图标**:[reicon-react](https://www.npmjs.com/package/reicon-react)
- **字体**:Noto Sans SC + Geist(Fontsource 自托管)
- **部署**:Cloudflare Pages(`@astrojs/cloudflare` 适配器,纯静态输出)

## 目录结构

```text
src/
├── components/        通用组件(页头页脚、卡片、目录、分享栏等)
│   └── react/         React islands 组件
├── content/           内容源文件(why/ 六大分类、know/、news/)
├── layouts/           BaseLayout.astro(SEO、字体、全局样式)
├── pages/             路由页面(首页、分类、标签、搜索、来源、静态页等)
├── scripts/           原生 TypeScript 交互脚本
├── styles/            全局样式与 design tokens
├── consts.ts          站点信息、分类定义、作者注册表
├── content.config.ts  内容集合 schema(所有内容的校验入口)
└── utils.ts           通用工具函数
public/                静态资源(Logo、图标、字体、吉祥物、OG 图)
astro.config.mjs       Astro 配置(数学公式、Mermaid、Shiki 等)
play/                  迭代计划与记录
work.md                迭代日志
```

## 本地开发

```sh
npm install
npm run dev        # 开发服务器(默认 http://localhost:4321)
npm run build      # 构建,产物输出到 dist/client
npm run preview    # 预览构建产物
```

要求 Node.js >= 22.12(见 [`package.json`](package.json) 的 engines 字段)。

## 撰写内容

新增一篇文章 = 在对应目录添加一个 `.mdx` 文件,frontmatter 由 [`src/content.config.ts`](src/content.config.ts) 校验。

**WHY 文章**(`src/content/why/<分类>/<slug>.mdx`):

```yaml
---
id: "WHY.0123"           # 文章编号,WHY.XXXX
title: "为什么……"
authors: ["zyhorg"]      # 作者 key,在 src/consts.ts 的 AUTHORS 中注册
category: "tech"         # everyday | tech | nature | society | mind | meta
tags: ["…"]
date: 2026-09-15
status: "published"      # draft | published | archived
sources:                 # 参考来源(可选)
  - name: "……"
    url: "https://……"
---
```

**Know 知识点**(`src/content/know/<slug>.mdx`):字段与 WHY 相同(编号为 `KNOW.XXXX`,分类共用六大分类)。

**News 新闻**(`src/content/news/<date-slug>.mdx`):frontmatter 为 `title` / `summary` / `date` / `status`(`draft` | `published`),可直接复制 [`src/content/news/template.mdx`](src/content/news/template.mdx) 作为模板。

## 部署(Cloudflare Pages)

| 配置 | 值 |
| --- | --- |
| 构建命令 | `npm run build` |
| 输出目录 | `dist/client` |
| Node 版本 | 22(环境变量 `NODE_VERSION=22`) |

> 项目使用 `@astrojs/cloudflare` 适配器,静态资源位于 `dist/client`。将来引入服务端能力(如数据接口)后,可切换为 Wrangler / Workers 的部署方式。

## 参与与反馈

- 发现内容错误、渲染问题或代码缺陷:欢迎提交 Issue;
- 推荐一个值得追问的「为什么」,或投稿:发送邮件到 [info@zyhorg.cn](mailto:info@zyhorg.cn);
- 如果这个站点曾帮你弄明白过一件小事,欢迎给仓库点一颗 Star。

---

<p align="center">本站由 <strong>联合库 UNHub</strong> 运行维护 · 愿每一次追问,都让你更靠近世界的真相。</p>
