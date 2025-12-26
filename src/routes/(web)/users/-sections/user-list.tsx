import {
	type ColumnDef,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { SortableHeader } from "@/components/global/sortable-header";
import TanstackTable from "@/components/global/ts-table";
import { Input } from "@/components/ui/input";
import UserActions from "./user-actions";

export const columns: ColumnDef<User>[] = [
	{
		accessorKey: "id",
		header: ({ column }) => <SortableHeader column={column} title="ID" />,
		size: 10,
		cell: ({ row }) => {
			const id = row.original.id.toString();

			return <p>{id}</p>;
		},
	},
	{
		accessorKey: "name",
		header: ({ column }) => <SortableHeader column={column} title="Fullname" />,
	},
	{
		accessorKey: "email",
		header: "Email",
	},
	{
		accessorKey: "createdAt",
		header: "Registered At",
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
	} as any);

	return (
		<>
			<div className="flex items-center justify-between mb-4 gap-x-5">
				<Input
					placeholder="Cari User..."
					value={keyword ?? ""}
					onChange={(e) => setKeyword(e.target.value)}
					className="w-full border border-telnet-surface-darker"
				/>
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
