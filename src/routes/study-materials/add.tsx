import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/study-materials/add")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/study-materials/add"!</div>;
}
