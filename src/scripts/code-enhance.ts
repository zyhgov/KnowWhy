/*
 * 代码块增强:为文章正文内 Shiki 高亮块(pre.astro-code)追加工具条——左上语言标签 + 右上复制按钮。
 * 行号不走 JS:由全局样式对 Shiki 每行的 .line 用 CSS 计数器渲染,伪元素不参与复制/选中,粘贴即纯代码;
 * 复制优先 Clipboard API,失败回退 execCommand,反馈直接切换按钮文案(复制 → 已复制 / 复制失败)。
 * Mermaid 围栏已在 Astro 配置中排除出 Shiki 高亮(渲染后无 astro-code 类),由 mermaid-render.ts 单独处理。
 */

/** reicon-react "Copy"(O 变体)线性图标路径,与分享条复制按钮同源 */
const COPY_ICON =
	'<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
	'<path fill-rule="evenodd" clip-rule="evenodd" d="M15 1.25H10.9436C9.10583 1.24998 7.65019 1.24997 6.51098 1.40314C5.33856 1.56076 4.38961 1.89288 3.64124 2.64124C2.89288 3.38961 2.56076 4.33856 2.40314 5.51098C2.24997 6.65019 2.24998 8.10582 2.25 9.94357V16C2.25 17.8722 3.62205 19.424 5.41551 19.7047C5.55348 20.4687 5.81753 21.1208 6.34835 21.6517C6.95027 22.2536 7.70814 22.5125 8.60825 22.6335C9.47522 22.75 10.5775 22.75 11.9451 22.75H15.0549C16.4225 22.75 17.5248 22.75 18.3918 22.6335C19.2919 22.5125 20.0497 22.2536 20.6517 21.6517C21.2536 21.0497 21.5125 20.2919 21.6335 19.3918C21.75 18.5248 21.75 17.4225 21.75 16.0549V10.9451C21.75 9.57754 21.75 8.47522 21.6335 7.60825C21.5125 6.70814 21.2536 5.95027 20.6517 5.34835C20.1208 4.81753 19.4687 4.55348 18.7047 4.41551C18.424 2.62205 16.8722 1.25 15 1.25ZM17.1293 4.27117C16.8265 3.38623 15.9876 2.75 15 2.75H11C9.09318 2.75 7.73851 2.75159 6.71085 2.88976C5.70476 3.02502 5.12511 3.27869 4.7019 3.7019C4.27869 4.12511 4.02502 4.70476 3.88976 5.71085C3.75159 6.73851 3.75 8.09318 3.75 10V16C3.75 16.9876 4.38624 17.8265 5.27117 18.1293C5.24998 17.5194 5.24999 16.8297 5.25 16.0549V10.9451C5.24998 9.57754 5.24996 8.47522 5.36652 7.60825C5.48754 6.70814 5.74643 5.95027 6.34835 5.34835C6.95027 4.74643 7.70814 4.48754 8.60825 4.36652C9.47522 4.24996 10.5775 4.24998 11.9451 4.25H15.0549C15.8297 4.24999 16.5194 4.24998 17.1293 4.27117ZM7.40901 6.40901C7.68577 6.13225 8.07435 5.9518 8.80812 5.85315C9.56347 5.75159 10.5646 5.75 12 5.75H15C16.4354 5.75 17.4365 5.75159 18.1919 5.85315C18.9257 5.9518 19.3142 6.13225 19.591 6.40901C19.8678 6.68577 20.0482 7.07435 20.1469 7.80812C20.2484 8.56347 20.25 9.56458 20.25 11V16C20.25 17.4354 20.2484 18.4365 20.1469 19.1919C20.0482 19.9257 19.8678 20.3142 19.591 20.591C19.3142 20.8678 18.9257 21.0482 18.1919 21.1469C17.4365 21.2484 16.4354 21.25 15 21.25H12C10.5646 21.25 9.56347 21.2484 8.80812 21.1469C8.07435 21.0482 7.68577 20.8678 7.40901 20.591C7.13225 20.3142 6.9518 19.9257 6.85315 19.1919C6.75159 18.4365 6.75 17.4354 6.75 16V11C6.75 9.56458 6.75159 8.56347 6.85315 7.80812C6.9518 7.07435 7.13225 6.68577 7.40901 6.40901Z" fill="currentColor"></path></svg>';

/** 常见围栏语言的展示名(未覆盖的语言回退为首字母大写) */
const LANGUAGE_LABELS: Record<string, string> = {
	js: 'JavaScript',
	javascript: 'JavaScript',
	ts: 'TypeScript',
	typescript: 'TypeScript',
	py: 'Python',
	python: 'Python',
	sh: 'Shell',
	bash: 'Shell',
	shell: 'Shell',
	zsh: 'Shell',
	html: 'HTML',
	css: 'CSS',
	json: 'JSON',
	yaml: 'YAML',
	yml: 'YAML',
	md: 'Markdown',
	mdx: 'MDX',
	sql: 'SQL',
	go: 'Go',
	rust: 'Rust',
	java: 'Java',
	diff: 'Diff',
	txt: 'Text',
	text: 'Text',
	plaintext: 'Text',
};

function formatLanguage(lang: string): string {
	const normalized = lang.toLowerCase();
	return LANGUAGE_LABELS[normalized] ?? normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

/** 复制文本:优先 Clipboard API,失败回退隐藏 textarea + execCommand(与分享条同策略) */
async function copyText(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		const area = document.createElement('textarea');
		area.value = text;
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

/** 为单个高亮块插入工具条与复制按钮(包裹层 .code-block 仅作定位锚点,样式在 global.css) */
function enhance(pre: HTMLElement): void {
	const wrapper = document.createElement('div');
	wrapper.className = 'code-block';
	pre.before(wrapper);
	wrapper.appendChild(pre);

	const toolbar = document.createElement('div');
	toolbar.className = 'code-toolbar';

	const label = document.createElement('span');
	label.className = 'code-lang';
	label.textContent = formatLanguage(pre.dataset.language ?? 'text');

	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'code-copy';
	button.setAttribute('aria-label', '复制代码');
	button.innerHTML = `${COPY_ICON}<span class="code-copy-text">复制</span>`;

	toolbar.append(label, button);
	wrapper.prepend(toolbar);

	const textEl = button.querySelector<HTMLElement>('.code-copy-text');
	let resetTimer = 0;

	button.addEventListener('click', () => {
		const source = (pre.querySelector('code')?.textContent ?? '').replace(/\n+$/, '');
		void copyText(source).then((ok) => {
			if (!textEl) return;
			window.clearTimeout(resetTimer);
			textEl.textContent = ok ? '已复制' : '复制失败';
			button.classList.toggle('is-done', ok);
			resetTimer = window.setTimeout(() => {
				textEl.textContent = '复制';
				button.classList.remove('is-done');
			}, 1800);
		});
	});
}

for (const pre of document.querySelectorAll<HTMLElement>('.prose pre.astro-code')) {
	enhance(pre);
}

// 显式导出使本文件成为模块:隔离顶层作用域,避免与其它全局脚本(如 related-random.ts)冲突
export {};
