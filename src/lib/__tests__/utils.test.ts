import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
	cn,
	filterColumns,
	generateFilename,
	getFileExtension,
	validateField,
} from "../utils";

describe("cn", () => {
	it("merges class names", () => {
		expect(cn("foo", "bar")).toBe("foo bar");
	});

	it("handles conditional classes", () => {
		expect(cn("base", false && "hidden", "visible")).toBe("base visible");
	});

	it("merges tailwind conflicts", () => {
		expect(cn("px-2", "px-4")).toBe("px-4");
	});

	it("returns empty string for no inputs", () => {
		expect(cn()).toBe("");
	});
});

describe("filterColumns", () => {
	type Item = { id: number; name: string; email: string };

	const columns = [
		{ accessorKey: "id", header: "ID" },
		{ accessorKey: "name", header: "Name" },
		{ accessorKey: "email", header: "Email" },
	];

	it("returns all columns when no disableKeys", () => {
		expect(filterColumns<Item>(columns, undefined)).toEqual(columns);
	});

	it("returns all columns when disableKeys is empty", () => {
		expect(filterColumns<Item>(columns, [])).toEqual(columns);
	});

	it("filters out specified columns", () => {
		const result = filterColumns<Item>(columns, ["email"]);
		expect(result).toHaveLength(2);
		expect(result.map((c) => "accessorKey" in c && c.accessorKey)).toEqual([
			"id",
			"name",
		]);
	});

	it("keeps columns without accessorKey", () => {
		const withAction = [...columns, { id: "actions", header: "Actions" }];
		const result = filterColumns<Item>(withAction, ["id", "name", "email"]);
		expect(result).toHaveLength(1);
	});
});

describe("validateField", () => {
	const schema = z.object({
		name: z.string().min(1, "Name is required"),
		age: z.number().min(0, "Age must be positive"),
	});

	it("returns undefined for valid field", () => {
		expect(validateField(schema, "name", "Alice")).toBeUndefined();
	});

	it("returns error message for invalid field", () => {
		expect(validateField(schema, "name", "")).toBe("Name is required");
	});

	it("validates number fields", () => {
		expect(validateField(schema, "age", -1)).toBe("Age must be positive");
	});
});

describe("generateFilename", () => {
	it("generates filename with extension", () => {
		const result = generateFilename("photo.png");
		expect(result).toMatch(/^\d{4}-\d{2}-\d{2}_[A-Z0-9]+\.png$/);
	});

	it("generates filename with prefix", () => {
		const result = generateFilename("doc.pdf", { prefix: "upload" });
		expect(result).toMatch(/^upload_\d{4}-\d{2}-\d{2}_[A-Z0-9]+\.pdf$/);
	});

	it("handles files without extension", () => {
		const result = generateFilename("README");
		expect(result).toMatch(/^\d{4}-\d{2}-\d{2}_[A-Z0-9]+\.$/);
	});

	it("uses current date", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2025-06-15"));
		const result = generateFilename("test.txt");
		expect(result).toContain("2025-06-15");
		vi.useRealTimers();
	});
});

describe("getFileExtension", () => {
	it("returns mime type for .jpg", () => {
		expect(getFileExtension("photo.jpg")).toBe("image/jpg");
	});

	it("returns mime type for .png", () => {
		expect(getFileExtension("image.png")).toBe("image/png");
	});

	it("returns undefined for unknown extension", () => {
		expect(getFileExtension("file.xyz")).toBeUndefined();
	});
});
