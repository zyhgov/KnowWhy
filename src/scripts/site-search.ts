/*
 * 站内搜索脚本:拉取 /search-index.json,按关键词实时过滤并渲染结果。
 * 由 /search/ 页面引入(结果卡片与自定义下拉样式在 global.css)。
 */

/** 与 src/pages/search-index.json.ts 输出的字段保持一致 */
interface SearchItem {
	type: 'why' | 'know' | 'news';
	label: string;
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

/** 自定义筛选下拉:根节点 + 触发按钮 + 当前值文案 + 选项面板(结构见 search/index.astro) */
interface FilterDropdown {
	root: HTMLElement;
	trigger: HTMLButtonElement;
	label: HTMLElement;
	panel: HTMLElement;
}

const input = document.querySelector<HTMLInputElement>('#site-search-input');
const statusEl = document.querySelector<HTMLElement>('[data-search-status]');
const resultsEl = document.querySelector<HTMLElement>('[data-search-results]');

if (input && statusEl && resultsEl) {
	// 非空别名:TypeScript 不在嵌套函数内保留收窄,供内部函数统一引用
	const inputEl: HTMLInputElement = input;
	const statusNode: HTMLElement = statusEl;
	const resultsNode: HTMLElement = resultsEl;

	let items: SearchItem[] = [];
	/** 下拉选中变化后的回调(内部调用 search,赋值于下方) */
	let notify: () => void = () => {};

	/** 读取页面上的自定义下拉组件(内容线 / 分类 / 年份,组件缺失时返回 undefined) */
	function findDropdown(name: string): FilterDropdown | undefined {
		const root = document.querySelector<HTMLElement>(`[data-filter-${name}]`);
		const trigger = root?.querySelector<HTMLButtonElement>('.filter-select-trigger');
		const label = root?.querySelector<HTMLElement>('.filter-select-label');
		const panel = root?.querySelector<HTMLElement>('.filter-select-options');
		if (!root || !trigger || !label || !panel) return undefined;
		return { root, trigger, label, panel };
	}

	const dropdownType = findDropdown('type');
	const dropdownCategory = findDropdown('category');
	const dropdownYear = findDropdown('year');
	const allDropdowns = [dropdownType, dropdownCategory, dropdownYear];

	/** 当前选中值('all' 表示未筛选) */
	function valueOf(dropdown: FilterDropdown | undefined): string {
		return dropdown?.root.dataset.value ?? 'all';
	}

	/** 以代码方式设置选中值(初始化回填 URL 参数时使用):同步按钮文案与选项高亮 */
	function setValue(dropdown: FilterDropdown | undefined, value: string): void {
		if (!dropdown) return;
		const target = [...dropdown.panel.querySelectorAll<HTMLElement>('[role="option"]')].find(
			(option) => option.dataset.value === value,
		);
		if (!target) return;
		dropdown.root.dataset.value = value;
		dropdown.label.textContent = target.textContent ?? '';
		for (const option of dropdown.panel.querySelectorAll('[role="option"]')) {
			option.setAttribute('aria-selected', String(option === target));
		}
	}

	/** 收起一个下拉 */
	function closeDropdown(dropdown: FilterDropdown): void {
		dropdown.panel.hidden = true;
		dropdown.root.classList.remove('is-open');
		dropdown.trigger.setAttribute('aria-expanded', 'false');
	}

	/** 展开一个下拉(自动收起其它;可选把焦点移到当前选中项) */
	function openDropdown(dropdown: FilterDropdown, focusSelected = false): void {
		for (const other of allDropdowns) {
			if (other && other !== dropdown) closeDropdown(other);
		}
		dropdown.panel.hidden = false;
		dropdown.root.classList.add('is-open');
		dropdown.trigger.setAttribute('aria-expanded', 'true');
		if (focusSelected) {
			dropdown.panel.querySelector<HTMLElement>('[aria-selected="true"]')?.focus();
		}
	}

	/** 选中某一项:同步文案与高亮,收起面板并通知刷新搜索结果 */
	function choose(dropdown: FilterDropdown, option: HTMLElement): void {
		dropdown.root.dataset.value = option.dataset.value ?? 'all';
		dropdown.label.textContent = option.textContent ?? '';
		for (const each of dropdown.panel.querySelectorAll('[role="option"]')) {
			each.setAttribute('aria-selected', String(each === option));
		}
		closeDropdown(dropdown);
		dropdown.trigger.focus();
		notify();
	}

	/** 绑定下拉的全部交互:点击切换 / 选项选择 / 键盘导航(开关状态以容器 is-open 类为准) */
	function initDropdown(dropdown: FilterDropdown): void {
		const { root, trigger, panel } = dropdown;
		closeDropdown(dropdown);

		trigger.addEventListener('click', (event) => {
			// 阻止冒泡:避免与「按下外部关闭」逻辑相互干扰
			event.stopPropagation();
			if (root.classList.contains('is-open')) {
				closeDropdown(dropdown);
			} else {
				openDropdown(dropdown);
			}
		});

		// 键盘:上下键直接展开并把焦点移到当前选中项
		trigger.addEventListener('keydown', (event) => {
			if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
				event.preventDefault();
				openDropdown(dropdown, true);
			}
		});

		panel.addEventListener('click', (event) => {
			const option = (event.target as HTMLElement).closest<HTMLElement>('[role="option"]');
			if (option) choose(dropdown, option);
		});

		// 键盘:面板内上下键循环移动,回车 / 空格选中
		panel.addEventListener('keydown', (event) => {
			const current = (event.target as HTMLElement).closest<HTMLElement>('[role="option"]');
			if (!current) return;
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				choose(dropdown, current);
			} else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
				event.preventDefault();
				const options = [...panel.querySelectorAll<HTMLElement>('[role="option"]')];
				const step = event.key === 'ArrowDown' ? 1 : -1;
				const next = (options.indexOf(current) + step + options.length) % options.length;
				options[next]?.focus();
			}
		});

		// Esc 收起并归还焦点
		root.addEventListener('keydown', (event) => {
			if (event.key === 'Escape') {
				closeDropdown(dropdown);
				trigger.focus();
			}
		});
	}

	for (const dropdown of allDropdowns) {
		if (dropdown) initDropdown(dropdown);
	}

	// 按下页面其它位置时收起所有下拉(pointerdown 先于 click 触发,时序最可靠)
	document.addEventListener('pointerdown', (event) => {
		const target = event.target as Node;
		for (const dropdown of allDropdowns) {
			if (dropdown && !dropdown.root.contains(target)) closeDropdown(dropdown);
		}
	});

	/** 拼接一条索引项的全部可搜字段(小写),供关键词匹配 */
	function haystackOf(item: SearchItem): string {
		return [
			item.title,
			item.summary,
			item.serial,
			item.category,
			item.tags.join(' '),
			item.authors,
			item.label,
		]
			.join(' ')
			.toLowerCase();
	}

	/** 构建一条结果卡片 */
	function buildHit(item: SearchItem): HTMLLIElement {
		const li = document.createElement('li');
		const link = document.createElement('a');
		link.className = 'search-hit';
		link.href = item.url;

		const meta = document.createElement('div');
		meta.className = 'hit-meta';

		const badge = document.createElement('span');
		badge.className = `hit-badge is-${item.type}`;
		badge.textContent = item.label;
		meta.append(badge);

		if (item.serial) {
			const serial = document.createElement('span');
			serial.className = 'hit-serial';
			serial.textContent = item.serial;
			meta.append(serial);
		}

		const date = document.createElement('span');
		date.textContent = item.dateText;
		meta.append(date);

		if (item.authors) {
			const authors = document.createElement('span');
			authors.textContent = item.authors;
			meta.append(authors);
		}

		const title = document.createElement('h2');
		title.className = 'hit-title';
		title.textContent = item.title;

		link.append(meta, title);

		if (item.summary) {
			const summary = document.createElement('p');
			summary.className = 'hit-summary';
			summary.textContent = item.summary;
			link.append(summary);
		}

		li.append(link);
		return li;
	}

	/** 渲染搜索结果;空关键词且无筛选条件时恢复初始提示 */
	function render(keyword: string): void {
		const words = keyword.toLowerCase().split(/\s+/).filter(Boolean);
		const type = valueOf(dropdownType);
		const category = valueOf(dropdownCategory);
		const year = valueOf(dropdownYear);
		const hasFilter = type !== 'all' || category !== 'all' || year !== 'all';

		if (words.length === 0 && !hasFilter) {
			resultsNode.replaceChildren();
			resultsNode.hidden = true;
			statusNode.textContent = '输入关键词开始搜索。';
			return;
		}

		// 筛选(类型/分类/年份)与关键词为「与」关系;多关键词(空格分隔)需全部命中
		const hits = items.filter((item) => {
			if (type !== 'all' && item.type !== type) return false;
			if (category !== 'all' && item.category !== category) return false;
			if (year !== 'all' && String(item.year) !== year) return false;
			if (words.length === 0) return true;
			const haystack = haystackOf(item);
			return words.every((word) => haystack.includes(word));
		});

		if (hits.length === 0) {
			resultsNode.replaceChildren();
			resultsNode.hidden = true;
			statusNode.textContent =
				words.length > 0 ? `没有找到与「${keyword}」相关的内容。` : '没有符合筛选条件的内容。';
			return;
		}

		resultsNode.replaceChildren(...hits.map(buildHit));
		resultsNode.hidden = false;
		statusNode.textContent = `共 ${hits.length} 条结果。`;
	}

	/** 搜索并同步 URL(关键词与筛选条件),便于分享与刷新保留 */
	function search(keyword: string): void {
		render(keyword);
		const url = new URL(window.location.href);
		const setOrDelete = (key: string, value: string): void => {
			if (value && value !== 'all') {
				url.searchParams.set(key, value);
			} else {
				url.searchParams.delete(key);
			}
		};
		setOrDelete('q', keyword.trim());
		setOrDelete('type', valueOf(dropdownType));
		setOrDelete('category', valueOf(dropdownCategory));
		setOrDelete('year', valueOf(dropdownYear));
		history.replaceState(null, '', url);
	}

	notify = () => search(inputEl.value);
	inputEl.addEventListener('input', () => search(inputEl.value));

	/** 生成一个下拉选项 li(与模板中的静态选项结构一致) */
	function makeOption(text: string, value: string): HTMLLIElement {
		const li = document.createElement('li');
		li.setAttribute('role', 'option');
		li.setAttribute('aria-selected', 'false');
		li.tabIndex = -1;
		li.dataset.value = value;
		li.textContent = text;
		return li;
	}

	/** 年份下拉选项:从索引数据提取(倒序),「全部年份」固定第一项 */
	function fillYears(): void {
		const dropdown = dropdownYear;
		if (!dropdown) return;
		const years = [...new Set(items.map((item) => item.year))].sort((a, b) => b - a);
		const nodes: HTMLLIElement[] = [makeOption('全部年份', 'all')];
		for (const year of years) {
			nodes.push(makeOption(String(year), String(year)));
		}
		dropdown.panel.replaceChildren(...nodes);
		// 重建后同步高亮与按钮文案(保持当前值,通常为初始 all)
		setValue(dropdown, valueOf(dropdown));
	}

	fetch('/search-index.json')
		.then((response) => {
			if (!response.ok) throw new Error(String(response.status));
			return response.json() as Promise<SearchItem[]>;
		})
		.then((data) => {
			items = data;
			fillYears();
			// 支持 /search/?q=...&type=...&category=...&year=... 直达与刷新保留
			const params = new URLSearchParams(window.location.search);
			const preset = params.get('q') ?? '';
			if (preset) inputEl.value = preset;
			const presetType = params.get('type');
			if (presetType) setValue(dropdownType, presetType);
			const presetCategory = params.get('category');
			if (presetCategory) setValue(dropdownCategory, presetCategory);
			const presetYear = params.get('year');
			if (presetYear) setValue(dropdownYear, presetYear);
			if (['q', 'type', 'category', 'year'].some((key) => params.has(key))) {
				search(inputEl.value);
			}
		})
		.catch(() => {
			statusNode.textContent = '搜索索引加载失败,请刷新重试。';
		});
}
