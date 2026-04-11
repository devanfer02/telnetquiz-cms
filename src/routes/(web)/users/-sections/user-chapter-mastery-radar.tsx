import { useMemo } from "react";
import {
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	Radar,
	RadarChart,
} from "recharts";
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

interface UserChapterMasteryRadarProps {
	submissions: { chapterTitle: string; score: number }[];
}

const chartConfig = {
	mastery: {
		label: "Penguasaan",
		color: "#8b5cf6",
	},
} satisfies ChartConfig;

export default function UserChapterMasteryRadar({
	submissions,
}: UserChapterMasteryRadarProps) {
	const chartData = useMemo(() => {
		if (submissions.length === 0) return [];

		const byChapter = new Map<string, number[]>();
		for (const sub of submissions) {
			const scores = byChapter.get(sub.chapterTitle) ?? [];
			scores.push(sub.score);
			byChapter.set(sub.chapterTitle, scores);
		}

		return [...byChapter.entries()].map(([chapter, scores]) => ({
			chapter,
			mastery: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
		}));
	}, [submissions]);

	if (chartData.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Profil Penguasaan Materi</CardTitle>
					<CardDescription>Radar penguasaan per bab</CardDescription>
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
				<CardTitle>Profil Penguasaan Materi</CardTitle>
				<CardDescription>
					Bentuk simetris menunjukkan penguasaan merata, bentuk tidak seimbang
					menunjukkan area yang perlu diperkuat
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer
					config={chartConfig}
					className="mx-auto aspect-square max-h-[350px]"
				>
					<RadarChart data={chartData}>
						<PolarGrid />
						<PolarAngleAxis dataKey="chapter" />
						<PolarRadiusAxis angle={30} domain={[0, 100]} />
						<ChartTooltip content={<ChartTooltipContent />} />
						<Radar
							name="Penguasaan"
							dataKey="mastery"
							stroke="var(--color-mastery)"
							fill="var(--color-mastery)"
							fillOpacity={0.3}
						/>
					</RadarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
