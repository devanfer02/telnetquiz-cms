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
import { removeSchool } from "@/actions/schools";
import ActionCell from "@/components/global/action-cell";
import { SortableHeader } from "@/components/global/sortable-header";
import TanstackTable from "@/components/global/ts-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QUERY_KEYS } from "@/lib/constant";
import { setFlashState } from "@/store/use-flash";

interface SchoolListProps {
	schools: School[];
}

export default function SchoolList({ schools }: SchoolListProps) {
	const queryClient = useQueryClient();
	const [keyword, setKeyword] = useState("");
	const [sorting, setSorting] = useState<SortingState>([]);

	const columns: ColumnDef<School>[] = [
		{
			accessorKey: "id",
			header: ({ column }) => <SortableHeader column={column} title="ID" />,
			size: 10,
		},
		{
			accessorKey: "name",
			header: ({ column }) => (
				<SortableHeader column={column} title="Nama Sekolah" />
			),
			size: 200,
		},
		{
			accessorKey: "createdAt",
			header: "Created At",
			cell: ({ row }) =>
				new Date(row.original.createdAt).toLocaleDateString("id-ID"),
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
						editHref="/schools/edit/$id"
						handleDelete={async () => {
							const result = await removeSchool({ data: { id } });
							await queryClient.invalidateQueries({
								queryKey: [QUERY_KEYS.SCHOOLS],
							});
							if (result !== null) {
								setFlashState({
									type: "success",
									message: "Successfully deleted school",
								});
							}
						}}
					/>
				);
			},
		},
	];

	const table = useReactTable({
		data: schools,
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
			<div className="flex items-center justify-between mb-4 gap-x-5">
				<Input
					placeholder="Cari sekolah..."
					value={keyword ?? ""}
					onChange={(e) => setKeyword(e.target.value)}
					className="w-full"
				/>
				<Button className="px-4 py-2 rounded-md bg-primary border border-telnet-primary bg-telnet-primary text-white hover:bg-white hover:text-telnet-primary duration-200 cursor-pointer">
					<Link to="/schools/add">Tambah Sekolah</Link>
				</Button>
			</div>
			<TanstackTable
				table={table}
				columns={columns}
				title="List Schools"
				fallbackMessage="No School created yet"
			/>
		</>
	);
}
