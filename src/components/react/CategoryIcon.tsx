import { Coffee, Compass, Cpu, Leaf, Lightbulb, Profile2user } from 'reicon-react';

/** 分类 slug -> reicon 图标(图标库:reicon-react,https://reicon.dev) */
const ICONS = {
	everyday: Coffee,
	tech: Cpu,
	nature: Leaf,
	society: Profile2user,
	mind: Lightbulb,
	meta: Compass,
} as const;

interface Props {
	/** 分类 slug(见 src/consts.ts) */
	category: string;
	/** 图标尺寸,默认 24 */
	size?: number;
	className?: string;
}

/**
 * 分类图标组件(React)。
 * 默认由 Astro 服务端渲染为静态 SVG、不产生客户端 JS;
 * 图标属于静态内容,无需 client:* 水合指令。
 */
export default function CategoryIcon({ category, size = 24, className }: Props) {
	const Icon = ICONS[category as keyof typeof ICONS] ?? Compass;
	return <Icon size={size} className={className} />;
}
