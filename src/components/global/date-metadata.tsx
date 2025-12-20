interface MetadataTableProps {
	createdAt: Date;
	updatedAt: Date;
}

export function MetadataTable({ createdAt, updatedAt }: MetadataTableProps) {
	return (
		<>
			<table className="mt-6 w-full border-collapse">
				<tbody>
					{createdAt && (
						<tr className="border-b border-gray-200">
							<td className="py-3 pr-4 text-sm font-medium text-gray-500 w-32">
								Created At:
							</td>
							<td className="py-3 text-sm text-gray-900">
								{new Date(createdAt).toLocaleDateString("en-US", {
									year: "numeric",
									month: "long",
									day: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								})}
							</td>
						</tr>
					)}
					{updatedAt && (
						<tr className="border-b border-gray-200">
							<td className="py-3 pr-4 text-sm font-medium text-gray-500 w-32">
								Updated At:
							</td>
							<td className="py-3 text-sm text-gray-900">
								{new Date(updatedAt).toLocaleDateString("en-US", {
									year: "numeric",
									month: "long",
									day: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								})}
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</>
	);
}
