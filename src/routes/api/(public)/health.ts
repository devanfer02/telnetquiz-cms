import { createFileRoute } from "@tanstack/react-router";
import { response } from "@/lib/http";

export const Route = createFileRoute("/api/(public)/health")({
	server: {
		handlers: {
			GET: () => {
				return response(
					{
						message: "server ok!",
					},
					200,
				);
			},
		},
	},
});
