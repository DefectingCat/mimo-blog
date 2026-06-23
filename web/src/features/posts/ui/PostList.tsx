import { Skeleton } from "@shared/ui/skeleton";

import { usePosts } from "../api/queries";
import type { PostListQuery } from "../model/types";
import PostCard from "./PostCard";
import PostFeatured from "./PostFeatured";

/**
 * PostListProps - 首页文章列表属性
 */
export interface PostListProps {
	/** 分页与标签筛选 */
	query?: PostListQuery;
	/** 是否显示加载骨架 */
	showSkeleton?: boolean;
}

/**
 * PostList - 首页文章列表（featured + 错落网格）
 *
 * 第一篇 featured（PostFeatured），其余 PostCard 错落网格。
 * 加载中渲染骨架，错误/空态有降级。
 */
const PostList = ({ query = {}, showSkeleton = true }: PostListProps) => {
	const { data, isLoading, isError, error } = usePosts(query);

	if (isLoading && showSkeleton) {
		return (
			<div className="space-y-12">
				<Skeleton className="h-80 rounded-xl" />
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: (query.limit ?? 6) - 1 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: 静态骨架，顺序固定
						<Skeleton key={i} className="h-64 rounded-xl" />
					))}
				</div>
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

	const [featured, ...rest] = data.data;

	return (
		<div className="space-y-16">
			{featured ? <PostFeatured post={featured} /> : null}

			{rest.length > 0 ? (
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{rest.map((post, i) => (
						<PostCard key={post.id} post={post} index={i} />
					))}
				</div>
			) : null}
		</div>
	);
};

export default PostList;
