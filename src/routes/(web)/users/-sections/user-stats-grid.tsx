import { BookOpen, GraduationCap, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface UserStatsGridProps {
	stats: {
		totalScore: number;
		levelsCompleted: number;
		chaptersCompleted: number;
		pretestTaken: boolean;
		pretestScore: number | null;
	};
}

export default function UserStatsGrid({ stats }: UserStatsGridProps) {
	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
			<Card>
				<CardContent>
					<div className="flex items-center gap-3">
						<div className="p-2 bg-orange-100 rounded-lg">
							<Trophy className="h-5 w-5 text-orange-600" />
						</div>
						<div>
							<p className="text-2xl font-bold">{stats.totalScore}</p>
							<p className="text-xs text-muted-foreground">Total Skor</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent>
					<div className="flex items-center gap-3">
						<div className="p-2 bg-blue-100 rounded-lg">
							<GraduationCap className="h-5 w-5 text-blue-600" />
						</div>
						<div>
							<p className="text-2xl font-bold">{stats.levelsCompleted}</p>
							<p className="text-xs text-muted-foreground">Level Selesai</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent>
					<div className="flex items-center gap-3">
						<div className="p-2 bg-green-100 rounded-lg">
							<BookOpen className="h-5 w-5 text-green-600" />
						</div>
						<div>
							<p className="text-2xl font-bold">{stats.chaptersCompleted}</p>
							<p className="text-xs text-muted-foreground">Bab Selesai</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent>
					<div className="flex items-center gap-3">
						<div className="p-2 bg-purple-100 rounded-lg">
							<BookOpen className="h-5 w-5 text-purple-600" />
						</div>
						<div>
							<p className="text-2xl font-bold">
								{stats.pretestTaken ? `${stats.pretestScore}%` : "-"}
							</p>
							<p className="text-xs text-muted-foreground">Skor Pretest</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
