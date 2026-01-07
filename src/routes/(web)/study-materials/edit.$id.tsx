import {
	createFileRoute,
	redirect,
	useNavigate,
	Link,
} from "@tanstack/react-router";
import { useCustomForm } from "@/hooks/use-custom-form";
import type { StudyMaterialFormData } from "@/types/zod";
import MaterialForm from "./-sections/material-form";
import {
	getStudyMaterialById,
	updateStudyMaterial,
} from "@/actions/study-material";
import { setFlashState } from "@/store/use-flash";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constant";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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
		<div className="max-w-4xl mx-auto space-y-6 pb-10">
			<div className="flex items-center gap-4">
				<Button variant="outline" size="icon" asChild>
					<Link
						to="/study-materials/$id"
						params={{ id: studyMaterial.id.toString() }}
					>
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						Edit Materi {studyMaterial?.title}
					</h1>
					<p className="text-muted-foreground">
						Isi form di bawah untuk memperbarui materi.
					</p>
				</div>
			</div>
			<Separator />
			<MaterialForm
				form={form}
				buttonText="Perbarui"
				oldImageLink={studyMaterial.imageLink}
			/>
		</div>
	);
}
