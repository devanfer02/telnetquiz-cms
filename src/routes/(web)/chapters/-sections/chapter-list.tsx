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
import { toggleChapterVisibility } from "@/actions/chapters";
import ActionCell from "@/components/global/action-cell";
import { SortableHeader } from "@/components/global/sortable-header";
import TableLink from "@/components/global/table-link";
import TanstackTable from "@/components/global/ts-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QUERY_KEYS } from "@/lib/constant";
import { sanitizeHtml } from "@/lib/sanitize";
import { setFlashState } from "@/store/use-flash";

interface ChapterListProps {
	chapters: Chapter[];
}

export default function ChapterList({ chapters }: ChapterListProps) {
	const queryClient = useQueryClient();
	const [keyword, setKeyword] = useState("");
	const [sorting, setSorting] = useState<SortingState>([]);

	const columns: ColumnDef<Chapter>[] = [
		{
			accessorKey: "title",
			header: ({ column }) => <SortableHeader column={column} title="Title" />,
			size: 50,
			cell: ({ row }) => (
				<TableLink
					to="/chapters/$id"
					paramKey="id"
					paramValue={row.original.id}
				>
					<div className="flex items-center gap-2">
						<span>{row.original.title}</span>
						{row.original.isHidden && (
							<Badge
								variant="outline"
								className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200"
							>
								Hidden
							</Badge>
						)}
					</div>
				</TableLink>
			),
		},
		{
			accessorKey: "minimumScore",
			header: ({ column }) => <SortableHeader column={column} title="KKM" />,
		},
		{
			accessorKey: "description",
			header: "Description",
			size: 200,
			cell: ({ row }) => (
				<div
					className="max-h-20 overflow-y-auto prose prose-sm"
					dangerouslySetInnerHTML={{
						__html: sanitizeHtml(row.original.description),
					}}
				/>
			),
		},
		{
			accessorKey: "mascotId",
			header: "Mascot",
			cell: ({ row }) => {
				const mascotId = row.original.mascotId.toString();

				const url = `/assets/mascot/chap${mascotId}.png`;

				return (
					<img className="max-w-10" src={url} alt={`Mascot ${mascotId}`} />
				);
			},
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
						editHref="/chapters/edit/$id"
						deleteLabel={isHidden ? "Show" : "Hide"}
						deleteIcon={isHidden ? <Eye size="18" /> : <EyeOff size="18" />}
						deleteClassName={
							isHidden
								? "p-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm cursor-pointer"
								: "p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md text-sm cursor-pointer"
						}
						confirmTitle={
							isHidden ? "Tampilkan chapter ini?" : "Sembunyikan chapter ini?"
						}
						confirmDescription={
							isHidden
								? `Chapter "${row.original.title}" akan ditampilkan kembali ke pengguna.`
								: `Chapter "${row.original.title}" akan disembunyikan. Semua quiz, soal, dan submission terkait akan dihapus permanen.`
						}
						handleDelete={async () => {
							const result = await toggleChapterVisibility({
								data: { id, isHidden },
							});
							await queryClient.invalidateQueries({
								queryKey: [QUERY_KEYS.CHAPTERS],
							});
							if (result !== null) {
								setFlashState({
									type: "success",
									message: isHidden
										? "Chapter berhasil ditampilkan"
										: "Chapter berhasil disembunyikan",
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
	});

	return (
		<>
			<div className="flex items-center justify-between mb-4 gap-x-5">
				<Input
					placeholder="Cari chapter..."
					value={keyword ?? ""}
					onChange={(e) => setKeyword(e.target.value)}
					className="w-full"
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
