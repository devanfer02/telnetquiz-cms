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

export const columns: ColumnDef<Question>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <SortableHeader column={column} title="ID" />,
    size: 10,
    cell: ({ row }) => {
      const id = row.original.id.toString()

      return (
        <p className="hover:bg-white duration-200 py-1 px-2 rounded-md text-telnet-primary hover:text-telnet-dark-brown font-semibold">
          {id}
        </p>
      )
    }
  },
  {
    accessorKey: "quizId",
    header: ({ column }) => <SortableHeader column={column} title="Quiz ID" />,
    size: 10,
    cell: ({ row }) => {
      const quizId = row.original.quizId.toString()

      return (
        <TableLink to="/quiz/$id" paramKey="id" paramValue={quizId} />
      )
    }
  },
  {
    accessorKey: "description",
    header: ({ column }) => <SortableHeader column={column} title="Description" />,
    size: 50,
  },
  {
    accessorKey: "question",
    header: ({ column }) => <SortableHeader column={column} title="Question" />,
    size: 100,
  },
  {
    accessorKey: "imageLink",
    header: "Image",
    size: 50,
    cell: ({ row }) => {
      if (!row.original.imageLink) return null

      return (
        <img src={row.original.imageLink} alt="image description" className="w-18 h-18" />
      )
    }
  },
  {
    id: "actions",
    header: "Actions",
    size: 100,
    cell: ({ row }) => <ActionCell row={row} keyName="id" editHref="/questions/edit/$id" />
  },
]

interface QuestionListProps {
  questions: Question[]
  disableKey?: (keyof Question)[]
}

export default function QuestionList({ questions, disableKey }: QuestionListProps) {
  const [keyword, setKeyword] = useState("")
  const [data, _] = useState(() => questions)
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
          placeholder="Cari pertanyaan..."
          value={keyword ?? ""}
          onChange={e => setKeyword(e.target.value)}
          className="w-full border border-telnet-surface-darker"
        />
        <Button className="px-4 py-2 rounded-md bg-primary border border-telnet-primary bg-telnet-primary text-white hover:bg-white hover:text-telnet-primary duration-200 cursor-pointer">
          <Link to="/questions/add">
            Tambah Pertanyaan
          </Link>
        </Button>
      </div>
      <TanstackTable
        table={table}
        columns={columns}
        title="List Pertanyaan"
        fallbackMessage="No Question created yet"
      />
    </>
  )
}