import type { CollectionEntry } from 'astro:content';

/**
 * 从内容条目生成 URL slug。
 * 约定:内容文件放置在 src/content/why/<category>/ 下,
 * 文件的 glob id 形如 `tech/why-airplane-windows-round`,去除首段分类目录后即为 slug。
 */
export function getWhySlug(entry: CollectionEntry<'why'>): string {
	const segments = entry.id.split('/');
	return segments.length > 1 ? segments.slice(1).join('/') : entry.id;
}

/** 内容详情页路径(SEO 友好,统一尾斜杠) */
export function getWhyHref(entry: CollectionEntry<'why'>): string {
	return `/${entry.data.category}/${getWhySlug(entry)}/`;
}

/** Know 详情页路径:/know/<slug>/ */
export function getKnowHref(entry: CollectionEntry<'know'>): string {
	return `/know/${entry.id}/`;
}

/** 新闻详情页路径:/news/<slug>/ */
export function getNewsHref(entry: CollectionEntry<'news'>): string {
	return `/news/${entry.id}/`;
}

/** 列表排序:最新在前(日期倒序;同日按编号倒序,新编号优先) */
export function byNewest<T extends { data: { date: Date; id: string } }>(a: T, b: T): number {
	return b.data.date.valueOf() - a.data.date.valueOf() || b.data.id.localeCompare(a.data.id);
}

/** 中文日期格式,如「2026年9月12日」 */
export function formatDate(date: Date): string {
	return new Intl.DateTimeFormat('zh-CN', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	}).format(date);
}
