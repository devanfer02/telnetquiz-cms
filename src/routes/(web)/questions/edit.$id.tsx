import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { getQuestionById, updateQuestion } from "@/actions/questions";
import FormPageLayout from "@/components/global/form-page-layout";
import { useCustomForm } from "@/hooks/use-custom-form";
import { QUERY_KEYS } from "@/lib/constant";
import { setFlashState } from "@/store/use-flash";
import type { QuestionsFormData } from "@/types/zod";
import QuestionForm from "./-sections/question-form";

export const Route = createFileRoute("/(web)/questions/edit/$id")({
	loader: async ({ params }) => {
		const question = await getQuestionById({ data: Number(params.id) });

		if (question === null) {
			throw redirect({
				to: "/questions",
			});
		}

		return {
			question,
		};
	},
	component: RouteComponent,
});

export default function RouteComponent() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { question } = Route.useLoaderData();

	const form = useCustomForm({
		defaultValues: {
			type: question.type ?? "quiz",
			quizId: question.quizId,
			chapterId: question.chapterId,
			materialId: question.materialId,
			questions: [
				{
					type: question.type ?? "quiz",
					question: question.question,
					description: question.description,
					image: question.imageLink,
					options: question.options.map((opt) => ({
						text: opt.text,
						isCorrect: opt.isCorrect,
						questionId: opt.questionId?.toString(),
					})),
					quizId: question.quizId,
					chapterId: question.chapterId,
					materialId: question.materialId,
				},
			],
		} as QuestionsFormData,
		onSubmit: async ({ value }) => {
			const updatedQ = value.questions[0];
			const formData = new FormData();

			formData.append("id", String(question.id));
			formData.append("type", value.type);
			if (updatedQ.quizId) formData.append("quizId", String(updatedQ.quizId));
			if (updatedQ.materialId)
				formData.append("materialId", String(updatedQ.materialId));
			formData.append("description", updatedQ.description);
			formData.append("question", updatedQ.question);
			formData.append("options", JSON.stringify(updatedQ.options));

			if (updatedQ.image instanceof File) {
				formData.append("image", updatedQ.image);
			}

			const result = await updateQuestion({ data: formData });

			if (result === null) {
				setFlashState({
					type: "error",
					message: "Failed to update question. See logs.",
				});
				return;
			}

			setFlashState({
				type: "success",
				message: "Successfully updated question",
			});

			await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUESTIONS] });
			navigate({ to: "/questions", hash: value.type });
		},
	});

	return (
		<FormPageLayout
			title="Edit Question"
			description="Edit the form below to update the question."
		>
			<QuestionForm form={form} buttonText="Update Question" />
		</FormPageLayout>
	);
}
