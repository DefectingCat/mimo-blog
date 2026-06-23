"use client";

import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import type { Post } from "../model/types";

/**
 * PostFeaturedProps - featured 大卡属性
 */
export interface PostFeaturedProps {
	/** 文章数据 */
	post: Post;
}

/**
 * PostFeatured - 首页最新一篇的 featured 大卡
 *
 * 2 列布局：左封面大图（直角），右标题/excerpt/meta。
 * 无封面时左列改为电光蓝渐变占位，保持视觉权重。
 * whileInView 入场，reduced-motion 静态。
 */
const PostFeatured = ({ post }: PostFeaturedProps) => {
	const reduce = useReducedMotion();

	return (
		<motion.article
			initial={reduce ? false : { opacity: 0, y: 32 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.15 }}
			transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
			className="group grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12"
		>
			<Link
				to="/blog/$slug"
				params={{ slug: post.slug }}
				className="block aspect-[16/10] overflow-hidden rounded-xl"
				aria-label={post.title}
			>
				{post.cover_image ? (
					<img
						src={post.cover_image}
						alt={post.title}
						loading="lazy"
						className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
					/>
				) : (
					<div className="h-full w-full border border-border bg-gradient-to-br from-accent/20 via-card to-muted" />
				)}
			</Link>

			<div className="flex flex-col">
				<div className="mb-4 flex items-center gap-3">
					<span className="rounded-full border border-accent/40 px-2 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
						最新
					</span>
					<time className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
						{new Date(post.published_at)
							.toLocaleDateString("zh-CN", {
								year: "numeric",
								month: "2-digit",
								day: "2-digit",
							})
							.replace(/\//g, ".")}
					</time>
				</div>

				<h2 className="mb-4 text-3xl font-bold leading-tight tracking-tight transition-colors group-hover:text-accent md:text-4xl">
					<Link to="/blog/$slug" params={{ slug: post.slug }}>
						{post.title}
					</Link>
				</h2>

				<p className="mb-6 line-clamp-3 max-w-[55ch] text-base leading-relaxed text-muted-foreground">
					{post.excerpt}
				</p>

				<div className="flex items-center gap-3 font-mono text-sm text-muted-foreground">
					<span>{post.author.username}</span>
					<span aria-hidden="true">·</span>
					<span>{post.view_count} 次阅读</span>
				</div>
			</div>
		</motion.article>
	);
};

export default PostFeatured;
