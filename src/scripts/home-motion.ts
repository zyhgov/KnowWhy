/*
 * 首页动效(GSAP):
 * - Hero 首屏元素依次入场(上移淡入)
 * - 各区块滚动进入(标题与卡片 stagger,fade-up,仅触发一次)
 * - prefers-reduced-motion 时完全禁用
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reducedMotion) {
	// ---- Hero 首屏入场 ----
	const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
	heroTl
		.from('.hero-kicker', { y: 16, autoAlpha: 0, duration: 0.45 })
		.from('.hero-title', { y: 22, autoAlpha: 0, duration: 0.6 }, '-=0.25')
		.from('.hero-lead', { y: 18, autoAlpha: 0, duration: 0.5 }, '-=0.3')
		.from('.hero-actions .btn', { y: 14, autoAlpha: 0, duration: 0.4 }, '-=0.25');

	// ---- 各区块滚动进入(一次性) ----
	const targetSelector =
		'.section-head, .discover-card, .category-card, .why-list > li, .hot-placeholder';
	document.querySelectorAll<HTMLElement>('.home-section').forEach((section) => {
		const elements = section.querySelectorAll<HTMLElement>(targetSelector);
		if (elements.length === 0) return;
		gsap.from(elements, {
			y: 24,
			autoAlpha: 0,
			duration: 0.55,
			ease: 'power2.out',
			stagger: 0.05,
			scrollTrigger: {
				trigger: section,
				start: 'top 88%',
				once: true,
			},
		});
	});
}
