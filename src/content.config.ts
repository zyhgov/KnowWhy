import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/*
 * 内容集合配置(Content Layer API)
 * 文件位置说明:自 Astro 6 起,内容集合必须定义在 src/content.config.ts;
 * src/content/config.ts 是 v4 遗留路径,已不再支持(详见 work.md 记录)。
 *
 * TODO: Supabase integration for votes/submissions
 * 未来迭代:投票(votes)与问题提交(submissions)的统计数据由 Supabase 提供,
 * 内容集合本身保持纯静态,运行时数据通过客户端或构建期拉取 Supabase 获取。
 */

const why = defineCollection({
	// 按目录约定:src/content/why/<category>/<slug>.mdx
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/why' }),
	schema: z.object({
		/** 文章编号,格式:WHY.0001 */
		id: z.string(),
		title: z.string(),
		/** 作者 key 数组(在 consts.AUTHORS 注册),支持多作者;缺省为站长 */
		authors: z.array(z.string()).default(['zyhorg']),
		category: z.enum(['everyday', 'tech', 'nature', 'society', 'mind', 'meta']),
		tags: z.array(z.string()),
		date: z.coerce.date(),
		status: z.enum(['draft', 'published', 'archived']).default('draft'),
		sources: z
			.array(
				z.object({
					name: z.string(),
					url: z.url(),
				}),
			)
			.optional(),
		/** 关联其他 WHY 编号,如 ["WHY.0002"] */
		related: z.array(z.string()).optional(),
		/** 文章 OG 分享图(public 下绝对路径,如 /images/og/why-0002.png;缺省用站点默认图) */
		ogImage: z.string().optional(),
	}),
});

/** Know 内容线:KNOW.0001 编号的「你知道吗」知识点,目录 src/content/know/<slug>.mdx */
const know = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/know' }),
	schema: z.object({
		/** 知识点编号,格式:KNOW.0001 */
		id: z.string(),
		title: z.string(),
		/** 作者 key 数组(在 consts.AUTHORS 注册),支持多作者;缺省为站长 */
		authors: z.array(z.string()).default(['zyhorg']),
		/** 与 WHY 共用的六大分类 */
		category: z.enum(['everyday', 'tech', 'nature', 'society', 'mind', 'meta']),
		tags: z.array(z.string()).default([]),
		date: z.coerce.date(),
		status: z.enum(['draft', 'published', 'archived']).default('draft'),
		sources: z
			.array(
				z.object({
					name: z.string(),
					url: z.url(),
				}),
			)
			.optional(),
		/** 关联其他 KNOW 编号,如 ["KNOW.0002"] */
		related: z.array(z.string()).optional(),
		/** 文章 OG 分享图(public 下绝对路径,如 /images/og/know-0001.png;缺省用站点默认图) */
		ogImage: z.string().optional(),
	}),
});

/** 站点新闻:目录 src/content/news/<slug>.mdx */
const news = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/news' }),
	schema: z.object({
		title: z.string(),
		/** 作者 key 数组(在 consts.AUTHORS 注册),支持多作者;缺省为站长 */
		authors: z.array(z.string()).default(['zyhorg']),
		/** 列表页摘要(可选) */
		summary: z.string().optional(),
		date: z.coerce.date(),
		status: z.enum(['draft', 'published']).default('draft'),
		/** 新闻 OG 分享图(public 下绝对路径,如 /images/og/news-xxx.png;缺省用站点默认图) */
		ogImage: z.string().optional(),
	}),
});

export const collections = { why, know, news };
