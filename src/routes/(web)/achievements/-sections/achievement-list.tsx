import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
	type ColumnDef,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { removeAchievement } from "@/actions/achievements";
import ActionCell from "@/components/global/action-cell";
import { SortableHeader } from "@/components/global/sortable-header";
import TanstackTable from "@/components/global/ts-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QUERY_KEYS } from "@/lib/constant";
import { setFlashState } from "@/store/use-flash";

interface AchievementListProps {
	achievements: Achievement[];
}

export default function AchievementList({
	achievements,
}: AchievementListProps) {
	const queryClient = useQueryClient();
	const [keyword, setKeyword] = useState("");
	const [sorting, setSorting] = useState<SortingState>([]);

	const columns: ColumnDef<Achievement>[] = [
		{
			accessorKey: "slug",
			header: ({ column }) => <SortableHeader column={column} title="Slug" />,
			size: 30,
		},
		{
			accessorKey: "title",
			header: ({ column }) => <SortableHeader column={column} title="Judul" />,
			size: 40,
			cell: ({ row }) => (
				<Link
					to="/achievements/$id"
					params={{ id: String(row.original.id) }}
					className="hover:underline text-primary font-medium"
				>
					{row.original.title}
				</Link>
			),
		},
		{
			accessorKey: "description",
			header: "Deskripsi",
			size: 50,
		},
		{
			accessorKey: "icon",
			header: "Icon",
			size: 20,
		},
		{
			accessorKey: "isActive",
			header: "Status",
			size: 20,
			cell: ({ row }) => (
				<span
					className={`rounded-lg border px-2 py-0.5 text-xs ${
						row.original.isActive
							? "border-green-500 bg-green-100 text-green-600"
							: "border-gray-300 bg-gray-100 text-gray-600"
					}`}
				>
					{row.original.isActive ? "Aktif" : "Nonaktif"}
				</span>
			),
		},
		{
			id: "actions",
			header: "Actions",
			size: 100,
			cell: ({ row }) => {
				const id = row.original.id;

				return (
					<ActionCell
						row={row}
						keyName="id"
						editHref="/achievements/edit/$id"
						handleDelete={async () => {
							const result = await removeAchievement({ data: { id } });
							await queryClient.invalidateQueries({
								queryKey: [QUERY_KEYS.ACHIEVEMENTS],
							});
							if (result !== null) {
								setFlashState({
									type: "success",
									message: "Achievement berhasil dihapus",
								});
							}
						}}
					/>
				);
			},
		},
	];

	const table = useReactTable({
		data: achievements,
		columns,
		state: { globalFilter: keyword, sorting },
		onGlobalFilterChange: setKeyword,
		globalFilterFn: "includesString",
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
	});

	return (
		<>
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3 sm:gap-x-5">
				<Input
					placeholder="Cari achievement..."
					value={keyword ?? ""}
					onChange={(e) => setKeyword(e.target.value)}
					className="w-full"
				/>
				<Button className="w-full sm:w-auto px-4 py-2 rounded-md bg-primary border border-telnet-primary bg-telnet-primary text-white hover:bg-white hover:text-telnet-primary duration-200 cursor-pointer">
					<Link to="/achievements/add">Tambah Achievement</Link>
				</Button>
			</div>
			<TanstackTable
				table={table}
				columns={columns}
				title="List Achievement"
				fallbackMessage="Belum ada achievement"
			/>
		</>
	);
}
