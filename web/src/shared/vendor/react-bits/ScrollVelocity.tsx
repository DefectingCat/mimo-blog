"use client";

import { useRef } from "react";
import {
	motion,
	useReducedMotion,
	useScroll,
	useSpring,
	useTransform,
	useVelocity,
} from "motion/react";

interface ScrollVelocityProps {
	children: React.ReactNode;
	baseVelocity?: number;
	className?: string;
}

/**
 * ScrollVelocity - 随滚动横向漂移的文字
 *
 * react-bits 移植。滚动速度驱动文字横向位移，内联 wrap 实现无缝循环。
 * reduced-motion 下静态渲染（无位移）。
 */
export default function ScrollVelocity({
	children,
	baseVelocity = 2,
	className = "",
}: ScrollVelocityProps) {
	const reduce = useReducedMotion();
	const baseX = useRef(0);
	const { scrollY } = useScroll();
	const scrollVelocity = useVelocity(scrollY);
	const smoothVelocity = useSpring(scrollVelocity, {
		damping: 50,
		stiffness: 400,
	});
	const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
		clamp: false,
	});

	const x = useTransform(() => {
		if (reduce) return "0%";
		const moveBy = baseVelocity * (1 + velocityFactor.get());
		baseX.current += moveBy;
		// 内联 wrap(-50, 50, value)，避免依赖 motion 的 wrap 导出是否存在
		const wrapped = (((baseX.current + 50) % 100) + 100) % 100 - 50;
		return `${wrapped}%`;
	});

	if (reduce) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			className={`flex flex-nowrap whitespace-nowrap ${className}`}
			style={{ x }}
		>
			{children}
			{children}
		</motion.div>
	);
}
