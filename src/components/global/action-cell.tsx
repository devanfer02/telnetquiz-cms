import { Link } from "@tanstack/react-router";
import type { Row } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";

interface ActionCellProps<T, K extends keyof T> {
	row: Row<T>;
	keyName: K;
	editHref: string;
}

export default function ActionCell<T, K extends keyof T>({
	row,
	keyName,
	editHref,
}: ActionCellProps<T, K>) {
	const id = row.original[keyName];

	return (
		<div className="flex gap-2">
			<Link
				to={editHref}
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
	);
}
