/*
 * 信息来源页脚本(/sources/):客户端分页。
 * 构建期将全部来源分组内嵌为 JSON([data-source-data]),页面 SSR 仅渲染第一页;
 * 翻页在客户端重建列表,避免一次性输出全部 DOM。
 *
 * DOM 约定(与 pages/sources.astro 一致):
 * - 根容器 [data-source-browser]
 * - 状态行 [data-source-status]、列表容器 [data-source-list]、分页容器 [data-pager]
 */

interface SourceLink {
	name: string;
	url: string;
}

interface SourceGroup {
	type: 'why' | 'know';
	id: string;
	title: string;
	href: string;
	sources: SourceLink[];
}

/** 每页条目数(与归档页每页条数一致) */
const PER_PAGE = 10;

const browserEl = document.querySelector<HTMLElement>('[data-source-browser]');

if (browserEl) {
	const rootEl: HTMLElement = browserEl;
	const dataEl = rootEl.querySelector<HTMLScriptElement>('[data-source-data]');
	const statusEl = rootEl.querySelector<HTMLElement>('[data-source-status]');
	const listEl = rootEl.querySelector<HTMLElement>('[data-source-list]');
	const pagerEl = rootEl.querySelector<HTMLElement>('[data-pager]');

	let groups: SourceGroup[] = [];
	try {
		groups = JSON.parse(dataEl?.textContent ?? '[]') as SourceGroup[];
	} catch {
		groups = [];
	}

	let page = 1;

	const totalPages = (): number => Math.max(1, Math.ceil(groups.length / PER_PAGE));

	/** 构建一篇来源卡片(与 SSR 模板结构一致) */
	function buildGroup(group: SourceGroup): HTMLElement {
		const article = document.createElement('article');
		article.className = 'source-group';

		const title = document.createElement('h2');
		title.className = 'source-title';

		const serial = document.createElement('span');
		serial.className = `source-serial is-${group.type}`;
		serial.textContent = group.id;

		const link = document.createElement('a');
		link.href = group.href;
		link.textContent = group.title;

		title.append(serial, link);
		article.append(title);

		const list = document.createElement('ul');
		list.className = 'source-links';
		for (const source of group.sources) {
			const li = document.createElement('li');
			const a = document.createElement('a');
			a.href = source.url;
			a.target = '_blank';
			a.rel = 'noopener noreferrer';
			a.textContent = source.name;
			li.append(a);
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

	/** 渲染当前页(列表 + 状态 + 分页) */
	function render(): void {
		page = Math.min(Math.max(1, page), totalPages());
		const start = (page - 1) * PER_PAGE;
		listEl?.replaceChildren(...groups.slice(start, start + PER_PAGE).map(buildGroup));

		if (statusEl) {
			const pages = totalPages();
			statusEl.textContent =
				pages > 1
					? `共 ${groups.length} 篇文章 · 第 ${page} / ${pages} 页`
					: `共 ${groups.length} 篇文章`;
		}
		renderPager();
	}

	function goToPage(target: number): void {
		page = target;
		render();
		syncUrl();
		rootEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	/** 页码同步到 URL(便于分享与刷新保留) */
	function syncUrl(): void {
		const url = new URL(window.location.href);
		if (page > 1) {
			url.searchParams.set('page', String(page));
		} else {
			url.searchParams.delete('page');
		}
		history.replaceState(null, '', url);
	}

	// 初始化:?page 直达与刷新保留
	const presetPage = Number(new URLSearchParams(window.location.search).get('page'));
	if (Number.isFinite(presetPage) && presetPage >= 1) page = Math.floor(presetPage);
	render();
}

// 标记为模块(而非全局脚本),避免与其它脚本的顶层变量名冲突
export {};
