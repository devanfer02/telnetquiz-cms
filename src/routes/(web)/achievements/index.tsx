import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { getAllAchievements } from "@/actions/achievements";
import PageHeader from "@/components/global/page-header";
import { QUERY_KEYS } from "@/lib/constant";
import AchievementList from "./-sections/achievement-list";

export const Route = createFileRoute("/(web)/achievements/")({
	loader: async ({ context }) => {
		await context.queryClient.prefetchQuery({
			queryKey: [QUERY_KEYS.ACHIEVEMENTS],
			queryFn: () => getAllAchievements(),
		});
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { data: achievements } = useSuspenseQuery({
		queryKey: [QUERY_KEYS.ACHIEVEMENTS],
		queryFn: () => getAllAchievements(),
		staleTime: 60 * 1000,
	});

	return (
		<div>
			<PageHeader
				title="Achievements"
				description="Kelola achievement yang dapat diraih oleh pengguna."
			/>
			<AchievementList achievements={achievements} />
		</div>
	);
}
