import { useMemo } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface UserActivityHeatmapProps {
	submissions: { createdAt: string }[];
}

const DAYS = [
	{ key: "mon", label: "Sen" },
	{ key: "tue", label: "" },
	{ key: "wed", label: "Rab" },
	{ key: "thu", label: "" },
	{ key: "fri", label: "Jum" },
	{ key: "sat", label: "" },
	{ key: "sun", label: "" },
] as const;

const WEEKS_TO_SHOW = 26;

function getCellClass(count: number): string {
	if (count === 0) return "bg-muted";
	if (count === 1) return "bg-green-200";
	if (count === 2) return "bg-green-400";
	return "bg-green-600";
}

interface HeatmapCell {
	key: string;
	display: string;
	count: number;
}

export default function UserActivityHeatmap({
	submissions,
}: UserActivityHeatmapProps) {
	const activityStats = useMemo(() => {
		if (submissions.length === 0)
			return {
				totalSubmissions: 0,
				activeDays: 0,
				longestStreak: 0,
				currentStreak: 0,
			};

		const dates = new Set<string>();
		for (const sub of submissions) {
			dates.add(sub.createdAt.split("T")[0]);
		}

		const sortedDates = [...dates].sort();
		const today = new Date().toISOString().split("T")[0];

		let longestStreak = 0;
		let currentStreak = 0;
		let streak = 1;

		for (let i = 1; i < sortedDates.length; i++) {
			const prev = new Date(sortedDates[i - 1]);
			const curr = new Date(sortedDates[i]);
			const diffDays = (curr.getTime() - prev.getTime()) / 86_400_000;
			if (diffDays === 1) {
				streak++;
			} else {
				longestStreak = Math.max(longestStreak, streak);
				streak = 1;
			}
		}
		longestStreak = Math.max(longestStreak, streak);

		// Current streak: count backwards from today
		currentStreak = 0;
		const d = new Date(today);
		while (dates.has(d.toISOString().split("T")[0])) {
			currentStreak++;
			d.setDate(d.getDate() - 1);
		}

		return {
			totalSubmissions: submissions.length,
			activeDays: dates.size,
			longestStreak,
			currentStreak,
		};
	}, [submissions]);

	const { grid, monthLabels } = useMemo(() => {
		const countByDate = new Map<string, number>();
		for (const sub of submissions) {
			const dateKey = sub.createdAt.split("T")[0];
			countByDate.set(dateKey, (countByDate.get(dateKey) ?? 0) + 1);
		}

		const today = new Date();
		today.setHours(12, 0, 0, 0);

		const todayDow = (today.getDay() + 6) % 7;
		const startDate = new Date(today);
		startDate.setDate(startDate.getDate() - todayDow - (WEEKS_TO_SHOW - 1) * 7);

		const weeks: HeatmapCell[][] = [];
		const monthLabels: { label: string; weekIndex: number }[] = [];
		let lastMonth = -1;
		let weekIndex = 0;

		const current = new Date(startDate);

		while (current <= today || weeks.length === 0) {
			const week: HeatmapCell[] = [];
			const weekId = current.toISOString().split("T")[0];

			for (let d = 0; d < 7; d++) {
				if (current > today) {
					week.push({
						key: `future-${weekId}-${d}`,
						display: "",
						count: -1,
					});
				} else {
					const dateStr = current.toISOString().split("T")[0];
					const displayStr = current.toLocaleDateString("id-ID", {
						day: "numeric",
						month: "long",
						year: "numeric",
					});

					if (current.getMonth() !== lastMonth) {
						lastMonth = current.getMonth();
						monthLabels.push({
							label: current.toLocaleDateString("id-ID", {
								month: "short",
							}),
							weekIndex,
						});
					}

					week.push({
						key: dateStr,
						display: displayStr,
						count: countByDate.get(dateStr) ?? 0,
					});
				}

				current.setDate(current.getDate() + 1);
			}

			weeks.push(week);
			weekIndex++;

			if (weekIndex > WEEKS_TO_SHOW + 1) break;
		}

		return { grid: weeks, monthLabels };
	}, [submissions]);

	if (submissions.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Aktivitas Harian</CardTitle>
					<CardDescription>
						Frekuensi pengerjaan kuis dalam 6 bulan terakhir
					</CardDescription>
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
				<CardTitle>Aktivitas Harian</CardTitle>
				<CardDescription>
					Frekuensi pengerjaan kuis dalam 6 bulan terakhir. Pola konsisten lebih
					baik daripada belajar dadakan
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="overflow-x-auto">
					<div className="inline-block">
						<div className="flex ml-8 mb-1 text-xs text-muted-foreground">
							{monthLabels.map((m) => {
								const nextStart =
									monthLabels.find((n) => n.weekIndex > m.weekIndex)
										?.weekIndex ?? grid.length;
								const span = nextStart - m.weekIndex;
								return (
									<div
										key={`month-${m.weekIndex}`}
										style={{ width: `${span * 18}px` }}
									>
										{m.label}
									</div>
								);
							})}
						</div>

						<div className="flex gap-[3px]">
							<div className="flex flex-col gap-[3px] pr-0.5">
								{DAYS.map((day) => (
									<div
										key={day.key}
										className="h-[15px] w-6 text-[11px] text-muted-foreground leading-[15px]"
									>
										{day.label}
									</div>
								))}
							</div>

							{grid.map((week) => (
								<div key={week[0].key} className="flex flex-col gap-[3px]">
									{week.map((cell) =>
										cell.count < 0 ? (
											<div key={cell.key} className="h-[15px] w-[15px]" />
										) : (
											<div
												key={cell.key}
												className={`h-[15px] w-[15px] rounded-[2px] ${getCellClass(cell.count)}`}
												title={`${cell.display}: ${cell.count} pengerjaan`}
											/>
										),
									)}
								</div>
							))}
						</div>

						<div className="flex items-center gap-1 text-[11px] text-muted-foreground justify-end mt-2">
							<span>Sedikit</span>
							<div className="h-[15px] w-[15px] rounded-[2px] bg-muted" />
							<div className="h-[15px] w-[15px] rounded-[2px] bg-green-200" />
							<div className="h-[15px] w-[15px] rounded-[2px] bg-green-400" />
							<div className="h-[15px] w-[15px] rounded-[2px] bg-green-600" />
							<span>Banyak</span>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t">
					<div className="text-center">
						<p className="text-2xl font-bold">
							{activityStats.totalSubmissions}
						</p>
						<p className="text-xs text-muted-foreground">Total Pengerjaan</p>
					</div>
					<div className="text-center">
						<p className="text-2xl font-bold">{activityStats.activeDays}</p>
						<p className="text-xs text-muted-foreground">Hari Aktif</p>
					</div>
					<div className="text-center">
						<p className="text-2xl font-bold">{activityStats.longestStreak}</p>
						<p className="text-xs text-muted-foreground">Streak Terpanjang</p>
					</div>
					<div className="text-center">
						<p className="text-2xl font-bold text-green-600">
							{activityStats.currentStreak}
						</p>
						<p className="text-xs text-muted-foreground">Streak Saat Ini</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
