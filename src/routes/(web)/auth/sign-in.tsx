import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(web)/auth/sign-in")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/auth/sign-in"!</div>;
}
