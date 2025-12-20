import { removeStudyMaterial } from "@/actions/study-material";
import ActionCell from "@/components/global/action-cell";
import { SortableHeader } from "@/components/global/sortable-header";
import TableLink from "@/components/global/table-link";
import TanstackTable from "@/components/global/ts-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { filterColumns } from "@/lib/utils";
import { setFlashState } from "@/store/use-flash";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
	ColumnDef,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

interface StudyMaterialListProps {
	studyMaterials: StudyMaterial[];
	disableKey?: (keyof StudyMaterial)[];
}

export default function StudyMaterialList({
	studyMaterials,
	disableKey,
}: StudyMaterialListProps) {
	const queryClient = useQueryClient();
	const [keyword, setKeyword] = useState("");
	const [data, _] = useState(() => studyMaterials);
	const [sorting, setSorting] = useState<SortingState>([]);

	const columns: ColumnDef<StudyMaterial>[] = [
		{
			accessorKey: "id",
			header: ({ column }) => <SortableHeader column={column} title="ID" />,
			size: 10,
			cell: ({ row }) => {
				const id = row.original.id.toString();

				return (
					<TableLink to="/study-materials/$id" paramKey="id" paramValue={id} />
				);
			},
		},
		{
			accessorKey: "title",
			header: ({ column }) => <SortableHeader column={column} title="Title" />,
			size: 50,
		},
		{
			accessorKey: "content",
			header: "Content",
			size: 200,
			cell: ({ row }) => (
				<div className="whitespace-normal wrap-break-word">
					{row.original.content}
				</div>
			),
		},
		{
			accessorKey: "imageLink",
			header: "Image",
			size: 50,
			cell: ({ row }) => {
				if (!row.original.imageLink) return null;

				return (
					<img
						src={row.original.imageLink}
						alt="image material"
						className="w-18 h-18"
					/>
				);
			},
		},
		{
			accessorKey: "actions",
			header: "Actions",
			size: 100,
			cell: ({ row }) => {
				const id = row.original.id;

				return (
					<ActionCell
						row={row}
						keyName="id"
						editHref="/study-materials/edit/$id"
						handleDelete={async () => {
							const result = await removeStudyMaterial({ data: id });
							await queryClient.invalidateQueries({
								queryKey: ["study-material-list"],
							});
							if (result !== null) {
								setFlashState({
									type: "success",
									message: "Successfully deleted material",
								});
							}
						}}
					/>
				);
			},
		},
	];

	const table = useReactTable({
		data,
		columns: filterColumns(columns, disableKey),
		state: { globalFilter: keyword, sorting },
		onGlobalFilterChange: setKeyword,
		globalFilterFn: "includesString",
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowMOdel: getFilteredRowModel(),
	} as any);

	return (
		<>
			<div className="flex items-center justify-between mb-4 gap-x-5">
				<Input
					placeholder="Cari materi pelajaran..."
					value={keyword ?? ""}
					onChange={(e) => setKeyword(e.target.value)}
					className="w-full border border-telnet-surface-darker"
				/>
				<Button className="px-4 py-2 rounded-md bg-primary border border-telnet-primary bg-telnet-primary text-white hover:bg-white hover:text-telnet-primary duration-200 cursor-pointer">
					<Link to="/study-materials/add">Tambah Materi Pelajaran</Link>
				</Button>
			</div>
			<TanstackTable
				table={table}
				columns={columns}
				title="List Materi Pelajaran"
				fallbackMessage="No Study Materials created yet"
			/>
		</>
	);
}
