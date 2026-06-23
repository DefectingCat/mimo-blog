import { Link } from "@tanstack/react-router";
import { usePosts } from "../api/queries";
import type { PostListQuery } from "../model/types";
import PostListItem from "./PostListItem";

/**
 * PostListViewProps - 列表视图属性
 */
export interface PostListViewProps {
	query: PostListQuery;
}

/**
 * PostListView - 博客列表页视图（流式 + 传统分页）
 *
 * 纵向 divide-y 流式列表，每页 10 篇。
 * 分页：上一页/下一页 + Mono 页码，URL search param 驱动。
 */
const PostListView = ({ query }: PostListViewProps) => {
	const page = query.page ?? 1;
	const { data, isLoading, isError, error } = usePosts({ ...query, limit: 10 });

	if (isLoading) {
		return (
			<div className="divide-y divide-border">
				{Array.from({ length: 6 }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: 静态骨架，顺序固定
					<div key={i} className="animate-pulse py-8">
						<div className="mb-3 h-6 w-24 rounded bg-muted" />
						<div className="mb-2 h-7 w-3/4 rounded bg-muted" />
						<div className="h-4 w-1/2 rounded bg-muted" />
					</div>
				))}
			</div>
		);
	}

	if (isError) {
		return (
			<p className="py-12 text-center text-muted-foreground">
				加载失败：{error instanceof Error ? error.message : "未知错误"}
			</p>
		);
	}

	if (!data?.data?.length) {
		return <p className="py-12 text-center text-muted-foreground">暂无文章</p>;
	}

	const totalPages = data.pagination.total_pages ?? 1;

	return (
		<div>
			<div className="divide-y divide-border">
				{data.data.map((post, i) => (
					<PostListItem key={post.id} post={post} index={i} />
				))}
			</div>

			{/* 分页 */}
			{totalPages > 1 ? (
				<nav className="mt-16 flex items-center justify-center gap-6 font-mono text-sm">
					{page > 1 ? (
						<Link
							to="/blog"
							search={{ page: page - 1 }}
							className="text-muted-foreground transition-colors hover:text-accent"
						>
							← 上一页
						</Link>
					) : (
						<span className="text-muted-foreground/40">← 上一页</span>
					)}

					<span className="tabular-nums text-muted-foreground">
						{page} / {totalPages}
					</span>

					{page < totalPages ? (
						<Link
							to="/blog"
							search={{ page: page + 1 }}
							className="text-muted-foreground transition-colors hover:text-accent"
						>
							下一页 →
						</Link>
					) : (
						<span className="text-muted-foreground/40">下一页 →</span>
					)}
				</nav>
			) : null}
		</div>
	);
};

export default PostListView;
