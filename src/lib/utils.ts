import type { ColumnDef } from "@tanstack/react-table";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { z } from "zod";

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
