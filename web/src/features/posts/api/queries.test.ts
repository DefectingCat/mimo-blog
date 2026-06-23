import { beforeEach, describe, expect, it, vi } from "vitest";

const { getMock } = vi.hoisted(() => ({ getMock: vi.fn() }));
vi.mock("@shared/api/http", () => ({
	httpClient: { get: getMock },
}));

import { fetchPost } from "./queries";

describe("fetchPost", () => {
	beforeEach(() => getMock.mockReset());

	it("按 slug 拉取详情，返回 data 字段", async () => {
		getMock.mockResolvedValue({
			data: { id: "1", title: "t", slug: "s", content_md: "# hi" },
		});
		const res = await fetchPost("s");
		expect(getMock).toHaveBeenCalledWith("/posts/s");
		expect(res.title).toBe("t");
		expect(res.content_md).toBe("# hi");
	});
});
