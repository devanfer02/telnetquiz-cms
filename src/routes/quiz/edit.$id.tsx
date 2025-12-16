import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useCustomForm } from "@/hooks/use-custom-form";
import type { QuizFormData } from "@/types/zod";
import QuizForm from "./-sections/quiz-form";
import { getQuizById, updateQuiz } from "@/actions/quizzes";
import { useQueryClient } from "@tanstack/react-query";
import { setFlashState } from "@/store/use-flash";

export const Route = createFileRoute("/quiz/edit/$id")({
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

			await queryClient.invalidateQueries({ queryKey: ["quiz-list"] });

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
					Edit Kuis {quiz?.title}
				</h1>
				<p className="text-muted-foreground">
					Isi form di bawah untuk memperbarui kuis.
				</p>
			</div>
			<QuizForm form={form} buttonText="Perbarui" />
		</>
	);
}
