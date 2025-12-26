import { getAllUsers } from "@/actions/analytics";
import { QUERY_KEYS } from "@/lib/constant";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import UserList from "./-sections/user-list";

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
		<>
			<div className="mt-3 mb-5">
				<h1 className="text-3xl font-black text-telnet-primary tracking-tight">
					Users
				</h1>
				<p className="text-muted-foreground">
					List pengguna yang sudah terdaftar
				</p>
			</div>
			<UserList users={users} />
		</>
	);
}
