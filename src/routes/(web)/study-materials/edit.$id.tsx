import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import {
	getStudyMaterialById,
	updateStudyMaterial,
} from "@/actions/study-material";
import FormPageLayout from "@/components/global/form-page-layout";
import { useCustomForm } from "@/hooks/use-custom-form";
import { QUERY_KEYS } from "@/lib/constant";
import { setFlashState } from "@/store/use-flash";
import type { StudyMaterialFormData } from "@/types/zod";
import MaterialForm from "./-sections/material-form";

export const Route = createFileRoute("/(web)/study-materials/edit/$id")({
	loader: async ({ params }) => {
		const studyMaterial = await getStudyMaterialById({
			data: Number(params.id),
		});

		if (studyMaterial === null) {
			throw redirect({
				to: "/study-materials",
			});
		}

		return {
			studyMaterial,
		};
	},
	component: RouteComponent,
});

export default function RouteComponent() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { studyMaterial } = Route.useLoaderData();

	const form = useCustomForm({
		defaultValues: {
			id: studyMaterial?.id,
			title: studyMaterial?.title,
			content: studyMaterial?.content,
			imageLink: studyMaterial?.imageLink,
		} as StudyMaterialFormData,
		onSubmit: async ({ value }) => {
			const formData = new FormData();

			formData.append("id", studyMaterial.id.toString());
			formData.append("title", value.title);
			formData.append("content", value.content);
			if (value.imageFile) {
				formData.append("imageFile", value.imageFile);
			}

			const result = await updateStudyMaterial({ data: formData });

			if (result === null) {
				setFlashState({
					type: "error",
					message: "Failed to update study material. See logs.",
				});
				navigate({ to: "/study-materials" });
				return;
			}

			setFlashState({
				type: "success",
				message: "Successfully updated study material",
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
			backTo="/study-materials/$id"
			backParams={{ id: studyMaterial.id.toString() }}
			title={`Edit Materi ${studyMaterial?.title}`}
			description="Isi form di bawah untuk memperbarui materi."
		>
			<MaterialForm
				form={form}
				buttonText="Perbarui"
				oldImageLink={studyMaterial.imageLink}
			/>
		</FormPageLayout>
	);
}
