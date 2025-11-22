import type { ColumnDef } from "@tanstack/react-table";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
