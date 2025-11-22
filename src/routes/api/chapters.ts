import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { mockChapters } from "@/data/mock-chapter";

export const Route = createFileRoute("/api/chapters")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				return json(
					{
						data: mockChapters,
					},
					{
						status: 200,
					},
				);
			},
		},
	},
});
