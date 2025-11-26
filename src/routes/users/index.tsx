import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/users/")({
	component: RouteComponent,
});

function RouteComponent() {
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
			{/* <>component</> */}
		</>
	);
}
