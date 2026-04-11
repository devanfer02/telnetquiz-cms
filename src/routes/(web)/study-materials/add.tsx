import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { addStudyMaterial } from "@/actions/study-material";
import FormPageLayout from "@/components/global/form-page-layout";
import { useCustomForm } from "@/hooks/use-custom-form";
import { QUERY_KEYS } from "@/lib/constant";
import { setFlashState } from "@/store/use-flash";
import type { StudyMaterialFormData } from "@/types/zod";
import MaterialForm from "./-sections/material-form";

export const Route = createFileRoute("/(web)/study-materials/add")({
	component: RouteComponent,
});

export default function RouteComponent() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const form = useCustomForm({
		defaultValues: {
			title: "",
			content: "",
			questionId: 0,
		} as StudyMaterialFormData,
		onSubmit: async ({ value }) => {
			const formData = new FormData();

			formData.append("title", value.title);
			formData.append("content", value.content);
			if (value.imageFile) {
				formData.append("imageFile", value.imageFile);
			}

			const result = await addStudyMaterial({ data: formData });

			if (result === null) {
				setFlashState({
					type: "error",
					message: "Failed to create study material. See logs.",
				});
				navigate({ to: "/study-materials" });
				return;
			}

			setFlashState({
				type: "success",
				message: "Successfully created new study material",
			});

			await queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.STUDY_MATERIALS],
			});

			navigate({
				to: "/study-materials/$id",
				params: { id: result.id.toString() },
			});
		},
	});

	return (
		<FormPageLayout
			title="Tambah Materi Baru"
			description="Isi form di bawah untuk menambahkan materi baru."
		>
			<MaterialForm form={form} buttonText="Tambah" />
		</FormPageLayout>
	);
}
