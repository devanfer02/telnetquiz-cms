import Footer from "@/components/global/footer";
import { QUERY_KEYS } from "@/lib/constant";
import AverageChapterBarChart from "@/routes/(web)/dashboard/-sections/average-chapter-chart";
import DashboardStats from "@/routes/(web)/dashboard/-sections/dashboard-stat";
import Leaderboard from "@/routes/(web)/dashboard/-sections/leaderboard";
import RecentSubmission from "@/routes/(web)/dashboard/-sections/recent-submission";
import { createFileRoute } from "@tanstack/react-router";
import {
	getAllSubmissions,
	getAverageScores,
	getDashboardStats,
	getLeaderboard,
} from "@/actions/analytics";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardHeader from "./-sections/dashboard-header";

export const Route = createFileRoute("/(web)/dashboard")({
	loader: async ({ context }) => {
		const promises = [
			context.queryClient.prefetchQuery({
				queryKey: [QUERY_KEYS.SUBMISSIONS],
				queryFn: () => getAllSubmissions(),
			}),
			context.queryClient.prefetchQuery({
				queryKey: [QUERY_KEYS.AVERAGE_SCORES],
				queryFn: () => getAverageScores(),
			}),
			context.queryClient.prefetchQuery({
				queryKey: [QUERY_KEYS.LEADERBOARD],
				queryFn: () => getLeaderboard(),
			}),
			context.queryClient.prefetchQuery({
				queryKey: [QUERY_KEYS.DASHBOARD_STATS],
				queryFn: () => getDashboardStats(),
			}),
		];

		await Promise.all(promises);
	},
	component: DashboardIndex,
});

function DashboardIndex() {
	return (
		<>
			<DashboardHeader />

			<Suspense fallback={<Skeleton className="h-50 w-full my-5" />}>
				<DashboardStats />
			</Suspense>

			<Suspense fallback={<Skeleton className="h-100 w-full my-5" />}>
				<RecentSubmission />
			</Suspense>

			<div className="flex flex-col lg:flex-row gap-y-5 gap-x-5 mb-10">
				<div className="lg:w-3/5 flex flex-col min-h-0">
					<Suspense fallback={<Skeleton className="h-100 w-full" />}>
						<AverageChapterBarChart className="flex-1" />
					</Suspense>
				</div>
				<div className="lg:w-2/5 flex flex-col min-h-0">
					<Suspense fallback={<Skeleton className="h-100 w-full" />}>
						<Leaderboard className="flex-1" />
					</Suspense>
				</div>
			</div>
			<Footer />
		</>
	);
}
