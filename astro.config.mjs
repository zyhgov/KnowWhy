// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
	// 站点基准 URL:canonical / sitemap / openGraph 使用(绑定正式域名后如有变动再修改)
	site: 'https://knowwhy.zyhorg.cn',

	integrations: [
		// MDX:支持在 Markdown 中混用 JSX 组件
		mdx(),
		// Sitemap:构建时自动生成 sitemap-index.xml
		sitemap(),
		// React:用于图标与交互组件的按需水合(默认不水合,仅显式 client:* 时激活)
		react(),
	],

	// 开云适配器:Cloudflare Pages 部署环境
	// 站点为纯静态输出(output 默认 'static'),所有页面在构建期预渲染为 HTML;
	// 未来接入 Supabase 需要服务端能力(SSR / API 路由)时,基于本适配器即可渐进启用。
	adapter: cloudflare(),

	// 开发服务器:监听全部网络接口(0.0.0.0)——localhost / 127.0.0.1 / 局域网 IP /
	// VPN 虚拟网卡 IP 均可访问;开启 VPN 系统代理导致 localhost 被拦截时,可改用本机 IP 访问
	server: {
		host: true,
		port: 4321,
	},

	vite: {
		resolve: {
			// 强制 React 单实例:修复 dev 下 SSR 依赖预打包(react-dom/server)内联第二份 React
			// 导致的 "Invalid hook call" / "Cannot read properties of null (reading 'useState')"。
			dedupe: ['react', 'react-dom'],
		},
		plugins: [
			{
				name: 'knowwhy:prebundle-astro-deps',
				// dev 修复:@astrojs/cloudflare 的 optimizeDeps.include 列表未覆盖 astro/zod,
				// 冷启动首次请求才触发懒发现优化并 "program reload" —— 之后 Vite 预打包的 SSR 缓存
				// 与 node_modules 外部副本各持一份 React,每个请求都报 Invalid hook call
				// (上游最小复现:kleinadrian/astro-cf-react-repro)。把 astro/zod、astro-seo 预热进
				// 非 client 环境(ssr/prerender)的预打包列表,消除该次 reload 即根治。
				configEnvironment(environmentName, config) {
					if (environmentName === 'client') return;
					config.optimizeDeps ??= {};
					config.optimizeDeps.include ??= [];
					for (const dep of ['astro/zod', 'astro-seo']) {
						if (!config.optimizeDeps.include.includes(dep)) {
							config.optimizeDeps.include.push(dep);
						}
					}
				},
			},
		],
	},
});
