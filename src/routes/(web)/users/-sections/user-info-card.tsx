import {
	Calendar,
	GraduationCap,
	Mail,
	School,
	User,
	UserCircle,
} from "lucide-react";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface UserInfoCardProps {
	user: {
		name: string;
		email: string;
		image: string | null;
		school: { name: string } | null;
		grade: string | null;
		gender: boolean | null;
		createdAt: string | Date | null;
		bio: string | null;
	};
}

export default function UserInfoCard({ user }: UserInfoCardProps) {
	return (
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
						{user.school && (
							<p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
								<School className="h-3 w-3" />
								{user.school.name}
							</p>
						)}
						<div className="flex items-center gap-3 mt-1">
							{user.grade && (
								<p className="text-xs text-muted-foreground flex items-center gap-1.5">
									<GraduationCap className="h-3 w-3" />
									Kelas {user.grade}
								</p>
							)}
							{user.gender !== null && user.gender !== undefined && (
								<p className="text-xs text-muted-foreground flex items-center gap-1.5">
									<UserCircle className="h-3 w-3" />
									{user.gender ? "Laki-Laki" : "Perempuan"}
								</p>
							)}
						</div>
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
						{user.bio && (
							<p className="text-sm text-muted-foreground mt-2 italic">
								"{user.bio}"
							</p>
						)}
					</div>
				</div>
			</CardHeader>
		</Card>
	);
}
