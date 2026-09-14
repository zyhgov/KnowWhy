# KnowWhy 项目工作记录(work.md)

> **使用规范**:本文件实时记录项目的每一次工作痕迹(执行的命令、修改的文件、遇到的问题与解决方案、完成的功能点),每条记录标注时间戳,按时间顺序追加,不删除历史记录。
> 未来迭代计划、待办事项、功能规划类文本请写入 `play/` 文件夹(按日期命名,如 `play/2026-09-12-plan.md`),本文件只记录"已发生的事实"。

## 2026-09-12

### 09:16 - 环境检查

- Node v22.17.1 / npm 10.9.2;工作区 `d:\github-project\knowwhy` 初始仅含 `play/jihua.md`。
- 依赖探测结论:
  - `reicon-react@1.2.5` 在 npm 真实存在,无需替换为 react-icons;
  - Astro 当前最新版为 `7.3.2`(2026-06 发布 7.0,含 Vite 8、Rust 编译器、advancedRouting、Sätteri Markdown 处理器);
  - `@fontsource-variable/geist-sans` 在 npm 不存在(404),Geist 可变字体在 Fontsource 的现行包名为 `@fontsource-variable/geist`。

### 09:21 - 初始化 Astro minimal 项目

- 命令:`npx create-astro@latest . --template minimal --no-install --no-git --no-ai --skip-houston --yes`
- 问题:目标目录非空(已含 play/),create-astro 自动将模板创建到子目录 `./purple-point`。
- 解决:将 `purple-point` 全部内容移动至项目根目录并删除空目录;`package.json` 的 `name` 由 `purple-point` 修正为 `knowwhy`。

### 09:22 - 安装依赖

- 命令:`npm install @astrojs/mdx @astrojs/cloudflare @astrojs/sitemap @astrojs/react react react-dom reicon-react sharp @fontsource-variable/geist astro-seo`
- 命令:`npm install -D typescript @types/react @types/react-dom`
- 问题 1:`@fontsource-variable/geist-sans` 404 导致首轮安装整体失败 → 改用官方现行包名 `@fontsource-variable/geist`(字体家族名 `Geist Variable`,字重 100-900)。
- 问题 2(环境警告):`undici@8.10.2` 要求 Node >=22.19.0,当前 22.17.1,产生 EBADENGINE 警告(待构建验证是否影响运行,若不影响则仅提示用户)。

### 09:26 - 关键 API 核实(依据本地安装包实物)

- `reicon-react`:入口 `index.d.ts` 导出全部命名图标(`export { Coffee } from './icons/Coffee.js'`),组件 props 为 `size / weight('Outline'|'Filled') / color / className`;已确认分类图标可用:`Coffee、Cpu、Leaf、Profile2user、Lightbulb、Compass、ArrowUp`。
- `@fontsource-variable/geist@5.3.0`:`index.css` 中 `font-family: 'Geist Variable'`。
- `astro-seo@1.2.0`:Props 含 `title / description / canonical / openGraph`(openGraph.basic 必填 title/type/image)。
- Astro 7 关键规范:内容集合配置必须使用 `src/content.config.ts`(Content Layer API + glob loader);`src/content/config.ts` 为 v4 遗留路径,自 Astro 6 起不再默认支持(仅可通过 `legacy.collectionsBackwardsCompat` 临时兼容,不适合新建项目);Zod 需从 `astro/zod` 导入,loader 从 `astro/loaders` 导入。

### 09:27 - 创建配置、内容集合与全局样式

- `astro.config.mjs`:site(`https://knowwhy.zyhorg.cn`)+ mdx/sitemap/react 集成 + cloudflare adapter(默认静态输出)。
- `src/content.config.ts`:why 集合(glob loader;schema 严格匹配需求,其中 source.url 用 `z.url()` 以适配 Zod 4)。
- `src/consts.ts`(站点信息+6 分类定义)、`src/utils.ts`(slug/href/日期格式化)。
- `src/styles/global.css`:设计令牌(深靛蓝 `#1e293b`/琥珀黄 `#f59e0b`)、字体栈(Geist Variable+中文回退)、prose 与卡片网格样式。
- `src/content/why/tech/why-airplane-windows-round.mdx`:WHY.0001 示例文章(status: published)。

### 09:28 - 创建组件与布局

- `src/layouts/BaseLayout.astro`:astro-seo(基础 meta+openGraph+canonical)、head 具名插槽(Schema.org 注入位)。
- Astro 静态组件:`Header` / `Footer` / `WhyCard` / `CategoryNav`(均不水合,零 JS)。
- React 组件:`CategoryIcon.tsx`(reicon-react 图标映射,仅 SSR)、`BackToTop.tsx`(全站唯一 `client:load` 水合组件)。
- 品牌资产:`public/favicon.svg`(替换 Astro 默认)、`src/assets/knowwhy-mark.svg`。

### 09:29 - 创建页面路由

- `src/pages/index.astro`:hero + 分类导航 + 最新 WHY + 本周热门占位(Supabase TODO)+ FAQPage JSON-LD 预留。
- `src/pages/[category]/index.astro`:6 个分类列表页(动态生成)。
- `src/pages/[category]/[...slug].astro`:详情页(面包屑/标签/参考资料/相关阅读/投票占位 Supabase TODO/Article JSON-LD 预留)。
- `src/pages/about.mdx`(静态 MDX)、`src/pages/submit.astro`(静态表单+提交拦截脚本+两处 Supabase TODO)。

### 09:30 - 社交分享图与清理

- `scripts/generate-og.mjs`:用 sharp 将内联 SVG 渲染为 `public/og-default.png`(1200x630,深靛蓝渐变底+琥珀黄问号+站点标识),已执行生成成功并验证尺寸。
- 删除 Astro 默认 `public/favicon.ico`。

### 09:31 - 首次构建验证(一次通过)

- 命令:`npm run build` → 10 个页面全部生成,耗时约 29s。
- 关键验证点全部通过:① `z.date()` 与 Sätteri YAML 解析正常;② cloudflare adapter 与默认静态输出兼容(output: static);③ about.mdx 的 div 包裹 markdown 正常;④ reicon-react 的 'use client' 指令无报错;⑤ sitemap 正常生成;⑥ 构建未受 undici EBADENGINE 警告影响(仅安装期警告)。
- 遗留问题:构建产物 `dist/client` 中仍含默认 favicon.ico(此前删除未真正生效)。

### 09:32 - favicon.ico 清理与二次构建

- 问题:`public/favicon.ico` 实际仍存在,首次构建将其复制进了产物。
- 解决:`Remove-Item -Force` 强删后重新构建(`npm run build`,3.4s),产物已无 favicon.ico。

### 09:33 - 构建产物抽查(全部通过)

- 首页:title/canonical/og:image/og:type/description 正常;why-list 卡片渲染,链接指向 `/tech/why-airplane-windows-round/`。
- 文章页:WHY.0001 徽章、面包屑、h1、正文 h2、日期(2026年9月12日)、参考资料、投票占位(article-vote 区块+「即将上线」按钮)全部渲染。
- 分类页:6 个分类页全部生成;科技页正常渲染文章卡片。
- `sitemap-0.xml`:10 个 URL 全部收录;`_astro` JS 产物仅 3 个文件(仅水合组件相关)。
- 说明:构建产物会移除 HTML/TODO 注释(Astro 压缩行为),Supabase 预留标记保留在源码中;临时验证脚本已清理,`scripts/generate-og.mjs` 保留供后续重新生成分享图。

### 09:34 - 创建 play 迭代计划

- `play/2026-09-12-plan.md`:v0.1 完成状态、P1-P4 迭代待办(内容/Supabase/体验/工程化)、三条技术决策记录。
- 本次搭建任务全部完成。

### 09:46 - 修复 dev 运行时报错并接入用户素材

