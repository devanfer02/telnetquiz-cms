import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { getQuizById, updateQuiz } from "@/actions/quizzes";
import FormPageLayout from "@/components/global/form-page-layout";
import { useCustomForm } from "@/hooks/use-custom-form";
import { QUERY_KEYS } from "@/lib/constant";
import { setFlashState } from "@/store/use-flash";
import type { QuizFormData } from "@/types/zod";
import QuizForm from "./-sections/quiz-form";

export const Route = createFileRoute("/(web)/quiz/edit/$id")({
	loader: async ({ params }) => {
		const quiz = await getQuizById({ data: Number(params.id) });

		if (quiz === null) {
			throw redirect({
				to: "/quiz",
			});
		}

		return {
			quiz,
		};
	},
	component: RouteComponent,
});

export default function RouteComponent() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { quiz } = Route.useLoaderData();

	const form = useCustomForm({
		defaultValues: {
			id: quiz?.id,
			title: quiz?.title,
			difficulty: quiz?.difficulty,
			chapterId: quiz?.chapterId,
			level: quiz?.level,
		} as QuizFormData,
		onSubmit: async ({ value }) => {
			const result = await updateQuiz({
				data: {
					id: quiz.id,
					quiz: value,
				},
			});

			if (result === null) {
				setFlashState({
					type: "error",
					message: "Failed to update quiz. See logs.",
				});
				navigate({ to: "/quiz" });
				return;
			}

			setFlashState({
				type: "success",
				message: "Successfully update quiz",
			});

			await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUIZZES] });

			navigate({
				to: "/quiz/$id",
				params: { id: result.id.toString() },
			});
		},
	});

	return (
		<FormPageLayout
			title={`Edit Kuis ${quiz?.title}`}
			description="Isi form di bawah untuk memperbarui kuis."
		>
			<QuizForm form={form} buttonText="Perbarui" />
		</FormPageLayout>
	);
}
