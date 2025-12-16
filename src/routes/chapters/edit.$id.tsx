import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useCustomForm } from "@/hooks/use-custom-form";
import type { ChapterFormData } from "@/types/zod";
import ChapterForm from "./-sections/chapter-form";
import { getChapterById, updateChapter } from "@/actions/chapters";
import { setFlashState } from "@/store/use-flash";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/chapters/edit/$id")({
	loader: async ({ params }) => {
		const chapter = await getChapterById({ data: Number(params.id) });

		if (chapter === null) {
			throw redirect({
				to: "/chapters",
			});
		}

		return {
			chapter,
		};
	},
	component: RouteComponent,
});

export default function RouteComponent() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { chapter } = Route.useLoaderData();

	const form = useCustomForm({
		defaultValues: {
			id: chapter?.id,
			title: chapter?.title,
			description: chapter?.description,
			mascotId: chapter?.mascotId,
		} as ChapterFormData,
		onSubmit: async ({ value }) => {
			const result = await updateChapter({
				data: {
					id: chapter.id,
					chapter: value,
				},
			});

			if (result === null) {
				setFlashState({
					type: "error",
					message: "Failed to update chapter. See logs.",
				});

				navigate({ to: "/chapters" });
				return;
			}

			setFlashState({
				type: "success",
				message: "Successfully updated chapter",
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
					Edit Chapter {chapter?.title}
				</h1>
				<p className="text-muted-foreground">
					Isi form di bawah untuk menambahkan chapter baru.
				</p>
			</div>
			<ChapterForm form={form} buttonText="Perbarui" />
		</>
	);
}
