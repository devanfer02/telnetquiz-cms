import { Column } from "@tanstack/react-table"

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
interface SortableHeaderProps<TData> {
  column: Column<TData, unknown>
  title: string
}

export function SortableHeader<TData>({column, title}: SortableHeaderProps<TData>) {
  const isSorted = column.getIsSorted()

  return (
    <button
      type="button"
      onClick={() => column.toggleSorting(isSorted === "asc")}
      className="flex items-center gap-2 select-none"
    >
      <span>{title}</span>
      {isSorted === "asc" ? (
        <ArrowUp className="w-4 h-4 text-muted-foreground" />
      ) : isSorted === "desc" ? (
        <ArrowDown className="w-4 h-4 text-muted-foreground" />
      ) : (
        <ArrowUpDown className="w-4 h-4 text-muted-foreground opacity-50" />
      )}
    </button>
  )
}