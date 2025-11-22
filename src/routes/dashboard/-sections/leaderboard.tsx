import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { mockLeaderboard } from "@/data/mock-dashboard";
import { cn } from "@/lib/utils";
import { SortableHeader } from "../../../components/global/sortable-header";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";

type LeaderboardEntry = {
	rank: number;
	userName: string;
	score: number;
	latestSubmitAt: string;
};

interface LeaderboardProps {
	className?: string;
}

const columns: ColumnDef<LeaderboardEntry>[] = [
	{
		accessorKey: "rank",
		header: "Rank",
	},
	{
		accessorKey: "userName",
		header: "User's Name",
	},
	{
		accessorKey: "score",
		header: ({ column }) => <SortableHeader column={column} title="Score" />,
		cell: ({ row }) => (
			<div className="font-semibold">{row.original.score}</div>
		),
	},
	{
		accessorKey: "latestSubmitAt",
		header: "Latest Submit At",
	},
];

export default function Leaderboard({ className }: LeaderboardProps) {
	const [sorting, setSorting] = useState<SortingState>([]);

	const table = useReactTable({
		data: mockLeaderboard,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	} as any);

	return (
		<Card className={cn("px-5 h-full", className)}>
			<h2 className="text-xl font-black text-telnet-primary mb-4">
				Leaderboard
			</h2>
			<Table>
				<TableCaption className="caption-top mb-3">
					Top performing users
				</TableCaption>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<TableHead
									key={header.id}
									className="cursor-pointer select-none"
									onClick={header.column.getToggleSortingHandler()}
								>
									{flexRender(
										header.column.columnDef.header,
										header.getContext(),
									)}
									{{}[header.column.getIsSorted() as string] ?? null}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows.map((row) => (
						<TableRow key={row.id}>
							{row.getVisibleCells().map((cell) => (
								<TableCell key={cell.id}>
									{cell.renderValue() as string}
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
			<div className="flex items-center justify-end space-x-2 mt-1">
				<Button
					variant="outline"
					size="sm"
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					Previous
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					Next
				</Button>
			</div>
		</Card>
	);
}
