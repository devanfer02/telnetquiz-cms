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
import { filterColumns } from "@/lib/utils";
import { removeQuiz } from "@/actions/quizzes";
import { queryClient } from "@/lib/query-client";
import { setFlashState } from "@/store/use-flash";

interface QuizListProps {
	quizzes: Quiz[];
	disableKey?: (keyof Quiz)[];
}

export default function QuizList({ quizzes, disableKey }: QuizListProps) {
	const [keyword, setKeyword] = useState("");
	const [data, _] = useState(() => quizzes);
	const [sorting, setSorting] = useState<SortingState>([]);

	const columns: ColumnDef<Quiz>[] = [
		{
			accessorKey: "id",
			header: ({ column }) => <SortableHeader column={column} title="ID" />,
			size: 10,
			cell: ({ row }) => {
				const id = row.original.id.toString();

				return <TableLink to="/quiz/$id" paramKey="id" paramValue={id} />;
			},
		},
		{
			accessorKey: "chapterId",
			header: ({ column }) => (
				<SortableHeader column={column} title="Chapter ID" />
			),
			size: 10,
			cell: ({ row }) => {
				const chapterId = row.original.chapterId!.toString();

				return (
					<TableLink to="/chapters/$id" paramKey="id" paramValue={chapterId} />
				);
			},
		},
		{
			accessorKey: "chapter.title",
			header: "Chapter Name",
			size: 10,
		},
		{
			accessorKey: "title",
			header: ({ column }) => <SortableHeader column={column} title="Title" />,
			size: 50,
		},
		{
			accessorKey: "difficulty",
			header: ({ column }) => (
				<SortableHeader column={column} title="Difficulty" />
			),
			size: 50,
			cell: ({ row }) => {
				const difficultyStyles: Record<string, string> = {
					easy: "border-sky-500 bg-sky-100 text-sky-500",
					medium: "border-yellow-500 bg-yellow-100 text-yellow-600",
					hard: "border-red-500 bg-red-100 text-red-600",
				};

				return (
					<p
						className={`capitalize border rounded-lg py-0.5 px-2 w-fit ${
							difficultyStyles[row.original.difficulty] ??
							"border-gray-300 bg-gray-100 text-gray-600"
						}`}
					>
						{row.original.difficulty}
					</p>
				);
			},
		},
		{
			accessorKey: "level",
			header: ({ column }) => <SortableHeader column={column} title="Level" />,
		},
		{
			accessorKey: "numberOfQuestions",
			header: ({ column }) => (
				<SortableHeader
					column={column}
					title="Total Questions"
					className="text-center"
				/>
			),
			cell: ({ row }) => <p className="">{row.original.numberOfQuestions}</p>,
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
						editHref="/quiz/edit/$id"
						handleDelete={async () => {
							const result = await removeQuiz({ data: { id } });
							await queryClient.invalidateQueries({
								queryKey: ["quiz-list"],
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
		data,
		columns: filterColumns(columns, disableKey),
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
					placeholder="Cari quiz..."
					value={keyword ?? ""}
					onChange={(e) => setKeyword(e.target.value)}
					className="w-full border border-telnet-surface-darker"
				/>
				<Button className="px-4 py-2 rounded-md bg-primary border border-telnet-primary bg-telnet-primary text-white hover:bg-white hover:text-telnet-primary duration-200 cursor-pointer">
					<Link to="/quiz/add">Tambah Quiz</Link>
				</Button>
			</div>
			<TanstackTable
				table={table}
				columns={columns}
				title="List Quiz"
				fallbackMessage="No Quiz created yet"
			/>
		</>
	);
}
