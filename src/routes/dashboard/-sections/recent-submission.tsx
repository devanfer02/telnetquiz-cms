import {
	type ColumnDef,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import TanstackTable from "@/components/global/ts-table";
import { SortableHeader } from "../../../components/global/sortable-header";
import { useSuspenseQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constant";
import { getAllSubmissions } from "@/actions/analytics";

export const columns: ColumnDef<Submission>[] = [
	{
		accessorKey: "userName",
		header: ({ column }) => (
			<SortableHeader column={column} title="User's Name" />
		),
	},
	{
		accessorKey: "chapterId",
		header: ({ column }) => (
			<SortableHeader column={column} title="Chapter ID" />
		),
	},
	{
		accessorKey: "quizId",
		header: ({ column }) => <SortableHeader column={column} title="Quiz ID" />,
	},
	{
		accessorKey: "score",
		header: ({ column }) => <SortableHeader column={column} title="Score" />,
	},
	{
		accessorKey: "startedAt",
		header: ({ column }) => (
			<SortableHeader column={column} title="Started At" />
		),
	},
	{
		accessorKey: "completedAt",
		header: ({ column }) => (
			<SortableHeader column={column} title="Completed At" />
		),
	},
];

export default function RecentSubmission() {
	const { data: submissions } = useSuspenseQuery({
		queryKey: [QUERY_KEYS.SUBMISSIONS],
		queryFn: () => getAllSubmissions(),
		staleTime: 60 * 1000,
	});

	const [sorting, setSorting] = useState<SortingState>([]);

	const table = useReactTable({
		data: submissions,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	} as any);

	return (
		<TanstackTable
			table={table}
			columns={columns}
			title="Recent Submissions"
			fallbackMessage="No Submission Yet"
		/>
	);
}
