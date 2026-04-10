import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { getChapterById, updateChapter } from "@/actions/chapters";
import FormPageLayout from "@/components/global/form-page-layout";
import { useCustomForm } from "@/hooks/use-custom-form";
import { QUERY_KEYS } from "@/lib/constant";
import { setFlashState } from "@/store/use-flash";
import type { ChapterFormData } from "@/types/zod";
import ChapterForm from "./-sections/chapter-form";

export const Route = createFileRoute("/(web)/chapters/edit/$id")({
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
			minimumScore: chapter?.minimumScore ?? 100,
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

			await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHAPTERS] });

			navigate({
				to: "/chapters/$id",
				params: { id: result.id.toString() },
			});
		},
	});

	return (
		<FormPageLayout
			backTo="/chapters/$id"
			backParams={{ id: chapter.id.toString() }}
			title={`Edit Chapter ${chapter?.title}`}
			description="Isi form di bawah untuk memperbarui chapter."
		>
			<ChapterForm form={form} buttonText="Perbarui" />
		</FormPageLayout>
	);
}
