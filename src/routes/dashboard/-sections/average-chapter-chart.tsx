import { useState } from "react";
import { Bar, BarChart, Cell, Label, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { Card } from "../../../components/ui/card";
import { type ChartConfig, ChartContainer } from "../../../components/ui/chart";

interface AverageChapterBarChartProps {
	className?: string;
	averages: AverageScoreChapter[];
}

const chartConfig = {
	averageScore: {
		label: "Average Score",
		color: "#f37704",
	},
} satisfies ChartConfig;

export default function AverageChapterBarChart({
	className,
	averages,
}: AverageChapterBarChartProps) {
	const [focusBar, setFocusBar] = useState<number | null>(null);

	return (
		<Card className={cn("", className)}>
			<h2 className="text-xl text-telnet-primary mb-3 ml-5 font-black">
				Average Score per Chapter
			</h2>
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
						{averages.map((_, index) => (
							<Cell
								key={`cell-${index}`}
								fill={focusBar === index ? "#ffdab7" : "#f37704"}
							/>
						))}
					</Bar>
				</BarChart>
			</ChartContainer>
		</Card>
	);
}