- 用户反馈:dev 启动后报 "Invalid hook call" / "Cannot read properties of null (reading 'useState')"(BackToTop 组件),页面样式缺失、字体未生效。
- 诊断:react/react-dom 均为 19.3.0 且 node_modules 单一副本;根因为 Vite dev 的 SSR 依赖预打包(react-dom_server bundle)内联了第二份 React。
- 修复 1(React):`astro.config.mjs` 增加 `vite.resolve.dedupe: ['react', 'react-dom']`,强制单实例。
- 修复 2(字体/样式):`global.css` 移除 `@import '@fontsource-variable/geist'`(dev 下 CSS 包解析链路异常会导致整表加载失败、页面无样式),改用 public/fonts 自托管 @font-face;全局字体栈改为 OpenAI Sans > PingFang SC > SF Pro Display/Text > Geist Variable > 系统回退。
- 修复 3(图标):BaseLayout 替换为用户提供的 public/icon 全套(apple-touch-icon ×9 / favicon PNG ×3 / android-icon / manifest / msapplication / theme-color)。
- 修复 4(Logo):Header 改用 public/kw-logo-彩色.svg(移除 astro:assets 引用,连带消除 /_image 400)。
- 修复 5(og:image):由 /og-default.png 改为 /kw-og.png(用户提供)。
- 修复 6(manifest):public/icon/manifest.json 图标 src 由绝对根路径修正为相对路径(原写法在 /icon/ 目录下会 404);name 由 "App" 改为站点名。
- 清理:删除废弃生成物(public/favicon.svg、public/og-default.png、src/assets/knowwhy-mark.svg、scripts/generate-og.mjs)。
- 验证:`npm run build` 一次通过(10 页面)。

### 09:55 - 视觉修复:容器缺失、字号字重、品牌切换动画、站点信息

- 用户反馈:页面左右贴边无边距、文本字号小且偏细、品牌名要求上下渐变半透明切换动画并放大、需补充站点信息。
- 诊断(一次 HTTP 检查):dev 返回 HTML 中 CSS 以 7 个内联 `<style>` 正常注入(`--font-sans`/`.container`/`.hero` 均在),样式无加载问题;真正缺陷是页面区块(hero 等)直接置于 `main.site-main` 下且 main 无左右容器约束 → 全站内容贴边。
- `src/styles/global.css`:
  - `.site-main` 增加 `width: min(100% - 2.5rem, var(--max-width)); margin-inline: auto;`,全站主内容统一收进 1080px 容器;
  - body 字号 16px→18px、字重 400→500;h1-h4 字重 650→700;
  - PingFang SC Semibold 字重声明由 600 改为 500(映射为正文权重,中文观感更实)。
- `src/components/Header.astro`:品牌文字改为 `.brand-switcher` 双项轮换动画(上下滑动 + 透明度渐变,6s 循环,纯 CSS,含 `prefers-reduced-motion` 降级),字号放大至 1.5rem(移动端 1.2rem)。
- `src/consts.ts`:SITE 增加 author(杖雍皓)/maintainer(联合库 UNHub)/email(info@zyhorg.cn)。
- `src/components/Footer.astro`:新增 `.footer-credit` 署名行(作者/维护方/邮箱 mailto)。
- `src/pages/about.mdx`:反馈渠道改为邮件;补充作者与维护方信息。
- 验证:`npm run build` 一次通过(10 页面,4.69s)。

### 10:13 - v0.2:dev 报错根治、阅读字号、Know 线、页脚重设计、站点新闻

- 用户反馈(依据 play/001.md 日志):① 切换/刷新页面持续报 Invalid hook call 等错误;② 文章标题正文需再放大或加小/中/大档位;③ 在 WHY.0001 之外新增 KNOW.0001 编号线(一个「为什么」、一个「你知道吗」),入口进导航栏与页底;④ 页脚优化设计;⑤ 新增站点新闻功能。
- dev 报错根治(经上游最小复现 kleinadrian/astro-cf-react-repro 定位):真因为 @astrojs/cloudflare 的 `optimizeDeps.include` 清单遗漏 `astro/zod`(content.config.ts 官方导入路径),冷启动首次请求触发 Vite 懒依赖发现并 program reload,此后预打包 SSR 缓存(react-dom_server 内联 React)与 node_modules 外部副本各持一份 React → 每个请求都报错。上一轮加的 `dedupe` 仅是无效果的缓解。
  - 修复 1:`astro.config.mjs` 新增 `knowwhy:prebundle-astro-deps` 插件,用 Vite `configEnvironment` hook 把 `astro/zod`、`astro-seo` 预热进非 client 环境(ssr/prerender)的 optimizeDeps.include,消除该次 reload。
  - 修复 2:`BaseLayout.astro` 中 BackToTop 改为 `client:only="react"`(纵深防御,跳过 SSR)。
- 阅读字号:`global.css` 增加 `--reading-size` 档位变量(html[data-font-size] 驱动,small/medium/large),`.prose` 与 h2/h3 采用 em 联动缩放;新建 `FontSizeSwitcher.astro`(小/中/大按钮,localStorage 记忆);文章 h1 放大至 clamp(1.8rem, 4.1vw, 2.5rem)。
- 组件抽取:新建 `ArticleHead.astro`(编号徽章+日期+分类+字号切换器+标题+标签,why/know/news 三处复用)、`KnowCard.astro`。
- Know 内容线:`content.config.ts` 新增 know(含 id/sources/related 字段)与 news 集合;新建 `/why/`(WHY 归档,按编号排序)、`/know/`(Know 归档)、`/know/[...slug]/`(详情,含参考资料与相关阅读)。
- 站点新闻:新建 `/news/`(日期倒序列表)、`/news/[...slug]/`(详情);模板 `src/content/news/template.mdx`(draft,改 published 即发布)。
- 导航与页脚:`Header.astro` 导航扩为 6 项(首页/WHY/Know/新闻/关于/提交问题),720px 以下改两行换行布局;`Footer.astro` 整文件重写为深色四栏(品牌/内容线/分类/关于)+ 版权署名行,使用 public/kw-logo-白色.svg。
- 内容模板:`src/content/know/template.mdx`(KNOW.0001 draft 示例 + 字段说明)。
- 验证:`npm run build` 一次通过(13 页面,6.09s)。待用户重启 dev server 后确认报错清零(config 变更需重新预打包)。

### 10:29 - 字距与字体栈、导航选中态、分类入口、Know/新闻样例内容

- 用户反馈:① 全站加字间距(久看不累);② 字体优先级改为 SF Pro Text > SF Pro Display > PingFang SC;③ 导航选中态不要按钮底色,改字重加粗+颜色加深;④ 导航栏与页底缺分类入口;⑤ 发布一篇 Know 文章与一篇新闻,用于查看样式。
- `global.css`:字体栈改为 'SF Pro Text' > 'SF Pro Display' > 'PingFang SC' > 'OpenAI Sans' > 'Geist Variable'(西文命中 SF Pro Text,中文回退 PingFang SC);SF Pro Text 的 semibold 文件额外映射 500,与中文 500 观感对齐(西文正文不显细);body 加 `letter-spacing: 0.01em`,`.prose` 加 `letter-spacing: 0.02em`。
- `Header.astro`:导航新增「分类」项(→ /categories/,共 7 项);`.nav-link` 去掉圆角与底色,hover 仅加深颜色,active 改为 `font-weight: 700` + 深色文字。
- 新建 `src/pages/categories/index.astro`:分类索引页(六大主题卡片:图标/名称/描述/已发布篇数)。
- `Footer.astro`:分类栏追加「全部分类」链接。
- 样例内容:`know/microwave-door-mesh.mdx`(KNOW.0001《微波炉的观察窗》published)、`news/site-launch.mdx`(上线公告,published);`know/template.mdx` 示例编号由 KNOW.0001 改为 KNOW.0000(避免正式编号冲突)。
- 验证:`npm run build` 一次通过(16 页面,5.91s)。

### 10:31 - 字体栈调整:Geist Variable 提至最优先级

- 用户要求:强制优先使用自托管 Geist Variable 字体。
- `global.css`:`--font-sans` 栈改为 'Geist Variable' > 'SF Pro Text' > 'SF Pro Display' > 'PingFang SC' > 'OpenAI Sans'(西文/数字命中 Geist,中文仍回退 PingFang SC);文件头与变量注释同步更新。
- 验证:`npm run build` 一次通过。

### 10:43 - WHY/Know 共用分类、双视图+分页、首页最新 Know、KNOW 蓝色徽章

