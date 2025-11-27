import { generateMockUsers } from "@/data/mock-user";
import { createFileRoute } from "@tanstack/react-router";
import UserList from "./-sections/user-list";

export const Route = createFileRoute("/users/")({
	loader: () => ({ data: generateMockUsers(30) }),
	component: RouteComponent,
});

function RouteComponent() {
	const { data: users } = Route.useLoaderData();

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
