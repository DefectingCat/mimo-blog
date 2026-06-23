"use client";

import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { motion, useReducedMotion } from "motion/react";
import type { Post } from "../model/types";

/**
 * PostCardProps - 文章卡片属性
 */
export interface PostCardProps {
	/** 文章数据 */
	post: Post;
	/** 错峰入场索引 */
	index?: number;
}

/**
 * PostCard - 首页文章卡（杂志式，兼容有无封面）
 *
 * 有封面：封面直角置顶 + 下方标题/meta。
 * 无封面：纯排版卡（Mono 日期 + 大标题 + excerpt），靠排版撑视觉权重。
 * hover：标题变 accent + 封面 scale。
 * whileInView 错峰入场（stagger），reduced-motion 静态。
 */
const PostCard = ({ post, index = 0 }: PostCardProps) => {
	const reduce = useReducedMotion();

	return (
		<motion.article
			initial={reduce ? false : { opacity: 0, y: 24 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.2 }}
			transition={{
				duration: 0.5,
				delay: reduce ? 0 : Math.min(index * 0.06, 0.3),
				ease: [0.16, 1, 0.3, 1],
			}}
			className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-accent/50"
		>
			{post.cover_image ? (
				<Link
					to="/blog/$slug"
					params={{ slug: post.slug }}
					className="block overflow-hidden"
				>
					<img
						src={post.cover_image}
						alt={post.title}
						loading="lazy"
						className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
					/>
				</Link>
			) : null}

			<div className="flex flex-1 flex-col p-6">
				<time className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
					{new Date(post.published_at)
						.toLocaleDateString("zh-CN", {
							year: "numeric",
							month: "2-digit",
							day: "2-digit",
						})
						.replace(/\//g, ".")}
				</time>

				<h3 className="mb-2 text-xl font-semibold leading-snug transition-colors group-hover:text-accent">
					<Link to="/blog/$slug" params={{ slug: post.slug }}>
						{post.title}
					</Link>
				</h3>

				<p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">
					{post.excerpt}
				</p>

				<div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
					<span>{post.author.username}</span>
					<span aria-hidden="true">·</span>
					<span>
						{formatDistanceToNow(new Date(post.published_at), {
							addSuffix: true,
							locale: zhCN,
						})}
					</span>
				</div>
			</div>
		</motion.article>
	);
};

export default PostCard;
