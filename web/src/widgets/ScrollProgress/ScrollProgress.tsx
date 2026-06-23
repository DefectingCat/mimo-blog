"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

/**
 * ScrollProgress - 顶部固定滚动进度条
 *
 * 2px 电光蓝进度条，固定在视口顶部（z-50），全站统一。
 * scaleX 驱动，transform-origin 左侧。
 * reduced-motion 下不渲染（静态页不需要进度反馈）。
 */
const ScrollProgress = () => {
	const reduce = useReducedMotion();
	const { scrollYProgress } = useScroll();
	const scaleX = useSpring(scrollYProgress, {
		stiffness: 120,
		damping: 30,
		restDelta: 0.001,
	});

	if (reduce) return null;

	return (
		<motion.div
			aria-hidden="true"
			style={{ scaleX }}
			className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-accent"
		/>
	);
};

export default ScrollProgress;
