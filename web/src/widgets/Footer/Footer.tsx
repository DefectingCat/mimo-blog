import { useSettings } from "@features/settings/api/queries";

/**
 * Footer - 页脚（结构不变，换皮）
 *
 * Mono 字体 + 电光蓝 hover + 细分割线。
 */
const Footer = () => {
	const { data } = useSettings();
	const year = new Date().getFullYear();

	return (
		<footer className="mt-24 border-t border-border">
			<div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-10 sm:flex-row">
				<p className="font-mono text-sm text-muted-foreground">
					© {year} {data?.siteName ?? "Blog"}
				</p>
				{data?.socials ? (
					<div className="flex gap-6 font-mono text-sm">
						{data.socials.github ? (
							<a
								href={data.socials.github}
								className="text-muted-foreground transition-colors hover:text-accent"
							>
								GitHub
							</a>
						) : null}
						{data.socials.twitter ? (
							<a
								href={data.socials.twitter}
								className="text-muted-foreground transition-colors hover:text-accent"
							>
								Twitter
							</a>
						) : null}
						{data.socials.email ? (
							<a
								href={`mailto:${data.socials.email}`}
								className="text-muted-foreground transition-colors hover:text-accent"
							>
								Email
							</a>
						) : null}
					</div>
				) : null}
			</div>
		</footer>
	);
};

export default Footer;
