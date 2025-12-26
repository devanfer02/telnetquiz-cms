import {
	createFileRoute,
	redirect,
	useNavigate,
	Link,
} from "@tanstack/react-router";
import { useCustomForm } from "@/hooks/use-custom-form";
import QuestionForm from "./-sections/question-form";
import type { QuestionsFormData } from "@/types/zod";
import { getQuestionById, updateQuestion } from "@/actions/questions";
import { setFlashState } from "@/store/use-flash";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constant";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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

			await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUESTIONS] });
			navigate({ to: "/questions" });
		},
	});

	return (
		<div className="max-w-4xl mx-auto space-y-6 pb-10">
			<div className="flex items-center gap-4">
				<Button variant="outline" size="icon" asChild>
					<Link to="/questions">
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Edit Question</h1>
					<p className="text-muted-foreground">
						Edit the form below to update the question.
					</p>
				</div>
			</div>
			<Separator />
			<QuestionForm form={form} buttonText="Update Question" />
		</div>
	);
}
