// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ClientOnly from "./client-only";

describe("ClientOnly", () => {
	it("mount 后渲染 children（jsdom 同步 effect，render 完成即 mounted）", () => {
		const { container, getByTestId } = render(
			<ClientOnly fallback={<div data-testid="fb">loading</div>}>
				<div data-testid="real">content</div>
			</ClientOnly>,
		);
		// jsdom 中 render 后 useEffect 已执行，mounted=true，渲染 children
		expect(getByTestId("real")).toBeTruthy();
		expect(container.querySelector('[data-testid="fb"]')).toBeNull();
	});

	it("未传 fallback 时渲染 children（mount 后）", () => {
		const { container, getByTestId } = render(
			<ClientOnly>
				<div data-testid="nofb">content</div>
			</ClientOnly>,
		);
		expect(getByTestId("nofb")).toBeTruthy();
		expect(container.firstChild).not.toBeNull();
	});
});
