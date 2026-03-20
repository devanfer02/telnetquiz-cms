import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	BookOpen,
	Calendar,
	GraduationCap,
	Mail,
	Trophy,
	User,
} from "lucide-react";
import { getUserDetail } from "@/actions/users";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { QUERY_KEYS } from "@/lib/constant";

export const Route = createFileRoute("/(web)/users/$id")({
	loader: async ({ context, params }) => {
		await context.queryClient.prefetchQuery({
			queryKey: [QUERY_KEYS.USER_DETAIL, params.id],
			queryFn: () => getUserDetail({ data: { id: params.id } }),
		});
	},
	component: UserDetailPage,
});

function UserDetailPage() {
	const { id } = Route.useParams();

	const { data } = useSuspenseQuery({
		queryKey: [QUERY_KEYS.USER_DETAIL, id],
		queryFn: () => getUserDetail({ data: { id } }),
		staleTime: 30 * 1000,
	});

	if (!data) {
		return (
			<div className="flex flex-col items-center justify-center py-20 gap-4">
				<p className="text-muted-foreground text-lg">User not found</p>
				<Link to="/users">
					<Button variant="outline">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back to Users
					</Button>
				</Link>
			</div>
		);
	}

	const { user, stats, submissions, pretestSubmissions } = data;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Link to="/users">
					<Button variant="outline" size="icon">
						<ArrowLeft className="h-4 w-4" />
					</Button>
				</Link>
				<div>
					<h1 className="text-2xl font-bold tracking-tight">User Detail</h1>
					<p className="text-muted-foreground">
						View user profile and quiz activity
					</p>
				</div>
			</div>

			<Separator />

			{/* User Info Card */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-4">
						{user.image ? (
							<img
								src={user.image}
								alt={user.name}
								className="w-16 h-16 rounded-full object-cover border-2 border-orange-200"
							/>
						) : (
							<div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
								<User className="w-8 h-8 text-orange-600" />
							</div>
						)}
						<div>
							<CardTitle className="text-xl">{user.name}</CardTitle>
							<CardDescription className="flex items-center gap-1.5 mt-1">
								<Mail className="h-3.5 w-3.5" />
								{user.email}
							</CardDescription>
							<p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
								<Calendar className="h-3 w-3" />
								Registered{" "}
								{user.createdAt
									? new Date(user.createdAt).toLocaleDateString("id-ID", {
											day: "numeric",
											month: "long",
											year: "numeric",
										})
									: "-"}
							</p>
						</div>
					</div>
				</CardHeader>
			</Card>

			{/* Stats Grid */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="">
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
					<CardContent className="">
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
					<CardContent className="">
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
					<CardContent className="">
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

			{/* Submissions Table */}
			<Card>
				<CardHeader>
					<CardTitle>Riwayat Kuis ({stats.totalSubmissions})</CardTitle>
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
			{/* Pretest Results Table */}
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
		</div>
	);
}
