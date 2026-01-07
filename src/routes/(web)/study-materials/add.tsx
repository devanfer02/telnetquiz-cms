import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useCustomForm } from "@/hooks/use-custom-form";
import type { StudyMaterialFormData } from "@/types/zod";
import MaterialForm from "./-sections/material-form";
import { addStudyMaterial } from "@/actions/study-material";
import { setFlashState } from "@/store/use-flash";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constant";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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
		<div className="max-w-4xl mx-auto space-y-6 pb-10">
			<div className="flex items-center gap-4">
				<Button variant="outline" size="icon" asChild>
					<Link to="/study-materials">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						Tambah Materi Baru
					</h1>
					<p className="text-muted-foreground">
						Isi form di bawah untuk menambahkan materi baru.
					</p>
				</div>
			</div>
			<Separator />
			<MaterialForm form={form} buttonText="Tambah" />
		</div>
	);
}
