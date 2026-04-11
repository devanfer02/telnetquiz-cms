import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Award, Lock, Trophy } from "lucide-react";
import { getUserAchievements } from "@/actions/achievements";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { QUERY_KEYS } from "@/lib/constant";

interface UserAchievementsProps {
	userId: string;
}

export default function UserAchievements({ userId }: UserAchievementsProps) {
	const { data: achievements, isLoading } = useQuery({
		queryKey: [QUERY_KEYS.USER_ACHIEVEMENTS, userId],
		queryFn: () => getUserAchievements({ data: { id: userId } }),
		staleTime: 30 * 1000,
	});

	const unlocked = achievements?.filter((a) => a.unlocked) ?? [];
	const locked = achievements?.filter((a) => !a.unlocked) ?? [];

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2">
							<Trophy className="h-5 w-5 text-amber-500" />
							Achievements
						</CardTitle>
						<CardDescription>
							{isLoading
								? "Memuat achievements..."
								: `${unlocked.length} dari ${achievements?.length ?? 0} achievement diperoleh`}
						</CardDescription>
					</div>
					{!isLoading && achievements && achievements.length > 0 && (
						<Badge variant="outline" className="text-sm">
							{unlocked.length}/{achievements.length}
						</Badge>
					)}
				</div>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						{["a", "b", "c", "d"].map((id) => (
							<Skeleton key={id} className="h-20 rounded-lg" />
						))}
					</div>
				) : !achievements || achievements.length === 0 ? (
					<p className="text-center text-muted-foreground py-8 italic">
						Belum ada achievement yang tersedia
					</p>
				) : (
					<div className="space-y-4">
						{unlocked.length > 0 && (
							<div className="space-y-2">
								<p className="text-sm font-medium text-green-700">
									Diperoleh ({unlocked.length})
								</p>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									{unlocked.map((a) => (
										<Link
											key={a.id}
											to="/achievements/$id"
											params={{ id: String(a.id) }}
											className="block"
										>
											<div className="flex items-start gap-3 p-3 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 transition-colors">
												<div className="p-1.5 bg-green-100 rounded-md mt-0.5">
													<Award className="h-4 w-4 text-green-600" />
												</div>
												<div className="min-w-0 flex-1">
													<p className="font-medium text-sm truncate">
														{a.title}
													</p>
													<p className="text-xs text-muted-foreground truncate">
														{a.description}
													</p>
													{a.unlockedAt && (
														<p className="text-xs text-green-600 mt-1">
															Diperoleh{" "}
															{new Date(a.unlockedAt).toLocaleDateString(
																"id-ID",
																{
																	day: "numeric",
																	month: "short",
																	year: "numeric",
																},
															)}
														</p>
													)}
												</div>
											</div>
										</Link>
									))}
								</div>
							</div>
						)}

						{locked.length > 0 && (
							<div className="space-y-2">
								<p className="text-sm font-medium text-muted-foreground">
									Belum Diperoleh ({locked.length})
								</p>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									{locked.map((a) => (
										<Link
											key={a.id}
											to="/achievements/$id"
											params={{ id: String(a.id) }}
											className="block"
										>
											<div className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-gray-100 transition-colors">
												<div className="p-1.5 bg-gray-100 rounded-md mt-0.5">
													<Lock className="h-4 w-4 text-gray-400" />
												</div>
												<div className="min-w-0 flex-1">
													<p className="font-medium text-sm text-muted-foreground truncate">
														{a.title}
													</p>
													<p className="text-xs text-muted-foreground/70 truncate">
														{a.description}
													</p>
												</div>
											</div>
										</Link>
									))}
								</div>
							</div>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
