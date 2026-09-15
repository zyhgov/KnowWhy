/*
 * 文章内 Mermaid 图形渲染:
 * ```mermaid 围栏已在 Astro 配置中排除出 Shiki 高亮(markdown.syntaxHighlight.excludeLangs),
 * 保持原始 <pre><code class="language-mermaid"> 标记,便于此处精准识别;
 * 仅当页面存在 Mermaid 块时才动态 import('mermaid')(独立按需 chunk,无图文章零加载),
 * 逐块渲染为内联 SVG 替换原代码块;解析失败则保留原始代码块并输出控制台警告。
 */

const blocks = Array.from(document.querySelectorAll<HTMLElement>('.prose pre')).filter((pre) =>
	pre.querySelector('code.language-mermaid'),
);

async function renderAll(targets: HTMLElement[]): Promise<void> {
	const { default: mermaid } = await import('mermaid');

	mermaid.initialize({
		startOnLoad: false,
		theme: 'neutral',
		securityLevel: 'strict',
		// 解析失败交由下方 catch 处理,阻止 mermaid 向页面注入错误图形
		suppressErrorRendering: true,
		// 图形文字继承站点正文字体
		fontFamily: getComputedStyle(document.body).fontFamily,
	});

	let seq = 0;

	for (const pre of targets) {
		const source = pre.querySelector('code')?.textContent ?? '';
		const id = `mermaid-figure-${++seq}`;
		try {
			const { svg } = await mermaid.render(id, source);
			const figure = document.createElement('figure');
			figure.className = 'mermaid-figure';
			figure.innerHTML = svg;
			pre.replaceWith(figure);
		} catch (error) {
			console.warn('[mermaid] 图形渲染失败,已保留原始代码块', error);
			// 兜底清理个别失败路径残留在 body 的临时节点(形如 #id / #d<id>)
			document.getElementById(id)?.remove();
			document.getElementById(`d${id}`)?.remove();
		}
	}
}

if (blocks.length > 0) {
	void renderAll(blocks);
}

// 显式导出使本文件成为模块:隔离顶层作用域,避免与其它全局脚本冲突
export {};
