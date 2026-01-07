import { getAllUsers } from "@/actions/analytics";
import { QUERY_KEYS } from "@/lib/constant";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import UserList from "./-sections/user-list";
import PageHeader from "@/components/global/page-header";

export const Route = createFileRoute("/(web)/users/")({
	loader: async ({ context }) => {
		await context.queryClient.prefetchQuery({
			queryKey: [QUERY_KEYS.USERS],
			queryFn: () => getAllUsers(),
		});
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { data: users } = useSuspenseQuery({
		queryKey: [QUERY_KEYS.USERS],
		queryFn: () => getAllUsers(),
		staleTime: 60 * 1000,
	});

	return (
		<div>
			<PageHeader
				title="Users"
				description="List pengguna yang sudah terdaftar."
			/>
			<UserList users={users} />
		</div>
	);
}
