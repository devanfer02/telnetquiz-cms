import {
	createFileRoute,
	redirect,
	useNavigate,
	Link,
} from "@tanstack/react-router";
import { useCustomForm } from "@/hooks/use-custom-form";
import type { QuizFormData } from "@/types/zod";
import QuizForm from "./-sections/quiz-form";
import { getQuizById, updateQuiz } from "@/actions/quizzes";
import { useQueryClient } from "@tanstack/react-query";
import { setFlashState } from "@/store/use-flash";
import { QUERY_KEYS } from "@/lib/constant";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/(web)/quiz/edit/$id")({
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

			await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.QUIZZES] });

			navigate({
				to: "/quiz/$id",
				params: { id: result.id.toString() },
			});
		},
	});

	return (
		<div className="max-w-4xl mx-auto space-y-6 pb-10">
			<div className="flex items-center gap-4">
				<Button variant="outline" size="icon" asChild>
					<Link to="/quiz/$id" params={{ id: quiz.id.toString() }}>
						<ArrowLeft className="h-4 w-4" />
					</Link>
				</Button>
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						Edit Kuis {quiz?.title}
					</h1>
					<p className="text-muted-foreground">
						Isi form di bawah untuk memperbarui kuis.
					</p>
				</div>
			</div>
			<Separator />
			<QuizForm form={form} buttonText="Perbarui" />
		</div>
	);
}
