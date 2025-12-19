import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCustomForm } from "@/hooks/use-custom-form";
import type { StudyMaterialFormData } from "@/types/zod";
import MaterialForm from "./-sections/material-form";
import { addStudyMaterial } from "@/actions/study-material";
import { useFlashStore } from "@/store/use-flash";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/study-materials/add")({
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
			const result = await addStudyMaterial({ data: value });

			if (result === null) {
				useFlashStore.getState().setFlash({
					type: "error",
					message: "Failed to create study material. See logs.",
				});

				navigate({ to: "/study-materials" });
				return;
			}

			useFlashStore.getState().setFlash({
				type: "success",
				message: "Successfully created new study material",
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
					Tambah Materi Baru
				</h1>
				<p className="text-muted-foreground">
					Isi form di bawah untuk menambahkan materi baru.
				</p>
			</div>
			<MaterialForm form={form} buttonText="Tambah" />
		</>
	);
}
