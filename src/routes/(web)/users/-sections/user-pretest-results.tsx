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

interface UserPretestResultsProps {
	pretestSubmissions: {
		id: number;
		question: string;
		answeredOption: string;
		isCorrect: boolean;
	}[];
	stats: {
		pretestTaken: boolean;
		pretestScore: number | null;
		pretestCorrect: number | null;
		pretestTotal: number | null;
	};
}

export default function UserPretestResults({
	pretestSubmissions,
	stats,
}: UserPretestResultsProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>
					Hasil Pretest{" "}
					{stats.pretestTaken && (
						<Badge
							className={
								(stats.pretestScore ?? 0) >= 80
									? "bg-green-100 text-green-700 border-green-200"
									: (stats.pretestScore ?? 0) >= 50
										? "bg-yellow-100 text-yellow-700 border-yellow-200"
										: "bg-red-100 text-red-700 border-red-200"
							}
							variant="outline"
						>
							{stats.pretestCorrect}/{stats.pretestTotal} benar (
							{stats.pretestScore}%)
						</Badge>
					)}
				</CardTitle>
				<CardDescription>Jawaban pretest pengguna</CardDescription>
			</CardHeader>
			<CardContent>
				{pretestSubmissions.length === 0 ? (
					<p className="text-center text-muted-foreground py-8 italic">
						Belum mengerjakan pretest
					</p>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>No</TableHead>
								<TableHead>Soal</TableHead>
								<TableHead>Jawaban</TableHead>
								<TableHead>Hasil</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{pretestSubmissions.map((p, index) => (
								<TableRow key={p.id}>
									<TableCell className="text-muted-foreground">
										{index + 1}
									</TableCell>
									<TableCell className="font-medium max-w-md wrap-break-word whitespace-normal">
										{p.question}
									</TableCell>
									<TableCell>{p.answeredOption}</TableCell>
									<TableCell>
										<Badge
											className={
												p.isCorrect
													? "bg-green-100 text-green-700 border-green-200"
													: "bg-red-100 text-red-700 border-red-200"
											}
											variant="outline"
										>
											{p.isCorrect ? "Benar" : "Salah"}
										</Badge>
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
