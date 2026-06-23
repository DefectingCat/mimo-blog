import ReactMarkdown from "react-markdown";
import RehypeHighlight from "rehype-highlight";
import RemarkGfm from "remark-gfm";

/**
 * MarkdownContentProps - 正文渲染属性
 */
export interface MarkdownContentProps {
	/** Markdown 原文 */
	content: string;
}

/**
 * MarkdownContent - 文章正文 Markdown 渲染
 *
 * react-markdown + remark-gfm（表格/任务列表/删除线）+ rehype-highlight（代码高亮）。
 * 样式由 styles.css 的 .prose-editorial 覆盖。
 * SSR 安全（无客户端 API）。
 */
const MarkdownContent = ({ content }: MarkdownContentProps) => {
	return (
		<div className="prose-editorial">
			<ReactMarkdown
				remarkPlugins={[RemarkGfm]}
				rehypePlugins={[RehypeHighlight]}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
};

export default MarkdownContent;
