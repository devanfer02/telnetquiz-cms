import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
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

interface UnlockedUser {
	userId: string;
	userName: string;
	userEmail: string;
	userImage: string | null;
	schoolName: string | null;
	grade: string | null;
	unlockedAt: Date;
}

interface AchievementUsersTableProps {
	users: UnlockedUser[];
}

const PAGE_SIZE = 10;

export default function AchievementUsersTable({
	users,
}: AchievementUsersTableProps) {
	const [page, setPage] = useState(0);
	const totalPages = Math.ceil(users.length / PAGE_SIZE);
	const paged = users.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Pengguna yang Mendapatkan ({users.length})</CardTitle>
				<CardDescription>
					Daftar pengguna yang telah membuka achievement ini
				</CardDescription>
			</CardHeader>
			<CardContent>
				{users.length === 0 ? (
					<p className="text-center text-muted-foreground py-8 italic">
						Belum ada pengguna yang mendapatkan achievement ini
					</p>
				) : (
					<>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>No</TableHead>
									<TableHead>Pengguna</TableHead>
									<TableHead>Sekolah</TableHead>
									<TableHead>Kelas</TableHead>
									<TableHead>Tanggal Diperoleh</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{paged.map((u, index) => (
									<TableRow key={u.userId}>
										<TableCell className="text-muted-foreground">
											{page * PAGE_SIZE + index + 1}
										</TableCell>
										<TableCell>
											<Link
												to="/users/$id"
												params={{ id: u.userId }}
												className="flex items-center gap-2 hover:underline"
											>
												{u.userImage ? (
													<img
														src={u.userImage}
														alt={u.userName}
														className="w-7 h-7 rounded-full object-cover"
													/>
												) : (
													<div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
														<User className="w-3.5 h-3.5 text-muted-foreground" />
													</div>
												)}
												<div>
													<p className="font-medium text-sm">{u.userName}</p>
													<p className="text-xs text-muted-foreground">
														{u.userEmail}
													</p>
												</div>
											</Link>
										</TableCell>
										<TableCell className="text-muted-foreground">
											{u.schoolName ?? "-"}
										</TableCell>
										<TableCell>
											{u.grade ? (
												<Badge variant="outline">Kelas {u.grade}</Badge>
											) : (
												<span className="text-muted-foreground">-</span>
											)}
										</TableCell>
										<TableCell className="text-muted-foreground">
											{new Date(u.unlockedAt).toLocaleDateString("id-ID", {
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
									{Math.min((page + 1) * PAGE_SIZE, users.length)} dari{" "}
									{users.length}
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
