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

interface UserPretestVsQuizChartProps {
	submissions: { chapterTitle: string; score: number }[];
	pretestSubmissions: {
		chapterId: number | null;
		chapterTitle: string | null;
		isCorrect: boolean;
	}[];
}

const chartConfig = {
	pretest: {
		label: "Pretest (%)",
		color: "#3b82f6",
	},
	quiz: {
		label: "Kuis (rata-rata)",
		color: "#f37704",
	},
} satisfies ChartConfig;

export default function UserPretestVsQuizChart({
	submissions,
	pretestSubmissions,
}: UserPretestVsQuizChartProps) {
	const chartData = useMemo(() => {
		const pretestByChapter = new Map<
			string,
			{ correct: number; total: number }
		>();
		for (const p of pretestSubmissions) {
			if (!p.chapterTitle) continue;
			const existing = pretestByChapter.get(p.chapterTitle) ?? {
				correct: 0,
				total: 0,
			};
			existing.total++;
			if (p.isCorrect) existing.correct++;
			pretestByChapter.set(p.chapterTitle, existing);
		}

		const quizByChapter = new Map<string, number[]>();
		for (const s of submissions) {
			const scores = quizByChapter.get(s.chapterTitle) ?? [];
			scores.push(s.score);
			quizByChapter.set(s.chapterTitle, scores);
		}

		const allChapters = new Set([
			...pretestByChapter.keys(),
			...quizByChapter.keys(),
		]);

		return [...allChapters].map((chapter) => {
			const pretest = pretestByChapter.get(chapter);
			const quizScores = quizByChapter.get(chapter);
			return {
				chapter,
				pretest: pretest
					? Math.round((pretest.correct / pretest.total) * 100)
					: 0,
				quiz: quizScores
					? Math.round(
							quizScores.reduce((a, b) => a + b, 0) / quizScores.length,
						)
					: 0,
			};
		});
	}, [submissions, pretestSubmissions]);

	const hasPretestData = pretestSubmissions.some((p) => p.chapterId !== null);

	if (chartData.length === 0 || !hasPretestData) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Pretest vs Kuis</CardTitle>
					<CardDescription>
						Perbandingan hasil pretest dan kuis per bab
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-center text-muted-foreground py-8 italic">
						{!hasPretestData
							? "Data pretest per bab tidak tersedia"
							: "Belum ada data"}
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Pretest vs Kuis</CardTitle>
				<CardDescription>
					Perbandingan skor pretest awal dengan performa kuis. Selisih positif
					menunjukkan pertumbuhan belajar
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig}>
					<BarChart data={chartData}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="chapter" />
						<YAxis domain={[0, 100]} />
						<ChartTooltip content={<ChartTooltipContent />} />
						<ChartLegend content={<ChartLegendContent />} />
						<Bar
							dataKey="pretest"
							fill="var(--color-pretest)"
							radius={[4, 4, 0, 0]}
						/>
						<Bar
							dataKey="quiz"
							fill="var(--color-quiz)"
							radius={[4, 4, 0, 0]}
						/>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
