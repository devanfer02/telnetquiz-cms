import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCustomForm } from "@/hooks/use-custom-form";
import QuestionForm from "@/routes/questions/-sections/question-form";
import type { QuestionsFormData } from "@/types/zod";
import { createQuestions } from "@/actions/questions";

export const Route = createFileRoute("/questions/add")({
	component: RouteComponent,
});

export default function RouteComponent() {
	const navigate = useNavigate();
	const form = useCustomForm({
		defaultValues: {
			quizId: 0,
			materialId: 0,
			questions: [],
		} as QuestionsFormData,
		onSubmit: async ({ value }) => {
			const questionsPayload = value.questions.map((q) => ({
				...q,
				image: undefined,
			}));

			const formData = new FormData();
			formData.append("quizId", String(value.quizId));
			formData.append("materialId", String(value.materialId));
			formData.append("questions", JSON.stringify(questionsPayload));

			value.questions.forEach((q, index) => {
				if (q.image instanceof File) {
					formData.append(`image_${index}`, q.image);
				}
			});

			await createQuestions({ data: formData });
			navigate({ to: "/questions" });
		},
	});

	return (
		<>
			<div className="mb-6">
				<h1 className="text-telnet-primary font-black text-3xl">
					Add New Questions
				</h1>
				<p className="text-muted-foreground">
					Fill out the form below to add new questions. You can add multiple
					questions at once.
				</p>
			</div>
			<QuestionForm form={form} buttonText="Tambah Pertanyaan" />
		</>
	);
}
