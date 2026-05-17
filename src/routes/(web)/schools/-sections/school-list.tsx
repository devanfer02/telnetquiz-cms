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
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toggleSchoolVisibility } from "@/actions/schools";
import ActionCell from "@/components/global/action-cell";
import { SortableHeader } from "@/components/global/sortable-header";
import TanstackTable from "@/components/global/ts-table";
import { Badge } from "@/components/ui/badge";
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
			accessorKey: "name",
			header: ({ column }) => (
				<SortableHeader column={column} title="Nama Sekolah" />
			),
			size: 200,
			cell: ({ row }) => (
				<div className="flex items-center gap-2">
					<span>{row.original.name}</span>
					{row.original.isHidden && (
						<Badge
							variant="outline"
							className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200"
						>
							Hidden
						</Badge>
					)}
				</div>
			),
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
				const { id, isHidden } = row.original;

				return (
					<ActionCell
						row={row}
						keyName="id"
						editHref="/schools/edit/$id"
						deleteLabel={isHidden ? "Show" : "Hide"}
						deleteIcon={isHidden ? <Eye size="18" /> : <EyeOff size="18" />}
						deleteClassName={
							isHidden
								? "p-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm cursor-pointer"
								: "p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md text-sm cursor-pointer"
						}
						confirmTitle={
							isHidden ? "Tampilkan sekolah ini?" : "Sembunyikan sekolah ini?"
						}
						confirmDescription={
							isHidden
								? `Sekolah "${row.original.name}" akan ditampilkan kembali di daftar sekolah.`
								: `Sekolah "${row.original.name}" akan disembunyikan dari daftar sekolah.`
						}
						handleDelete={async () => {
							const result = await toggleSchoolVisibility({
								data: { id, isHidden },
							});
							await queryClient.invalidateQueries({
								queryKey: [QUERY_KEYS.SCHOOLS],
							});
							if (result !== null) {
								setFlashState({
									type: "success",
									message: isHidden
										? "Sekolah berhasil ditampilkan"
										: "Sekolah berhasil disembunyikan",
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
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3 sm:gap-x-5">
				<Input
					placeholder="Cari sekolah..."
					value={keyword ?? ""}
					onChange={(e) => setKeyword(e.target.value)}
					className="w-full"
				/>
				<Button className="w-full sm:w-auto px-4 py-2 rounded-md bg-primary border border-telnet-primary bg-telnet-primary text-white hover:bg-white hover:text-telnet-primary duration-200 cursor-pointer">
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
