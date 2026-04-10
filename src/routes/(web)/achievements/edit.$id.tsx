import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { getAchievementById, updateAchievement } from "@/actions/achievements";
import FormPageLayout from "@/components/global/form-page-layout";
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
		<FormPageLayout
			backTo="/achievements"
			title={`Edit Achievement: ${achievement.title}`}
			description="Perbarui detail achievement di bawah."
		>
			<AchievementForm form={form} buttonText="Perbarui" />
		</FormPageLayout>
	);
}
