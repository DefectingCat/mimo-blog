import type { ReactNode } from "react";
import { useEffect, useState } from "react";

/**
 * ClientOnlyProps - 仅客户端渲染包装器属性
 */
export interface ClientOnlyProps {
	/** 仅客户端时渲染的子节点 */
	children: ReactNode;
	/** 服务端/首帧（mount 前）渲染的 fallback */
	fallback?: ReactNode;
}

/**
 * ClientOnly - SSR 安全包装器
 *
 * SSR 与首帧渲染 fallback（默认 null），客户端 mount 后才渲染 children。
 * 用于隔离依赖 window/canvas/WebGL/mouse 的组件，避免 hydration mismatch。
 *
 * 原理：useState 初值 false，useEffect 仅在客户端执行置 true。
 */
const ClientOnly = ({ children, fallback = null }: ClientOnlyProps) => {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);
	return <>{mounted ? children : fallback}</>;
};

export default ClientOnly;
