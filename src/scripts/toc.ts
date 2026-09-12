/*
 * 文章目录(TOC)增强脚本:
 * 1. 测量固定导航栏高度写入 --header-h(CSS 用于粘滞偏移与锚点留白,窄屏导航换行时高度会变);
 * 2. 滚动时高亮当前章节(scrollspy),并同步按钮条上的章节名;
 * 3. 点击目录项平滑滚动定位并收起面板;面板展开时支持外部点击 / Esc 关闭。
 */

const header = document.querySelector<HTMLElement>('.site-header');

// 导航栏高度 → CSS 变量;resize 时同步(窄屏 header 变两行)
const syncHeaderHeight = (): void => {
	document.documentElement.style.setProperty('--header-h', `${header?.offsetHeight ?? 64}px`);
};
syncHeaderHeight();
window.addEventListener('resize', syncHeaderHeight);

const toc = document.querySelector<HTMLDetailsElement>('details[data-toc]');

if (toc) {
	const current = toc.querySelector<HTMLElement>('[data-toc-current]');
	const links = Array.from(toc.querySelectorAll<HTMLAnchorElement>('[data-toc-link]'));

	const entries = links
		.map((link) => ({ link, target: document.getElementById(link.dataset.slug ?? '') }))
		.filter((entry): entry is { link: HTMLAnchorElement; target: HTMLElement } => entry.target !== null);

	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const close = (): void => {
		toc.open = false;
	};

	// 点击目录项:先收起面板,再按"导航栏 + 目录条"实际高度精确滚动,标题恰好停在目录条下方
	for (const { link, target } of entries) {
		link.addEventListener('click', (event) => {
			event.preventDefault();
			close();
			// 读高度会强制刷新布局(收起后目录条变矮、目标位置随之上移),再计算绝对滚动位置
			const headerH = header?.offsetHeight ?? 0;
			const tocH = toc.offsetHeight;
			const top = target.getBoundingClientRect().top + window.scrollY - headerH - tocH - 12;
			window.scrollTo({ top: Math.max(top, 0), behavior: reduced ? 'auto' : 'smooth' });
			history.replaceState(null, '', `#${target.id}`);
		});
	}

	// 外部点击 / Esc 关闭展开的面板
	document.addEventListener('click', (event) => {
		if (toc.open && event.target instanceof Node && !toc.contains(event.target)) {
			close();
		}
	});
	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape' && toc.open) {
			close();
		}
	});

	// scrollspy:高亮"最后一个已越过阈值线"的标题;页面滚到底时高亮最后一项
	let ticking = false;
	const update = (): void => {
		ticking = false;
		if (entries.length === 0) return;

		const offset = (header?.offsetHeight ?? 64) + toc.offsetHeight + 24;
		let active = 0;
		entries.forEach((entry, index) => {
			if (entry.target.getBoundingClientRect().top <= offset) {
				active = index;
			}
		});
		if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
			active = entries.length - 1;
		}

		entries.forEach((entry, index) => {
			entry.link.classList.toggle('is-active', index === active);
		});
		// 同步按钮条上的当前章节名;面板展开时让高亮项保持在面板可视区内
		const activeEntry = entries[active];
		if (current && activeEntry) {
			current.textContent = activeEntry.link.textContent;
		}
		if (toc.open && activeEntry) {
			activeEntry.link.scrollIntoView({ block: 'nearest' });
		}
	};

	const onScroll = (): void => {
		if (!ticking) {
			ticking = true;
			requestAnimationFrame(update);
		}
	};
	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', onScroll);
	update();
}
