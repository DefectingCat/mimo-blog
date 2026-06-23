/**
 * Post - 文章摘要（首页列表用）
 *
 * 对接后端 GET /api/v1/posts 返回字段（post 模块的 list DTO）。
 */
export interface Post {
	/** 文章 ID */
	id: string;
	/** slug（用于 URL） */
	slug: string;
	/** 标题 */
	title: string;
	/** 摘要 */
	excerpt: string;
	/** 封面图 URL */
	cover_image: string;
	/** 浏览量 */
	view_count: number;
	/** 发布时间（RFC3339） */
	published_at: string;
	/** 标签名列表 */
	tags: string[];
	/** 作者信息 */
	author: {
		/** 作者用户名 */
		username: string;
		/** 作者头像 URL */
		avatar_url: string;
	};
}

/**
 * PostListQuery - 文章列表查询参数
 */
export interface PostListQuery {
	/** 页码（从 1 开始） */
	page?: number;
	/** 每页条数 */
	limit?: number;
	/** 标签筛选 */
	tag?: string;
}

/**
 * PostDetail - 文章详情（详情页用）
 *
 * 对接后端 GET /api/v1/posts/{slug} 返回的完整 PostDTO。
 * 比列表摘要多 content_md / content_html / view_count 等。
 */
export interface PostDetail {
	/** 文章 ID */
	id: string;
	/** 标题 */
	title: string;
	/** slug */
	slug: string;
	/** Markdown 原文（前端渲染） */
	content_md: string;
	/** 后端预渲染 HTML（备用，本期不用） */
	content_html: string;
	/** 摘要 */
	excerpt: string;
	/** 封面图 URL */
	cover_image: string;
	/** 浏览量 */
	view_count: number;
	/** 是否精选 */
	is_featured: boolean;
	/** 发布时间（RFC3339） */
	published_at: string;
	/** 标签 */
	tags: string[];
	/** 作者 */
	author: {
		username: string;
		avatar_url: string;
	};
}
