import { useState } from "react";
import { Bar, BarChart, Cell, Label, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { Card } from "../../../components/ui/card";
import { type ChartConfig, ChartContainer } from "../../../components/ui/chart";
import { useSuspenseQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constant";
import { getAverageScores } from "@/actions/analytics";

interface AverageChapterBarChartProps {
	className?: string;
}

const chartConfig = {
	averageScore: {
		label: "Average Score",
		color: "#f37704",
	},
} satisfies ChartConfig;

export default function AverageChapterBarChart({
	className,
}: AverageChapterBarChartProps) {
	const { data: averages } = useSuspenseQuery({
		queryKey: [QUERY_KEYS.AVERAGE_SCORES],
		queryFn: () => getAverageScores(),
		staleTime: 60 * 1000,
	});

	const [focusBar, setFocusBar] = useState<number | null>(null);

	return (
		<Card className={cn("", className)}>
			<h2 className="text-xl text-telnet-primary mb-3 ml-5 font-black">
				Average Score per Chapter
			</h2>
			{averages.length === 0 ? (
				<div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground italic">
					No data available yet
				</div>
			) : (
				<ChartContainer config={chartConfig}>
					<BarChart
						data={averages}
						onMouseMove={(state) => {
							if (state.isTooltipActive) {
								setFocusBar(state.activeTooltipIndex || null);
							} else {
								setFocusBar(null);
							}
						}}
						onMouseLeave={(_) => {
							setFocusBar(null);
						}}
					>
						<XAxis dataKey="chapter">
							<Label value="Chapters" offset={-2} position="insideBottom" />
						</XAxis>
						<YAxis>
							<Label
								value="Average Score"
								angle={-90}
								offset={+15}
								position="insideLeft"
								style={{ textAnchor: "middle" }}
							/>
						</YAxis>
						<Tooltip />
						<Bar dataKey="averageScore" fill="#f37704">
							{averages.map((average, index) => (
								<Cell
									key={average.chapter}
									fill={focusBar === index ? "#ffdab7" : "#f37704"}
								/>
							))}
						</Bar>
					</BarChart>
				</ChartContainer>
			)}
		</Card>
	);
}
