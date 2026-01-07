import { auth } from "@/lib/auth";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/api/(public)/auth/$")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const url = new URL(request.url);
				const authError = url.searchParams.get("error");

				if (authError) {
					throw redirect({
						to: "/auth/sign-in",
						search: {
							error: authError,
						},
					});
				}

				return await auth.handler(request);
			},
			POST: async ({ request }) => {
				return await auth.handler(request);
			},
		},
	},
});
