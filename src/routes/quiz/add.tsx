import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCustomForm } from "@/hooks/use-custom-form";
import type { QuizFormData } from "@/types/zod";
import QuizForm from "./-sections/quiz-form";
import { addQuiz } from "@/actions/quizzes";
import { setFlashState } from "@/store/use-flash";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/constant";

export const Route = createFileRoute("/quiz/add")({
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
		<>
			<div className="mb-6">
				<h1 className="text-telnet-primary font-black text-3xl">
					Tambah Kuis Baru
				</h1>
				<p className="text-muted-foreground">
					Isi form di bawah untuk menambahkan kuis baru.
				</p>
			</div>
			<QuizForm form={form} buttonText="Tambah" />
		</>
	);
}
