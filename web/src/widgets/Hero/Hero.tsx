"use client";

import { useSettings } from "@features/settings/api/queries";
import ClientOnly from "@shared/lib/client-only";
import { Button } from "@shared/ui/button";
import Aurora from "@shared/vendor/react-bits/Aurora";
import DecryptedText from "@shared/vendor/react-bits/DecryptedText";
import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";

/**
 * Hero - 首页头部英雄区（不对称编辑式）
 *
 * 左 7 列文字（Mono 站名标签 + 大标题 + tagline + 单一主 CTA），右 5 列留白。
 * 背景电光蓝 Aurora（WebGL，client-only 隔离）。
 * 站名用 DecryptedText（进入视口解密），tagline 静态。
 * reduced-motion 下文字直接显示、Aurora 仍由 ClientOnly 控制。
 */
const Hero = () => {
	const { data } = useSettings();
	const reduce = useReducedMotion();
	const siteName = data?.siteName ?? "Blog";
	const tagline = data?.tagline ?? "Hello World";

	return (
		<section className="relative flex min-h-[88dvh] items-center overflow-hidden">
			<div className="absolute inset-0 -z-10">
				<ClientOnly fallback={null}>
					<Aurora />
				</ClientOnly>
			</div>

			<div className="container mx-auto px-4">
				<div className="max-w-3xl">
					<p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-accent">
						{"// "}
						{siteName.toLowerCase().replace(/\s+/g, "-")}
					</p>

					<h1 className="mb-6 text-5xl font-bold leading-[1.05] tracking-tighter text-foreground md:text-7xl lg:text-8xl">
						<DecryptedText
							text={siteName}
							animateOn="view"
							speed={40}
							className="text-foreground"
							encryptedClassName="text-accent"
						/>
					</h1>

					<p className="mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
						{tagline}
					</p>

					<motion.div
						initial={reduce ? false : { opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
					>
						<Button size="lg" asChild className="rounded-full">
							<Link to="/blog">进入博客</Link>
						</Button>
					</motion.div>
				</div>
			</div>
		</section>
	);
};

export default Hero;
