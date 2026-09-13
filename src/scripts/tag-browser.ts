/*
 * 标签页脚本(/tags/):客户端搜索 + 分页。
 * 构建期将全部标签分组内嵌为 JSON([data-tag-data]),页面 SSR 仅渲染第一页;
 * 搜索与翻页均在客户端重建列表,避免一次性输出全部 DOM。
 *
 * DOM 约定(与 pages/tags/index.astro 一致):
 * - 根容器 [data-tag-browser]
 * - 搜索框 [data-tag-search]、标签云 [data-tag-cloud]、状态行 [data-tag-status]
 * - 分组容器 [data-tag-groups]、空态 [data-tag-empty]、分页容器 [data-pager]
 */

interface TagItem {
	type: 'why' | 'know' | 'news';
	/** 编号(新闻无编号,不显示) */
	id?: string;
	title: string;
	href: string;
}

interface TagGroup {
	tag: string;
	items: TagItem[];
}

/** 每页标签数(与归档页每页条数一致) */
const PER_PAGE = 10;

const browserEl = document.querySelector<HTMLElement>('[data-tag-browser]');

if (browserEl) {
	const rootEl: HTMLElement = browserEl;
	const dataEl = rootEl.querySelector<HTMLScriptElement>('[data-tag-data]');
	const searchEl = rootEl.querySelector<HTMLInputElement>('[data-tag-search]');
	const cloudEl = rootEl.querySelector<HTMLElement>('[data-tag-cloud]');
	const statusEl = rootEl.querySelector<HTMLElement>('[data-tag-status]');
	const groupsEl = rootEl.querySelector<HTMLElement>('[data-tag-groups]');
	const emptyEl = rootEl.querySelector<HTMLElement>('[data-tag-empty]');
	const pagerEl = rootEl.querySelector<HTMLElement>('[data-pager]');

	let allGroups: TagGroup[] = [];
	try {
		allGroups = JSON.parse(dataEl?.textContent ?? '[]') as TagGroup[];
	} catch {
		allGroups = [];
	}

	let filtered: TagGroup[] = allGroups;
	let query = '';
	let page = 1;

	const totalPages = (): number => Math.max(1, Math.ceil(filtered.length / PER_PAGE));

	/** 按关键词过滤标签(名称包含匹配,忽略大小写) */
	function applyFilter(keyword: string): void {
		const text = keyword.trim().toLowerCase();
		filtered = text ? allGroups.filter((group) => group.tag.toLowerCase().includes(text)) : allGroups;
	}

	/** 构建标签云芯片(与 SSR 模板结构一致) */
	function buildChip(group: TagGroup): HTMLAnchorElement {
		const chip = document.createElement('a');
		chip.className = 'tag-chip';
		chip.href = `#tag-${group.tag}`;
		chip.dataset.tagChip = group.tag;
		chip.append(group.tag);

		const count = document.createElement('span');
		count.className = 'tag-chip-count';
		count.textContent = String(group.items.length);
		chip.append(count);
		return chip;
	}

	/** 构建分组卡片(与 SSR 模板结构一致) */
	function buildGroup(group: TagGroup): HTMLElement {
		const article = document.createElement('article');
		article.className = 'tag-group';
		article.id = `tag-${group.tag}`;

		const title = document.createElement('h2');
		title.className = 'tag-group-title';
		title.append(group.tag);

		const count = document.createElement('span');
		count.className = 'tag-group-count';
		count.textContent = `${group.items.length} 篇`;
		title.append(count);
		article.append(title);

		const list = document.createElement('ul');
		list.className = 'tag-links';
		for (const item of group.items) {
			const li = document.createElement('li');
			const link = document.createElement('a');
			link.href = item.href;
			if (item.id) {
				const serial = document.createElement('span');
				serial.className = `tag-serial is-${item.type}`;
				serial.textContent = item.id;
				link.append(serial);
			}
			link.append(item.title);
			li.append(link);
			list.append(li);
		}
		article.append(list);
		return article;
	}

	/** 重建分页按钮(样式复用归档页 .entries-pager) */
	function renderPager(): void {
		if (!pagerEl) return;
		const pages = totalPages();
		pagerEl.hidden = pages <= 1;
		if (pages <= 1) {
			pagerEl.replaceChildren();
			return;
		}

		const makeButton = (label: string, target: number, current: boolean): HTMLButtonElement => {
			const button = document.createElement('button');
			button.type = 'button';
			button.textContent = label;
			if (current) button.setAttribute('aria-current', 'page');
			button.addEventListener('click', () => goToPage(target));
			return button;
		};

		const nodes: HTMLButtonElement[] = [makeButton('上一页', page - 1, false)];
		for (let target = 1; target <= pages; target += 1) {
			nodes.push(makeButton(String(target), target, target === page));
		}
		nodes.push(makeButton('下一页', page + 1, false));
		pagerEl.replaceChildren(...nodes);
	}

	/** 更新状态行(搜索时显示匹配数) */
	function renderStatus(): void {
		if (!statusEl) return;
		const pages = totalPages();
		const scope = query ? `匹配 ${filtered.length} 个标签` : `共 ${filtered.length} 个标签`;
		statusEl.textContent = pages > 1 ? `${scope} · 第 ${page} / ${pages} 页` : scope;
	}

	/** 渲染当前页(标签云 + 分组 + 空态 + 状态 + 分页) */
	function render(): void {
		page = Math.min(Math.max(1, page), totalPages());
		const start = (page - 1) * PER_PAGE;
		const visible = filtered.slice(start, start + PER_PAGE);

		cloudEl?.replaceChildren(...visible.map(buildChip));
		groupsEl?.replaceChildren(...visible.map(buildGroup));
		if (emptyEl) emptyEl.hidden = filtered.length > 0;

		renderStatus();
		renderPager();
	}

	/** 页码与搜索状态同步到 URL(便于分享与刷新保留);keepHash 时保留锚点 */
	function syncUrl(keepHash: boolean): void {
		const url = new URL(window.location.href);
		if (query) {
			url.searchParams.set('q', query);
		} else {
			url.searchParams.delete('q');
		}
		if (page > 1) {
			url.searchParams.set('page', String(page));
		} else {
			url.searchParams.delete('page');
		}
		if (!keepHash) url.hash = '';
		history.replaceState(null, '', url);
	}

	/** 定位标签:同页直接滚动,跨页先切页再滚动(支持文章页 /tags/#tag-xxx 直达) */
	function locateTag(tag: string, smooth: boolean): void {
		const index = filtered.findIndex((group) => group.tag === tag);
		if (index < 0) return;
		const target = Math.floor(index / PER_PAGE) + 1;
		if (target !== page) {
			page = target;
			render();
			syncUrl(true);
		}
		const el = document.getElementById(`tag-${tag}`);
		if (!el) return;
		history.replaceState(null, '', `#tag-${encodeURIComponent(tag)}`);
		el.scrollIntoView(smooth ? { behavior: 'smooth', block: 'start' } : { block: 'start' });
	}

	function goToPage(target: number): void {
		page = target;
		render();
		syncUrl(false);
		rootEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	/** 从地址哈希解析标签名(#tag-xxx → xxx) */
	function decodeTagFromHash(): string | undefined {
		if (!window.location.hash.startsWith('#tag-')) return undefined;
		return decodeURIComponent(window.location.hash.slice('#tag-'.length));
	}

	// 芯片点击:事件委托(同页滚动;跨页先切页,定位准确后滚动)
	cloudEl?.addEventListener('click', (event) => {
		const chip = (event.target as HTMLElement).closest<HTMLElement>('[data-tag-chip]');
		if (!chip) return;
		event.preventDefault();
		const tag = chip.dataset.tagChip;
		if (tag) locateTag(tag, true);
	});

	// 搜索:实时过滤,回到第 1 页
	searchEl?.addEventListener('input', () => {
		query = searchEl.value.trim();
		applyFilter(query);
		page = 1;
		render();
		syncUrl(false);
	});

	// 外部锚点变化(手动改地址栏等)时兜底定位
	window.addEventListener('hashchange', () => {
		const tag = decodeTagFromHash();
		if (tag) locateTag(tag, true);
	});

	// 初始化:?q 回填搜索;锚点优先定位,其次 ?page
	function init(): void {
		const params = new URLSearchParams(window.location.search);
		query = params.get('q')?.trim() ?? '';
		if (query && searchEl) searchEl.value = query;
		applyFilter(query);

		const hashTag = decodeTagFromHash();
		if (hashTag) {
			const index = filtered.findIndex((group) => group.tag === hashTag);
			if (index >= 0) page = Math.floor(index / PER_PAGE) + 1;
		} else {
			const presetPage = Number(params.get('page'));
			if (Number.isFinite(presetPage) && presetPage >= 1) page = Math.floor(presetPage);
		}

		render();
		syncUrl(true);
		if (hashTag) locateTag(hashTag, true);
	}

	init();
}

// 标记为模块(而非全局脚本),避免与其它脚本的顶层变量名冲突
export {};