- 用户反馈:① WHY 与 Know 共用分类,/categories/ 计数合并两条线,KNOW 编号徽章改用蓝色(与 WHY 琥珀区分);② 首页新增「最新 Know」,两个区块加「查看更多」;③ /why/、/know/、/news/ 支持列表/表格双视图切换(默认列表)并分页。
- `content.config.ts`:know 集合新增 `category` 字段(与 why 共用六大枚举);示例文 `microwave-door-mesh.mdx` 与 `template.mdx` 同步(frontmatter + 字段说明)。
- 蓝色令牌:`--blue #2563eb / --blue-deep #1d4ed8 / --blue-soft #dbeafe`;`ArticleHead` 编号徽章按 KNOW 前缀自动切蓝色;`KnowCard` 徽章蓝色 + 悬停蓝框 + 显示分类;know 详情页 ArticleHead 传 categoryName。
- 共用分类:`/[category]/index.astro` 改为 WHY/Know 分区展示(各带计数);`/categories/index.astro` 计数改为 why+know 合计。
- 首页:新增「最新 Know」区块(3 条),「最新 WHY/Know」右上角加「查看更多 →」链接(global.css `.more-link`)。
- 双视图+分页:新建 `src/scripts/entries-browser.ts`(视图偏好 localStorage 记忆 + 每页 10 条客户端分页)与 `EntriesToolbar.astro`;global.css 新增 toolbar/表格/pager 样式;三页接入(表格列:WHY/Know=编号/标题/分类/标签/日期,新闻=日期/标题/摘要;编号列 know 蓝、why 琥珀)。
- 验证:`npm run build` 一次通过(16 页面,4.17s)。

### 10:53 - 修复:双视图叠加显示 + 视图命名调整为【列表】/【卡片】
- 用户反馈:why/know/新闻三页两视图叠在一起显示;且命名错误——应为【列表】(行式)与【卡片】(卡片网格),默认列表。
- 根因:`.why-list { display: grid }` 作者样式覆盖了 `hidden` 属性的 UA 默认 `display: none`,导致卡片面板永远可见,与行式视图叠加。
- 修复:global.css 增加 `[hidden] { display: none !important }` 兜底;entries-browser.ts 视图值改 'list'/'card'(localStorage 键升为 `knowwhy:entries-view-v2`,默认 list);EntriesToolbar 按钮改为【列表】【卡片】;三页 DOM 调换为:行式面板 `data-view-panel="list"` 在前默认显示,卡片面板 `data-view-panel="card" hidden` 在后。
- 验证:`npm run build` 一次通过(16 页面,6.36s)。

### 11:03 - 视图默认卡片(宽卡) + 站内搜索
- 用户需求:why/know 列表与卡片换位、默认卡片且卡片改为新闻式通栏宽卡;新增站内搜索。
- 视图:`EntriesToolbar` 按钮改【卡片】【列表】并新增 `defaultView` prop;`entries-browser.ts` 升 `knowwhy:entries-view-v3` 键,默认视图改由容器 `data-default-view` 决定(why/know=card,news=list);why/know 页面卡片面板前置默认显示、行式面板 hidden。
- 宽卡:`WhyCard`/`KnowCard` 新增 `wide` prop(scoped `.card-link.is-wide`:间距/标题放大、行头左对齐);global.css `.why-list.why-list-wide { grid-template-columns: 1fr }`(双类压过窄屏媒体查询;首页/分类页小卡网格不受影响)。
- 搜索:Astro 无内置搜索,采用「构建期 JSON 索引 + 浏览器端实时过滤」(dev/build 均可用,无需第三方服务):新建 `src/pages/search-index.json.ts`(聚合三条线已发布条目的 title/summary/tags/编号/分类/日期/URL)、`src/scripts/site-search.ts`(空格分词全部命中、结果卡片渲染、`?q=` URL 同步)、`src/pages/search/index.astro`(搜索页:输入框+状态行+结果列表+noscript);Header 导航新增「搜索」;global.css 新增搜索全套样式。
- 验证:`npm run build` 一次通过(17 页面,4.42s),`dist/client/search-index.json` 正常生成(843B)。

### 11:28 - 导航精简 + Search4 图标 + 搜索高级筛选 + 作者系统
- 用户需求:①导航去掉「首页」(点 logo 回首页)、搜索文字改 Search4 图标;②搜索支持高级筛选检索;③作者系统(头像/名字/邮箱,示例文章+新闻+列表均显示,支持多作者)。
- 导航:`Header.astro` 移除「首页」导航项,`isActive` 简化;「搜索」文字改为内联 SVG 图标(矢量数据取自 `reicon-react` 包 Search4,fill=currentColor,18×18),新增 `.nav-link-search` 样式。
- 作者注册表:`consts.ts` 新增 `AUTHORS` 注册表(zyhorg:杖雍皓/`/author/zyhorg.jpg`/info@zyhorg.cn)+ `getAuthor` + `formatAuthorNames`(顿号连接);`content.config.ts` 三集合新增 `authors: z.array(z.string()).default(['zyhorg'])`,缺省即站长;4 个内容文件(why/know 示例、新闻、template)frontmatter 同步加 `authors: ["zyhorg"]`。
- 作者展示:新建 `AuthorInline.astro`(20px 圆头像+名字顿号连接);`ArticleHead.astro` 新增 `authors` prop 与署名行(36px 头像+名字+mailto 链接),三个详情页传入;`WhyCard`/`KnowCard` 卡片底部加作者;why/know/news 三个归档页表格新增「作者」列。
- 搜索筛选:搜索页新增「内容线/分类/年份」三个下拉(与关键词为「与」关系),年份选项由脚本按索引数据动态填充;`site-search.ts` 支持 type/category/year 过滤与 q/type/category/year URL 同步;`search-index.json.ts` 索引新增 authors(显示名)与 year 字段;global.css 新增 `.search-filters` 样式。
- 验证:`npm run build` 一次通过(17 页面,5.99s),`dist/client/search-index.json` 含 authors/year 字段正常。

