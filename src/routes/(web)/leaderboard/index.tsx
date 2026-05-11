import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	type ColumnDef,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { getLeaderboardAll } from "@/actions/analytics";
import PageHeader from "@/components/global/page-header";
import { SortableHeader } from "@/components/global/sortable-header";
import TanstackTable from "@/components/global/ts-table";
import { QUERY_KEYS } from "@/lib/constant";

type LeaderboardRow = {
	rank: number;
	userId: string;
	userName: string;
	schoolName: string;
	score: number;
	quizzesCompleted: number;
	latestSubmitAt: string;
};

const columns: ColumnDef<LeaderboardRow>[] = [
	{
		accessorKey: "rank",
		header: ({ column }) => <SortableHeader column={column} title="Rank" />,
		cell: ({ row }) => (
			<div className="font-semibold tabular-nums">#{row.original.rank}</div>
		),
	},
	{
		accessorKey: "userName",
		header: ({ column }) => <SortableHeader column={column} title="Name" />,
	},
	{
		accessorKey: "schoolName",
		header: ({ column }) => <SortableHeader column={column} title="School" />,
	},
	{
		accessorKey: "score",
		header: ({ column }) => (
			<SortableHeader column={column} title="Total Score" />
		),
		cell: ({ row }) => (
			<div className="font-semibold tabular-nums">{row.original.score}</div>
		),
	},
	{
		accessorKey: "quizzesCompleted",
		header: ({ column }) => (
			<SortableHeader column={column} title="Quizzes Completed" />
		),
		cell: ({ row }) => (
			<div className="tabular-nums">{row.original.quizzesCompleted}</div>
		),
	},
];

export const Route = createFileRoute("/(web)/leaderboard/")({
	loader: async ({ context }) => {
		await context.queryClient.prefetchQuery({
			queryKey: [QUERY_KEYS.LEADERBOARD_ALL],
			queryFn: () => getLeaderboardAll(),
		});
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { data: leaderboard } = useSuspenseQuery({
		queryKey: [QUERY_KEYS.LEADERBOARD_ALL],
		queryFn: () => getLeaderboardAll(),
		staleTime: 60 * 1000,
	});

	const [sorting, setSorting] = useState<SortingState>([]);

	const table = useReactTable({
		data: leaderboard,
		columns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	return (
		<div>
			<PageHeader
				title="Leaderboard"
				description="Peringkat pengguna berdasarkan total skor terbaik dari seluruh kuis."
			/>
			<TanstackTable
				table={table}
				columns={columns}
				title="Top Players"
				fallbackMessage="Belum ada data leaderboard"
			/>
		</div>
	);
}
