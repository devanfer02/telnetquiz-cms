import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useCustomForm } from "@/hooks/use-custom-form";
import type { StudyMaterialFormData } from "@/types/zod";
import MaterialForm from "./-sections/material-form";
import {
	getStudyMaterialById,
	updateStudyMaterial,
} from "@/actions/study-material";
import { setFlashState } from "@/store/use-flash";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/study-materials/edit/$id")({
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
		} as StudyMaterialFormData,
		onSubmit: async ({ value }) => {
			const result = await updateStudyMaterial({
				data: {
					id: studyMaterial.id,
					studyMaterial: value,
				},
			});

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
				queryKey: ["study-material-list"],
			});

			navigate({ to: "/study-materials" });
		},
	});

	return (
		<>
			<div className="mb-6">
				<h1 className="text-telnet-primary font-black text-3xl">
					Edit Materi {studyMaterial?.title}
				</h1>
				<p className="text-muted-foreground">
					Isi form di bawah untuk memperbarui materi.
				</p>
			</div>
			<MaterialForm form={form} buttonText="Perbarui" />
		</>
	);
}
