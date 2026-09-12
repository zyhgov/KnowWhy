/*
 * 归档页共用脚本:条目「卡片/列表」双视图切换 + 客户端分页。
 * 由 /why/、/know/、/news/ 三个页面引入。
 *
 * DOM 约定:
 * - 根容器 .entries-browser(可选 data-per-page 指定每页条数,默认 10;
 *   可选 data-default-view="card"|"list" 指定无本地偏好时的默认视图)
 * - 视图面板 [data-view-panel="card"(卡片网格) | "list"(行式)]
 * - 条目 [data-entry](每个面板内按 DOM 顺序独立分页)
 * - 视图切换按钮 [data-view-btn]
 * - 分页容器 [data-pager]、状态文字 [data-page-status]
 */

// v3:默认视图按页面 data-default-view 区分,与 v2 键区分(旧值默认语义不同)
const VIEW_KEY = 'knowwhy:entries-view-v3';

function setupBrowser(root: HTMLElement): void {
	const perPage = Number(root.dataset.perPage) || 10;
	const defaultView: 'card' | 'list' = root.dataset.defaultView === 'card' ? 'card' : 'list';
	const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-view-panel]'));
	const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-view-btn]'));
	const pager = root.querySelector<HTMLElement>('[data-pager]');
	const status = root.querySelector<HTMLElement>('[data-page-status]');

	// 每个面板内的条目列表(列表与表格面板各自独立编号,分页同步)
	const itemsByPanel = new Map<HTMLElement, HTMLElement[]>();
	let total = 0;
	for (const panel of panels) {
		const items = Array.from(panel.querySelectorAll<HTMLElement>('[data-entry]'));
		itemsByPanel.set(panel, items);
		total = Math.max(total, items.length);
	}

	const totalPages = Math.max(1, Math.ceil(total / perPage));
	let page = 1;

	// 视图模式全站记忆;无本地偏好时用页面默认视图(why/know=卡片,新闻=列表)
	function readView(fallback: 'card' | 'list'): 'list' | 'card' {
		try {
			const stored = localStorage.getItem(VIEW_KEY);
			if (stored === 'card' || stored === 'list') return stored;
		} catch {
			// 隐私模式下存储不可用
		}
		return fallback;
	}

	let view = readView(defaultView);

	function applyView(): void {
		for (const panel of panels) {
			panel.hidden = panel.dataset.viewPanel !== view;
		}
		for (const button of buttons) {
			button.setAttribute('aria-pressed', String(button.dataset.viewBtn === view));
		}
	}

	function renderPager(): void {
		if (!pager) return;
		pager.hidden = totalPages <= 1;
		if (totalPages <= 1) return;

		const makeButton = (label: string, target: number, current: boolean): HTMLButtonElement => {
			const button = document.createElement('button');
			button.type = 'button';
			button.textContent = label;
			if (current) button.setAttribute('aria-current', 'page');
			button.addEventListener('click', () => goTo(target));
			return button;
		};

		const nodes: HTMLButtonElement[] = [makeButton('上一页', page - 1, false)];
		for (let target = 1; target <= totalPages; target += 1) {
			nodes.push(makeButton(String(target), target, target === page));
		}
		nodes.push(makeButton('下一页', page + 1, false));
		pager.replaceChildren(...nodes);
	}

	function applyPage(): void {
		for (const items of itemsByPanel.values()) {
			items.forEach((element, index) => {
				element.hidden = Math.floor(index / perPage) + 1 !== page;
			});
		}
		if (status) {
			status.textContent =
				totalPages > 1 ? `共 ${total} 条 · 第 ${page} / ${totalPages} 页` : `共 ${total} 条`;
		}
		renderPager();
	}

	function goTo(target: number): void {
		page = Math.min(Math.max(1, target), totalPages);
		applyPage();
		root.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	for (const button of buttons) {
		button.addEventListener('click', () => {
			view = button.dataset.viewBtn === 'card' ? 'card' : 'list';
			try {
				localStorage.setItem(VIEW_KEY, view);
			} catch {
				// 隐私模式下存储不可用时忽略
			}
			applyView();
		});
	}

	applyView();
	applyPage();
}

for (const root of document.querySelectorAll<HTMLElement>('.entries-browser')) {
	setupBrowser(root);
}
