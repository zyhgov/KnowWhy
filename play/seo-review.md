# KnowWhy SEO 核查与强化报告(基于项目真实情况)

> 对象:`seo-qa.md`(外部 AI 诊断报告)逐条核查 + 本站实际可强化项梳理。
> 方法:线上响应头/页面 HTML 实测、全站源码与构建产物检索、git 记录核对(核查日 2026-09-17)。
> 结论先行:**OG 分享卡片早已完整配置(报告结论不成立)**;唯一真实硬伤是 **HSTS 仍未生效(max-age=0)**;另梳理出 5 项报告没提到的真实强化点。

---

## 一、逐条核查:报告说了什么 vs 项目真实情况

### ❌ 结论不成立(无需处理)

**1. "缺失 Open Graph (OG) 标签"——不成立,线上已完整输出**

实测线上首页与文章页 `<head>`,OG/Twitter 卡片全套就位(由 `astro-seo` 在 `BaseLayout.astro` 统一生成,2026-09-13 已做过全站 SEO 辅助项补全):

- 全站:`og:title` / `og:type` / `og:image`(含 `og:image:url`、`og:image:alt`)/ `og:url` / `og:description` / `og:locale=zh_CN` / `og:site_name`,以及 `twitter:card=summary_large_image` + title/description/image/imageAlt;
- 文章页(实测 `/news/2026-09-12-meet-xiaowen/`):`og:type=article` + `article:published_time / author / section / tag`,并注入 **Article + BreadcrumbList** 两个 JSON-LD;
- 首页:注入 **WebSite + Organization** JSON-LD(FAQPage 因无真实问答而有意留空)。

即:分享到 Telegram / X / Facebook / Slack 等平台已能正常渲染卡片;"只能显示干瘪纯文本链接"与事实不符(可能基于旧版页面或误判)。微信内分享的最终样式建议用真机发一条链接确认(微信抓取策略保守,若需定制卡片再考虑 JS-SDK)。

**2. "TTFB 慢 / 是 SSR,建议改 SSG/ISR"——前提不成立,本站本来就是纯静态**

- `astro.config.mjs`:Cloudflare 适配器 + 默认 `output: 'static'`,所有页面在构建期预渲染为 HTML(无 SSR、无数据库实时查询;Supabase 尚未接入);
- 响应头 `cf-cache-status: DYNAMIC` 是 Cloudflare Pages(Workers 化边缘分发)的正常标识,不代表动态渲染;
- 实测边缘处理耗时 `Server-Timing: cfEdge;dur=48ms`(毫秒级);报告中的 2.5s 更可能来自测点网络,而非站点架构。

### ⚠️ 属实但仍未完成(唯一需要动手的)

**3. HSTS `max-age=0`——实测仍为 0,需要去 Cloudflare 面板改**

- 实测(2026-09-17):`Strict-Transport-Security: max-age=0; includeSubDomains; preload`(HTML 与静态资源响应都带);
- 已查明:全仓库(含 git 历史)不存在任何 HSTS 配置 → 该头由 **Cloudflare 边缘统一注入**,即**只能在 Cloudflare 面板里改,与代码无关**;
- "Always Use HTTPS" 已生效(http 请求实测会跳转到 https 并 200),但 HSTS 的 Max Age 仍是 0(CF 面板中 0 = Disable,等于未启用 HSTS);
- **修复步骤(1 分钟)**:Cloudflare 控制台 → 你的域名 → SSL/TLS → Edge Certificates → HTTP Strict Transport Security (HSTS) → 开启,Max Age 选 **12 months** → 保存,立即生效;
- 修完可自查:
  ```powershell
  (Invoke-WebRequest 'https://knowwhy.zyhorg.cn/' -UseBasicParsing).Headers['Strict-Transport-Security']
  ```
- 注意:`preload` 标志虽已在响应头里,但要真正进入浏览器预加载列表还需向 hstspreload.org 单独提交,**且很难撤销**——确认 zyhorg.cn 全部子域都支持 HTTPS 后再考虑提交。

### ⚖️ 属于设计取舍(建议维持现状)

**4. meta keywords——确实没有,但建议不做**:Google 已明确忽略、Bing 权重极低、百度参考价值也已很弱,写入反而有堆砌风险。

