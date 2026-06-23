"use client";

import { useEffect, useState } from "react";

/**
 * TocItem - 目录条目
 */
interface TocItem {
	/** 锚点 id */
	id: string;
	/** 文本 */
	text: string;
	/** 层级（2 或 3） */
	level: number;
}

/**
 * TableOfContentsProps - 目录属性
 */
export interface TableOfContentsProps {
	/** 目录容器（正文）的选择器，默认 article */
	containerSelector?: string;
}

/**
 * TableOfContents - 文章详情页侧栏目录（桌面 sticky）
 *
 * 从正文 H2/H3 提取目录，IntersectionObserver 跟踪当前章节高亮。
 * 移动端隐藏（由调用方 hidden xl:block 控制）。
 * SSR 安全：mounted 后才扫描 DOM。
 */
const TableOfContents = ({
	containerSelector = "article",
}: TableOfContentsProps) => {
	const [items, setItems] = useState<TocItem[]>([]);
	const [activeId, setActiveId] = useState<string>("");

	useEffect(() => {
		const container = document.querySelector(containerSelector);
		if (!container) return;
		const headings = Array.from(container.querySelectorAll("h2, h3"));
		const tocItems: TocItem[] = headings.map((h, i) => {
			const text = h.textContent ?? "";
			const id = h.id || `heading-${i}`;
			h.id = id;
			return { id, text, level: h.tagName === "H2" ? 2 : 3 };
		});
		setItems(tocItems);

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries.filter((e) => e.isIntersecting);
				if (visible.length > 0) {
					setActiveId(visible[0].target.id);
				}
			},
			{ rootMargin: "-80px 0px -70% 0px" },
		);
		headings.forEach((h) => {
			observer.observe(h);
		});
		return () => observer.disconnect();
	}, [containerSelector]);

	if (items.length === 0) return null;

	return (
		<nav aria-label="目录" className="space-y-1">
			<p className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
				目录
			</p>
			<ul className="space-y-1 border-l border-border">
				{items.map((item) => (
					<li key={item.id} className={item.level === 3 ? "ml-4" : ""}>
						<a
							href={`#${item.id}`}
							className={`-ml-px block border-l py-1.5 pr-2 text-sm transition-colors ${
								activeId === item.id
									? "border-accent text-accent"
									: "border-transparent text-muted-foreground hover:text-foreground"
							}`}
						>
							{item.text}
						</a>
					</li>
				))}
			</ul>
		</nav>
	);
};

export default TableOfContents;
