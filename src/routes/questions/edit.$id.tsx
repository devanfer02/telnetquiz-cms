import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useCustomForm } from "@/hooks/use-custom-form";
import QuestionForm from "./-sections/question-form";
import type { QuestionsFormData } from "@/types/zod";
import { getQuestionById, updateQuestion } from "@/actions/questions";
import { setFlashState } from "@/store/use-flash";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/questions/edit/$id")({
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
			quizId: question.quizId,
			materialId: question.materialId,
			questions: [
				{
					question: question.question,
					description: question.description,
					image: question.imageLink,
					options: question.options.map((opt) => ({
						text: opt.text,
						isCorrect: opt.isCorrect,
						questionId: opt.questionId!.toString(),
					})),
					quizId: question.quizId,
					materialId: question.materialId,
				},
			],
		} as QuestionsFormData,
		onSubmit: async ({ value }) => {
			const updatedQ = value.questions[0];
			const formData = new FormData();

			formData.append("id", String(question.id));
			formData.append("quizId", String(updatedQ.quizId));
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

			await queryClient.invalidateQueries({ queryKey: ["question-list"] });
			navigate({ to: "/questions" });
		},
	});

	return (
		<>
			<div className="mb-6">
				<h1 className="text-telnet-primary font-black text-3xl">
					Edit Question
				</h1>
				<p className="text-muted-foreground">
					Edit the form below to update the question.
				</p>
			</div>
			<QuestionForm form={form} buttonText="Update Question" />
		</>
	);
}
