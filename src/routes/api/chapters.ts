import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";


export const Route = createFileRoute("/api/chapters")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				return json(
					{
						
					},
					{
						status: 200,
					},
				);
			},
		},
	},
});
