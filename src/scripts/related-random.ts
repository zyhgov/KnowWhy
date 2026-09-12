/*
 * 文章底部"相关内容"增强脚本:
 * 从内嵌候选池(全部已发布 WHY + Know,已排除当前文章)随机抽取展示,
 * 点击"换一批"重新随机;只更新链接文本与地址,不重建 DOM。
 */

interface RelatedItem {
	id: string;
	title: string;
	href: string;
}

const root = document.querySelector<HTMLElement>('[data-related]');

if (root) {
	const dataEl = root.querySelector<HTMLScriptElement>('[data-related-pool]');
	const button = root.querySelector<HTMLButtonElement>('[data-related-refresh]');
	const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-related-link]'));
	const pool: RelatedItem[] = dataEl ? JSON.parse(dataEl.textContent ?? '[]') : [];

	if (button && pool.length > 0 && links.length > 0) {
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		let lastIds = links.map((link) => link.dataset.key ?? '');

		// Fisher-Yates 洗牌后取前 N
		const pick = (): RelatedItem[] => {
			const shuffled = [...pool];
			for (let i = shuffled.length - 1; i > 0; i -= 1) {
				const j = Math.floor(Math.random() * (i + 1));
				[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
			}
			return shuffled.slice(0, links.length);
		};

		button.addEventListener('click', () => {
			let next = pick();
			// 池大于展示数时,避免与当前一批完全相同
			if (pool.length > links.length && next.map((item) => item.id).join() === lastIds.join()) {
				next = pick();
			}
			lastIds = next.map((item) => item.id);

			links.forEach((link, index) => {
				const item = next[index];
				if (!item) return;
				link.href = item.href;
				link.textContent = `${item.id}・${item.title}`;
				link.dataset.key = item.id;
			});

			// 重启动画:先移除类并强制重排,再加回触发淡入
			if (!reduced) {
				root.classList.remove('is-swapping');
				void root.offsetWidth;
				root.classList.add('is-swapping');
			}
		});
	}
}
