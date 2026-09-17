import type { APIRoute } from 'astro';
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE, getCategory } from '../consts';
import { getKnowHref, getNewsHref, getWhyHref } from '../utils';

/*
 * RSS 订阅源:/rss.xml
 * 构建期聚合三条内容线(WHY / Know / 新闻)的已发布条目,按发布日期倒序输出;
 * 页面订阅入口:页脚「内容线」栏的「RSS 订阅」链接,
 * <head> 中另有 rel="alternate" 声明供阅读器自动发现。
 */

/** 从正文提取纯文本导语(与首页发现区同一策略:取前两个普通段落,跳过标题与组件行) */
const toExcerpt = (body: string | undefined, max = 140): string => {
	const paragraphs = (body ?? '')
		.replace(/\r\n?/g, '\n')
		.split(/\n{2,}/)
		.map((block) => block.trim())
		.filter((block) => block.length > 0 && !/^[#<!`|>-]/.test(block));
	const text = paragraphs
		.slice(0, 2)
		.join(' ')
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/[#*_>`~]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
	return text.length > max ? `${text.slice(0, max)}…` : text;
};

export const GET: APIRoute = async (context) => {
	const [whyEntries, knowEntries, newsEntries] = await Promise.all([
		getCollection('why', ({ data }) => data.status === 'published'),
		getCollection('know', ({ data }) => data.status === 'published'),
		getCollection('news', ({ data }) => data.status === 'published'),
	]);

	const items = [
		...whyEntries.map((entry) => ({
			title: entry.data.title,
			pubDate: entry.data.date,
			link: getWhyHref(entry),
			categories: [entry.data.id, getCategory(entry.data.category)?.name ?? '', ...entry.data.tags].filter(Boolean),
			description: toExcerpt(entry.body),
		})),
		...knowEntries.map((entry) => ({
			title: entry.data.title,
			pubDate: entry.data.date,
			link: getKnowHref(entry),
			categories: [entry.data.id, getCategory(entry.data.category)?.name ?? '', ...entry.data.tags].filter(Boolean),
			description: toExcerpt(entry.body),
		})),
		...newsEntries.map((entry) => ({
			title: entry.data.title,
			pubDate: entry.data.date,
			link: getNewsHref(entry),
			categories: [...entry.data.tags],
			description: entry.data.summary ?? toExcerpt(entry.body),
		})),
	].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

	return rss({
		title: `${SITE.name} | ${SITE.nameZh}`,
		description: SITE.description,
		site: context.site ?? SITE.url,
		items,
		customData: '<language>zh-cn</language>',
	});
};
