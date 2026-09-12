import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { formatAuthorNames, getCategory } from '../consts';
import { formatDate, getKnowHref, getNewsHref, getWhyHref } from '../utils';

/*
 * 站内搜索索引:/search-index.json
 * 构建期聚合三条内容线(WHY / Know / 新闻)的已发布条目,
 * 供 /search/ 页面在浏览器端做实时过滤(纯静态,dev 与线上均可用)。
 */

/** 单条索引项(字段与 src/scripts/site-search.ts 的 SearchItem 保持一致) */
interface SearchItem {
	/** 内容线标识(决定徽章配色) */
	type: 'why' | 'know' | 'news';
	/** 徽章文字 */
	label: string;
	/** 编号(新闻无编号,为空串) */
	serial: string;
	title: string;
	summary: string;
	category: string;
	tags: string[];
	dateText: string;
	/** 作者显示名(顿号连接;无作者为空串) */
	authors: string;
	/** 四位年份(用于高级筛选) */
	year: number;
	url: string;
}

export const GET: APIRoute = async () => {
	const [whyEntries, knowEntries, newsEntries] = await Promise.all([
		getCollection('why', ({ data }) => data.status === 'published'),
		getCollection('know', ({ data }) => data.status === 'published'),
		getCollection('news', ({ data }) => data.status === 'published'),
	]);

	// 各内容线内部按日期倒序,保证默认展示顺序稳定
	const byDateDesc = <T extends { data: { date: Date } }>(list: T[]): T[] =>
		list.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

	const items: SearchItem[] = [
		...byDateDesc(whyEntries).map((entry) => ({
			type: 'why' as const,
			label: 'WHY',
			serial: entry.data.id,
			title: entry.data.title,
			summary: '',
			category: getCategory(entry.data.category)?.name ?? '',
			tags: entry.data.tags,
			dateText: formatDate(entry.data.date),
			authors: formatAuthorNames(entry.data.authors),
			year: entry.data.date.getFullYear(),
			url: getWhyHref(entry),
		})),
		...byDateDesc(knowEntries).map((entry) => ({
			type: 'know' as const,
			label: 'Know',
			serial: entry.data.id,
			title: entry.data.title,
			summary: '',
			category: getCategory(entry.data.category)?.name ?? '',
			tags: entry.data.tags,
			dateText: formatDate(entry.data.date),
			authors: formatAuthorNames(entry.data.authors),
			year: entry.data.date.getFullYear(),
			url: getKnowHref(entry),
		})),
		...byDateDesc(newsEntries).map((entry) => ({
			type: 'news' as const,
			label: '新闻',
			serial: '',
			title: entry.data.title,
			summary: entry.data.summary ?? '',
			category: '',
			tags: [],
			dateText: formatDate(entry.data.date),
			authors: formatAuthorNames(entry.data.authors),
			year: entry.data.date.getFullYear(),
			url: getNewsHref(entry),
		})),
	];

	return new Response(JSON.stringify(items), {
		headers: { 'Content-Type': 'application/json; charset=utf-8' },
	});
};
