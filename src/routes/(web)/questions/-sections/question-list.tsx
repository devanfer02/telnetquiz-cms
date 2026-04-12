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
import { Check, X } from "lucide-react";
import { useMemo, useState } from "react";
import { removeQuestion } from "@/actions/questions";
import ActionCell from "@/components/global/action-cell";
import { SortableHeader } from "@/components/global/sortable-header";
import TableLink from "@/components/global/table-link";
import TanstackTable from "@/components/global/ts-table";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QUERY_KEYS } from "@/lib/constant";
import { sanitizeHtml } from "@/lib/sanitize";
import { filterColumns } from "@/lib/utils";
import { setFlashState } from "@/store/use-flash";
import PretestPreviewSheet from "./pretest-preview-sheet";

interface QuestionListProps {
	questions: Question[];
	disableKey?: (keyof Question)[];
}

export default function QuestionList({
	questions,
	disableKey,
}: QuestionListProps) {
	const queryClient = useQueryClient();
	const [keyword, setKeyword] = useState("");
	const [sorting, setSorting] = useState<SortingState>([]);
	const [activeTab, setActiveTab] = useState<"quiz" | "pretest">("quiz");

	const filteredData = useMemo(() => {
		return questions.filter((q) => {
			if (activeTab === "quiz") return q.type === "quiz";
			return q.type === "pretest";
		});
	}, [questions, activeTab]);

	const columnVisibility = useMemo(() => {
		return {
			quizId: activeTab === "quiz",
			materialId: activeTab === "quiz",
			chapterId: activeTab === "pretest",
		};
	}, [activeTab]);

	const columns: ColumnDef<Question>[] = [
		{
			accessorKey: "id",
			header: ({ column }) => <SortableHeader column={column} title="ID" />,
			size: 10,
			cell: ({ row }) => {
				const id = row.original.id.toString();

				return (
					<p className="hover:bg-white duration-200 py-1 px-2 rounded-md text-telnet-primary hover:text-telnet-dark-brown font-semibold">
						{id}
					</p>
				);
			},
		},
		{
			accessorKey: "quizId",
			header: ({ column }) => (
				<SortableHeader column={column} title="Quiz ID" />
			),
			size: 10,
			cell: ({ row }) => {
				const quizId = row.original.quizId?.toString();

				if (!quizId) return "-";

				return <TableLink to="/quiz/$id" paramKey="id" paramValue={quizId} />;
			},
		},
		{
			accessorKey: "materialId",
			header: ({ column }) => (
				<SortableHeader column={column} title="Material ID" />
			),
			size: 10,
			cell: ({ row }) => {
				const materialId = row.original.materialId?.toString();

				if (!materialId) return "-";

				return (
					<TableLink
						to="/study-materials/$id"
						paramKey="id"
						paramValue={materialId}
					/>
				);
			},
		},
		{
			accessorKey: "chapterId",
			header: "Chapter ID",
			cell: ({ row }) => {
				const chapterId = row.original.chapterId?.toString();

				if (!chapterId) return "-";

				return (
					<TableLink to="/chapters/$id" paramKey="id" paramValue={chapterId} />
				);
			},
		},
		{
			accessorKey: "type",
			header: "Type",
			cell: ({ row }) => <p className="capitalize">{row.original.type}</p>,
		},
		{
			accessorKey: "description",
			header: ({ column }) => (
				<SortableHeader column={column} title="Description" />
			),
			size: 50,
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
			accessorKey: "question",
			header: ({ column }) => (
				<SortableHeader column={column} title="Question" />
			),
			size: 100,
			cell: ({ row }) => (
				<div
					className="max-h-20 overflow-y-auto prose prose-sm"
					dangerouslySetInnerHTML={{
						__html: sanitizeHtml(row.original.question),
					}}
				/>
			),
		},
		{
			id: "options",
			header: "Options",
			size: 200,
			cell: ({ row }) => {
				const options = row.original.options || [];
				return (
					<Accordion type="single" collapsible className="w-full">
						<AccordionItem value="options" className="border-none">
							<AccordionTrigger className="py-2 text-sm font-medium text-telnet-primary hover:no-underline">
								Options ({options.length})
							</AccordionTrigger>
							<AccordionContent>
								<div className="flex flex-col gap-1">
									{options.map((opt, i) => (
										// biome-ignore lint/suspicious/noArrayIndexKey: options have no stable id
										<div key={i} className="flex items-center gap-2 text-sm">
											{opt.isCorrect ? (
												<Check className="w-4 h-4 text-green-500" />
											) : (
												<X className="w-4 h-4 text-red-500" />
											)}
											<span
												className={
													opt.isCorrect
														? "font-semibold text-green-700"
														: "text-gray-600"
												}
											>
												{opt.text}
											</span>
										</div>
									))}
								</div>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				);
			},
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
						alt="Question attachment"
						className="w-18 h-18"
					/>
				);
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
						editHref="/questions/edit/$id"
						handleDelete={async () => {
							const result = await removeQuestion({ data: id });
							await queryClient.invalidateQueries({
								queryKey: [QUERY_KEYS.QUESTIONS],
							});
							if (result !== null) {
								setFlashState({
									type: "success",
									message: "Successfully deleted question",
								});
							}
						}}
					/>
				);
			},
		},
	];

	const table = useReactTable({
		data: filteredData,
		columns: filterColumns(columns, disableKey),
		state: { globalFilter: keyword, sorting, columnVisibility },
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
					placeholder="Cari pertanyaan..."
					value={keyword ?? ""}
					onChange={(e) => setKeyword(e.target.value)}
					className="w-full"
				/>
				<div className="flex items-center gap-2 shrink-0">
					{activeTab === "pretest" && (
						<PretestPreviewSheet questions={filteredData} />
					)}
					<Button className="px-4 py-2 rounded-md bg-primary border border-telnet-primary bg-telnet-primary text-white hover:bg-white hover:text-telnet-primary duration-200 cursor-pointer">
						<Link to="/questions/add">Tambah Pertanyaan</Link>
					</Button>
				</div>
			</div>
			<Tabs
				value={activeTab}
				onValueChange={(val) => setActiveTab(val as "quiz" | "pretest")}
				className="w-full"
			>
				<TabsList className="mb-4">
					<TabsTrigger value="quiz">Quiz Questions</TabsTrigger>
					<TabsTrigger value="pretest">Pretest Questions</TabsTrigger>
				</TabsList>
				<TabsContent value="quiz">
					<TanstackTable
						table={table}
						columns={columns}
						title="Quiz Questions"
						fallbackMessage="No Quiz Question created yet"
					/>
				</TabsContent>
				<TabsContent value="pretest">
					<TanstackTable
						table={table}
						columns={columns}
						title="Pretest Questions"
						fallbackMessage="No Pretest Question created yet"
					/>
				</TabsContent>
			</Tabs>
		</>
	);
}
