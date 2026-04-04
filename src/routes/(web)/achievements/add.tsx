import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { addAchievement } from "@/actions/achievements";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
		<div className="max-w-4xl mx-auto space-y-6 pb-10">
			<div className="flex items-center gap-4">
				<Button variant="outline" size="icon" asChild>
					<Link to="/achievements">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						Tambah Achievement Baru
					</h1>
					<p className="text-muted-foreground">
						Isi form di bawah untuk menambahkan achievement baru.
					</p>
				</div>
			</div>
			<Separator />
			<AchievementForm form={form} buttonText="Tambah" />
		</div>
	);
}
