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
import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { resetAllUsersProgressAction } from "@/actions/users";
import { SortableHeader } from "@/components/global/sortable-header";
import TanstackTable from "@/components/global/ts-table";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QUERY_KEYS } from "@/lib/constant";
import { setFlashState } from "@/store/use-flash";
import UserActions from "./user-actions";

function formatDate(value: unknown): string {
	const date = value instanceof Date ? value : new Date(String(value));
	if (Number.isNaN(date.getTime())) return "-";
	return date.toLocaleDateString("id-ID", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export const columns: ColumnDef<User>[] = [
	{
		accessorKey: "name",
		header: ({ column }) => <SortableHeader column={column} title="Fullname" />,
		cell: ({ row }) => (
			<Link
				to="/users/$id"
				params={{ id: row.original.id }}
				className="text-orange-600 hover:underline font-medium"
			>
				{row.original.name}
			</Link>
		),
	},
	{
		accessorKey: "email",
		header: "Email",
	},
	{
		accessorKey: "schoolName",
		header: "School",
		cell: ({ row }) => row.original.schoolName ?? "-",
	},
	{
		accessorKey: "grade",
		header: "Grade",
		cell: ({ row }) => row.original.grade ?? "-",
	},
	{
		accessorKey: "createdAt",
		header: "Registered At",
		cell: ({ row }) => formatDate(row.original.createdAt),
	},
	{
		id: "actions",
		header: "Actions",
		cell: ({ row }) => <UserActions user={row.original} />,
	},
];

interface UserListProps {
	users: User[];
}

export default function UserList({ users }: UserListProps) {
	const [keyword, setKeyword] = useState("");
	const [sorting, setSorting] = useState<SortingState>([]);
	const [isResetting, setIsResetting] = useState(false);
	const queryClient = useQueryClient();

	const table = useReactTable({
		data: users,
		columns,
		state: { globalFilter: keyword, sorting },
		onGlobalFilterChange: setKeyword,
		globalFilterFn: "includesString",
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
	});

	const handleResetAll = async () => {
		setIsResetting(true);
		const result = await resetAllUsersProgressAction();
		setIsResetting(false);

		if (result) {
			setFlashState({
				type: "success",
				message: "Progress semua user berhasil direset (pretest tetap).",
			});
			await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
		} else {
			setFlashState({
				type: "error",
				message: "Gagal mereset progress semua user.",
			});
		}
	};

	return (
		<>
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3 sm:gap-x-5">
				<Input
					placeholder="Cari User..."
					value={keyword ?? ""}
					onChange={(e) => setKeyword(e.target.value)}
					className="w-full"
				/>
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button
							type="button"
							disabled={isResetting}
							className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white cursor-pointer whitespace-nowrap"
						>
							<RotateCcw size={18} />
							Reset All Progress
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Reset Progress Semua User?</AlertDialogTitle>
							<AlertDialogDescription>
								Tindakan ini akan menghapus{" "}
								<span className="font-semibold">seluruh quiz submissions</span>{" "}
								dan achievements milik{" "}
								<span className="font-semibold">semua user</span>. Hasil pretest{" "}
								<span className="font-semibold">tidak akan</span> dihapus.
								Tindakan ini tidak dapat dibatalkan.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel className="cursor-pointer">
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={handleResetAll}
								className="bg-amber-600 text-white hover:bg-amber-700 cursor-pointer"
							>
								Reset All
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
			<TanstackTable
				table={table}
				columns={columns}
				title="List users"
				fallbackMessage="No User created yet"
			/>
		</>
	);
}
