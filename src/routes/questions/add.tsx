import { createFileRoute } from "@tanstack/react-router";
import { useCustomForm } from "@/hooks/use-custom-form";
import QuestionForm from "@/routes/questions/-sections/question-form";
import { updateCount } from "@/services/example";
import { createQuestions } from "@/services/question";
import type { QuestionsFormData } from "@/types/zod/question";

export const Route = createFileRoute("/questions/add")({
	component: RouteComponent,
});

export default function RouteComponent() {
	const form = useCustomForm({
		defaultValues: { questions: [] } as QuestionsFormData,
		onSubmit: async ({ value }) => {
			const res = await createQuestions({ data: value });

			console.log(res);
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
			<QuestionForm form={form} buttonText="Add Questions" />
		</>
	);
}
