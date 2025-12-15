import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCustomForm } from "@/hooks/use-custom-form";
import type { ChapterFormData } from "@/types/zod";
import ChapterForm from "./-sections/chapter-form";
import { addChapter } from "@/actions/chapters";
import { useFlashStore } from "@/store/use-flash";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/chapters/add")({
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
		} as ChapterFormData,
		onSubmit: async ({ value }) => {
			const result = await addChapter({ data: value });

			if (result === null) {
				useFlashStore.getState().setFlash({
					type: "error",
					message: "Failed to create chapter. See logs.",
				});

				navigate({ to: "/chapters" });
				return;
			}

			useFlashStore.getState().setFlash({
				type: "success",
				message: "Successfully created new chapter",
			});

			await queryClient.invalidateQueries({ queryKey: ["chapter-list"] });

			navigate({
				to: "/chapters/$id",
				params: { id: result.id.toString() },
			});
		},
	});

	return (
		<>
			<div className="mb-6">
				<h1 className="text-telnet-primary font-black text-3xl">
					Tambah Chapter Baru
				</h1>
				<p className="text-muted-foreground">
					Isi form di bawah untuk menambahkan chapter baru.
				</p>
			</div>
			<ChapterForm form={form} buttonText="Tambah" />
		</>
	);
}
