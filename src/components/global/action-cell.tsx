import { Link } from "@tanstack/react-router";
import { Row } from "@tanstack/react-table"
import { Edit, Trash2 } from "lucide-react";

interface ActionCellProps<T,K extends keyof T> {
  row: Row<T>
  keyName: K;
}

export default function ActionCell<T, K extends keyof T>({row, keyName}: ActionCellProps<T, K>) {
  const id = row.original[keyName]

  return (
    <div className="flex gap-2">
      <Link
        to="/chapters/edit/$id"
        params={{ id: String(id) }}
        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
      >
        <Edit size="18" />
      </Link>

      <button
        onClick={() => alert(`delete ${id}`)}
        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm cursor-pointer"
      >
        <Trash2 size="18" />
      </button>
    </div>
  )
}