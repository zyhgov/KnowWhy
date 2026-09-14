/*
 * 文章分享交互:复制链接 / 二维码浮层 / 微信扫码提示 / 各平台分享跳转。
 * 仅在文章详情页(ArticleShare.astro)加载;二维码首次点击时才动态加载 uqr 生成 SVG(按需 chunk)。
 */

const root = document.querySelector<HTMLElement>('[data-share]');

if (root) {
	const toastEl = root.querySelector<HTMLElement>('[data-share-toast]');
	const modalEl = root.querySelector<HTMLElement>('[data-share-modal]');
	const modalTitleEl = root.querySelector<HTMLElement>('[data-share-modal-title]');
	const modalHintEl = root.querySelector<HTMLElement>('[data-share-modal-hint]');
	const qrBox = root.querySelector<HTMLElement>('[data-share-qrbox]');

	/** 分享地址(去掉锚点;运行时取,适配预览域名与自定义域名) */
	const pageUrl = (): string => window.location.href.split('#')[0];
	/** 分享文案:优先组件传入的纯标题,缺省回退页面标题 */
	const pageTitle = (): string => root.dataset.title || document.title;
	const q = (text: string): string => encodeURIComponent(text);

	/** 平台分享页地址(在新窗口打开) */
	const PLATFORM_URLS: Record<string, () => string> = {
		qq: () =>
			`https://connect.qq.com/widget/shareqq/index.html?url=${q(pageUrl())}&title=${q(pageTitle())}`,
		weibo: () =>
			`https://service.weibo.com/share/share.php?url=${q(pageUrl())}&title=${q(pageTitle())}`,
		x: () => `https://x.com/intent/post?url=${q(pageUrl())}&text=${q(pageTitle())}`,
		reddit: () =>
			`https://www.reddit.com/submit?url=${q(pageUrl())}&title=${q(pageTitle())}`,
	};

	let toastTimer = 0;

	/** 底部轻提示:显示 2.2 秒后淡出 */
	function showToast(message: string): void {
		if (!toastEl) return;
		window.clearTimeout(toastTimer);
		toastEl.textContent = message;
		toastEl.classList.add('is-open');
		toastTimer = window.setTimeout(() => toastEl.classList.remove('is-open'), 2200);
	}

	/** 复制当前页链接:优先 Clipboard API,失败回退 execCommand */
	async function copyLink(): Promise<boolean> {
		try {
			await navigator.clipboard.writeText(pageUrl());
			return true;
		} catch {
			const area = document.createElement('textarea');
			area.value = pageUrl();
			area.setAttribute('readonly', '');
			area.style.position = 'fixed';
			area.style.opacity = '0';
			document.body.appendChild(area);
			area.select();
			let ok = false;
			try {
				ok = document.execCommand('copy');
			} catch {
				ok = false;
			}
			area.remove();
			return ok;
		}
	}

	let qrPromise: Promise<string> | null = null;

	/** 生成(首次惰性加载 uqr)并填充当前页二维码 */
	async function ensureQr(): Promise<void> {
		if (!qrBox) return;
		qrPromise ??= import('uqr').then(({ renderSVG }) => renderSVG(pageUrl(), { border: 2 }));
		qrBox.innerHTML = await qrPromise;
	}

	/** 打开二维码浮层:kind 决定标题与提示文案 */
	function openModal(kind: 'qr' | 'wechat'): void {
		if (!modalEl) return;
		if (modalTitleEl) modalTitleEl.textContent = kind === 'wechat' ? '分享到微信' : '二维码分享';
		if (modalHintEl) {
			modalHintEl.textContent =
				kind === 'wechat'
					? '打开微信「扫一扫」,扫码打开本页后即可转发给好友'
					: '用手机扫码打开本页,或截图发给好友';
		}
		void ensureQr();
		modalEl.hidden = false;
		document.body.style.overflow = 'hidden';
	}

	function closeModal(): void {
		if (!modalEl || modalEl.hidden) return;
		modalEl.hidden = true;
		document.body.style.overflow = '';
	}

	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') closeModal();
	});

	modalEl?.addEventListener('click', (event) => {
		if ((event.target as HTMLElement).closest('[data-share-close]')) closeModal();
	});

	root.addEventListener('click', (event) => {
		const button = (event.target as HTMLElement).closest<HTMLElement>('[data-share-action]');
		if (!button) return;

		switch (button.dataset.shareAction) {
			case 'copy':
				void copyLink().then((ok) => {
					showToast(ok ? '链接已复制,粘贴即可分享' : '复制失败,请手动复制地址栏链接');
				});
				break;
			case 'qr':
				openModal('qr');
				break;
			case 'wechat':
				openModal('wechat');
				break;
			case 'instagram':
				// Instagram 无网页分享入口:复制链接后在 App 内粘贴
				void copyLink().then((ok) => {
					showToast(ok ? '链接已复制,打开 Instagram 粘贴即可分享' : '复制失败,请手动复制地址栏链接');
				});
				break;
			case 'platform': {
				const buildUrl = PLATFORM_URLS[button.dataset.sharePlatform ?? ''];
				if (buildUrl) window.open(buildUrl(), '_blank', 'noopener,noreferrer');
				break;
			}
		}
	});
}

// 显式导出使本文件成为模块:隔离顶层变量作用域,避免与其它全局脚本(如 related-random.ts)冲突
export {};
