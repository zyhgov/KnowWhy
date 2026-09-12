请帮我从零搭建 **KnowWhy｜知其所以然** 网站项目，严格遵循以下所有要求执行，全程无需人工干预，完成后输出项目启动命令、目录结构说明、已安装依赖清单、预留Supabase迭代的代码位置说明，确保项目可直接运行无报错，访问 http://localhost:4321 能看到首页和WHY.0001示例文章页：

### 一、项目基础配置
1. 初始化Astro项目：使用minimal模板，项目名称为knowwhy，适配Cloudflare Pages部署环境
2. 核心依赖按顺序安装：
   - Astro官方插件：@astrojs/mdx（支持MDX内容创作）、@astrojs/cloudflare（Cloudflare适配器）、@astrojs/sitemap（自动生成SEO站点地图）、@astrojs/react（支持React组件水合，用于图标/交互组件）
   - 图片处理：sharp（Astro图片优化必备）
   - 图标库：reicon-react（按指定名称安装，若包不存在则自动替换为社区主流的react-icons并告知我）
   - 字体：@fontsource-variable/geist-sans（Geist可变无衬线字体，全局生效）
   - 工具链：typescript（类型安全）、astro-seo（SEO元标签管理）
3. 明确约束：本次不集成Supabase任何功能，但需在代码中预留注释标记（如// TODO: Supabase integration for votes/submissions），方便后续迭代接入

### 二、项目结构与内容规范
1. 内容集合配置：
   - 创建src/content/config.ts，定义why内容集合，schema严格匹配以下frontmatter字段：
     id: z.string() // 格式：WHY.0001
     title: z.string()
     category: z.enum(["everyday", "tech", "nature", "society", "mind", "meta"])
     tags: z.array(z.string())
     date: z.date()
     status: z.enum(["draft", "published", "archived"]).default("draft")
     sources: z.array(z.object({ name: z.string(), url: z.string().url() })).optional()
     related: z.array(z.string()).optional() // 关联其他WHY编号
   - 创建示例内容文件：src/content/why/tech/why-airplane-windows-round.mdx（WHY.0001），填充符合schema的frontmatter和占位正文
2. 页面路由结构（严格遵循SEO友好URL规范）：
   - / → 首页（展示最新WHY、分类导航、本周热门占位）
   - /[category]/ → 分类列表页（动态生成6个分类页）
   - /[category]/[...slug]/ → 文章详情页（动态渲染MDX内容）
   - /about → 关于页（静态MDX）
   - /submit → 问题提交页（静态表单，暂不接后端，预留Supabase提交逻辑注释）
3. 全局样式与字体：
   - 在src/styles/global.css中导入Geist可变字体，设置全局无衬线字体栈，配色采用深靛蓝(#1e293b) + 琥珀黄(#f59e0b)作为品牌主色
   - 所有页面默认启用astro-seo配置基础meta标签（title/description/openGraph），首页和文章页预留Schema.org Article/FAQPage注入位置

### 三、SEO与性能基础配置
1. 在astro.config.mjs中启用sitemap插件，配置站点URL为https://knowwhy.zyhorg.cn（占位，后续可改）
2. 所有图片使用astro:assets的<Image />组件，开启自动优化
3. 首页和文章页禁止不必要的JS水合，仅React图标/交互组件使用client:load策略

### 四、额外强制约束
1. 所有未来迭代计划、待办事项、功能规划文本统一存放到项目根目录的play文件夹内，按日期命名文件（如play/2026-09-12-plan.md）
2. 每次你的工作痕迹（包括执行的命令、修改的文件、遇到的问题及解决方案、完成的功能点）必须实时追加记录到项目根目录的work.md文件中，每条记录标注时间戳，格式清晰可读
3. 交付时必须额外说明play文件夹和work.md的使用规范