**5. 首页 H1 是口号(`知其然,更要知其所以然。`)——不是错误**:搜索引擎判断主题主要依据 `<title>`(已含 "KnowWhy + 定位")与正文;品牌口号 H1 是常见做法。若想兼顾,可把 Hero 上方的 kicker("KnowWhy · 知其所以然")并入 H1 结构、视觉保持不变——收益有限,优先级最低。

**6. "增加外部锚文本"——合理,属长期运营**(GitHub Profile / 知乎 / 少数派等发文带站点链接),代码侧无需动作。

---

## 二、报告没提到、但本站真实存在的强化点

**1. `_headers` 文件不在源码里,线上缓存规则有丢失风险(P1,建议处理)**

- 现状:线上 `/_astro/*` 资源已命中 `Cache-Control: public, max-age=31536000, immutable` ✓;本机构建产物 `dist/client/_headers`(构建于 09-15 17:10)里有这条规则;
- 问题:该文件**从未进入 git**(全历史检索无记录)、当前源码目录中也不存在——重新构建/部署链路一旦变化,这条缓存优化随时可能丢失;
- 建议:新建 `public/_headers`(内容 2 行,与线上生效规则一致),提交即可:

  ```
  /_astro/*
    Cache-Control: public, max-age=31536000, immutable
  ```

**2. Sitemap 缺 lastmod(120 条 URL、0 条 lastmod)(P2,可选)**

- `@astrojs/sitemap` 支持 `serialize` 逐条注入(已确认类型签名 `serialize?(item): SitemapItem`),可把文章 URL 映射到内容 frontmatter 日期,帮助搜索引擎更快重爬新文章;收益中等、实现约 30 行。

**3. 百度收录通道完全没做(P1,中文站主要流量之一)**

- 已完成:GSC 提交、Bing 提交、IndexNow 主动推送(Bing/Yandex 系);
- 百度侧需要:① 百度搜索资源平台完成站点验证(下载验证文件放 `public/`,与 GSC/Bing 同流程);② 提交 sitemap;③ 可选:用"普通收录 API"(需 token)写一个 `scripts/baidu-push.mjs`——可完全照 `scripts/indexnow.mjs` 的结构,一条命令推送全站链接。

**4. 51.LA 统计脚本同步加载,轻微阻塞首屏(P2,可选)**

- `BaseLayout.astro` 中 51.LA 的 sdk 在 head 内同步引入(Clarity 已是 async);可改异步 + 把 `LA.init` 挪到 DOMContentLoaded(注意时序),收益较小。

**5. RSS / Feed 订阅(可选)**:当前站点没有 RSS(Astro 有官方 `@astrojs/rss` 集成)。对科普站的内容分发与聚合器收录有一定帮助,非必需。

**6. og:image:width/height——已评估,有意不写(维持)**

- 在用的分享图尺寸不一(默认图 4405×2480、why-0002 526×361、吉祥物 1254×1254),写错误尺寸会误导平台裁切;`astro-seo` 虽原生支持该字段,当前不写是正确的(2026-09-13 已决策)。默认分享图 4405×2480 / 约 88KB 实际可用;若你愿意,可另导一张 1200×630 的标准默认图(图片由你制作)。

---

## 三、执行顺序建议

| 优先级 | 事项 | 谁做 |
| --- | --- | --- |
| P0 | CF 面板把 HSTS Max Age 从 0 改为 12 months | 你(1 分钟) |
| P1 | 补 `public/_headers` 并提交(防缓存规则丢失) | 可交给我 |
| P1 | 百度:平台验证 + 提交 sitemap;(可选)token 后我来写推送脚本 | 你验证 + 我写脚本 |
| P2 | sitemap lastmod 注入 | 可交给我(可选) |
| P2 | 51.LA 异步化 | 可交给我(可选) |
| P3 | RSS 订阅 | 可交给我(可选) |
| — | meta keywords(不做)/ 首页 H1(不改)/ og 尺寸元数据(维持不写) | 维持 |
| — | 外链与社区分发 | 你(长期) |

> 备注:代码类改动按既有约定"重要内容才跑构建验证"。IndexNow 密钥文件 `eb7fc2ca….txt` 已随部署上线(实测 200),可直接运行 `npm run indexnow` 完成一次正确密钥的全量推送(此前那次用的是微信文件内容,重跑即覆盖)。
