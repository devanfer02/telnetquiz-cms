import { useSuspenseQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/actions/analytics";
import { flatSidebarItems, QUERY_KEYS } from "@/lib/constant";
import CardStat from "../../../../components/global/card-stat";
import { Card } from "../../../../components/ui/card";

export default function DashboardStats() {
	const { data: stats } = useSuspenseQuery({
		queryKey: [QUERY_KEYS.DASHBOARD_STATS],
		queryFn: () => getDashboardStats(),
		staleTime: 60 * 1000,
	});

	const dashboardItems = flatSidebarItems
		.filter((item) => item.title !== "Dashboard")
		.map((item) => {
			let count = 0;
			switch (item.title) {
				case "Chapters":
					count = stats.chapters;
					break;
				case "Quiz":
					count = stats.quizzes;
					break;
				case "Study Materials":
					count = stats.studyMaterials;
					break;
				case "Questions":
					count = stats.questions;
					break;
				case "Submissions":
					count = stats.submissions;
					break;
				case "Users":
					count = stats.users;
					break;
			}
			return {
				...item,
				counter: count,
			};
		});

	return (
		<Card className="my-5 px-5">
			<h1 className="font-black text-telnet-primary text-xl">
				Current statistics
			</h1>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 md:gap-x-10 gap-y-5">
				{dashboardItems.map((item) => (
					<CardStat
						key={item.title}
						counter={item.counter}
						icon={item.icon}
						title={item.title}
						target={item.url}
					/>
				))}
			</div>
		</Card>
	);
}
