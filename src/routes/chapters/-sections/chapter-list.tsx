import { SortableHeader } from "@/components/global/sortable-header";
import TanstackTable from "@/components/global/ts-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { chapters } from "@/data/mock-data";
import { Link } from "@tanstack/react-router";
import { ColumnDef, SortingState, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { useState } from "react";

export const columns: ColumnDef<Chapter>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <SortableHeader column={column} title="ID" />,
    size: 10,
    cell: ({ row }) => {
      const id = row.original.id.toString()

      return (
        <Link
          to="/chapters/$id"
          params={{ id }}
          className="hover:text-telnet-primary hover:bg-white duration-200 bg-telnet-primary py-1 px-2 rounded-md border border-telnet-primary text-white"
        >
          {id}
        </Link>
      )
    }
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
    )
  },
  {
    accessorKey: "mascotId",
    header: "Mascot",
    cell: ({ row }) => {
      const mascotId = row.original.mascotId.toString()

      const url = `/assets/mascot/chap${mascotId}.png`

      return <img className="max-w-10" src={url} />
    }
  },
]

export default function ChapterList() {
  const [keyword, setKeyword] = useState("")
  const [data, _] = useState(() => chapters)
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
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
          placeholder="Cari chapter..."
          value={keyword ?? ""}
          onChange={e => setKeyword(e.target.value)}
          className="w-full border border-telnet-surface-darker"
        />
        <Button className="px-4 py-2 rounded-md bg-primary border border-telnet-primary bg-telnet-primary text-white hover:bg-white hover:text-telnet-primary duration-200 cursor-pointer">
          <Link to="/chapters/add">
            Tambah Chapter
          </Link>
        </Button>
      </div>
      <TanstackTable
        table={table}
        columns={columns}
        title="List Chapters"
        fallbackMessage="No Chapter created yet"
      />
    </>
  )
}