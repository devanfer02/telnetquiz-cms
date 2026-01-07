import { response } from "@/lib/http";
import { createFileRoute } from "@tanstack/react-router";

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
