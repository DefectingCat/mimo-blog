"use client";

import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import type { Post } from "../model/types";

/**
 * PostListItemProps - 列表页条目属性
 */
export interface PostListItemProps {
	post: Post;
	index?: number;
}

/**
 * PostListItem - 博客列表页单条（流式，兼容有无封面）
 *
 * 左 Mono metadata（日期/标签）+ 中标题/excerpt + 右封面缩略（有则）。
 * hover 标题变 accent + 整行微位移。whileInView 错峰入场。
 */
const PostListItem = ({ post, index = 0 }: PostListItemProps) => {
	const reduce = useReducedMotion();

	return (
		<motion.div
			initial={reduce ? false : { opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.2 }}
			transition={{
				duration: 0.5,
				delay: reduce ? 0 : Math.min(index * 0.05, 0.25),
				ease: [0.16, 1, 0.3, 1],
			}}
			className="group grid grid-cols-1 gap-6 py-8 transition-transform hover:-translate-x-1 md:grid-cols-[140px_1fr_auto]"
		>
			{/* Mono metadata */}
			<div className="space-y-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
				<time>
					{new Date(post.published_at)
						.toLocaleDateString("zh-CN", {
							year: "numeric",
							month: "2-digit",
							day: "2-digit",
						})
						.replace(/\//g, ".")}
				</time>
				{post.tags[0] ? (
					<div className="text-accent">{post.tags[0]}</div>
				) : null}
			</div>

			{/* 主区 */}
			<div>
				<h3 className="mb-2 text-2xl font-semibold leading-snug transition-colors group-hover:text-accent">
					<Link to="/blog/$slug" params={{ slug: post.slug }}>
						{post.title}
					</Link>
				</h3>
				<p className="line-clamp-2 max-w-[60ch] text-muted-foreground">
					{post.excerpt}
				</p>
			</div>

			{/* 封面缩略（有则） */}
			{post.cover_image ? (
				<Link
					to="/blog/$slug"
					params={{ slug: post.slug }}
					className="hidden overflow-hidden md:block"
					aria-label={post.title}
				>
					<img
						src={post.cover_image}
						alt={post.title}
						loading="lazy"
						className="h-20 w-32 object-cover transition-transform duration-500 group-hover:scale-105"
					/>
				</Link>
			) : null}
		</motion.div>
	);
};

export default PostListItem;
