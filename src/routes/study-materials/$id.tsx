import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/study-materials/$id")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/study-materials/$id"!</div>;
}
