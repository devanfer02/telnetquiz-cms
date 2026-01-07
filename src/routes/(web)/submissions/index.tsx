import { getAllSubmissions } from "@/actions/analytics";
import { QUERY_KEYS } from "@/lib/constant";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import RecentSubmission from "../dashboard/-sections/recent-submission";
import PageHeader from "@/components/global/page-header";

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
		<div>
			<PageHeader
				title="Submissions"
				description="List submisi terbaru dari pengguna."
			/>
			<RecentSubmission />
		</div>
	);
}
