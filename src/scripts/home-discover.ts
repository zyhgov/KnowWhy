/*
 * 首页「今日发现」:每日阅读 + 随机词条
 * - 数据来自页面内联 JSON(#discover-data,构建期由 index.astro 生成,含 WHY 与 Know 条目)
 * - 今日阅读:以本地日期为种子选择,同一天内固定、次日轮换
 * - 随机词条:随机选取;「换一条」按钮切换(淡出 → 换内容 → 淡入)
 */

/** 发现区条目(字段与 index.astro 内联数据一致) */
interface DiscoverItem {
	type: 'why' | 'know';
	label: string;
	serial: string;
	title: string;
	excerpt: string;
	category: string;
	tags: string[];
	url: string;
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const dataEl = document.getElementById('discover-data');

if (dataEl?.textContent) {
	let items: DiscoverItem[] = [];
	try {
		items = JSON.parse(dataEl.textContent) as DiscoverItem[];
	} catch {
		items = [];
	}

	if (items.length > 0) {
		initDiscover(items);
	}
}

function initDiscover(items: DiscoverItem[]): void {
	// ---- 今日阅读:本地日期做种子(如 20260912),同一天内固定 ----
	const now = new Date();
	const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
	const dailyIndex = seed % items.length;
	fillCard('daily', items[dailyIndex]);

	// ---- 随机词条:初始随机(避开今日阅读那条) ----
	let randomIndex = pickRandom(items.length, dailyIndex);
	fillCard('random', items[randomIndex]);

	const refreshBtn = document.getElementById('random-refresh');
	refreshBtn?.addEventListener('click', () => {
		if (items.length < 2) return;
		const next = pickRandom(items.length, randomIndex);
		randomIndex = next;
		swapCard('random', items[next]);
	});
}

/** 在 [0, length) 中随机取一个下标,可排除 exclude */
function pickRandom(length: number, exclude: number): number {
	if (length <= 1) return 0;
	let index = Math.floor(Math.random() * (length - 1));
	if (index >= exclude) index += 1;
	return index;
}

/** 用条目数据填充卡片(按 daily / random 前缀定位元素) */
function fillCard(prefix: 'daily' | 'random', item: DiscoverItem): void {
	const serial = document.getElementById(`${prefix}-serial`);
	if (serial) serial.textContent = item.serial;
	const title = document.getElementById(`${prefix}-title`);
	if (title) title.textContent = item.title;
	const excerpt = document.getElementById(`${prefix}-excerpt`);
	if (excerpt) excerpt.textContent = item.excerpt;
	const link = document.getElementById(`${prefix}-link`);
	if (link instanceof HTMLAnchorElement) link.href = item.url;
	const tags = document.getElementById(`${prefix}-tags`);
	if (tags) {
		tags.replaceChildren(
			...item.tags.map((tag) => {
				const li = document.createElement('li');
				li.textContent = tag;
				return li;
			}),
		);
	}
}

/** 带过渡地切换卡片内容(淡出 → 换内容 → 淡入,过渡由 CSS 完成) */
function swapCard(prefix: 'daily' | 'random', item: DiscoverItem): void {
	const content = document.querySelector(`#${prefix}-card .discover-content`);
	if (!(content instanceof HTMLElement) || reducedMotion) {
		fillCard(prefix, item);
		return;
	}
	content.classList.add('is-swapping');
	window.setTimeout(() => {
		fillCard(prefix, item);
		content.classList.remove('is-swapping');
	}, 170);
}
