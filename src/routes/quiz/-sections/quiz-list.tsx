import ActionCell from "@/components/global/action-cell";
import { SortableHeader } from "@/components/global/sortable-header";
import TableLink from "@/components/global/table-link";
import TanstackTable from "@/components/global/ts-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { filterColumns } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { ColumnDef, SortingState, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useState } from "react";

export const columns: ColumnDef<Quiz>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <SortableHeader column={column} title="ID" />,
    size: 10,
    cell: ({ row }) => {
      const id = row.original.id.toString()

      return (
        <TableLink to="/quiz/$id" paramKey="id" paramValue={id}/>
      )
    }
  },
  {
    accessorKey: "chapterId",
    header: ({column}) => <SortableHeader column={column} title="Chapter ID"/>,
    size: 10,
    cell: ({row}) => {
      const chapterId = row.original.chapterId!.toString()

      return (
        <TableLink to="/chapters/$id" paramKey="id" paramValue={chapterId}/>
      )
    }
  },
  {
    accessorKey: "chapterName",
    header: "Chapter Name",
    size: 10
  },
  {
    accessorKey: "title",
    header: ({ column }) => <SortableHeader column={column} title="Title" />,
    size: 50,
  },
  {
    accessorKey: "difficulty",
    header: ({ column }) => <SortableHeader column={column} title="Difficulty" />,
    size: 50,
  },
  {
    accessorKey: "numberOfQuestions",
    header: ({column}) => <SortableHeader column={column} title="Total Questions" className="text-center"/>,
    cell: ({row}) => <p className="">{row.original.numberOfQuestions}</p>
  },
  {
    id: "actions",
    header: "Actions",
    size: 100,
    cell: ({ row }) => <ActionCell row={row} keyName="id" editHref="/quiz/edit/$id"/>
  },
]

interface QuizListProps {
  quizzes: Quiz[]
  disableKey?: (keyof Quiz)[]
}

export default function QuizList({quizzes, disableKey}: QuizListProps) {
  const [keyword, setKeyword] = useState("")
  const [data, _] = useState(() => quizzes)
  const [sorting, setSorting] = useState<SortingState>([])

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
  } as any)

  return (
    <>
      <div className="flex items-center justify-between mb-4 gap-x-5">
        <Input
          placeholder="Cari quiz..."
          value={keyword ?? ""}
          onChange={e => setKeyword(e.target.value)}
          className="w-full border border-telnet-surface-darker"
        />
        <Button className="px-4 py-2 rounded-md bg-primary border border-telnet-primary bg-telnet-primary text-white hover:bg-white hover:text-telnet-primary duration-200 cursor-pointer">
          <Link to="/quiz/add">
            Tambah Quiz
          </Link>
        </Button>
      </div>
      <TanstackTable
        table={table}
        columns={columns}
        title="List Quiz"
        fallbackMessage="No Chapter created yet"
      />
    </>
  )
}