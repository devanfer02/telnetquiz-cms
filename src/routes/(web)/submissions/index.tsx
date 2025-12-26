import { getAllSubmissions } from "@/actions/analytics";
import { QUERY_KEYS } from "@/lib/constant";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import RecentSubmission from "../dashboard/-sections/recent-submission";

export const Route = createFileRoute("/(web)/submissions/")({
	loader: async ({ context }) => {
		await context.queryClient.prefetchQuery({
			queryKey: [QUERY_KEYS.SUBMISSIONS],
			queryFn: () => getAllSubmissions(),
		});
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<div className="mt-3 mb-5">
				<h1 className="text-3xl font-black text-telnet-primary tracking-tight">
					Submissions
				</h1>
				<p className="text-muted-foreground">
					List submisi terbaru dari pengguna.
				</p>
			</div>
			<RecentSubmission />
		</>
	);
}
