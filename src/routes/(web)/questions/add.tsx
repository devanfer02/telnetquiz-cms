import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { addQuestions } from "@/actions/questions";
import FormPageLayout from "@/components/global/form-page-layout";
import { useCustomForm } from "@/hooks/use-custom-form";
import { QUERY_KEYS } from "@/lib/constant";
import QuestionForm from "@/routes/(web)/questions/-sections/question-form";
import { setFlashState } from "@/store/use-flash";
import type { QuestionsFormData } from "@/types/zod";

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
		<FormPageLayout
			backTo="/questions"
			title="Add New Questions"
			description="Fill out the form below to add new questions. You can add multiple questions at once."
		>
			<QuestionForm form={form} buttonText="Tambah Pertanyaan" />
		</FormPageLayout>
	);
}
