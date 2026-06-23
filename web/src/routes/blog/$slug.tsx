import { postKeys } from "@features/posts/api/keys";
import { fetchPost } from "@features/posts/api/queries";
import MarkdownContent from "@features/posts/ui/MarkdownContent";
import TableOfContents from "@features/posts/ui/TableOfContents";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";

/**
 * BlogDetailPage - 文章详情页
 *
 * loader SSR 预取文章详情，dehydrate。
 * 布局：左 sticky 目录（桌面 xl+）+ 中央窄列正文。
 * 动效最克制：仅目录高亮 + 全局 ScrollProgress。
 */
function BlogDetailPage() {
	const { post } = Route.useLoaderData();

	return (
		<article className="container mx-auto px-4 py-16">
			<div className="grid grid-cols-1 gap-12 xl:grid-cols-[220px_minmax(0,680px)] xl:justify-center">
				{/* 桌面 sticky 目录 */}
				<aside className="hidden xl:block">
					<div className="sticky top-24">
						<TableOfContents containerSelector="article" />
					</div>
				</aside>

				{/* 正文窄列 */}
				<div className="mx-auto w-full max-w-[680px] xl:mx-0">
					<Link
						to="/blog"
						search={{ page: 1 }}
						className="mb-8 inline-flex items-center gap-1 font-mono text-sm text-muted-foreground transition-colors hover:text-accent"
					>
						<span aria-hidden="true">←</span> Back
					</Link>

					{/* Meta */}
					<div className="mb-6 space-y-3">
						<div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
							<time>{format(new Date(post.published_at), "yyyy.MM.dd")}</time>
							<span aria-hidden="true">·</span>
							<span>{post.view_count} 次阅读</span>
						</div>
						{post.tags.length > 0 ? (
							<div className="flex flex-wrap gap-2">
								{post.tags.map((tag) => (
									<span
										key={tag}
										className="rounded-full border border-border px-2 py-0.5 font-mono text-xs text-muted-foreground"
									>
										{tag}
									</span>
								))}
							</div>
						) : null}
					</div>

					<h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
						{post.title}
					</h1>

					<div className="mb-10 flex items-center gap-3">
						{post.author.avatar_url ? (
							<img
								src={post.author.avatar_url}
								alt={post.author.username}
								className="h-8 w-8 rounded-full object-cover"
							/>
						) : null}
						<span className="font-mono text-sm text-muted-foreground">
							{post.author.username}
						</span>
					</div>

					{post.cover_image ? (
						<img
							src={post.cover_image}
							alt={post.title}
							style={{ borderRadius: "0px" }}
							className="mb-10 max-h-[480px] w-full object-cover"
						/>
					) : null}

					<MarkdownContent content={post.content_md} />

					{/* 尾部标签 */}
					{post.tags.length > 0 ? (
						<div className="mt-12 flex flex-wrap gap-2 border-t border-border pt-8">
							{post.tags.map((tag) => (
								<span
									key={tag}
									className="rounded-full border border-border px-2.5 py-1 font-mono text-xs text-muted-foreground"
								>
									{tag}
								</span>
							))}
						</div>
					) : null}
				</div>
			</div>
		</article>
	);
}

export const Route = createFileRoute("/blog/$slug")({
	loader: async ({ params, context }) => {
		const post = await context.queryClient.ensureQueryData({
			queryKey: postKeys.detail(params.slug),
			queryFn: () => fetchPost(params.slug),
		});
		return { post };
	},
	component: BlogDetailPage,
});
