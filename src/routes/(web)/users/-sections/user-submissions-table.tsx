import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface UserSubmissionsTableProps {
	submissions: {
		id: number;
		chapterTitle: string;
		quizLevel: number;
		score: number;
		createdAt: string | Date;
	}[];
	totalSubmissions: number;
}

export default function UserSubmissionsTable({
	submissions,
	totalSubmissions,
}: UserSubmissionsTableProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Riwayat Kuis ({totalSubmissions})</CardTitle>
				<CardDescription>
					Semua percobaan kuis yang telah dilakukan pengguna
				</CardDescription>
			</CardHeader>
			<CardContent>
				{submissions.length === 0 ? (
					<p className="text-center text-muted-foreground py-8 italic">
						Belum ada submission
					</p>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>No</TableHead>
								<TableHead>Bab</TableHead>
								<TableHead>Level</TableHead>
								<TableHead>Skor</TableHead>
								<TableHead>Tanggal</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{submissions.map((sub, index) => (
								<TableRow key={sub.id}>
									<TableCell className="text-muted-foreground">
										{index + 1}
									</TableCell>
									<TableCell className="font-medium">
										{sub.chapterTitle}
									</TableCell>
									<TableCell>
										<Badge variant="outline">Level {sub.quizLevel}</Badge>
									</TableCell>
									<TableCell>
										<Badge
											className={
												sub.score >= 80
													? "bg-green-100 text-green-700 border-green-200"
													: sub.score >= 50
														? "bg-yellow-100 text-yellow-700 border-yellow-200"
														: "bg-red-100 text-red-700 border-red-200"
											}
											variant="outline"
										>
											{sub.score}
										</Badge>
									</TableCell>
									<TableCell className="text-muted-foreground">
										{new Date(sub.createdAt).toLocaleDateString("id-ID", {
											day: "numeric",
											month: "short",
											year: "numeric",
											hour: "2-digit",
											minute: "2-digit",
										})}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	);
}
