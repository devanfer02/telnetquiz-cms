import { Award, Calendar, Code, Hash, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface AchievementInfoCardProps {
	achievement: Achievement;
}

export default function AchievementInfoCard({
	achievement,
}: AchievementInfoCardProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="p-2.5 bg-amber-100 rounded-lg">
							<Award className="h-6 w-6 text-amber-600" />
						</div>
						<div>
							<CardTitle className="text-xl">{achievement.title}</CardTitle>
							<CardDescription>{achievement.description}</CardDescription>
						</div>
					</div>
					<Badge
						className={
							achievement.isActive
								? "bg-green-100 text-green-700 border-green-200"
								: "bg-gray-100 text-gray-600 border-gray-200"
						}
						variant="outline"
					>
						{achievement.isActive ? "Aktif" : "Nonaktif"}
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
					<div className="flex items-center gap-2 text-muted-foreground">
						<Hash className="h-4 w-4" />
						<span>ID: {achievement.id}</span>
					</div>
					<div className="flex items-center gap-2 text-muted-foreground">
						<Tag className="h-4 w-4" />
						<span>Slug: {achievement.slug}</span>
					</div>
					{achievement.icon && (
						<div className="flex items-center gap-2 text-muted-foreground">
							<Award className="h-4 w-4" />
							<span>Icon: {achievement.icon}</span>
						</div>
					)}
				</div>
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<Calendar className="h-4 w-4" />
					<span>
						Dibuat{" "}
						{new Date(achievement.createdAt).toLocaleDateString("id-ID", {
							day: "numeric",
							month: "long",
							year: "numeric",
						})}
					</span>
				</div>
				<div className="mt-4">
					<p className="text-sm font-medium mb-2 flex items-center gap-2">
						<Code className="h-4 w-4" />
						Rule (JSON Logic)
					</p>
					<pre className="bg-muted rounded-lg p-3 text-xs overflow-x-auto">
						{JSON.stringify(achievement.rule, null, 2)}
					</pre>
				</div>
			</CardContent>
		</Card>
	);
}
