import { dashboardItems } from "@/data/constant";
import CardStat from "../../../components/global/card-stat";
import { Card } from "../../../components/ui/card";

export default function DashboardStats() {
	return (
		<Card className="my-5 px-5">
			<h1 className="font-black text-telnet-primary text-xl">
				Current statistics
			</h1>
			<div className={`grid grid-cols-3 gap-x-10 gap-y-5`}>
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
