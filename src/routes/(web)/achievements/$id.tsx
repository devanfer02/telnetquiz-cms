import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { getAchievementDetail } from "@/actions/achievements";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { QUERY_KEYS } from "@/lib/constant";
import AchievementInfoCard from "./-sections/achievement-info-card";
import AchievementUsersTable from "./-sections/achievement-users-table";

export const Route = createFileRoute("/(web)/achievements/$id")({
	loader: async ({ context, params }) => {
		await context.queryClient.prefetchQuery({
			queryKey: [QUERY_KEYS.ACHIEVEMENT_DETAIL, params.id],
			queryFn: () => getAchievementDetail({ data: Number(params.id) }),
		});
	},
	component: AchievementDetailPage,
});

function AchievementDetailPage() {
	const { id } = Route.useParams();

	const { data } = useSuspenseQuery({
		queryKey: [QUERY_KEYS.ACHIEVEMENT_DETAIL, id],
		queryFn: () => getAchievementDetail({ data: Number(id) }),
		staleTime: 30 * 1000,
	});

	if (!data) {
		return (
			<div className="flex flex-col items-center justify-center py-20 gap-4">
				<p className="text-muted-foreground text-lg">Achievement not found</p>
				<Link to="/achievements">
					<Button variant="outline">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Kembali ke Achievements
					</Button>
				</Link>
			</div>
		);
	}

	const { achievement, unlockedUsers } = data;

	return (
		<div className="space-y-6 mb-10">
			<div className="flex items-center gap-4">
				<Link to="/achievements">
					<Button variant="outline" size="icon">
						<ArrowLeft className="h-4 w-4" />
					</Button>
				</Link>
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						Detail Achievement
					</h1>
					<p className="text-muted-foreground">
						Informasi achievement dan pengguna yang mendapatkannya
					</p>
				</div>
			</div>

			<Separator />

			<AchievementInfoCard achievement={achievement} />
			<AchievementUsersTable users={unlockedUsers} />
		</div>
	);
}
