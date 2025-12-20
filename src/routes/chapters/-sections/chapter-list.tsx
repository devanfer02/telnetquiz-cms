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
import ActionCell from "@/components/global/action-cell";
import { SortableHeader } from "@/components/global/sortable-header";
import TableLink from "@/components/global/table-link";
import TanstackTable from "@/components/global/ts-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { removeChapter } from "@/actions/chapters";
import { useQueryClient } from "@tanstack/react-query";
import { setFlashState } from "@/store/use-flash";
import { QUERY_KEYS } from "@/lib/constant";

interface ChapterListProps {
	chapters: Chapter[];
}

export default function ChapterList({ chapters }: ChapterListProps) {
	const queryClient = useQueryClient();
	const [keyword, setKeyword] = useState("");
	const [sorting, setSorting] = useState<SortingState>([]);

	const columns: ColumnDef<Chapter>[] = [
		{
			accessorKey: "id",
			header: ({ column }) => <SortableHeader column={column} title="ID" />,
			size: 10,
			cell: ({ row }) => {
				const id = row.original.id.toString();

				return <TableLink to="/chapters/$id" paramKey="id" paramValue={id} />;
			},
		},
		{
			accessorKey: "title",
			header: ({ column }) => <SortableHeader column={column} title="Title" />,
			size: 50,
		},
		{
			accessorKey: "description",
			header: "Description",
			size: 200,
			cell: ({ row }) => (
				<div className="whitespace-normal wrap-break-word">
					{row.original.description}
				</div>
			),
		},
		{
			accessorKey: "mascotId",
			header: "Mascot",
			cell: ({ row }) => {
				const mascotId = row.original.mascotId.toString();

				const url = `/assets/mascot/chap${mascotId}.png`;

				return <img className="max-w-10" src={url} />;
			},
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
						editHref="/chapters/edit/$id"
						handleDelete={async () => {
							const result = await removeChapter({ data: { id } });
							await queryClient.invalidateQueries({
								queryKey: [QUERY_KEYS.CHAPTERS],
							});
							if (result !== null) {
								setFlashState({
									type: "success",
									message: "Successfully deleted chapter",
								});
							}
						}}
					/>
				);
			},
		},
	];

	const table = useReactTable({
		data: chapters,
		columns,
		state: { globalFilter: keyword, sorting },
		onGlobalFilterChange: setKeyword,
		globalFilterFn: "includesString",
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
	} as any);

	return (
		<>
			<div className="flex items-center justify-between mb-4 gap-x-5">
				<Input
					placeholder="Cari chapter..."
					value={keyword ?? ""}
					onChange={(e) => setKeyword(e.target.value)}
					className="w-full border border-telnet-surface-darker"
				/>
				<Button className="px-4 py-2 rounded-md bg-primary border border-telnet-primary bg-telnet-primary text-white hover:bg-white hover:text-telnet-primary duration-200 cursor-pointer">
					<Link to="/chapters/add">Tambah Chapter</Link>
				</Button>
			</div>
			<TanstackTable
				table={table}
				columns={columns}
				title="List Chapters"
				fallbackMessage="No Chapter created yet"
			/>
		</>
	);
}
