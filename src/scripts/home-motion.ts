/*
 * 首页动效(GSAP):
 * - Hero:标题逐行遮罩 + 逐字上推浮现(SplitText);吉祥物飘入并持续轻浮
 * - Hero:柔光斑随指针平滑跟随(quickTo;仅精细指针设备)
 * - 各区块滚动进入(一次性):元素错峰浮现 + 微缩;区块标题色条展开
 * - prefers-reduced-motion 时完全禁用(不拆字、不加动效,保留静态渲染)
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reducedMotion) {
	// 等字体就绪再初始化:避免 SplitText 按回退字形测量导致拆行错位
	document.fonts.ready.then(() => {
		initHero();
		initSections();
		initGlow();
	});
}

/** Hero 首屏:标题逐字浮现、吉祥物飘入并持续轻浮 */
function initHero() {
	const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
	heroTl.from('.hero-kicker', { y: 14, autoAlpha: 0, duration: 0.4 });

	const title = document.querySelector<HTMLElement>('.hero-title');
	if (title) {
		// 行遮罩 + 逐字上推;aria:'auto' 自动保留可访问名称
		const split = SplitText.create(title, { type: 'lines,chars', mask: 'lines', aria: 'auto' });
		heroTl.from(split.chars, { yPercent: 118, duration: 0.65, stagger: 0.032 }, '>-0.2');
	} else {
		heroTl.from('.hero-title', { y: 22, autoAlpha: 0, duration: 0.6 }, '>-0.2');
	}

	heroTl
		.from('.hero-lead', { y: 18, autoAlpha: 0, duration: 0.5 }, '-=0.25')
		.from('.hero-actions .btn', { y: 14, autoAlpha: 0, duration: 0.4, stagger: 0.06 }, '-=0.3')
		.from('.hero-visual', { x: 40, rotation: 3, autoAlpha: 0, duration: 0.7 }, '-=0.45')
		.add(() => {
			// 吉祥物持续轻浮(y 与入场 x 互不冲突)
			gsap.to('.hero-visual img', {
				y: -9,
				duration: 2.7,
				ease: 'sine.inOut',
				yoyo: true,
				repeat: -1,
			});
		});
}

/** 各区块滚动进入(一次性):元素错峰浮现 + 标题色条展开 */
function initSections() {
	const targetSelector =
		'.section-head, .discover-card, .category-card, .why-list > li, .hot-placeholder';
	document.querySelectorAll<HTMLElement>('.home-section').forEach((section) => {
		const elements = section.querySelectorAll<HTMLElement>(targetSelector);
		if (elements.length === 0) return;
		const sectionTl = gsap.timeline({
			scrollTrigger: {
				trigger: section,
				start: 'top 88%',
				once: true,
			},
		});
		sectionTl.from(elements, {
			y: 26,
			scale: 0.985,
			autoAlpha: 0,
			duration: 0.6,
			ease: 'power3.out',
			stagger: 0.06,
		});
		// 标题色条:由 --head-bar 驱动 scaleY(降级时 CSS 默认 1,完整显示)
		const heads = section.querySelectorAll<HTMLElement>('.section-head h2');
		if (heads.length > 0) {
			sectionTl.fromTo(
				heads,
				{ '--head-bar': 0 },
				{ '--head-bar': 1, duration: 0.5, ease: 'power2.out', stagger: 0.08 },
				0.12,
			);
		}
	});
}

/** Hero 柔光斑随指针移动(仅精细指针设备;quickTo 平滑跟随) */
function initGlow() {
	if (!window.matchMedia('(pointer: fine)').matches) return;
	const hero = document.querySelector<HTMLElement>('.hero');
	const glow = document.querySelector<HTMLElement>('.hero-glow');
	if (!hero || !glow) return;
	const xTo = gsap.quickTo(glow, 'x', { duration: 0.55, ease: 'power3' });
	const yTo = gsap.quickTo(glow, 'y', { duration: 0.55, ease: 'power3' });
	// 光斑尺寸 560px:指针坐标减去半径,让中心对准指针
	const radius = 280;
	let seeded = false;
	hero.addEventListener('pointermove', (event) => {
		const rect = hero.getBoundingClientRect();
		const x = event.clientX - rect.left - radius;
		const y = event.clientY - rect.top - radius;
		if (!seeded) {
			seeded = true;
			gsap.set(glow, { x, y, autoAlpha: 1 });
			return;
		}
		xTo(x);
		yTo(y);
	});
	hero.addEventListener('pointerleave', () => {
		gsap.to(glow, { autoAlpha: 0, duration: 0.5 });
	});
}
