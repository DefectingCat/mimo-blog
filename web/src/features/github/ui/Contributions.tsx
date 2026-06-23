"use client";

import ClientOnly from "@shared/lib/client-only";
import ScrollVelocity from "@shared/vendor/react-bits/ScrollVelocity";
import { useContributions } from "../api/queries";

/** 贡献强度对应色阶（电光蓝由淡到浓） */
const LEVEL_COLORS = [
	"bg-muted",
	"bg-accent/30",
	"bg-accent/50",
	"bg-accent/70",
	"bg-accent",
];

/**
 * Contributions - GitHub 贡献区（Mono 大字统计 + 横向漂移标题 + 热力图）
 *
 * 上方：ScrollVelocity 横向漂移的 Mono 大字（"Building in public"）。
 * 下方左：Mono 大字统计（总贡献数），右：热力图。
 * ScrollVelocity 通过 ClientOnly 隔离（依赖 useScroll）。
 */
const Contributions = () => {
	const { data, isLoading, isError } = useContributions();

	return (
		<div className="space-y-8">
			<ClientOnly
				fallback={
					<div className="font-mono text-4xl font-bold text-muted/30 md:text-6xl">
						Building in public
					</div>
				}
			>
				<ScrollVelocity
					baseVelocity={2}
					className="font-mono text-4xl font-bold text-muted/30 md:text-6xl"
				>
					Building in public ·
				</ScrollVelocity>
			</ClientOnly>

			<div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[auto_1fr]">
				<div>
					{isLoading ? (
						<div className="h-20 w-32 animate-pulse rounded-xl bg-muted" />
					) : isError || !data ? (
						<p className="text-sm text-muted-foreground">贡献图加载失败</p>
					) : (
						<>
							<p className="font-mono text-5xl font-bold tabular-nums text-foreground md:text-6xl">
								{data.total}
							</p>
							<p className="mt-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
								contributions · past year
							</p>
						</>
					)}
				</div>

				{!isLoading && !isError && data ? (
					<div className="overflow-x-auto">
						<div className="grid min-w-max grid-flow-col grid-rows-7 gap-1">
							{data.contributions.map((c) => (
								<div
									key={c.date}
									title={`${c.date}: ${c.count} 次`}
									className={`h-2.5 w-2.5 rounded-sm ${LEVEL_COLORS[c.level]}`}
								/>
							))}
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
};

export default Contributions;
