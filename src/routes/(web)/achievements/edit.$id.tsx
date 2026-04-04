import { useQueryClient } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { getAchievementById, updateAchievement } from "@/actions/achievements";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCustomForm } from "@/hooks/use-custom-form";
import { QUERY_KEYS } from "@/lib/constant";
import { setFlashState } from "@/store/use-flash";
import type { AchievementFormData } from "@/types/zod";
import AchievementForm from "./-sections/achievement-form";

export const Route = createFileRoute("/(web)/achievements/edit/$id")({
	loader: async ({ params }) => {
		const achievement = await getAchievementById({
			data: Number(params.id),
		});

		if (achievement === null) {
			throw redirect({ to: "/achievements" });
		}

		return { achievement };
	},
	component: RouteComponent,
});

export default function RouteComponent() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { achievement } = Route.useLoaderData();

	const form = useCustomForm({
		defaultValues: {
			slug: achievement.slug,
			title: achievement.title,
			description: achievement.description,
			icon: achievement.icon ?? "",
			rule: JSON.stringify(achievement.rule, null, 2),
			isActive: achievement.isActive,
		} as AchievementFormData,
		onSubmit: async ({ value }) => {
			const result = await updateAchievement({
				data: {
					id: achievement.id,
					achievement: value,
				},
			});

			if (result === null) {
				setFlashState({
					type: "error",
					message: "Gagal memperbarui achievement. Cek logs.",
				});
				navigate({ to: "/achievements" });
				return;
			}

			setFlashState({
				type: "success",
				message: "Achievement berhasil diperbarui",
			});

			await queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.ACHIEVEMENTS],
			});

			navigate({ to: "/achievements" });
		},
	});

	return (
		<div className="max-w-4xl mx-auto space-y-6 pb-10">
			<div className="flex items-center gap-4">
				<Button variant="outline" size="icon" asChild>
					<Link to="/achievements">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						Edit Achievement: {achievement.title}
					</h1>
					<p className="text-muted-foreground">
						Perbarui detail achievement di bawah.
					</p>
				</div>
			</div>
			<Separator />
			<AchievementForm form={form} buttonText="Perbarui" />
		</div>
	);
}
