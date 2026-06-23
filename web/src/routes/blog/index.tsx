import { postKeys } from "@features/posts/api/keys";
import { fetchPosts } from "@features/posts/api/queries";
import PostListView from "@features/posts/ui/PostListView";
import { createFileRoute } from "@tanstack/react-router";

/**
 * /blog - 博客列表页
 *
 * URL search param `page` 驱动分页，默认 1。
 * loader SSR 预取当前页数据。
 */
function BlogPage() {
	const { page } = Route.useSearch();
	return (
		<div className="container mx-auto px-4 py-16">
			<header className="mb-12">
				<p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-accent">
					{"// archive"}
				</p>
				<h1 className="text-4xl font-bold tracking-tight md:text-5xl">文章</h1>
				<div className="mt-6 h-px bg-accent/40" />
			</header>

			<PostListView query={{ page }} />
		</div>
	);
}

export const Route = createFileRoute("/blog/")({
	validateSearch: (search: Record<string, unknown>) => ({
		page: typeof search.page === "number" ? search.page : 1,
	}),
	loaderDeps: ({ search }) => ({ page: search.page }),
	loader: async ({ context, deps }) => {
		await context.queryClient.ensureQueryData({
			queryKey: postKeys.list({ page: deps.page, limit: 10 }),
			queryFn: () => fetchPosts({ page: deps.page, limit: 10 }),
		});
	},
	component: BlogPage,
});
