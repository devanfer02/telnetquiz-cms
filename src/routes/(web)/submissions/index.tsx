import { createFileRoute } from "@tanstack/react-router";
import { getAllSubmissions } from "@/actions/analytics";
import PageHeader from "@/components/global/page-header";
import { QUERY_KEYS } from "@/lib/constant";
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
		<div>
			<PageHeader
				title="Submissions"
				description="List submisi terbaru dari pengguna."
			/>
			<RecentSubmission />
		</div>
	);
}
