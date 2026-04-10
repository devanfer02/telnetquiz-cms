import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { getUserDetail } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { QUERY_KEYS } from "@/lib/constant";
import UserInfoCard from "./-sections/user-info-card";
import UserPretestResults from "./-sections/user-pretest-results";
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
				<Link to="/users">
					<Button variant="outline">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Users
					</Button>
				</Link>
			</div>
		);
	}

	const { user, stats, submissions, pretestSubmissions } = data;

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Link to="/users">
					<Button variant="outline" size="icon">
						<ArrowLeft className="h-4 w-4" />
					</Button>
				</Link>
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
