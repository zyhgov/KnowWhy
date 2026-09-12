import { useEffect, useState } from 'react';
import { ArrowUp } from 'reicon-react';

/**
 * 回到顶部按钮 —— 全站唯一的常驻 React 交互组件。
 * 由 BaseLayout 以 client:load 策略水合(仅交互组件使用水合,静态内容不加水合)。
 */
export default function BackToTop() {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const onScroll = () => setVisible(window.scrollY > 480);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	if (!visible) return null;

	return (
		<button
			type="button"
			className="back-to-top"
			aria-label="回到顶部"
			onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
		>
			<ArrowUp size={20} />
		</button>
	);
}
