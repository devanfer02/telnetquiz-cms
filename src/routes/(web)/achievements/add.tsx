import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { addAchievement } from "@/actions/achievements";
import FormPageLayout from "@/components/global/form-page-layout";
import { useCustomForm } from "@/hooks/use-custom-form";
import { QUERY_KEYS } from "@/lib/constant";
import { setFlashState } from "@/store/use-flash";
import type { AchievementFormData } from "@/types/zod";
import AchievementForm from "./-sections/achievement-form";

export const Route = createFileRoute("/(web)/achievements/add")({
	component: RouteComponent,
});

export default function RouteComponent() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const form = useCustomForm({
		defaultValues: {
			slug: "",
			title: "",
			description: "",
			icon: "",
			rule: "",
			isActive: true,
		} as AchievementFormData,
		onSubmit: async ({ value }) => {
			const result = await addAchievement({ data: value });

			if (result === null) {
				setFlashState({
					type: "error",
					message: "Gagal membuat achievement. Cek logs.",
				});
				navigate({ to: "/achievements" });
				return;
			}

			setFlashState({
				type: "success",
				message: "Achievement berhasil dibuat",
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
			title="Tambah Achievement Baru"
			description="Isi form di bawah untuk menambahkan achievement baru."
		>
			<AchievementForm form={form} buttonText="Tambah" />
		</FormPageLayout>
	);
}
