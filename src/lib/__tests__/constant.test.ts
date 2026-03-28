import { describe, expect, it } from "vitest";
import { dashboardItems, QUERY_KEYS, sidebarItems } from "../constant";

describe("sidebarItems", () => {
	it("has correct number of items", () => {
		expect(sidebarItems).toHaveLength(8);
	});

	it("each item has required fields", () => {
		for (const item of sidebarItems) {
			expect(item).toHaveProperty("title");
			expect(item).toHaveProperty("url");
			expect(item).toHaveProperty("icon");
			expect(typeof item.title).toBe("string");
			expect(item.url).toMatch(/^\//);
		}
	});

	it("includes Dashboard as first item", () => {
		expect(sidebarItems[0].title).toBe("Dashboard");
		expect(sidebarItems[0].url).toBe("/dashboard");
	});
});

describe("dashboardItems", () => {
	it("excludes Dashboard from items", () => {
		const titles = dashboardItems.map((item) => item.title);
		expect(titles).not.toContain("Dashboard");
	});

	it("has one fewer item than sidebarItems", () => {
		expect(dashboardItems).toHaveLength(sidebarItems.length - 1);
	});

	it("each item has counter property", () => {
		for (const item of dashboardItems) {
			expect(item).toHaveProperty("counter", 20);
		}
	});
});

describe("QUERY_KEYS", () => {
	it("has all expected keys", () => {
		expect(QUERY_KEYS).toHaveProperty("CHAPTERS");
		expect(QUERY_KEYS).toHaveProperty("QUIZZES");
		expect(QUERY_KEYS).toHaveProperty("QUESTIONS");
		expect(QUERY_KEYS).toHaveProperty("STUDY_MATERIALS");
		expect(QUERY_KEYS).toHaveProperty("USERS");
		expect(QUERY_KEYS).toHaveProperty("SCHOOLS");
	});

	it("all values are strings", () => {
		for (const value of Object.values(QUERY_KEYS)) {
			expect(typeof value).toBe("string");
		}
	});
});
