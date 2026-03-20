import { Link } from "@tanstack/react-router";
import type { Row } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ActionCellProps<T, K extends keyof T> {
	row: Row<T>;
	keyName: K;
	editHref: string;
	handleDelete?: () => void;
}

export default function ActionCell<T, K extends keyof T>({
	row,
	keyName,
	editHref,
	handleDelete = () => {
		console.log("deleted");
	},
}: ActionCellProps<T, K>) {
	const id = row.original[keyName];

	return (
		<AlertDialog>
			<div className="flex gap-2 ">
				<Link
					to={editHref}
					params={{ id: String(id) }}
					className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
				>
					<Edit size="18" />
				</Link>

				<AlertDialogTrigger asChild>
					<button
						type="button"
						className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm cursor-pointer"
					>
						<Trash2 size="18" />
					</button>
				</AlertDialogTrigger>
			</div>
			<AlertDialogContent className="border border-telnet-primary">
				<AlertDialogHeader>
					<AlertDialogTitle className="text-telnet-primary">
						Are you absolutely sure?
					</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently delete this data
						with ID{" "}
						<span className="font-semibold text-telnet-tertiary">
							{String(id)}
						</span>{" "}
						from our servers.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleDelete}
						className="cursor-pointer bg-red-600 text-white hover:bg-white hover:text-red-600 duration-200 border border-red-600"
					>
						Continue
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
