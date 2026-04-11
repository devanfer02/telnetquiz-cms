import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
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
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

interface UserDailyProgressChartProps {
	submissions: { score: number; createdAt: string }[];
}

const chartConfig = {
	avgScore: {
		label: "Rata-rata Skor",
		color: "#f37704",
	},
} satisfies ChartConfig;

export default function UserDailyProgressChart({
	submissions,
}: UserDailyProgressChartProps) {
	const chartData = useMemo(() => {
		if (submissions.length === 0) return [];

		const byDate = new Map<string, number[]>();
		for (const sub of submissions) {
			const date = sub.createdAt.split("T")[0];
			const scores = byDate.get(date) ?? [];
			scores.push(sub.score);
			byDate.set(date, scores);
		}

		return [...byDate.entries()]
			.map(([date, scores]) => ({
				date,
				avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
			}))
			.sort((a, b) => a.date.localeCompare(b.date));
	}, [submissions]);

	if (chartData.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Progres Harian</CardTitle>
					<CardDescription>Rata-rata skor per hari</CardDescription>
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
				<CardTitle>Progres Harian</CardTitle>
				<CardDescription>
					Tren rata-rata skor harian menunjukkan perkembangan siswa dari waktu
					ke waktu
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig}>
					<LineChart data={chartData}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis
							dataKey="date"
							tickFormatter={(val: string) => {
								const d = new Date(val);
								return d.toLocaleDateString("id-ID", {
									day: "numeric",
									month: "short",
								});
							}}
						/>
						<YAxis domain={[0, 100]} />
						<ChartTooltip
							content={
								<ChartTooltipContent
									labelFormatter={(val) => {
										const d = new Date(val as string);
										return d.toLocaleDateString("id-ID", {
											day: "numeric",
											month: "long",
											year: "numeric",
										});
									}}
								/>
							}
						/>
						<Line
							type="monotone"
							dataKey="avgScore"
							stroke="var(--color-avgScore)"
							strokeWidth={2}
							dot={{ r: 4 }}
							activeDot={{ r: 6 }}
						/>
					</LineChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
