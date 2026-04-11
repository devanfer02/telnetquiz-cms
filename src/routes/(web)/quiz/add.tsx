import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { addQuiz } from "@/actions/quizzes";
import FormPageLayout from "@/components/global/form-page-layout";
import { useCustomForm } from "@/hooks/use-custom-form";
import { QUERY_KEYS } from "@/lib/constant";
import { setFlashState } from "@/store/use-flash";
import type { QuizFormData } from "@/types/zod";
import QuizForm from "./-sections/quiz-form";

export const Route = createFileRoute("/(web)/quiz/add")({
	component: RouteComponent,
});

export default function RouteComponent() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const form = useCustomForm({
		defaultValues: {
			title: "",
			difficulty: "easy",
			chapterId: 0,
			level: 1,
		} as QuizFormData,
		onSubmit: async ({ value }) => {
			const result = await addQuiz({ data: value });

			if (result === null) {
				setFlashState({
					type: "error",
					message: "Failed to create quiz. See logs.",
				});
				navigate({ to: "/quiz" });
				return;
			}

			setFlashState({
				type: "success",
				message: "Successfully created new quiz",
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
			title="Tambah Kuis Baru"
			description="Isi form di bawah untuk menambahkan kuis baru."
		>
			<QuizForm form={form} buttonText="Tambah" />
		</FormPageLayout>
	);
}
