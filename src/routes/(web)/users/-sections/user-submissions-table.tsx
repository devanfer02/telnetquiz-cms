import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const PAGE_SIZE = 10;

export default function UserSubmissionsTable({
	submissions,
	totalSubmissions,
}: UserSubmissionsTableProps) {
	const [page, setPage] = useState(0);
	const totalPages = Math.ceil(submissions.length / PAGE_SIZE);
	const paged = submissions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

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
					<>
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
								{paged.map((sub, index) => (
									<TableRow key={sub.id}>
										<TableCell className="text-muted-foreground">
											{page * PAGE_SIZE + index + 1}
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

						{totalPages > 1 && (
							<div className="flex items-center justify-between pt-4">
								<p className="text-sm text-muted-foreground">
									{page * PAGE_SIZE + 1}-
									{Math.min((page + 1) * PAGE_SIZE, submissions.length)} dari{" "}
									{submissions.length}
								</p>
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setPage((p) => p - 1)}
										disabled={page === 0}
									>
										<ChevronLeft className="h-4 w-4" />
									</Button>
									<span className="text-sm text-muted-foreground">
										{page + 1} / {totalPages}
									</span>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setPage((p) => p + 1)}
										disabled={page >= totalPages - 1}
									>
										<ChevronRight className="h-4 w-4" />
									</Button>
								</div>
							</div>
						)}
					</>
				)}
			</CardContent>
		</Card>
	);
}
