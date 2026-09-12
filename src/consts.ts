// 全站共享常量:站点信息 + 分类定义(单一数据源)

export const SITE = {
	name: 'KnowWhy',
	nameZh: '知其所以然',
	tagline: '知其然,更要知其所以然',
	description:
		'KnowWhy|知其所以然 —— 用一个「为什么」探索世界。记录日常、科技、自然、社会、心智与元问题背后的原理与答案。',
	url: 'https://knowwhy.zyhorg.cn',
	/** 作者 */
	author: '杖雍皓',
	/** 运行维护方 */
	maintainer: '联合库 UNHub',
	/** 联系邮箱 */
	email: 'info@zyhorg.cn',
} as const;

/** 六大分类,slug 必须与 src/content.config.ts 中 category 枚举保持一致;topics 为子话题(内容规划见 play/002.md) */
export const CATEGORIES = [
	{
		slug: 'everyday',
		name: '日常',
		description: '生活中习以为常,却从未深究的小事。',
		topics: ['家居日用', '饮食相关', '出行交通', '身体感知', '生活常识'],
		/** 主题色:deep 用于图标/数字等强调,soft 用于卡片底色 */
		tone: { deep: '#15803d', soft: '#dcfce7' },
	},
	{
		slug: 'tech',
		name: '科技',
		description: '技术、工程与设计背后的原理与答案。',
		topics: ['数码硬件', '网络通信', '软件系统', '前沿技术', '工程设计'],
		tone: { deep: '#1d4ed8', soft: '#dbeafe' },
	},
	{
		slug: 'nature',
		name: '自然',
		description: '生物、气候与地球运转的规律。',
		topics: ['天文宇宙', '气象地理', '动物行为', '植物生态', '物理化学'],
		tone: { deep: '#0f766e', soft: '#ccfbf1' },
	},
	{
		slug: 'society',
		name: '社会',
		description: '制度、文化与群体行为的由来。',
		topics: ['规则制度', '历史文化', '经济商业', '群体心理', '公共事务'],
		tone: { deep: '#7c3aed', soft: '#ede9fe' },
	},
	{
		slug: 'mind',
		name: '心智',
		description: '认知、情绪与思维方式的研究。',
		topics: ['认知错觉', '情绪心理', '思维逻辑', '行为习惯', '感知机制'],
		tone: { deep: '#be185d', soft: '#fce7f3' },
	},
	{
		slug: 'meta',
		name: '元',
		description: '关于 KnowWhy 本身与知识方法论的记录。',
		topics: ['站点相关', '知识方法', '创作幕后', '读者互动'],
		tone: { deep: '#475569', soft: '#e2e8f0' },
	},
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]['slug'];

/** 按 slug 查找分类元信息 */
export function getCategory(slug: string) {
	return CATEGORIES.find((category) => category.slug === slug);
}

/**
 * 作者注册表:内容 frontmatter 的 authors 数组填 key(支持多作者),头像文件放 public/author/
 * 新增作者:在此追加条目,并把头像放到对应路径。
 */
export interface Author {
	/** 显示名 */
	name: string;
	/** 头像路径(public 下,建议正方形) */
	avatar: string;
	/** 联系邮箱(可选,署名行显示 mailto 链接) */
	email?: string;
	/** 相关网址(可选,署名行显示外链) */
	url?: string;
}

export const AUTHORS: Record<string, Author> = {
	zyhorg: {
		name: '杖雍皓',
		avatar: '/author/zyhorg.jpg',
		email: 'info@zyhorg.cn',
	},
	unhub: {
		name: '联合库UNHub Newsroom',
		avatar: '/author/UNHub-Newsroom-logo.jpg',
		url: 'https://news.zyhorg.cn/',
	},
};

/** 按 key 查找作者元信息;未注册的 key 返回 undefined */
export function getAuthor(key: string): Author | undefined {
	return AUTHORS[key];
}

/** 作者 key 数组 → 显示名(顿号连接);未注册的 key 原样保留,便于排查拼写 */
export function formatAuthorNames(keys: string[]): string {
	return keys.map((key) => getAuthor(key)?.name ?? key).join('、');
}
