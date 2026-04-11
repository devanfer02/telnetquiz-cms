import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

interface UserScoreDistributionChartProps {
	submissions: { chapterTitle: string; score: number }[];
}

const chartConfig = {
	low: {
		label: "< 50",
		color: "#ef4444",
	},
	medium: {
		label: "50–79",
		color: "#eab308",
	},
	high: {
		label: "\u2265 80",
		color: "#22c55e",
	},
} satisfies ChartConfig;

export default function UserScoreDistributionChart({
	submissions,
}: UserScoreDistributionChartProps) {
	const chartData = useMemo(() => {
		if (submissions.length === 0) return [];

		const byChapter = new Map<
			string,
			{ low: number; medium: number; high: number }
		>();
		for (const sub of submissions) {
			const counts = byChapter.get(sub.chapterTitle) ?? {
				low: 0,
				medium: 0,
				high: 0,
			};
			if (sub.score >= 80) counts.high++;
			else if (sub.score >= 50) counts.medium++;
			else counts.low++;
			byChapter.set(sub.chapterTitle, counts);
		}

		return [...byChapter.entries()].map(([chapter, counts]) => ({
			chapter,
			...counts,
		}));
	}, [submissions]);

	if (chartData.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Distribusi Skor</CardTitle>
					<CardDescription>Sebaran skor per bab</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-center text-muted-foreground py-8 italic">
						Belum ada data
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Distribusi Skor</CardTitle>
				<CardDescription>
					Jumlah percobaan per rentang skor di setiap bab. Banyak merah
					menandakan kesulitan berulang
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig}>
					<BarChart data={chartData}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="chapter" />
						<YAxis allowDecimals={false} />
						<ChartTooltip content={<ChartTooltipContent />} />
						<ChartLegend content={<ChartLegendContent />} />
						<Bar dataKey="low" stackId="a" fill="var(--color-low)" />
						<Bar dataKey="medium" stackId="a" fill="var(--color-medium)" />
						<Bar
							dataKey="high"
							stackId="a"
							fill="var(--color-high)"
							radius={[4, 4, 0, 0]}
						/>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
