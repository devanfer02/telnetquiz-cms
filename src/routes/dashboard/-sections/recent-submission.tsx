import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table"
import { submissions } from "@/data/mock-data"
import { Card } from "../../../components/ui/card"
import { useState } from "react"
import { SortableHeader } from "../../../components/global/sortable-header"
import { Submission } from "@/types/submission"

export const columns: ColumnDef<Submission>[] = [
  {
    accessorKey: "userName",
    header: ({ column }) => <SortableHeader column={column} title="User's Name" />,
  },
  {
    accessorKey: "chapterId",
    header: ({ column }) => <SortableHeader column={column} title="Chapter ID" />,
  },
  {
    accessorKey: "quizId",
    header: ({ column }) => <SortableHeader column={column} title="Quiz ID" />,
  },
  {
    accessorKey: "score",
    header: ({ column }) => <SortableHeader column={column} title="Score" />,
  },
  {
    accessorKey: "startedAt",
    header: ({ column }) => <SortableHeader column={column} title="Started At" />,
  },
  {
    accessorKey: "completedAt",
    header: ({ column }) => <SortableHeader column={column} title="Completed At" />,
  },
]

export default function RecentSubmission() {
  const [data, _] = useState(() => submissions)
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  } as any)

  return (
    <Card className="space-y-4 px-5 my-5">
      <Table>
        <TableCaption className="caption-top mt-0 mb-5 text-telnet-primary font-black text-xl text-left">Recent submissions</TableCaption>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead
                  key={header.id}
                  className="cursor-pointer select-none"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {{
                  }[header.column.getIsSorted() as string] ?? null}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No submissions found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between">
        <button
          className="border rounded px-3 py-1 disabled:opacity-50"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </button>
        <span>
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </span>
        <button
          className="border rounded px-3 py-1 disabled:opacity-50"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </button>
      </div>
    </Card>
  )
}
