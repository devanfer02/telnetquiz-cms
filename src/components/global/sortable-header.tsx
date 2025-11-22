import type { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableHeaderProps<TData> {
	column: Column<TData, unknown>;
	title: string;
	className?: string;
}

export function SortableHeader<TData>({
	column,
	title,
	className,
}: SortableHeaderProps<TData>) {
	const isSorted = column.getIsSorted();

	return (
		<button
			type="button"
			onClick={() => column.toggleSorting(isSorted === "asc")}
			className={cn("flex items-center gap-2 select-none ", className)}
		>
			<span>{title}</span>
			{isSorted === "asc" ? (
				<ArrowUp className="w-4 h-4 text-muted-foreground" />
			) : isSorted === "desc" ? (
				<ArrowDown className="w-4 h-4 text-muted-foreground" />
			) : (
				<ArrowUpDown className="w-4 h-4 text-muted-foreground opacity-50" />
			)}
		</button>
	);
}