### 11:40 - 搜索自定义下拉筛选 + 多作者扩展(UNHub)
- 用户反馈:搜索页三个下拉丑陋,改为完全自定义下拉(不使用浏览器原生 select 面板);新增第二作者测试多作者显示。
- 自定义下拉:`search/index.astro` 三个 select 替换为自定义组件(button 触发 + ul[role=listbox] 面板,箭头图标矢量取自 reicon-react 包 AngleDown);`site-search.ts` 重写筛选交互(点击展开/选择、上下键导航、Esc 关闭、点击外部与焦点移出自动收起、URL 参数回填 setValue、年份选项动态生成 li);`global.css` 新增 `.filter-select` 全套样式(悬停/聚焦描边、箭头旋转、面板投影与入场动画、选项悬停底色、选中琥珀圆点、reduced-motion 适配)。
- 多作者:`consts.ts` 的 AUTHORS 改为 `Record<string, Author>` 接口(新增可选 `url` 字段),新增 `unhub` 作者(联合库UNHub Newsroom / `/author/UNHub-Newsroom-logo.jpg` / https://news.zyhorg.cn/);`ArticleHead` 署名行支持邮箱或网址(类名 author-email → author-contact);`news/site-launch.mdx` 的 authors 改为 `["zyhorg", "unhub"]` 测试多作者。
- 验证:`npm run build` 一次通过(17 页面,4.74s);产物核验:新闻页两个作者署名(头像/名字/mailto/外链)均正确、搜索页 3 个自定义下拉面板正常生成、索引 news 条目 authors="杖雍皓、联合库UNHub Newsroom"。

### 11:58 - 修复:下拉交互保守重写 + 卡片头像化 + 分类卡主题化
- 用户反馈:①搜索高级筛选下拉点不开;②why/know/新闻卡片只显示作者头像(名字过长不显示);③分类浏览卡片重设计(放大篇数与文本、SVG 图标移至右上角、按分类主题着色,首页同步)。
- 下拉修复:`site-search.ts` 交互保守重写——展开状态以 `root.classList.contains('is-open')` 判定,trigger 点击加 `event.stopPropagation()`,删除 focusout+rAF 焦点时序机制(疑似点不动根因),外部关闭改用 document `pointerdown`(先于 click,时序最稳);`closeDropdown`/`openDropdown` 拆分,`choose` 内联高亮同步后收起。
- 卡片头像化:`AuthorInline` 新增 `showNames` prop(false 时仅头像,名字放入 title 提示;多作者头像叠靠+白描边);`WhyCard`/`KnowCard` 与新闻卡片均传 `showNames={false}`,新闻卡行头改为「日期+头像」两端对齐。
- 分类卡主题化:`consts.ts` 六大分类新增 `tone: { deep, soft }` 色板(日常绿/科技蓝/自然青/社会紫/心智玫红/元靛灰);`categories/index.astro` 与首页 `CategoryNav` 同步重设计——tone-soft 背景、color-mix 主题边框、图标右上角、篇数 `<strong>` 1.6rem 放大、标题/描述加大。
- 验证:`npm run build` 一次通过(17 页面,4.54s);产物核验:分类页/首页各 6 处主题色注入、新闻卡新结构、why 页 4 处作者头像均正常。

### 12:14 - 提交页改为邮件提交(mailto)
- 用户需求:Supabase 未接入前,submit 页支持点击直接唤起邮箱向 info@zyhorg.cn 发送邮件。
- 实现:`submit.astro` 提交逻辑改为前端拼装 `mailto:info@zyhorg.cn` 链接——主题「[KnowWhy 提问] 问题」,正文含【问题】【建议分类】(取所选 option 文本)【补充说明】【联系邮箱】(空字段自动省略),`encodeURIComponent` 编码,跳转后显示提示;按钮文案改「通过邮件提交」,提示与 noscript 兜底均提供邮箱链接;保留 Supabase TODO 注释(接入后替换为真实写入)。
- 验证:`npm run build` 一次通过(17 页面,4.32s);产物核验:按钮与邮箱链接(表单提示/noscript/页脚共 4 处)正常,提交脚本内联于页面且含完整 mailto 构造(subject/body 编码)。

### 12:18 - 关闭提问通道(暂不接收投稿)
- 用户决策:Supabase 未接入前不再接收投稿,前期内容由站长亲自撰写;待有知名度后再开通并与 Supabase 联动。
- 入口移除(3 处):`Header.astro` 导航移除「提交问题」;`index.astro` hero 移除「提交你的问题」按钮;`Footer.astro`「关于」列移除链接。
- 内容引用(2 处):`pages/about.mdx`「如何参与」改为「提问通道还在筹备中」;`news/site-launch.mdx` 反馈段改为纯邮件引导。
- `submit.astro` 覆写为「暂未开放」状态页:移除表单与 mailto 脚本,保留页头 + 琥珀色提示卡(说明内容积累期与邮箱联系方式);TODO 注释记录未来开通方案(Supabase 写入 + RLS + Turnstile,可先恢复 mailto 过渡)与恢复入口清单。
- 验证:`npm run build` 一次通过(17 页面,4.41s);产物核验:全站 HTML 仅 submit 页自身含 /submit/(canonical/og),页面含「提交通道暂未开放」且无表单/脚本残留。

### 12:26 - 首页优化:GSAP 动效 + 今日阅读/随机词条发现区
- 用户需求:首页支持随机词条与每日阅读,优化样式布局,引入 GSAP 动画。
- 依赖:新增 `gsap`(含 ScrollTrigger,仅首页按需加载)。
- 发现区(新增,Hero 与分类之间):`index.astro` 聚合 WHY+Know 已发布条目为内联 JSON(#discover-data,构建期生成;导语由正文前两段提取——跳过标题/列表/组件行并规范化 CRLF);左「今日阅读」以本地日期为种子(同日固定、次日轮换),右「随机词条」初始随机且「换一条」按钮切换(图标取自 reicon-react Shuffle);服务端渲染前两条兼底,无 JS 时仍可阅读;`home-discover.ts` 负责选取与填充(CSS 过渡淡出/淡入,reduced-motion 直接切换)。
- GSAP 动效:`home-motion.ts`——Hero 元素 stagger 入场(kicker/标题/导语/按钮)+ 各区块滚动进入(ScrollTrigger once,标题与卡片 fade-up);`prefers-reduced-motion` 时全部禁用;用 gsap.from(JS 失效时元素正常显示)。
- 验证:`npm run build` 一次通过(17 页面,4.32s);产物核验:两张发现卡与内联数据正常,why/know 导语提取干净(前两段),GSAP+ScrollTrigger 已打包进首页脚本 chunk。

### 12:31 - 分类体系落地(play/002.md)+ 隐私/条款/信息来源三页
- 用户需求:参考 play/002.md(六大分类内容规划)优化 about 与 categories 页;新建隐私政策、使用条款、信息来源页面并放入页脚。
- 数据源:`consts.ts` 的 CATEGORIES 新增 `topics` 子话题字段(日常五类家居日用/饮食相关/出行交通/身体感知/生活常识、科技五类、自然五类、社会五类、心智五类、元四类,均摘自 002.md)。
- `categories/index.astro`:分类卡新增子话题 chips(白底胶囊、按分类主题色上色,`category-topics` 行内嵌于描述与篇数之间)。
- `about.mdx`:「内容分类」展开为「主题 —— 子话题」六行;import「如何参与」新增信息来源页链接。
- 新页面:`pages/privacy.mdx`(隐私政策:无账号体系/无追踪 Cookie/Cloudflare 托管日志说明/邮件数据仅用于回复/政策变更预告)、`pages/terms.mdx`(使用条款:自由分享注明出处/禁止商用与高频爬取/不构成专业建议/外部链接免责/条款变更)、`pages/sources.astro`(信息来源:资料规范说明卡 + 构建期聚合 why_know 全部已发布文章的 frontmatter sources,按 WHY 琥珀/KNOW 蓝编号 badge 分组列出,含空态)。
- `Footer.astro`:「关于」列新增隐私政策/使用条款/信息来源三个链接。
- 验证:`npm run build` 一次通过(20 页面,4.95s);产物核验:分类页 6 组 chips(首组家居日用…/末组读者互动)、about 子话题与来源链接、sources 页「2 篇文章、4 条来源」及 4 条 noopener 外链、privacy/terms 正文与页脚三链接均正常。

### 13:08 - 修复:文章图片无法显示(Cloudflare 静态站图片管道不可用)+ 图注支持
- 用户反馈:文章内图片不显示(只显示 alt 文本)、不居中,并希望显示图注文字;另编辑器输入路径无自动补全。
- 根因(查 @astrojs/cloudflare 源码确认):适配器默认 `imageService: cloudflare-binding` 模式(`transformAtBuild: false`)——构建期不生成任何图片变体,Markdown 图片/`<Image>` 组件统一输出 `/_image?href=...` 运行时端点引用,期望由 Cloudflare Worker + IMAGES binding 处理;而本站为纯静态输出(无 Worker 运行时),dev 与部署后该端点均不存在 → 图片 404 显示 alt。改用 `<Image>` 组件写法也无法绕过(同一管道)。
- 修复方案(public 直出,dev/build/部署全环境稳定):图片复制到 `public/images/why/why-0001-001.jpg`;文章改用 HTML 图文块 `<figure><img src="/images/..." width height /><figcaption>图注</figcaption></figure>`(绝对路径不经优化管道);`global.css` 新增 `.prose figure`(居中)/`.prose figure img`(去除叠加外边距)/`.prose figcaption`(小字灰色图注)样式,并保留 `.prose img` 的 `margin-inline:auto` 居中。
- 验证:`npm run build` 一次通过(20 页面,4.59s);产物核验:dist 图片存在、figure/figcaption 各 1、img src 指向 /images/、无 /_image 残留、样式已打包进 BaseLayout CSS。
- 备注:编辑器对 `.mdx` 不提供路径自动补全(内置补全仅限 .md),手动输入路径即可;源文件夹 `src/content/why/tech/why-airplane-windows-round/001.jpg` 保留(用户可自行决定去留)。

### 13:40 - 列表倒序统一 + 文章 OG 分享图支持
- 排序:`utils.ts` 新增 `byNewest`(日期倒序,同日按编号倒序);why/know 编号目录由「按编号正序」改为「最新在前」(先 WHY.0002 再 WHY.0001);news/首页/分类页/搜索索引原已日期倒序,保持一致。
- OG 图:why/know/news 三集合 schema 新增可选 `ogImage` 字段;`BaseLayout` 新增 `ogImage` prop(缺省回退站点默认图 `/kw-og.png`);三个详情页([category]/[...slug]、know/[...slug]、news/[...slug])均透传 `data.ogImage`。
- 用法(已告知用户):frontmatter 加 `ogImage: "/images/og/why-0002.png"`,图片放 `public/images/og/`,建议 1200×630。
- 验证:`npm run build` 一次通过(21 页面,含用户新作 why-nonstick-pans-prevent-sticking,收录正常;亦证实此前"页面不显示"为 dev 未热更新新增文件,重启即可)。

### 13:55 - ogImage 封面图展示:列表卡片 + 首页今日发现
- 需求:文章有 ogImage 时,在列表卡片与首页「今日发现」展示该图(一图两用:分享图 + 封面图)。
- 卡片组件:`WhyCard`/`KnowCard` 在卡内顶部新增条件封面图(`data.ogImage && <img class="card-image">`,无图不渲染),样式按 1200×630 比例 `object-fit: cover` 裁切;自动覆盖 /why/、/know/ 列表页、首页最新区、分类页(均复用组件)。
- 首页发现区:`discoverItems` 内联数据新增 `image` 字段(WHY/Know 各一处 + fallbackItem);今日阅读/随机词条卡内顶部新增 `#daily-image`/`#random-image`(服务端兜底:无图时 `hidden` 且不渲染 src);`home-discover.ts` 接口与 `fillCard` 同步图片(有图赋 src 显示,无图移除 src 并 hidden),「换一条」切换时图片随内容一起淡入淡出。
- 样式:三类图片统一 `aspect-ratio: 1200/630; object-fit: cover; border-radius: var(--radius-sm)`;表格(列表视图)不显示封面图。
- 验证:`npm run build` 一次通过(21 页面,5.23s)。

### 13:58 - 封面图尺寸控制:列表卡通栏巨图改右侧缩略图
- 用户反馈卡片封面图过大,全面压缩尺寸:
- 列表页宽卡(/why/、/know/ 单列通栏):原整幅横幅(约 860×452)改为**右侧小缩略图 200×105**(比例恰好 1200:630 无裁切),图文左右排布——`WhyCard`/`KnowCard` 新增 `.card-body` 正文列包裹层,`is-wide` 时 `flex-direction: row` + `order` 调换图右文左。
- 窄卡(首页/分类页网格):顶部横幅固定 **高 150px**(宽度 100%,`object-fit: cover`)。
- 首页发现区:不动 HTML,纯 CSS 方案——`.discover-content` 改 Grid(`minmax(0,1fr) auto`),封面图显式 `grid-column: 2; grid-row: 1 / span 4; align-self: center`,得右侧缩略图 **190×100**(避开随机词条卡超长 SVG 的重写)。
- 响应式:宽卡 `≤640px`、发现区 `≤560px` 时回落纵向上下列,封面图回顶部横幅 150px 高。
- 验证:`npm run build` 一次通过(21 页面,4.41s)。

### 14:07 - 封面图布局再调:统一左侧小缩略图(修复卡片高低不齐)
- 用户反馈:图上文下布局使有图卡片被撑高,首页同行/跨行卡片高高低低;并要求列表页图放左边。
- 方案:卡片改为**统一横排**——封面图在左侧固定小尺寸、正文列在右,图高(63px/105px)低于正文列高,卡片高度完全由文字决定,有图/无图行高一致;同时去掉所有图上下布局相关的 media 查询(order 交换/列回退)。
- 尺寸:窄卡(首页/分类页) **120×63**;宽卡(列表页)**200×105**(均在左);`.card-link` 全局 `flex-direction: row; align-items: flex-start; gap: 1rem`。
- 发现区保持不变(右侧 190×100)。
- 验证:`npm run build` 一次通过(21 页面,4.47s)。

### 14:22 - 封面图全面下线:卡片/列表/发现区不再显示任何图片
- 用户决定:首页、列表均不再显示封面图,相关实现全部删除,卡片恢复纯文本布局。
- 删除范围:WhyCard/KnowCard 的封面图元素、`.card-image`/`.card-body` 样式及宽卡横排特化(结构回退为原始扁平版);index.astro 发现区两处 `<img>`、discoverItems/fallbackItem 的 `image` 字段、`.discover-image` 样式与 media 查询(`.discover-content` 回退为 flex column);home-discover.ts 的 `image` 字段与同步逻辑。
- 保留:ogImage 仅作为社交分享图(schema + BaseLayout og:meta + 详情页传参);正文 figure 图文块不受影响。
- 验证:`npm run build` 一次通过(21 页面,5.15s);grep 确认 src 无任何 card-image/discover-image/card-body 残留。

### 14:37 - 全站字体栈调整:OpenAI Sans 强制最高优先级
- 用户要求:强制优先使用 OpenAI 字体。
- 修改:`global.css` 字体栈改为 `'OpenAI Sans', 'Geist Variable', 'SF Pro Text', 'SF Pro Display', 'PingFang SC', ...`(OpenAI Sans 从末位提至首位),同步更新文件头与变量处注释。
- 字体文件已齐备(public/fonts:OpenAISans 400/500/600/700 四个字重),西文/数字/符号走 OpenAI Sans,中文无字形自动回退 PingFang SC。
- 验证:`npm run build` 一次通过(22 页面,4.77s)。

### 14:42 - 全局字体切换:Noto Sans SC(npm @fontsource)
- 用户要求:全局使用 Noto Sans SC,并询问 npm 集成方式。
- 安装:`npm install @fontsource/noto-sans-sc`(fontsource 分片式中文包,unicode-range 按需加载)。
- 集成:`BaseLayout.astro` frontmatter 引入 400/500/600/700 四个字重 css;`global.css` 字体栈改为 `'Noto Sans SC', 'OpenAI Sans', 'Geist Variable', ...`(Noto Sans SC 置顶,含中英文全字形,全局实际渲染即 Noto Sans SC),同步更新两处注释。
- 验证:`npm run build` 一次通过(22 页面,13.48s——字体分片增多所致);产物 _astro 下 392 个 woff2,构建 CSS 含 'Noto Sans SC'。

### 14:46 - 修复 GFM 表格无样式(看起来"没渲染成表格")
- 用户反馈:`why-bread-and-buns-go-stale.mdx` 39-42 行的表格在页面中没有以表格展示。
- 排查:mdx 语法正确、astro 默认开启 GFM;产物 HTML 确认已渲染为 `<table>`(1 table/5 th/8 td);根因是 `global.css` 从未定义 `.prose table` 样式,浏览器默认表格无边框无底色,视觉上不像表格。
- 修复:`global.css` `.prose figcaption` 之后新增表格样式——塌陷边框、`var(--line)` 细边框、表头 #f1f5f9 浅底加粗、偶数行 #f8fafc 斑马纹、`≤720px` 转为可横向滚动块。
- 验证:`npm run build` 一次通过(22 页面,11.49s)。

### 15:57 - 首页四项改版:Hero 吉祥物、Know 按钮、排序统一、标签样式
- 需求 1:Hero 改两栏 flex,右侧放大屏吉祥物 `public/mascot/Mascot-Thumbs-Up.png`(`clamp(150px,17vw,220px)`,`≤860px` 隐藏);新增"浏览最新 Know"幽灵按钮(`#latest-know`),最新 Know 区加 `id="latest-know"`。
- 需求 2:首页最新 WHY/Know 改用 `byNewest`(日期倒序 + 同日编号倒序 tie-break),修复同日文章顺序不定;[category] 分类页两处排序同样改用 `byNewest`。
- 需求 3:发现区 `.discover-tags li` 改小号实底胶囊(0.66rem、#f1f5f9 底、去边框、圆角 999px)。
- 需求 4:WhyCard/KnowCard 标签去掉 `slice(0,3)` 全量渲染;`.card-tags` 改单行 `nowrap` + `flex: 1 1 0` + `min-width: 0` + 横向溢出轻滑(隐藏滚动条),标签 `flex-shrink: 0`,不再换行撑高卡片;宽卡下标签自然展示更长。
- 验证:`npm run build` 一次通过(27 页面,12.77s);产物 index.html 确认 hero-mascot/最新 Know 锚点/按钮均已输出。

### 16:12 - Hero 换吉祥物背景图 + 发现区标签样式真修复
- 需求 1:Hero 背景换为横版吉祥物图 `public/mascot/横.png`(多层背景,透明区透出深色渐变;文本区 `max-width: 58%` 不压右侧吉祥物);`≤860px` 换竖版 `竖.png`(底部对齐 + 底部留白 13rem 露出吉祥物);删除单独吉祥物立绘 img 及 `::after` 问号装饰。
- 需求 2:发现区标签"字号很大、无胶囊样式"的根因——tags 的 li 由 home-discover.ts 动态 `replaceChildren` 生成,不带 Astro scoped 属性,页面级 scoped 样式对它们不生效;修复:将该规则移入页面内 `<style is:global>` 全局作用域。
- 验证:`npm run build` 一次通过(27 页面,11.65s);产物 CSS 确认 mascot 背景引用×2、无 scoped 限制的 `.discover-tags li` 规则已输出。

### 16:16 - Hero 适配白色调背景图 + 小屏加高
- 用户反馈:吉祥物背景图为白色调,文本/按钮需改深色;小屏竖图下文本/按钮盖到吉祥物脸部,需加高。
- 深色化:hero 标题 #fff→var(--ink-deep)、导语 #9aa8bd→var(--text)、kicker 琥珀→var(--amber-deep)、幽灵按钮边框/文字改深色系(hover 深琥珀);兜底渐变深靛蓝→白/浅灰(透明区透出浅色)。
- 小屏加高:`≤860px` 竖图改 `background-size: auto 100%` + `bottom center`(高度铺满等比缩放、底部对齐),底部留白 13rem→22rem(640 断点同步),文本区不再压到吉祥物。
- 小屏按钮:按用户要求 `≤860px` 隐藏「浏览最新 WHY/Know」按钮(`.hero-actions { display: none }`),空间留给吉祥物。
- 验证:`npm run build` 一次通过(27 页面,11.72s)。

### 16:23 - 新闻同日排序方案 + date 宽容化
- 用户提问:news 的 date 只有日期,同天多条新闻如何排序(why/know 有编号可 tie-break)。
- 改动 1:`news/index.astro` 排序加兜底——日期倒序后按 `entry.id`(文件名)字典序倒序,同日期顺序稳定可预期。
- 改动 2:`content.config.ts` 三集合 `date: z.date()` → `z.coerce.date()`——date 可直接写完整时间(如 `2026-09-12T15:30:00`)且带引号字符串也能解析,页面显示仍只到年月日(formatDate 只取年月日)。
- 验证:`npm run build` 一次通过(27 页面,11.85s),现有纯日期文章兼容无破坏。

### 16:45 - 修复新闻文章吉祥物图片 404(引用路径与 public 实际位置不符)
- 用户反馈:`2026-09-12-meet-xiaowen.mdx` 三处吉祥物图片 404(vite 日志提示 dynamic routes 警告)。
- 根因:图片实际在 `public/mascot/`,文章引用写成 `/images/og/Mascot-*.png`,路径对不上导致 404。
- 修复:三处引用改为 `/mascot/Mascot-Inspection.png`、`/mascot/Mascot-Thinking.png`、`/mascot/Mascot-Thumbs-Up.png`。
- 验证:三个文件均存在;`npm run build` 一次通过(28 页面,13.32s)。

### 16:53 - 文章目录(TOC):导航栏下粘滞 + 展开折叠 + 滚动高亮 + 快速定位
- 新增 `src/components/ArticleToc.astro`:接收 `render()` 的 `headings`,筛选 h2/h3 渲染;`<details>` 原生折叠(无 JS 可展开),粘滞在固定导航栏下方(`top: var(--header-h)`,无 JS 降级 64px);标题条显示当前章节名。
- 新增 `src/scripts/toc.ts`:① 测量 `.site-header` 高度写入 `--header-h`(窄屏 header 两行时自动同步);② scrollspy——滚动时高亮当前章节(rAF 节流)并同步标题条章节名,展开时高亮项自动滚入面板可视区;③ 点击目录项平滑滚动定位 + 收起面板,支持外部点击/Esc 关闭;④ reduced-motion 降级为瞬时跳转。
- 接入:why/know 详情页(`[category]/[...slug].astro`)与新闻详情页(`news/[...slug].astro`)均在正文前插入 `<ArticleToc headings={headings} />`。
- 锚点偏移:`global.css` 新增 `.prose :is(h2, h3) { scroll-margin-top: calc(var(--header-h, 64px) + 4.5rem) }`,跳转不被导航栏+目录条遮挡。
- 验证:`npm run build` 一次通过(28 页面,12.84s);产物确认 details 结构、4 个目录项、TOC 脚本已内联、scroll-margin 规则已输出。

### 16:59 - 目录条改全宽通栏磨砂风 + 点击定位精确化
- 用户反馈:① 点击定位不准,需排除导航栏+目录条高度;② 目录区改左右铺满、无边框无圆角、磨砂半透明、收起无阴影(展开才投影)。
- 定位修复:`toc.ts` 改为先收起面板(读高度强制刷新布局)再按 `导航栏实际高度 + 目录条实际高度 + 12px` 精确 `scrollTo`;原生 hash 跳转兜底 `scroll-margin-top` 同步修正为 `header-h + 3.25rem`。
- 视觉改造:`.article-toc-wrap` 改 full-bleed 通栏(`width:100vw` + `margin-inline: calc(50% - 50vw)`);`body` 加 `overflow-x: clip`(不创建滚动容器、不破坏 sticky)防横向滚动条;去除 border/radius,背景与 header 统一为 `rgb(255 255 255 / 85%)` + `blur(10px)`;收起无阴影,`[open]` 时才投影(200ms 过渡,reduced-motion 关闭);toggle 与列表内边距用 `max(1.25rem, calc(50% - 33.75rem))` 与 1080px 容器对齐。
- 验证:`npm run build` 一次通过(28 页面,11.84s);产物确认 100vw/33.75rem 内联样式、overflow-x:clip 全局规则、精确滚动脚本均已输出。

### 17:03 - 目录条移至导航栏正下方(Header 后插槽贴附)
- 用户要求:目录条紧贴导航栏下方,不再放在正文上方。
- 修改:BaseLayout 新增 `<slot name="after-header" />`(Header 与 main 之间);why/know 与 news 详情页改用 `<Fragment slot="after-header">` 把 `<ArticleToc />` 从 .article 内部移入该插槽。
- 随位置调整:目录条位于 body 直接子级→自然通栏,移除 `100vw + 负边距` full-bleed 方案与 body 的 `overflow-x: clip`(不再需要);删除上边距。
- 效果:页面加载即贴附导航栏下缘(同款磨砂背景连成一体),滚动时 sticky 吸附原位不动。
- 验证:`npm run build` 一次通过(28 页面,13.04s);产物确认目录条顺序位于 main 之前、正文与样式完整。

### 17:06 - 移除投票占位按钮 + 文章底部新增"相关内容"随机区
- 需求 1:删除 why 详情页「这篇文章有帮助 · 即将上线」投票占位 section、样式及 Supabase TODO 注释。
- 需求 2:新增 `ArticleRelated.astro`——从全部已发布内容(WHY + Know,排除当前文章)构建时 Fisher-Yates 随机推荐 4 篇,标题旁「换一批」按钮;候选池 JSON 内嵌(转义 `<` 防截断);`related-random.ts` 客户端洗牌换批(只更新链接文本/地址、不重建 DOM,与当前批次完全相同则重抽),换批带轻量淡入(减少动效时关闭)。
- 接入:why 详情页(替换原投票占位)与 know 详情页(相关阅读之后),新闻页不涉及。
- 验证:`npm run build` 一次通过(28 页面,11.22s);产物确认「相关内容/换一批」已渲染、候选池 8 条、「即将上线」零残留。

### 17:09 - 页脚新增装饰吉祥物(绝对定位,不影响布局)
- 需求:页脚底部合适位置放 `Mascot-Thumbs-Up.png`,要求不影响布局。
- 方案:`.footer-mascot` 绝对定位站在页脚右下角——1080px 内容容器外的侧边空白区——不参与文档流(不撑高页脚、不挤压任何列);`left: calc(50% + 33.75rem + 1rem)` 对齐容器右缘外侧;高度 `clamp(110px, 9vw, 150px)` 随视口微调;`pointer-events: none` 不挡点击;`alt=""` + `aria-hidden` 纯装饰;页脚 `position: relative` + `overflow: hidden` 防溢出。
- 窄屏适配:≤1360px 无侧边空白时自动隐藏,避免遮挡内容。
- 验证:`npm run build` 一次通过(28 页面,11.50s);产物含 footer-mascot 与图片引用。

### 17:38 - 部署上线与 /sitemap.xml 入口补全
- 上线前检查:SEO 配置全齐(canonical/sitemap/OG/图标/lang 均正常);修复四项——新增 `404.astro`(此前缺失,与新闻承诺的「托腮小问」对齐)、新增 `public/robots.txt`、`.gitignore` 补 `.wrangler/`、重写 README(项目说明+部署参数)。
- 代码托管:初始化 git 仓库并推送 https://github.com/zyhgov/KnowWhy(135 文件,node_modules/dist 已排除);用户已完成 Cloudflare 部署,站点上线 `https://knowwhy.zyhorg.cn`。
- 问题:访问 `/sitemap.xml` 返回 404。根因:@astrojs/sitemap 默认生成入口为 `sitemap-index.xml`(+`sitemap-0.xml`),从无 `sitemap.xml` 文件名。
- 修复:新增 `public/sitemap.xml`(sitemapindex 格式转发 sitemap-0.xml,惯例地址直接可用);`robots.txt` 的 Sitemap 行改为 `/sitemap.xml`。(45000 条 URL 拆分时需在 sitemap.xml 追加引用——见文件注释)

## 2026-09-13

### 09:10 - 补记:上轮完成但未记录的三项改动(Hero 吉祥物大图、统计脚本、Know 目录)
- 首页 Hero 改造:删除横/竖背景图,改 flex 左文右图布局,`/mascot/Mascot-Thinking.png` 右侧大图(高 `clamp(18rem, 30vw, 25rem)`);≤860px 纵向堆叠、≤640px 再收紧。
- 统计脚本:`BaseLayout` head 注入 Microsoft Clarity(项目 ID `yh39o7mjvy`,异步 IIFE)与 51.LA(id `LJhpuVmQONPz46Gl`,同步引入)全站脚本。
- Know 文章目录:`know/[...slug].astro` 接入 `<ArticleToc headings={headings} />`(此前仅 WHY/新闻有),三条内容线目录齐平。

### 09:18 - 响应式与内容体系六项优化(小屏布局 / 面包屑 / 搜索筛选 / 静态页居中 / OG 默认图 / 标签页)
- ① 文章字号选择器:`FontSizeSwitcher` 增加 ≤640px 规则(按钮收窄至 `0.72rem`/`0.18rem 0.5rem`),避免挤占文章元信息行。
- ② 面包屑层级:WHY 文章改为「首页>WHY>分类>编号」(补 `/why/` 层);Know 文章补分类层为「首页>Know>分类>编号」。
- ③ 搜索页筛选:global.css 新增 ≤640px 规则,内容线/分类/年份各占整行、下拉撑满(带 `.search-filters` 前缀提高特异性,修复基础规则 `min-width` 覆盖小屏 `min-width: 0` 问题)。
- ④ 静态页居中:about/privacy/terms 的 prose 容器加 `is-page` 类(`.prose.is-page { margin-inline: auto }`),sources 页 notes/list 限宽居中——消除靠左留白。
- ⑤ OG 默认图:`BaseLayout` 缺省图由 `/kw-og.png` 改为 `/kw-og-images.jpg`。
- ⑥ 新增 `/tags/` 标签聚合页:聚合 WHY/Know/新闻三线已发布 tags,标签云 + 分组卡片(锚点跳转);文章页 tags 改链接至对应分组;news schema 补 `tags` 字段(此前 mdx 写了 tags 但被 schema 忽略)并在新闻页显示;页脚「分类」列加「全部标签」入口。
- 验证:`npm run build` 一次通过(32 页面,37.49s);产物抽查——/tags/ 已生成、why 面包屑含 `/why/`、know 页含 tags 链接、about 页 `prose is-page` 与 `og:image=kw-og-images.jpg`、CSS 含小屏筛选规则。

### 09:45 - /tags/ 与 /sources/ 分页改造(SSR 仅第一页 + 客户端重建) + 修复动态节点样式丢失
- 用户反馈:两页直接展示全部条目,性能与加载不达标;要求 tags 页加「分页 + 搜索标签」、sources 页加「分页(无需搜索)」。
- 方案(每页 10 组,与归档页条数一致):构建期把全量分组 JSON 内嵌(`<script type="application/json" data-tag-data / data-source-data>`,转义 `<` 防截断),SSR 只渲染第一页 DOM,翻页/搜索由客户端脚本重建当前页(createElement,textContent 防 XSS)。
- 新增 `src/scripts/tag-browser.ts`:搜索(标签名包含匹配,忽略大小写) + 分页 + URL 同步(`?q`/`?page`,replaceState);文章页 `/tags/#tag-xxx` 直达定位(跨页自动切页后 scrollIntoView),hashchange 兜底。
- 新增 `src/scripts/source-browser.ts`:仅分页 + `?page` 同步。
- 重写 `src/pages/tags/index.astro`(搜索框/状态行/标签云/分组/空态/分页器/noscript/内嵌 JSON)与 `src/pages/sources.astro`(状态行/列表/分页器/noscript/内嵌 JSON,内容保持居中)。sources 页 SSR 10 组 + 内嵌 11 组(共 2 页);tags 页 SSR 10 组 + 内嵌 33 组(共 4 页)。
- 关键坑 1:两脚本原为「全局脚本」(无 import/export),与 related-random.ts 等脚本顶层变量共享作用域冲突 → 尾部加 `export {};` 标记为模块隔离(站点脚本新约定)。
- 关键坑 2:客户端重建的节点没有 scoped 样式的 `data-astro-cid` 属性 → 芯片/分组卡片样式失效。修复:把动态重建元素的样式移入 `src/styles/global.css`(站内既有约定,同 site-search/entries-browser),页面 scoped 仅保留 SSR 元素样式(根容器/搜索框/状态行/空态)。
- 验证:`npm run build` 通过(32 页面,12.76s/11.84s 两次);产物抽查——分页容器/内联脚本/noscript/JSON 均就位;修复后 scoped 形态归零、`.tag-chip{`/`.source-group{` 裸选择器进入 BaseLayout 全局 CSS 且两页均引用。

### 09:50 - 文章正文右侧留白修复(72ch 限宽与 860px 容器不匹配)
- 现象:文章页正文块右侧空出约 100px。
- 根因:`global.css` 的 `.prose { max-width: 72ch }`(默认字号下约 750px)比 `.article` 容器(860px)窄且靠左,而同容器内标题/参考资料等均全宽,右侧露出差值。
- 修复:`.prose` 撤掉 max-width(文章页正文随容器全宽,与标题/参考资料对齐);静态页限宽移至 `.prose.is-page { max-width: 72ch; margin-inline: auto }`(静态页容器 1080px 较宽,需保留限宽保证阅读行长)。
- 验证:`npm run build` 一次通过(32 页面,12.38s);产物确认 `.prose{font-size:...;letter-spacing:.02em}` 无 max-width、`.prose.is-page{max-width:72ch}` 就位。

### 09:52 - 修复文章 og:image 空字符串未回退默认图(输出成站点根)
- 现象:未设置图片的 8 篇文章 view-source 的 og:image 输出 `https://knowwhy.zyhorg.cn/`(仅站点根)。
- 根因:这些文章 frontmatter 写的是 `ogImage: ""`(空字符串),而 `ogImage ?? '/kw-og-images.jpg'` 中的 `??` 只拦 null/undefined,空字符串直接通过 → `new URL('', SITE.url)` 解析成站点根。
- 修复:`BaseLayout` 改为 `new URL(ogImage?.trim() || '/kw-og-images.jpg', SITE.url)`(空串/纯空白/缺省一律回退默认图)。
- 验证:`npm run build` 一次通过(32 页面,12.24s);全站产物统计——30 页为默认图 kw-og-images.jpg、why-0002.jpg 与 Mascot-Thumbs-Up.png 各保留 1 页、站点根残留 0。

### 09:46 - 首页「今日发现」整卡点击跳转
- 需求:今日阅读 / 随机词条卡片,点卡片任意位置即可跳转,不再必须点「阅读全文」。
- 实现:`home-discover.ts` 为两卡片添加 click 委托——实时读取对应 `#xxx-link` 的 href 跳转(随机词条切换后自动指向新条目);点「阅读全文」链接、「换一条」按钮(用 `closest('a, button')` 判断)或拖选文字时(读取 `getSelection`)不触发。
- 样式:`index.astro` 的 `.discover-card` 加 `cursor: pointer`;卡片原有 hover 抬升/描边效果继续作为可点击提示。
- 验证:`npm run build` 一次通过(32 页面,11.74s);产物确认首页 CSS 含 `cursor:pointer`、内联脚本含整卡点击逻辑。

### 09:55 - 全站 SEO 辅助项补全(结构化数据 + Twitter 卡片 + og:article + noindex)
- 需求:检查每个页面的 SEO 设置辅助项,能写的全部写完整。
- 新增 `src/components/ArticleJsonLd.astro`:文章页结构化数据(Article + BreadcrumbList,数组单 script 注入 head;标题/描述/发布日期/作者 Person 数组/发布者 Organization+logo/绝对 URL 配图/板块/关键词;`<` 转义防截断)。WHY/Know/News 三个详情页接入(News 此前没有 head 插槽,一并补上;面包屑末项按规范不带 URL)。
- `BaseLayout` 强化:① Twitter 卡片(summary_large_image + title/description/image/imageAlt,此前完全没有);② 新增可选 `article` prop → og:article:published_time / author / section / tag 系列(此前完全没有);③ 新增 `author` prop → `extend` 输出 `meta name="author"`;④ 新增 `noindex` prop → robots meta。
- 首页 `index.astro`:head 插槽注入 WebSite + Organization(JSON-LD:名称/别名/URL/描述/语言/logo/email/publisher);FAQPage TODO 注释更新为「无真实问答,不虚构」。
- `404.astro` 与 `search/index.astro` 传 `noindex`(防低质页被索引收录;其余页面保持默认 index,follow)。
- 关键取舍:og:image:width/height 不写死——在用的三张图尺寸不一(默认图 4405x2480、why-0002 526x361、吉祥物 1254x1254)且未来会新增图,写错尺寸会误导平台裁切;不写时 FB/Slack 会异步分析,无副作用。
- 验证:`npm run build` 一次通过(32 页面,11.93s);产物抽查——文章页(know/tech 各一张)twitter:card / og:article:published_time / article:tag / BreadcrumbList / headline / meta author 全就位、JSON-LD image 为绝对 URL;首页 WebSite / Organization / inLanguage / publisher 就位且无 FAQPage;404 与 search 页 noindex=True;about 等 mdx 静态页 twitter / canonical / robots 就位。

### 09:57 - 新文章 dev 渲染报错排查(why-keyboard-is-qwerty-not-abcdef)
- 现象:用户新建该文章后 dev 打开报 `Unexpected error while rendering → why-keyboard-is-qwerty-not-abcdef`。
- 排查:`npm run build` 一次通过(33 页,含新增该页产物,正文/表格/结构化数据渲染完整)——文件本身无任何问题;堆栈定位 `astro/dist/content/runtime.js` 的 render() 中 `typeof renderEntryImport !== "function"` 抛错,即 dev 的 content-module-imports 映射尚未收录新文件(getStaticPaths 扫描文件系统导致路由先于渲染模块出现,两缓存不对称)。
- 结论:与既有经验一致——新增 .mdx 后 dev server 不自动热更新,重启(`Ctrl+C` 后重跑 `npm run dev`)即恢复;无需改动任何文件。

### 11:15 - 首页 GSAP 动效升级(设计感强化)
- 需求:用上 GSAP 让首页更有设计感(原动效仅为基础 fade-up + 整块淡入,吉祥物完全静止)。
- Hero:① 标题改用 SplitText 逐行遮罩 + 逐字上推浮现(`aria:'auto'` 保留可访问名称;等 `document.fonts.ready` 后初始化,避免按回退字形测量错位);② 吉祥物新增飘入(x/rotation/autoAlpha)并持续轻浮(y ± 9px 循环,y 与入场 x 不冲突);③ 新增琥珀柔光斑 `.hero-glow` 随指针平滑跟随(`gsap.quickTo`,仅 pointer:fine 设备;z-index 分层:内容之下、底色之上)。
- 区块:① 各区块标题新增琥珀渐变竖条(`h2::before` 的 scaleY 由 CSS 变量 `--head-bar` 驱动,无脚本/降级时默认完整显示);② 入场升级为 fade-up + 微缩(scale 0.985,power3 缓动,错峰 0.06)。
- 降级:prefers-reduced-motion 时完全不拆字/无动效/隐藏光斑;无 JS 时静态页面完整。
- 验证:`npm run build` 一次通过(46 页,14.44s);产物抽查——hero-glow 与竖条 CSS 就位;home-motion 因打包 GSAP 全家桶改为外链 chunk(119KB,仅首页加载),内含 yPercent/--head-bar/fonts.ready/mask/quickTo/reduced-motion 全部特征。

### 11:20 - 导航栏品牌文字切换升级为「逐字上推浮现」
- 需求:导航栏「KnowWhy / 知其所以然」的切换改用首页标题同款效果(逐字上推浮现)。
- 技术选型:导航栏是全站组件,不引入 GSAP(仅首页按需加载,若用于导航栏会让所有页面背 119KB 包);效果本质为「字符独立遮罩 + 上推 + 错峰」,纯 CSS 复刻,零新增依赖。
- 实现(`Header.astro`):① 模板把两个品牌名拆成逐字符结构(每字外层遮罩 span + 内层滑动 span,内联 `--d: i*40ms` 错峰变量;英文按 split、中文按 spread 拆分);② CSS 动画从「整词滑动」(`.brand-item`)下移到字符层(`.brand-char > span`),keyframes 改名 `brand-char-swap`(位移 115% 不变);③ 加 `both` 填充模式,避免正延迟字符在延迟期间闪现;④ 中文名 `calc(-2.7s + var(--d))` 整体错开半周期并保留逐字错峰;⑤ reduced-motion 时停播改字符层控制,仅英文名常显(避免中英重叠)。
- 验证:`npm run build` 一次通过(46 页,11.09s);产物抽查——首页 HTML 含 12 个 `brand-char` 拆字结构与内联 `--d:`;共享 CSS 含 `brand-char-swap`/`var(--d)`/`-2.7s`/reduced-motion 降级。

## 2026-09-14

### 10:40 - dev server 改为监听全部网卡(VPN/代理环境访问修复)
- 需求:开启 VPN 代理后 dev(4321 端口)无法访问,要求全部网络均可访问。
- 修改:`astro.config.mjs` 新增 `server: { host: true, port: 4321 }`——dev server 监听 0.0.0.0,localhost / 127.0.0.1 / 局域网 IP / VPN 虚拟网卡 IP 均可访问。
- 验证:随本次构建一并生效(`npm run build` 71 页通过);dev 需重启后生效。

### 10:47 - 全站图片 alt 补全(Bing 站长工具空 alt 告警修复)
- 现象:Bing 站长工具报告大量图片缺少 alt;排查确认文章配图 alt 齐全,问题集中在模板组件。
- 全站清点:21 处 `<img>` 中 3 处空 alt——① `AuthorInline.astro` 内联作者头像(WhyCard/KnowCard 每张卡片都有,是 Bing 报「很多」的主因);② `Footer.astro` 白色 logo;③ `Footer.astro` 页脚吉祥物(原 `alt=""` + aria-hidden)。
- 修复:作者头像 `alt={author.name}`(与 ArticleHead 一致);页脚 logo `alt={SITE.name}`;页脚吉祥物补 `alt="小问竖起大拇指"` 并移除 aria-hidden(有语义 alt 后无需对辅助技术隐藏)。
- 验证:构建后全量扫描产物——72 个页面 397 张 img,空 alt 归零;页脚 logo/吉祥物、列表页 29 个作者头像 alt 全部非空。
