/*
 * 窗口式分页构建器(全站共用):由 tag-browser / source-browser / entries-browser 调用。
 * 经典布局——首页 | 上一页 | 页码窗口(含省略号) | 下一页 | 末页 | 页码选择跳转。
 * 总页数 ≤ 7 时全部显示;当前页以 aria-current 标记;处于首页/末页时对应按钮禁用。
 * 样式见 global.css 的 .entries-pager 段(动态构建节点必须用全局样式)。
 */

export interface PagerOptions {
	/** 当前页(从 1 起) */
	page: number;
	/** 总页数(≥1) */
	totalPages: number;
	/** 跳页回调(目标页保证在 1..totalPages 内) */
	onGo: (target: number) => void;
}

/** 计算页码窗口:始终保留首页与末页,当前页两侧各展开 1 个,间隙折叠为省略号 */
export function pageWindow(page: number, totalPages: number): Array<number | 'dots'> {
	if (totalPages <= 7) {
		return Array.from({ length: totalPages }, (_, index) => index + 1);
	}

	const items: Array<number | 'dots'> = [1];
	const start = Math.max(2, page - 1);
	const end = Math.min(totalPages - 1, page + 1);
	if (start > 2) items.push('dots');
	for (let target = start; target <= end; target += 1) items.push(target);
	if (end < totalPages - 1) items.push('dots');
	items.push(totalPages);
	return items;
}

/** 构建分页控件组(按钮 + 页码窗口 + 跳转下拉) */
export function buildPager({ page, totalPages, onGo }: PagerOptions): DocumentFragment {
	const fragment = document.createDocumentFragment();

	const makeButton = (
		label: string,
		target: number,
		state: { current?: boolean; disabled?: boolean } = {},
	): HTMLButtonElement => {
		const button = document.createElement('button');
		button.type = 'button';
		button.textContent = label;
		if (state.current) button.setAttribute('aria-current', 'page');
		if (state.disabled) {
			button.disabled = true;
		} else {
			button.addEventListener('click', () => onGo(target));
		}
		return button;
	};

	// 跳到最前 / 逐页后退
	fragment.append(makeButton('首页', 1, { disabled: page === 1 }));
	fragment.append(makeButton('上一页', page - 1, { disabled: page === 1 }));

	// 页码窗口:数字按钮 + 省略号占位
	for (const item of pageWindow(page, totalPages)) {
		if (item === 'dots') {
			const dots = document.createElement('span');
			dots.className = 'pager-dots';
			dots.textContent = '…';
			dots.setAttribute('aria-hidden', 'true');
			fragment.append(dots);
			continue;
		}
		fragment.append(makeButton(String(item), item, { current: item === page }));
	}

	// 逐页前进 / 跳到最后
	fragment.append(makeButton('下一页', page + 1, { disabled: page === totalPages }));
	fragment.append(makeButton('末页', totalPages, { disabled: page === totalPages }));

	// 页码选择跳转:选中即跳转(选项值始终在 1..totalPages 内)
	const select = document.createElement('select');
	select.className = 'pager-jump';
	select.setAttribute('aria-label', '跳转到指定页');
	for (let target = 1; target <= totalPages; target += 1) {
		const option = document.createElement('option');
		option.value = String(target);
		option.textContent = `第 ${target} 页`;
		if (target === page) option.selected = true;
		select.append(option);
	}
	select.addEventListener('change', () => onGo(Number(select.value)));
	fragment.append(select);

	return fragment;
}
