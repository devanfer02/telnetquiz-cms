import type { ColumnDef } from "@tanstack/react-table";
import { type ClassValue, clsx } from "clsx";
import path from "path";
import { twMerge } from "tailwind-merge";
import { ulid } from "ulid";
import { z } from "zod";

const EXTENSION_MAP = {
	".jpg": "image/jpg",
	".png": "image/png",
	jpeg: "image/jpeg",
} as Record<string, string>;

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function filterColumns<T>(
	columns: ColumnDef<T>[],
	disableKeys?: (keyof T)[],
): ColumnDef<T>[] {
	if (!disableKeys || disableKeys.length === 0) return columns;

	return columns.filter((col) => {
		if ("accessorKey" in col && col.accessorKey) {
			const key = col.accessorKey as keyof T;
			return !disableKeys.includes(key);
		}

		return true;
	});
}

export function validateField<
	T extends z.ZodObject<any>,
	K extends keyof T["shape"],
>(schema: T, key: K, value: unknown) {
	const fieldSchema = schema.shape[key];

	const result = fieldSchema.safeParse(value);

	return result.success ? undefined : result.error.issues[0].message;
}

export function generateFilename(
	originalName: string,
	options?: { prefix: string },
) {
	const ext = originalName.includes(".") ? originalName.split(".").pop() : "";

	const date = new Date().toISOString().slice(0, 10);
	const id = ulid();

	const prefix = options?.prefix ? `${options.prefix}_` : "";

	return `${prefix}${date}_${id}.${ext}`;
}

export function getFileExtension(fileName: string) {
	const ext = path.extname(fileName);

	return EXTENSION_MAP[ext];
}
