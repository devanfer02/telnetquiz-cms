import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { getUserDetail } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { QUERY_KEYS } from "@/lib/constant";
import UserAchievements from "./-sections/user-achievements";
import UserActivityHeatmap from "./-sections/user-activity-heatmap";
import UserChapterMasteryRadar from "./-sections/user-chapter-mastery-radar";
import UserDailyProgressChart from "./-sections/user-daily-progress-chart";
import UserInfoCard from "./-sections/user-info-card";
import UserPretestResults from "./-sections/user-pretest-results";
import UserPretestVsQuizChart from "./-sections/user-pretest-vs-quiz-chart";
import UserScoreDistributionChart from "./-sections/user-score-distribution-chart";
import UserStatsGrid from "./-sections/user-stats-grid";
import UserSubmissionsTable from "./-sections/user-submissions-table";

export const Route = createFileRoute("/(web)/users/$id")({
	loader: async ({ context, params }) => {
		await context.queryClient.prefetchQuery({
			queryKey: [QUERY_KEYS.USER_DETAIL, params.id],
			queryFn: () => getUserDetail({ data: { id: params.id } }),
		});
	},
	component: UserDetailPage,
});

function UserDetailPage() {
	const router = useRouter();
	const { id } = Route.useParams();

	const { data } = useSuspenseQuery({
		queryKey: [QUERY_KEYS.USER_DETAIL, id],
		queryFn: () => getUserDetail({ data: { id } }),
		staleTime: 30 * 1000,
	});

	if (!data) {
		return (
			<div className="flex flex-col items-center justify-center py-20 gap-4">
				<p className="text-muted-foreground text-lg">User not found</p>
				<Button variant="outline" onClick={() => router.history.back()}>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Users
				</Button>
			</div>
		);
	}

	const { user, stats, submissions, pretestSubmissions } = data;

	return (
		<div className="space-y-6 mb-10">
			<div className="flex items-center gap-4">
				<Button
					variant="outline"
					size="icon"
					onClick={() => router.history.back()}
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div>
					<h1 className="text-2xl font-bold tracking-tight">User Detail</h1>
					<p className="text-muted-foreground">
						View user profile and quiz activity
					</p>
				</div>
			</div>

			<Separator />

			<UserInfoCard user={user} />
			<UserStatsGrid stats={stats} />

			<UserDailyProgressChart submissions={submissions} />

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<UserActivityHeatmap submissions={submissions} />
				<UserChapterMasteryRadar submissions={submissions} />
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<UserScoreDistributionChart submissions={submissions} />
				<UserPretestVsQuizChart
					submissions={submissions}
					pretestSubmissions={pretestSubmissions}
				/>
			</div>

			<UserAchievements userId={id} />

			<UserSubmissionsTable
				submissions={submissions}
				totalSubmissions={stats.totalSubmissions}
			/>
			<UserPretestResults
				pretestSubmissions={pretestSubmissions}
				stats={stats}
			/>
		</div>
	);
}
