import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useCustomForm } from "@/hooks/use-custom-form";
import QuestionForm from "@/routes/(web)/questions/-sections/question-form";
import type { QuestionsFormData } from "@/types/zod";
import { addQuestions } from "@/actions/questions";
import { setFlashState } from "@/store/use-flash";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constant";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/(web)/questions/add")({
	component: RouteComponent,
});

export default function RouteComponent() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const form = useCustomForm({
		defaultValues: {
			type: "quiz",
			quizId: 0,
			chapterId: 0,
			materialId: 0,
			questions: [],
		} as QuestionsFormData,
		onSubmit: async ({ value }) => {
			const questionsPayload = value.questions.map((q) => ({
				...q,
				image: undefined,
			}));

			const formData = new FormData();
			formData.append("type", value.type);
			if (value.quizId) formData.append("quizId", String(value.quizId));
			if (value.chapterId)
				formData.append("chapterId", String(value.chapterId));
			if (value.materialId)
				formData.append("materialId", String(value.materialId));
			formData.append("questions", JSON.stringify(questionsPayload));

			value.questions.forEach((q, index) => {
				if (q.image instanceof File) {
					formData.append(`image_${index}`, q.image);
				}
			});

			const result = await addQuestions({ data: formData });
			if (result === null) {
				setFlashState({
					type: "error",
					message: "Failed to create questions. See logs.",
				});

				navigate({ to: "/questions" });
				return;
			}

			setFlashState({
				type: "success",
				message: "Successfully created question",
			});

			await queryClient.invalidateQueries({
				queryKey: [QUERY_KEYS.QUESTIONS],
			});

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
					<h1 className="text-2xl font-bold tracking-tight">
						Add New Questions
					</h1>
					<p className="text-muted-foreground">
						Fill out the form below to add new questions. You can add multiple
						questions at once.
					</p>
				</div>
			</div>
			<Separator />
			<QuestionForm form={form} buttonText="Tambah Pertanyaan" />
		</div>
	);
}
