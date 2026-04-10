import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { addChapter } from "@/actions/chapters";
import FormPageLayout from "@/components/global/form-page-layout";
import { useCustomForm } from "@/hooks/use-custom-form";
import { QUERY_KEYS } from "@/lib/constant";
import { setFlashState } from "@/store/use-flash";
import type { ChapterFormData } from "@/types/zod";
import ChapterForm from "./-sections/chapter-form";

export const Route = createFileRoute("/(web)/chapters/add")({
	component: RouteComponent,
});

export default function RouteComponent() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const form = useCustomForm({
		defaultValues: {
			title: "",
			description: "",
			mascotId: 1,
			minimumScore: 100,
		} as ChapterFormData,
		onSubmit: async ({ value }) => {
			const result = await addChapter({ data: value });

			if (result === null) {
				setFlashState({
					type: "error",
					message: "Failed to create chapter. See logs.",
				});
				navigate({ to: "/chapters" });
				return;
			}

			setFlashState({
				type: "success",
				message: "Successfully created new chapter",
			});

			await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHAPTERS] });

			navigate({
				to: "/chapters/$id",
				params: { id: result.id.toString() },
			});
		},
	});

	return (
		<FormPageLayout
			backTo="/chapters"
			title="Tambah Chapter Baru"
			description="Isi form di bawah untuk menambahkan chapter baru."
		>
			<ChapterForm form={form} buttonText="Tambah" />
		</FormPageLayout>
	);
}
